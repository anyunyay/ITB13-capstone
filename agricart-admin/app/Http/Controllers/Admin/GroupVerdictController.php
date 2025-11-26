<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\SalesAudit;
use App\Models\StockTrail;
use App\Services\AuditTrailService;
use App\Notifications\OrderStatusUpdate;
use App\Notifications\OrderReceipt;
use App\Notifications\OrderRejectionNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GroupVerdictController extends Controller
{
    /**
     * Apply a unified verdict (approve or reject) to a group of orders
     * All orders in the group will receive the same decision
     */
    public function applyGroupVerdict(Request $request)
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:sales_audit,id',
            'verdict' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $orderIds = $validated['order_ids'];
        $verdict = $validated['verdict'];
        $adminNotes = $validated['admin_notes'] ?? '';

        // Get all orders
        $orders = SalesAudit::whereIn('id', $orderIds)
            ->with(['customer', 'auditTrail.stock.product', 'auditTrail.stock.member'])
            ->get();

        if ($orders->isEmpty()) {
            return back()->with('error', 'No orders found.');
        }

        // Verify all orders are from the same customer
        $customerIds = $orders->pluck('customer_id')->unique();
        if ($customerIds->count() > 1) {
            return back()->with('error', 'Cannot apply group verdict to orders from different customers.');
        }

        // Verify all orders are in pending or delayed status
        $invalidOrders = $orders->filter(function ($order) {
            return !in_array($order->status, ['pending', 'delayed']);
        });

        if ($invalidOrders->isNotEmpty()) {
            return back()->with('error', 'Some orders cannot be processed. Only pending or delayed orders can be approved/rejected.');
        }

        DB::beginTransaction();

        try {
            $successCount = 0;
            $errorMessages = [];

            foreach ($orders as $order) {
                if ($verdict === 'approve') {
                    $result = $this->approveOrder($order, $request->user(), $adminNotes);
                } else {
                    $result = $this->rejectOrder($order, $request->user(), $adminNotes);
                }

                if ($result['success']) {
                    $successCount++;
                } else {
                    $errorMessages[] = "Order #{$order->id}: {$result['message']}";
                }
            }

            if ($successCount === $orders->count()) {
                DB::commit();
                
                $action = $verdict === 'approve' ? 'approved' : 'rejected';
                return back()->with('message', "Successfully {$action} {$successCount} orders in the group.");
            } else {
                DB::rollBack();
                
                $errorMessage = "Failed to process some orders:\n" . implode("\n", $errorMessages);
                return back()->with('error', $errorMessage);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Group verdict failed', [
                'order_ids' => $orderIds,
                'verdict' => $verdict,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'An error occurred while processing the group verdict.');
        }
    }

    /**
     * Approve a single order (extracted from OrderController)
     */
    private function approveOrder(SalesAudit $order, $user, string $adminNotes): array
    {
        // Check if order has sufficient stock
        if (!$order->hasSufficientStock()) {
            $insufficientItems = $order->getInsufficientStockItems();
            $errorMessage = 'Insufficient stock: ';
            foreach ($insufficientItems as $item) {
                $errorMessage .= "{$item['product_name']} ({$item['category']}): Need {$item['requested_quantity']}, Available {$item['available_stock']}. ";
            }
            return ['success' => false, 'message' => $errorMessage];
        }

        // Get multi-member order summary
        $orderSummary = AuditTrailService::getMultiMemberOrderSummary($order);
        $involvedMembers = collect($orderSummary['members'])->pluck('member_id');

        try {
            // STEP 1: Update order status to 'approved' FIRST before any stock deduction
            $order->update([
                'status' => 'approved',
                'delivery_status' => 'pending',
                'admin_id' => $user->id,
                'admin_notes' => $adminNotes,
                'is_suspicious' => false, // Clear suspicious flag when approved
                'suspicious_reason' => null, // Clear suspicious reason
            ]);

            // STEP 2: Now process stock deduction
            $processedMembers = collect();
            $processedStocks = collect();

        foreach ($order->auditTrail as $trail) {
            if ($trail->stock) {
                // Validate no duplicate processing
                $memberStockKey = $trail->stock->member_id . '_' . $trail->stock->id;
                if ($processedStocks->contains($memberStockKey)) {
                    continue;
                }

                $processedStocks->push($memberStockKey);
                $processedMembers->push($trail->stock->member_id);

                // Store quantity before deduction
                $quantityBeforeDeduction = $trail->stock->quantity;

                // Process pending order approval
                $trail->stock->processPendingOrderApproval($trail->quantity);

                // Record stock movement
                StockTrail::record(
                    stockId: $trail->stock->id,
                    productId: $trail->stock->product_id,
                    actionType: 'sale',
                    oldQuantity: $quantityBeforeDeduction,
                    newQuantity: $trail->stock->quantity,
                    memberId: $trail->stock->member_id,
                    category: $trail->stock->category,
                    notes: "Stock sold to customer (Order #{$order->id}, Group Approval)",
                    performedBy: $user->id,
                    performedByType: $user->type
                );

                // Update audit trail
                $trail->update([
                    'member_id' => $trail->stock->member_id,
                    'product_name' => $trail->stock->product->name,
                    'available_stock_after_sale' => $trail->stock->quantity,
                    'order_id' => $order->id,
                ]);
            }
        }

            // STEP 3: Log approval
            SystemLogger::logOrderStatusChange(
                $order->id,
                'pending',
                'approved',
                $user->id,
                $user->type,
                [
                    'admin_notes' => $adminNotes,
                    'total_amount' => $order->total_amount,
                    'customer_id' => $order->customer_id,
                    'group_verdict' => true
                ]
            );

            // STEP 4: Send notifications after successful processing
            $order->customer?->notify(new OrderStatusUpdate($order->id, 'approved', 'Your order has been approved and is being processed.'));
            $order->customer?->notify(new OrderReceipt($order));

            return ['success' => true, 'message' => 'Order approved successfully'];

        } catch (\Exception $e) {
            Log::error('Order approval failed in group verdict', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return ['success' => false, 'message' => 'Failed to approve order: ' . $e->getMessage()];
        }
    }

    /**
     * Reject a single order (extracted from OrderController)
     */
    private function rejectOrder(SalesAudit $order, $user, string $adminNotes): array
    {
        // Release pending orders
        foreach ($order->auditTrail as $trail) {
            if ($trail->stock) {
                // Release the pending order quantity
                $trail->stock->processPendingOrderRejection($trail->quantity);

                // Log pending order release
                SystemLogger::logStockUpdate(
                    $trail->stock->id,
                    $trail->stock->product_id,
                    0,
                    $trail->stock->quantity,
                    $user->id,
                    $user->type,
                    'pending_order_released',
                    [
                        'order_id' => $order->id,
                        'reason' => 'group_rejection',
                        'released_quantity' => $trail->quantity,
                        'pending_order_qty' => $trail->stock->pending_order_qty
                    ]
                );
            }
        }

        // Update order status
        $order->update([
            'status' => 'rejected',
            'delivery_status' => null,
            'admin_id' => $user->id,
            'admin_notes' => $adminNotes,
        ]);

        // Log rejection
        SystemLogger::logOrderStatusChange(
            $order->id,
            'pending',
            'rejected',
            $user->id,
            $user->type,
            [
                'admin_notes' => $adminNotes,
                'total_amount' => $order->total_amount,
                'customer_id' => $order->customer_id,
                'group_verdict' => true
            ]
        );

        // Notify customer
        $order->customer?->notify(new OrderRejectionNotification($order));

        return ['success' => true, 'message' => 'Order rejected successfully'];
    }
}
