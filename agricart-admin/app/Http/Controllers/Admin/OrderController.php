<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\StockTrail;
use App\Models\AuditTrail;
use App\Services\AuditTrailService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Notifications\OrderStatusUpdate;
use App\Notifications\OrderReceipt;
use App\Notifications\OrderRejectionNotification;
use App\Notifications\DeliveryTaskNotification;
use App\Notifications\ProductSaleNotification;
use App\Notifications\OrderDelayedNotification;
use App\Notifications\OrderPickedUpNotification;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    /**
     * Clear suspicious flags for orders older than 10 minutes
     * This ensures old orders don't continue showing as suspicious
     */
    private function clearExpiredSuspiciousOrders()
    {
        $timeWindowMinutes = 10;
        $expirationTime = now()->subMinutes($timeWindowMinutes);

        Log::info('Clearing expired suspicious orders', [
            'expiration_time' => $expirationTime->toISOString(),
            'current_time' => now()->toISOString(),
        ]);

        // Find all suspicious orders older than 10 minutes
        $expiredOrders = SalesAudit::where('is_suspicious', true)
            ->where('created_at', '<', $expirationTime)
            ->whereIn('status', ['pending', 'delayed']) // Only clear pending/delayed orders
            ->get();

        if ($expiredOrders->isEmpty()) {
            Log::info('No expired suspicious orders found');
            return 0;
        }

        $clearedCount = 0;
        foreach ($expiredOrders as $order) {
            $order->update([
                'is_suspicious' => false,
                'suspicious_reason' => null,
            ]);
            $clearedCount++;

            Log::info('Cleared expired suspicious order', [
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'order_age_minutes' => $order->created_at->diffInMinutes(now()),
                'created_at' => $order->created_at->toISOString(),
            ]);
        }

        Log::info('Expired suspicious orders cleared', [
            'total_cleared' => $clearedCount,
            'cleared_order_ids' => $expiredOrders->pluck('id')->toArray(),
        ]);

        return $clearedCount;
    }

    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $highlightOrderId = $request->get('highlight_order');
        $showUrgentApproval = $request->get('urgent_approval', false);

        // Clear expired suspicious orders (older than 10 minutes)
        $this->clearExpiredSuspiciousOrders();

        // Load all recent orders with essential data including audit trail for order cards
        // Frontend will handle pagination and filtering to ensure exactly 8 visible cards per page
        $allOrders = SalesAudit::with([
            'customer' => function ($query) {
                $query->select('id', 'name', 'email', 'contact_number');
            },
            'customer.defaultAddress' => function ($query) {
                $query->select('id', 'user_id', 'street', 'barangay', 'city', 'province');
            },
            'address' => function ($query) {
                $query->select('id', 'street', 'barangay', 'city', 'province');
            },
            'admin' => function ($query) {
                $query->select('id', 'name');
            },
            'logistic' => function ($query) {
                $query->select('id', 'name', 'contact_number');
            },
            'auditTrail.product' => function ($query) {
                $query->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali');
            },
            'auditTrail.stock' => function ($query) {
                $query->select('id', 'product_id', 'member_id', 'quantity', 'pending_order_qty', 'category', 'removed_at');
            },
            'auditTrail.product.stocks' => function ($query) {
                $query->whereNull('removed_at');
            }
        ])
            ->select('id', 'customer_id', 'address_id', 'admin_id', 'logistic_id', 'total_amount', 'status', 'delivery_status', 'delivery_packed_time', 'delivered_time', 'created_at', 'admin_notes', 'is_urgent', 'is_suspicious', 'suspicious_reason', 'linked_merged_order_id')
            ->where('status', '!=', 'merged') // Exclude merged orders from main index
            ->orderBy('created_at', 'desc')
            ->limit(200) // Load recent orders for better performance
            ->get()
            ->values(); // Convert to array

        // Process orders to check for delayed status and calculate urgent orders
        $processedOrders = $allOrders->map(function ($order) {
            $orderAge = $order->created_at->diffInHours(now());

            // Check if order should be marked as delayed (over 24 hours and still pending)
            if ($order->status === 'pending' && $orderAge > 24) {
                $order->update(['status' => 'delayed']);
                $order->status = 'delayed';

                // Send notification to customer about delay
                if ($order->customer) {
                    $order->customer->notify(new OrderDelayedNotification($order));
                }
            }

            // Transform the order data with optimized structure
            return [
                'id' => $order->id,
                'customer' => [
                    'name' => $order->customer->name ?? 'N/A',
                    'email' => $order->customer->email ?? 'N/A',
                    'contact_number' => $order->customer->contact_number ?? 'N/A',
                    'address' => $order->customer->defaultAddress?->street ?? 'N/A',
                    'barangay' => $order->customer->defaultAddress?->barangay ?? 'N/A',
                    'city' => $order->customer->defaultAddress?->city ?? 'N/A',
                    'province' => $order->customer->defaultAddress?->province ?? 'N/A',
                ],
                'delivery_address' => $order->address ?
                    $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province :
                    null,
                'order_address' => $order->address ? [
                    'street' => $order->address->street,
                    'barangay' => $order->address->barangay,
                    'city' => $order->address->city,
                    'province' => $order->address->province,
                ] : null,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'delivery_status' => $order->delivery_status,
                'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
                'delivered_time' => $order->delivered_time?->toISOString(),
                'delivery_timeline' => null, // Load on demand to reduce payload
                'created_at' => $order->created_at?->toISOString(),
                'admin' => $order->admin ? [
                    'name' => $order->admin->name,
                ] : null,
                'admin_notes' => $order->admin_notes,
                'logistic' => $order->logistic ? [
                    'id' => $order->logistic->id,
                    'name' => $order->logistic->name,
                    'contact_number' => $order->logistic->contact_number,
                ] : null,
                'audit_trail' => $order->getAggregatedAuditTrail(), // Load aggregated audit trail for order cards
                'is_urgent' => $order->is_urgent,
                'is_suspicious' => $order->is_suspicious,
                'suspicious_reason' => $order->suspicious_reason,
                'linked_merged_order_id' => $order->linked_merged_order_id,
            ];
        });

        // Filter orders by status if needed
        if ($status === 'all') {
            $orders = $processedOrders;
        } else {
            $orders = $processedOrders->where('status', $status)->values();
        }

        // Get available logistics for assignment (only active logistics)
        $logistics = User::where('type', 'logistic')
            ->where('active', true)
            ->get(['id', 'name', 'contact_number', 'assigned_area'])
            ->map(function ($logistic) {
                // Calculate average rating from sales
                $ratings = \DB::table('sales')
                    ->where('logistic_id', $logistic->id)
                    ->whereNotNull('logistic_rating')
                    ->pluck('logistic_rating');
                
                return [
                    'id' => $logistic->id,
                    'name' => $logistic->name,
                    'contact_number' => $logistic->contact_number,
                    'assigned_area' => $logistic->assigned_area,
                    'average_rating' => $ratings->count() > 0 ? round($ratings->avg(), 1) : null,
                    'total_ratings' => $ratings->count(),
                ];
            });

        // Calculate orders that need urgent approval (within 8 hours of 24-hour limit OR manually marked as urgent)
        $urgentOrders = $processedOrders->filter(function ($order) {
            if ($order['status'] !== 'pending') return false;
            // Check if manually marked as urgent
            if ($order['is_urgent']) return true;
            // Check if within 8 hours of 24-hour limit
            $orderAge = \Carbon\Carbon::parse($order['created_at'])->diffInHours(now());
            return $orderAge >= 16; // 16+ hours old (8 hours left)
        })->values(); // Convert to array

        return Inertia::render('Admin/Orders/index', [
            'orders' => $orders,
            'allOrders' => $processedOrders,
            'currentStatus' => $status,
            'logistics' => $logistics,
            'highlightOrderId' => $highlightOrderId,
            'urgentOrders' => $urgentOrders,
            'showUrgentApproval' => $showUrgentApproval,
        ]);
    }

    public function suspicious(Request $request)
    {
        // Clear expired suspicious orders (older than 10 minutes)
        $this->clearExpiredSuspiciousOrders();

        // Optimize: Load only recent orders with essential data
        // Only include pending and delayed orders - approved/rejected orders cannot be suspicious
        $allOrders = SalesAudit::with([
            'customer' => function ($query) {
                $query->select('id', 'name', 'email', 'contact_number');
            },
            'customer.defaultAddress' => function ($query) {
                $query->select('id', 'user_id', 'street', 'barangay', 'city', 'province');
            },
            'address' => function ($query) {
                $query->select('id', 'street', 'barangay', 'city', 'province');
            },
            'admin' => function ($query) {
                $query->select('id', 'name');
            },
            'logistic' => function ($query) {
                $query->select('id', 'name', 'contact_number');
            },
            'auditTrail.product' => function ($query) {
                $query->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali');
            },
            'auditTrail.stock' => function ($query) {
                $query->select('id', 'product_id', 'member_id', 'quantity', 'pending_order_qty', 'category', 'removed_at');
            },
            'auditTrail.product.stocks' => function ($query) {
                $query->whereNull('removed_at');
            }
        ])
            ->select('id', 'customer_id', 'address_id', 'admin_id', 'logistic_id', 'total_amount', 'status', 'delivery_status', 'delivery_packed_time', 'delivered_time', 'created_at', 'admin_notes', 'is_urgent', 'is_suspicious', 'suspicious_reason', 'linked_merged_order_id')
            ->whereIn('status', ['pending', 'delayed']) // Only pending/delayed orders can be suspicious
            ->orderBy('created_at', 'desc')
            ->limit(500) // Increased limit to catch more potential suspicious patterns
            ->get()
            ->values();

        // Process orders
        $processedOrders = $allOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'customer' => [
                    'name' => $order->customer->name ?? 'N/A',
                    'email' => $order->customer->email ?? 'N/A',
                    'contact_number' => $order->customer->contact_number ?? 'N/A',
                    'address' => $order->customer->defaultAddress?->street ?? 'N/A',
                    'barangay' => $order->customer->defaultAddress?->barangay ?? 'N/A',
                    'city' => $order->customer->defaultAddress?->city ?? 'N/A',
                    'province' => $order->customer->defaultAddress?->province ?? 'N/A',
                ],
                'delivery_address' => $order->address ?
                    $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province :
                    null,
                'order_address' => $order->address ? [
                    'street' => $order->address->street,
                    'barangay' => $order->address->barangay,
                    'city' => $order->address->city,
                    'province' => $order->address->province,
                ] : null,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'delivery_status' => $order->delivery_status,
                'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
                'delivered_time' => $order->delivered_time?->toISOString(),
                'delivery_timeline' => null,
                'created_at' => $order->created_at?->toISOString(),
                'admin' => $order->admin ? [
                    'name' => $order->admin->name,
                ] : null,
                'admin_notes' => $order->admin_notes,
                'logistic' => $order->logistic ? [
                    'id' => $order->logistic->id,
                    'name' => $order->logistic->name,
                    'contact_number' => $order->logistic->contact_number,
                ] : null,
                'audit_trail' => $order->getAggregatedAuditTrail(),
                'is_urgent' => $order->is_urgent,
                'is_suspicious' => $order->is_suspicious,
                'suspicious_reason' => $order->suspicious_reason,
                'linked_merged_order_id' => $order->linked_merged_order_id,
            ];
        });

        // Get available logistics for assignment
        $logistics = User::where('type', 'logistic')
            ->where('active', true)
            ->get(['id', 'name', 'contact_number', 'assigned_area'])
            ->map(function ($logistic) {
                // Calculate average rating from sales
                $ratings = \DB::table('sales')
                    ->where('logistic_id', $logistic->id)
                    ->whereNotNull('logistic_rating')
                    ->pluck('logistic_rating');
                
                return [
                    'id' => $logistic->id,
                    'name' => $logistic->name,
                    'contact_number' => $logistic->contact_number,
                    'assigned_area' => $logistic->assigned_area,
                    'average_rating' => $ratings->count() > 0 ? round($ratings->avg(), 1) : null,
                    'total_ratings' => $ratings->count(),
                ];
            });

        return Inertia::render('Admin/Orders/suspicious', [
            'orders' => $processedOrders,
            'logistics' => $logistics,
        ]);
    }

    public function showGroup(Request $request)
    {
        // Get order IDs from query parameter (comma-separated)
        $orderIds = explode(',', $request->get('orders', ''));
        
        if (empty($orderIds)) {
            return redirect()->route('admin.orders.suspicious')->with('error', 'No orders specified for group view.');
        }

        // Load orders with relationships
        $orders = SalesAudit::with([
            'customer' => function ($query) {
                $query->select('id', 'name', 'email', 'contact_number');
            },
            'customer.defaultAddress' => function ($query) {
                $query->select('id', 'user_id', 'street', 'barangay', 'city', 'province');
            },
            'address' => function ($query) {
                $query->select('id', 'street', 'barangay', 'city', 'province');
            },
            'admin' => function ($query) {
                $query->select('id', 'name');
            },
            'logistic' => function ($query) {
                $query->select('id', 'name', 'contact_number');
            },
            'auditTrail.product' => function ($query) {
                $query->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali');
            }
        ])
            ->whereIn('id', $orderIds)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->route('admin.orders.suspicious')->with('error', 'Orders not found.');
        }

        // Process orders
        $processedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'customer' => [
                    'name' => $order->customer->name ?? 'N/A',
                    'email' => $order->customer->email ?? 'N/A',
                    'contact_number' => $order->customer->contact_number ?? 'N/A',
                ],
                'delivery_address' => $order->address ?
                    $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province :
                    ($order->customer->defaultAddress ?
                        $order->customer->defaultAddress->street . ', ' . $order->customer->defaultAddress->barangay . ', ' . $order->customer->defaultAddress->city . ', ' . $order->customer->defaultAddress->province :
                        null),
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'delivery_status' => $order->delivery_status,
                'created_at' => $order->created_at?->toISOString(),
                'admin_notes' => $order->admin_notes,
                'audit_trail' => $order->getAggregatedAuditTrail(),
            ];
        });

        // Calculate group info
        $firstOrder = $orders->first();
        $lastOrder = $orders->last();
        $totalAmount = $orders->sum('total_amount');
        $timeSpan = round($firstOrder->created_at->diffInMinutes($lastOrder->created_at));

        $groupInfo = [
            'customerName' => $firstOrder->customer->name,
            'customerEmail' => $firstOrder->customer->email,
            'totalOrders' => $orders->count(),
            'totalAmount' => $totalAmount,
            'timeSpan' => $timeSpan,
            'firstOrderTime' => $firstOrder->created_at->toISOString(),
            'lastOrderTime' => $lastOrder->created_at->toISOString(),
        ];

        return Inertia::render('Admin/Orders/group-show', [
            'orders' => $processedOrders,
            'groupInfo' => $groupInfo,
        ]);
    }

    public function rejectGroup(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:sales_audit,id',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $orderIds = $request->input('order_ids');
        
        // Load all orders
        $orders = SalesAudit::with(['customer', 'auditTrail.stock'])
            ->whereIn('id', $orderIds)
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->back()->with('error', 'No orders found to reject.');
        }

        // Verify all orders can be rejected (pending or delayed status only)
        // Approved or rejected orders cannot be in suspicious list
        $invalidStatuses = $orders->whereNotIn('status', ['pending', 'delayed']);
        if ($invalidStatuses->isNotEmpty()) {
            return redirect()->back()->with('error', 'Can only reject orders with pending or delayed status. Approved or rejected orders cannot be marked as suspicious.');
        }

        try {
            \DB::beginTransaction();

            $rejectionReason = $request->input('rejection_reason', 'Rejected as part of suspicious order group');
            $rejectedCount = 0;

            foreach ($orders as $order) {
                // Release pending stock quantities
                foreach ($order->auditTrail as $auditItem) {
                    if ($auditItem->stock) {
                        $auditItem->stock->decrementPendingOrders($auditItem->quantity);
                    }
                }

                // Update order status - each order is individually rejected
                $order->update([
                    'status' => 'rejected',
                    'admin_notes' => $rejectionReason,
                    'admin_id' => $request->user()->id,
                    'is_suspicious' => false, // Clear suspicious flag
                    'suspicious_reason' => null, // Clear suspicious reason
                ]);

                // Log the rejection
                SystemLogger::logOrderStatusChange(
                    $order->id,
                    $order->status,
                    'rejected',
                    $request->user()->id,
                    $request->user()->type,
                    [
                        'rejection_reason' => $rejectionReason,
                        'rejected_as_group' => true,
                        'group_order_ids' => $orderIds,
                    ]
                );

                $rejectedCount++;
            }

            \DB::commit();

            return redirect()->route('admin.orders.suspicious')
                ->with('message', "Successfully rejected {$rejectedCount} order(s) from the suspicious group.");

        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Group order rejection failed', [
                'order_ids' => $orderIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to reject orders. Please try again or contact support.');
        }
    }

    public function mergeGroup(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:2',
            'order_ids.*' => 'required|integer|exists:sales_audit,id',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $orderIds = $request->input('order_ids');
        
        // Load all orders
        $orders = SalesAudit::with(['auditTrail', 'customer'])
            ->whereIn('id', $orderIds)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($orders->isEmpty() || $orders->count() < 2) {
            return redirect()->back()->with('error', 'At least 2 orders are required to merge.');
        }

        // Verify all orders are from the same customer
        $customerId = $orders->first()->customer_id;
        if ($orders->pluck('customer_id')->unique()->count() > 1) {
            return redirect()->back()->with('error', 'Cannot merge orders from different customers.');
        }

        // Verify all orders are in pending or delayed status only
        // Approved or rejected orders cannot be in suspicious list
        $invalidStatuses = $orders->whereNotIn('status', ['pending', 'delayed']);
        if ($invalidStatuses->isNotEmpty()) {
            return redirect()->back()->with('error', 'Can only merge orders with pending or delayed status. Approved or rejected orders cannot be marked as suspicious.');
        }

        try {
            \DB::beginTransaction();

            // Use the first order as the primary order
            $primaryOrder = $orders->first();
            $secondaryOrders = $orders->slice(1);

            // Calculate new totals
            $newSubtotal = $orders->sum('subtotal');
            $newCoopShare = $newSubtotal * 0.10;
            $newMemberShare = $newSubtotal;
            $newTotalAmount = $newSubtotal + $newCoopShare;

            // Move all audit trails from secondary orders to primary order
            foreach ($secondaryOrders as $secondaryOrder) {
                AuditTrail::where('sale_id', $secondaryOrder->id)
                    ->update(['sale_id' => $primaryOrder->id]);
            }

            // DEBUG: Log audit trail movement
            Log::info('Moving audit trails to primary order', [
                'primary_order_id' => $primaryOrder->id,
                'secondary_order_ids' => $secondaryOrders->pluck('id')->toArray(),
                'audit_trails_before_move' => AuditTrail::whereIn('sale_id', $orderIds)->count()
            ]);

            // Refresh the primary order to ensure audit trail is properly loaded
            $primaryOrder->refresh();
            $primaryOrder->load(['auditTrail.product', 'auditTrail.stock']);

            Log::info('Primary order audit trail after refresh', [
                'primary_order_id' => $primaryOrder->id,
                'audit_trail_count' => $primaryOrder->auditTrail->count(),
                'audit_trails_after_move' => AuditTrail::where('sale_id', $primaryOrder->id)->count()
            ]);

            // Update primary order with new totals
            $mergedOrderIds = $orders->pluck('id')->toArray();
            $mergeNote = "Merged from orders: " . implode(', ', $mergedOrderIds);
            if ($request->input('admin_notes')) {
                $mergeNote .= " | Admin notes: " . $request->input('admin_notes');
            }

            Log::info('Updating primary order with new totals', [
                'primary_order_id' => $primaryOrder->id,
                'old_total' => $primaryOrder->total_amount,
                'new_total' => $newTotalAmount,
                'merge_note' => $mergeNote
            ]);

            $primaryOrder->update([
                'subtotal' => $newSubtotal,
                'coop_share' => $newCoopShare,
                'member_share' => $newMemberShare,
                'total_amount' => $newTotalAmount,
                'admin_notes' => $mergeNote,
                'admin_id' => $request->user()->id,
            ]);

            // Mark secondary orders as merged (soft delete or status change)
            Log::info('Marking secondary orders as merged', [
                'secondary_order_ids' => $secondaryOrders->pluck('id')->toArray()
            ]);

            foreach ($secondaryOrders as $secondaryOrder) {
                $secondaryOrder->update([
                    'status' => 'merged',
                    'admin_notes' => "Merged into order #{$primaryOrder->id}",
                    'admin_id' => $request->user()->id,
                    'is_suspicious' => false, // Clear suspicious flag
                ]);
            }
            
            // Clear suspicious flag from primary order as well but keep it pending for approval
            Log::info('Clearing suspicious flag from primary order', [
                'primary_order_id' => $primaryOrder->id,
                'old_status' => $primaryOrder->status,
                'old_is_suspicious' => $primaryOrder->is_suspicious
            ]);

            $primaryOrder->update([
                'is_suspicious' => false,
                'status' => 'pending', // Ensure primary order remains pending for approval
            ]);

            Log::info('Primary order after merge completion', [
                'primary_order_id' => $primaryOrder->id,
                'final_status' => $primaryOrder->fresh()->status,
                'final_is_suspicious' => $primaryOrder->fresh()->is_suspicious,
                'final_total_amount' => $primaryOrder->fresh()->total_amount,
                'final_admin_notes' => $primaryOrder->fresh()->admin_notes,
                'final_audit_trail_count' => $primaryOrder->fresh()->auditTrail()->count()
            ]);

            // Log the merge operation
            SystemLogger::logOrderStatusChange(
                $primaryOrder->id,
                'suspicious',
                'pending',
                $request->user()->id,
                $request->user()->type,
                [
                    'action' => 'order_merge',
                    'merged_order_ids' => $mergedOrderIds,
                    'new_total_amount' => $newTotalAmount,
                    'total_orders_merged' => $orders->count(),
                    'note' => 'Orders merged and cleared from suspicious status, ready for approval'
                ]
            );

            \DB::commit();

            // Redirect to the merged order's detail page for immediate approval
            return redirect()->route('admin.orders.show', $primaryOrder->id)
                ->with('message', "Successfully merged {$orders->count()} orders into Order #{$primaryOrder->id}. New total: ₱{$newTotalAmount}. Order is ready for approval.");

        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Order merge failed', [
                'order_ids' => $orderIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to merge orders. Please try again or contact support.');
        }
    }

    public function show(Request $request, SalesAudit $order)
    {
        // DEBUG: Log order show request
        Log::info('Order show page requested', [
            'order_id' => $order->id,
            'current_status' => $order->status,
            'is_suspicious' => $order->is_suspicious,
            'admin_notes' => $order->admin_notes,
            'total_amount' => $order->total_amount,
            'is_merged_order' => strpos($order->admin_notes ?? '', 'Merged from orders:') !== false,
            'request_highlight' => $request->get('highlight', false),
            'request_user_id' => $request->user()->id
        ]);

        $order->load(['customer.defaultAddress', 'address', 'admin', 'logistic', 'auditTrail.product', 'auditTrail.stock']);

        Log::info('Order relationships loaded', [
            'order_id' => $order->id,
            'audit_trail_count' => $order->auditTrail->count(),
            'customer_loaded' => $order->customer ? true : false,
            'admin_loaded' => $order->admin ? true : false,
            'logistic_loaded' => $order->logistic ? true : false
        ]);

        // Get available logistics for assignment (only active logistics)
        $logistics = User::where('type', 'logistic')
            ->where('active', true)
            ->get(['id', 'name', 'contact_number', 'assigned_area'])
            ->map(function ($logistic) {
                // Calculate average rating from sales
                $ratings = \DB::table('sales')
                    ->where('logistic_id', $logistic->id)
                    ->whereNotNull('logistic_rating')
                    ->pluck('logistic_rating');
                
                return [
                    'id' => $logistic->id,
                    'name' => $logistic->name,
                    'contact_number' => $logistic->contact_number,
                    'assigned_area' => $logistic->assigned_area,
                    'average_rating' => $ratings->count() > 0 ? round($ratings->avg(), 1) : null,
                    'total_ratings' => $ratings->count(),
                ];
            });

        // Check if highlighting is requested (from notification click)
        $highlight = $request->get('highlight', false);

        // Calculate order age and urgency
        $orderAge = $order->created_at->diffInHours(now());

        // Check if order should be marked as delayed (over 24 hours and still pending)
        if ($order->status === 'pending' && $orderAge > 24) {
            $order->update(['status' => 'delayed']);
            $order->status = 'delayed';

            // Send notification to customer about delay
            if ($order->customer) {
                $order->customer->notify(new OrderDelayedNotification($order));
            }
        }

        $isUrgent = $order->status === 'pending' && ($order->is_urgent || $orderAge >= 16); // Manually marked OR 16+ hours old (8 hours left)
        $canApprove = in_array($order->status, ['pending', 'delayed']);

        // Transform the order data to include customer address information
        $transformedOrder = [
            'id' => $order->id,
            'customer' => [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'contact_number' => $order->customer->contact_number,
                'address' => $order->address ? $order->address->street : ($order->customer->defaultAddress ? $order->customer->defaultAddress->street : null),
                'barangay' => $order->address ? $order->address->barangay : ($order->customer->defaultAddress ? $order->customer->defaultAddress->barangay : null),
                'city' => $order->address ? $order->address->city : ($order->customer->defaultAddress ? $order->customer->defaultAddress->city : null),
                'province' => $order->address ? $order->address->province : ($order->customer->defaultAddress ? $order->customer->defaultAddress->province : null),
            ],
            'delivery_address' => $order->address ?
                $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province : ($order->customer->defaultAddress ?
                    $order->customer->defaultAddress->street . ', ' . $order->customer->defaultAddress->barangay . ', ' . $order->customer->defaultAddress->city . ', ' . $order->customer->defaultAddress->province :
                    null),
            'order_address' => $order->address ? [
                'street' => $order->address->street,
                'barangay' => $order->address->barangay,
                'city' => $order->address->city,
                'province' => $order->address->province,
            ] : null,
            'total_amount' => $order->total_amount,
            'subtotal' => $order->subtotal,
            'coop_share' => $order->coop_share,
            'member_share' => $order->member_share,
            'status' => $order->status,
            'delivery_status' => $order->delivery_status,
            'delivery_proof_image' => $order->delivery_proof_image ? route('private-file.show', ['folder' => 'delivery-proofs', 'filename' => basename($order->delivery_proof_image)]) : null,
            'delivery_confirmed' => $order->delivery_confirmed,
            'delivery_ready_time' => $order->delivery_ready_time?->toISOString(),
            'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
            'delivered_time' => $order->delivered_time?->toISOString(),
            'delivery_timeline' => $order->getDeliveryTimeline(),
            'created_at' => $order->created_at?->toISOString(),
            'admin' => $order->admin ? [
                'name' => $order->admin->name,
            ] : null,
            'admin_notes' => $order->admin_notes,
            'logistic' => $order->logistic ? [
                'id' => $order->logistic->id,
                'name' => $order->logistic->name,
                'contact_number' => $order->logistic->contact_number,
            ] : null,
            'audit_trail' => $order->getAggregatedAuditTrail(),
            'is_urgent' => $order->is_urgent,
            'is_suspicious' => $order->is_suspicious,
            'suspicious_reason' => $order->suspicious_reason,
            'linked_merged_order_id' => $order->linked_merged_order_id,
        ];

        return Inertia::render('Admin/Orders/show', [
            'order' => $transformedOrder,
            'logistics' => $logistics,
            'highlight' => $highlight,
            'isUrgent' => $isUrgent,
            'canApprove' => $canApprove,
            'orderAge' => $orderAge,
        ]);
    }

    public function receiptPreview(SalesAudit $order)
    {
        $order->load(['customer.defaultAddress', 'admin', 'auditTrail.product']);

        // Transform the order data to include aggregated audit trail with stored prices
        $transformedOrder = [
            'id' => $order->id,
            'customer' => [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'contact_number' => $order->customer->contact_number,
            ],
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'admin_notes' => $order->admin_notes,
            'created_at' => $order->created_at?->toISOString(),
            'updated_at' => $order->updated_at?->toISOString(),
            'admin' => $order->admin ? [
                'name' => $order->admin->name,
            ] : null,
            'audit_trail' => $order->getAggregatedAuditTrail(),
        ];

        return Inertia::render('Admin/Orders/receipt-preview', [
            'order' => $transformedOrder,
        ]);
    }

    /**
     * Securely serve delivery proof images with proper authorization
     */
    public function deliveryProof(SalesAudit $order)
    {
        // User is already authenticated and authorized via middleware

        // Check if order has delivery proof
        if (!$order->delivery_proof_image) {
            abort(404, 'Delivery proof not found for this order.');
        }

        // Check if the file exists in private storage
        $filePath = storage_path('app/private/delivery-proofs/' . basename($order->delivery_proof_image));
        if (!file_exists($filePath)) {
            abort(404, 'Delivery proof file not found.');
        }

        // Get file info
        $fileInfo = pathinfo($filePath);
        $mimeType = mime_content_type($filePath);

        // Set appropriate headers
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="delivery-proof-order-' . $order->id . '.' . $fileInfo['extension'] . '"',
            'Cache-Control' => 'private, max-age=3600', // Cache for 1 hour
        ];

        return response()->file($filePath, $headers);
    }

    public function assignLogistic(Request $request, SalesAudit $order)
    {
        $request->validate([
            'logistic_id' => 'required|exists:users,id',
        ]);

        // Verify the user is a logistic
        $logistic = User::where('id', $request->logistic_id)
            ->where('type', 'logistic')
            ->firstOrFail();

        $order->update([
            'logistic_id' => $logistic->id,
        ]);

        // Log logistic assignment
        SystemLogger::logOrderStatusChange(
            $order->id,
            $order->logistic_id ? 'assigned' : 'unassigned',
            'assigned',
            $request->user()->id,
            $request->user()->type,
            [
                'logistic_id' => $logistic->id,
                'logistic_name' => $logistic->name,
                'order_status' => $order->status
            ]
        );

        // Notify logistic about delivery task
        $logistic->notify(new DeliveryTaskNotification($order));

        // Send delivery status notification to customer now that logistic is assigned
        $order->customer?->notify(new \App\Notifications\DeliveryStatusUpdate(
            $order->id,
            'pending',
            'Your order is being prepared for delivery.'
        ));

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', "Order assigned to {$logistic->name} successfully");
    }

    /**
     * Auto-clear suspicious flag for all orders in the same 10-minute window
     * when the last pending suspicious order is approved or rejected
     */
    private function autoClearSuspiciousOrders(SalesAudit $order)
    {
        // Define the 10-minute window
        $timeWindowMinutes = 10;
        $orderTime = $order->created_at;
        $windowStart = $orderTime->copy()->subMinutes($timeWindowMinutes);
        $windowEnd = $orderTime->copy()->addMinutes($timeWindowMinutes);

        Log::info('Auto-clear suspicious orders: Finding related orders', [
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'order_time' => $orderTime->toISOString(),
            'window_start' => $windowStart->toISOString(),
            'window_end' => $windowEnd->toISOString(),
        ]);

        // Find all orders from the same customer within the 10-minute window
        $relatedOrders = SalesAudit::where('customer_id', $order->customer_id)
            ->whereBetween('created_at', [$windowStart, $windowEnd])
            ->whereIn('status', ['pending', 'delayed', 'approved', 'rejected']) // Include all statuses
            ->get();

        Log::info('Auto-clear suspicious orders: Related orders found', [
            'order_id' => $order->id,
            'total_related_orders' => $relatedOrders->count(),
            'related_order_ids' => $relatedOrders->pluck('id')->toArray(),
        ]);

        // Check if there are any remaining pending suspicious orders (excluding the current one)
        $remainingPendingSuspicious = $relatedOrders->filter(function ($relatedOrder) use ($order) {
            return $relatedOrder->id !== $order->id && // Exclude current order
                   in_array($relatedOrder->status, ['pending', 'delayed']) && // Only pending/delayed
                   $relatedOrder->is_suspicious === true; // Only suspicious
        });

        Log::info('Auto-clear suspicious orders: Checking remaining pending suspicious orders', [
            'order_id' => $order->id,
            'remaining_pending_suspicious_count' => $remainingPendingSuspicious->count(),
            'remaining_pending_suspicious_ids' => $remainingPendingSuspicious->pluck('id')->toArray(),
        ]);

        // If no remaining pending suspicious orders, clear all orders in the window
        if ($remainingPendingSuspicious->isEmpty()) {
            $clearedCount = 0;
            
            foreach ($relatedOrders as $relatedOrder) {
                // Only clear if currently suspicious
                if ($relatedOrder->is_suspicious === true) {
                    $relatedOrder->update([
                        'is_suspicious' => false,
                        'suspicious_reason' => null,
                    ]);
                    $clearedCount++;

                    Log::info('Auto-clear suspicious orders: Cleared order', [
                        'cleared_order_id' => $relatedOrder->id,
                        'cleared_order_status' => $relatedOrder->status,
                        'triggered_by_order_id' => $order->id,
                    ]);
                }
            }

            Log::info('Auto-clear suspicious orders: Completed', [
                'order_id' => $order->id,
                'total_cleared' => $clearedCount,
                'cleared_order_ids' => $relatedOrders->where('is_suspicious', false)->pluck('id')->toArray(),
            ]);

            return $clearedCount;
        } else {
            Log::info('Auto-clear suspicious orders: Skipped (pending suspicious orders remain)', [
                'order_id' => $order->id,
                'remaining_count' => $remainingPendingSuspicious->count(),
            ]);

            return 0;
        }
    }

    public function approve(Request $request, SalesAudit $order)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // DEBUG: Log order approval attempt with detailed information
        Log::info('Order approval attempt started', [
            'order_id' => $order->id,
            'current_status' => $order->status,
            'is_suspicious' => $order->is_suspicious,
            'suspicious_reason' => $order->suspicious_reason,
            'admin_notes_from_merge' => $order->admin_notes,
            'total_amount' => $order->total_amount,
            'customer_id' => $order->customer_id,
            'admin_id' => $order->admin_id,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'audit_trail_count' => $order->auditTrail ? $order->auditTrail->count() : 'not_loaded',
            'request_admin_notes' => $request->input('admin_notes'),
            'requesting_user_id' => $request->user()->id,
            'requesting_user_type' => $request->user()->type,
        ]);

        // Prevent approval of cancelled orders
        if ($order->status === 'cancelled') {
            Log::warning('Order approval blocked: Order is cancelled', ['order_id' => $order->id]);
            return redirect()->back()->with('error', 'Cannot approve a cancelled order.');
        }

        // Allow approval for pending and delayed orders
        if (!in_array($order->status, ['pending', 'delayed'])) {
            Log::warning('Order approval blocked: Invalid status', [
                'order_id' => $order->id,
                'current_status' => $order->status,
                'allowed_statuses' => ['pending', 'delayed']
            ]);
            return redirect()->back()->with('error', 'Only pending or delayed orders can be approved.');
        }

        // Check if order has sufficient stock before approval
        Log::info('Checking stock sufficiency for order', ['order_id' => $order->id]);
        
        if (!$order->hasSufficientStock()) {
            $insufficientItems = $order->getInsufficientStockItems();
            Log::error('Order approval blocked: Insufficient stock', [
                'order_id' => $order->id,
                'insufficient_items' => $insufficientItems
            ]);
            
            $errorMessage = 'Cannot approve order due to insufficient stock:\n';
            foreach ($insufficientItems as $item) {
                $errorMessage .= "• {$item['product_name']} ({$item['category']}): Requested {$item['requested_quantity']}, Available {$item['available_stock']}, Shortage {$item['shortage']}\n";
            }

            return redirect()->back()->with('error', $errorMessage);
        }
        
        Log::info('Stock sufficiency check passed', ['order_id' => $order->id]);

        // Ensure audit trail with stock is loaded
        Log::info('Loading audit trail for order', ['order_id' => $order->id]);
        $order->load(['auditTrail.stock', 'auditTrail.product']);
        
        Log::info('Audit trail loaded', [
            'order_id' => $order->id,
            'audit_trail_count' => $order->auditTrail->count(),
            'audit_trail_details' => $order->auditTrail->map(function($trail) {
                return [
                    'id' => $trail->id,
                    'sale_id' => $trail->sale_id,
                    'stock_id' => $trail->stock_id,
                    'product_id' => $trail->product_id,
                    'quantity' => $trail->quantity,
                    'category' => $trail->category,
                    'has_stock' => $trail->stock ? true : false,
                    'has_product' => $trail->product ? true : false,
                ];
            })->toArray()
        ]);
        
        // Validate that all audit trail items have stock assigned
        $missingStocks = $order->auditTrail->filter(function($trail) {
            return !$trail->stock_id || !$trail->stock;
        });
        
        if ($missingStocks->isNotEmpty()) {
            Log::error('Order approval failed: Missing stock assignments', [
                'order_id' => $order->id,
                'missing_stock_count' => $missingStocks->count(),
                'audit_trail_ids' => $missingStocks->pluck('id')->toArray(),
                'missing_stock_details' => $missingStocks->map(function($trail) {
                    return [
                        'audit_trail_id' => $trail->id,
                        'stock_id' => $trail->stock_id,
                        'product_id' => $trail->product_id,
                        'has_stock_object' => $trail->stock ? true : false,
                    ];
                })->toArray()
            ]);
            
            return redirect()->back()->with('error', 'Cannot approve order: Some items are not properly linked to stock. Please contact support.');
        }
        
        Log::info('Audit trail validation passed', ['order_id' => $order->id]);
        
        // Get multi-member order summary before processing
        $orderSummary = AuditTrailService::getMultiMemberOrderSummary($order);
        $involvedMembers = collect($orderSummary['members'])->pluck('member_id');

        Log::info('Processing multi-member order approval', [
            'order_id' => $order->id,
            'total_members' => $orderSummary['total_members_involved'],
            'involved_members' => $involvedMembers->toArray()
        ]);

        // Process the stock only when approving
        $processedMembers = collect();
        $processedStocks = collect();

        foreach ($order->auditTrail as $trail) {
            // Stock should always exist at this point due to validation above
            if (!$trail->stock) {
                Log::error('Stock missing during approval processing', [
                    'order_id' => $order->id,
                    'audit_trail_id' => $trail->id,
                    'stock_id' => $trail->stock_id
                ]);
                continue;
            }
            
            if ($trail->stock) {
                // For merged orders, allow multiple entries for the same stock
                // For regular orders, prevent duplicate processing
                $isMergedOrder = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false;
                $memberStockKey = $trail->stock->member_id . '_' . $trail->stock->id;
                
                if (!$isMergedOrder && $processedStocks->contains($memberStockKey)) {
                    Log::error('Duplicate stock processing detected in regular order', [
                        'order_id' => $order->id,
                        'member_id' => $trail->stock->member_id,
                        'stock_id' => $trail->stock->id
                    ]);
                    continue;
                }

                // Track processed stocks (but allow duplicates for merged orders)
                if (!$isMergedOrder) {
                    $processedStocks->push($memberStockKey);
                }
                $processedMembers->push($trail->stock->member_id);
                
                Log::info('Processing stock for audit trail', [
                    'order_id' => $order->id,
                    'audit_trail_id' => $trail->id,
                    'stock_id' => $trail->stock->id,
                    'member_id' => $trail->stock->member_id,
                    'quantity' => $trail->quantity,
                    'is_merged_order' => $isMergedOrder
                ]);

                // Store the quantity before deduction for audit trail
                $quantityBeforeDeduction = $trail->stock->quantity;
                $quantitySold = $trail->quantity;

                // Process pending order approval: decrease stock, increase sold, decrease pending
                $trail->stock->processPendingOrderApproval($trail->quantity);

                // Record stock movement in stock_trails table
                StockTrail::record(
                    stockId: $trail->stock->id,
                    productId: $trail->stock->product_id,
                    actionType: 'sale',
                    oldQuantity: $quantityBeforeDeduction,
                    newQuantity: $trail->stock->quantity,
                    memberId: $trail->stock->member_id,
                    category: $trail->stock->category,
                    notes: "Stock sold to customer (Order #{$order->id}, Customer ID: {$order->customer_id})",
                    performedBy: $request->user()->id,
                    performedByType: $request->user()->type
                );

                // Create comprehensive audit trail entry for order completion
                $availableStockAfterSale = $trail->stock->quantity;

                // Update the existing audit trail with comprehensive data
                $trail->update([
                    'member_id' => $trail->stock->member_id,
                    'product_name' => $trail->stock->product->name,
                    'available_stock_after_sale' => $availableStockAfterSale,
                    'order_id' => $order->id,
                ]);

                // Log stock update when quantity reaches 0
                if ($trail->stock->quantity == 0) {
                    // Log stock completion
                    SystemLogger::logStockUpdate(
                        $trail->stock->id,
                        $trail->stock->product_id,
                        $trail->quantity,
                        0,
                        $request->user()->id,
                        $request->user()->type,
                        'stock_sold',
                        [
                            'customer_id' => $order->customer_id,
                            'order_id' => $order->id,
                            'sold_quantity' => $trail->stock->sold_quantity,
                            'total_sold' => $trail->stock->sold_quantity,
                            'member_id' => $trail->stock->member_id,
                            'product_name' => $trail->stock->product->name,
                            'available_stock_after_sale' => $availableStockAfterSale
                        ]
                    );

                    // Automatically move stock to Stock Trail when quantity reaches zero
                    StockTrail::record(
                        stockId: $trail->stock->id,
                        productId: $trail->stock->product_id,
                        actionType: 'completed',
                        oldQuantity: $trail->quantity,
                        newQuantity: 0,
                        memberId: $trail->stock->member_id,
                        category: $trail->stock->category,
                        notes: "Stock fully sold and moved to Stock Trail (Order #{$order->id}). Total sold: {$trail->stock->sold_quantity}",
                        performedBy: $request->user()->id,
                        performedByType: $request->user()->type
                    );

                    Log::info('Stock automatically moved to Stock Trail', [
                        'stock_id' => $trail->stock->id,
                        'product_id' => $trail->stock->product_id,
                        'member_id' => $trail->stock->member_id,
                        'total_sold' => $trail->stock->sold_quantity,
                        'order_id' => $order->id
                    ]);
                } else {
                    // Log partial sale
                    SystemLogger::logStockUpdate(
                        $trail->stock->id,
                        $trail->stock->product_id,
                        $trail->quantity,
                        $trail->stock->quantity,
                        $request->user()->id,
                        $request->user()->type,
                        'stock_partial_sale',
                        [
                            'customer_id' => $order->customer_id,
                            'order_id' => $order->id,
                            'sold_quantity' => $trail->stock->sold_quantity,
                            'remaining_quantity' => $trail->stock->quantity,
                            'member_id' => $trail->stock->member_id,
                            'product_name' => $trail->stock->product->name,
                            'available_stock_after_sale' => $availableStockAfterSale
                        ]
                    );
                }

                // Notify member about product sale
                $trail->stock->member->notify(new ProductSaleNotification($trail->stock, $order, $order->customer, $trail));
            }
        }

        // Check if this is a merged order (skip validation for merged orders as duplicates are expected)
        $isMergedOrder = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false;
        
        if ($isMergedOrder) {
            Log::info('Skipping multi-member validation for merged order', [
                'order_id' => $order->id,
                'admin_notes' => $order->admin_notes,
                'processed_members' => $processedMembers->unique()->toArray(),
                'total_audit_entries' => $order->auditTrail->count()
            ]);
            
            // For merged orders, create a simple validation result
            $validation = [
                'is_complete' => true,
                'total_entries' => $order->auditTrail->count(),
                'member_breakdown' => $processedMembers->unique()->mapWithKeys(function($memberId) use ($order) {
                    $memberTrails = $order->auditTrail->filter(function($trail) use ($memberId) {
                        return $trail->stock && $trail->stock->member_id == $memberId;
                    });
                    
                    return [$memberId => [
                        'member_name' => $memberTrails->first()?->stock?->member?->name ?? 'Unknown',
                        'total_quantity_sold' => $memberTrails->sum('quantity'),
                        'total_revenue' => $memberTrails->sum(function($trail) {
                            return $trail->quantity * ($trail->unit_price ?? 0);
                        }),
                        'products_involved' => $memberTrails->pluck('product.name')->unique()->values()->toArray(),
                        'stock_entries' => $memberTrails->count()
                    ]];
                })->toArray()
            ];
        } else {
            // Validate multi-member order processing completeness for regular orders
            $validation = AuditTrailService::validateMultiMemberAuditTrails($order, $involvedMembers);

            if (!$validation['is_complete']) {
                Log::error('Multi-member order validation failed during approval', [
                    'order_id' => $order->id,
                    'validation' => $validation
                ]);

                return redirect()->back()->with('error', 'Order processing validation failed. Please contact support.');
            }
        }

        // Log successful multi-member order processing
        Log::info('Multi-member order approved successfully', [
            'order_id' => $order->id,
            'is_merged_order' => $isMergedOrder,
            'processed_members' => $processedMembers->unique()->toArray(),
            'total_processed_members' => $processedMembers->unique()->count(),
            'total_audit_entries' => $validation['total_entries'],
            'member_breakdown' => $validation['member_breakdown'],
            'validation_method' => $isMergedOrder ? 'merged_order_validation' : 'standard_validation'
        ]);

        // DEBUG: Log order state before final update
        Log::info('Order state before final status update', [
            'order_id' => $order->id,
            'current_status' => $order->status,
            'current_delivery_status' => $order->delivery_status,
            'current_admin_id' => $order->admin_id,
            'current_admin_notes' => $order->admin_notes,
            'current_is_suspicious' => $order->is_suspicious,
            'current_suspicious_reason' => $order->suspicious_reason,
        ]);

        // Preserve existing admin_notes if this is a merged order
        $isMergedOrder = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false;
        $newAdminNotes = $request->input('admin_notes');
        
        if ($isMergedOrder && empty($newAdminNotes)) {
            // Keep the existing merge notes
            $adminNotesToSave = $order->admin_notes;
        } elseif ($isMergedOrder && !empty($newAdminNotes)) {
            // Append new notes to existing merge notes
            $adminNotesToSave = $order->admin_notes . ' | ' . $newAdminNotes;
        } else {
            // Use new notes or null
            $adminNotesToSave = $newAdminNotes;
        }
        
        $updateData = [
            'status' => 'approved',
            'delivery_status' => 'pending',
            'admin_id' => $request->user()->id,
            'admin_notes' => $adminNotesToSave,
            'is_suspicious' => false, // Clear suspicious flag when approved
            'suspicious_reason' => null, // Clear suspicious reason
        ];

        Log::info('Attempting to update order with data', [
            'order_id' => $order->id,
            'update_data' => $updateData
        ]);

        $updateResult = $order->update($updateData);

        Log::info('Order update result', [
            'order_id' => $order->id,
            'update_successful' => $updateResult,
            'new_status' => $order->fresh()->status,
            'new_delivery_status' => $order->fresh()->delivery_status,
            'new_admin_id' => $order->fresh()->admin_id,
            'new_admin_notes' => $order->fresh()->admin_notes,
            'new_is_suspicious' => $order->fresh()->is_suspicious,
            'new_suspicious_reason' => $order->fresh()->suspicious_reason,
        ]);

        // Auto-clear suspicious flag for related orders in the same 10-minute window
        $clearedCount = $this->autoClearSuspiciousOrders($order);
        
        if ($clearedCount > 0) {
            Log::info('Auto-cleared suspicious orders after approval', [
                'order_id' => $order->id,
                'cleared_count' => $clearedCount,
            ]);
        }

        // Log order approval
        SystemLogger::logOrderStatusChange(
            $order->id,
            'pending',
            'approved',
            $request->user()->id,
            $request->user()->type,
            [
                'admin_notes' => $request->input('admin_notes'),
                'total_amount' => $order->total_amount,
                'customer_id' => $order->customer_id,
                'was_merged_order' => strpos($order->admin_notes ?? '', 'Merged from orders:') !== false,
            ]
        );

        // Notify the customer with status update
        try {
            $order->customer?->notify(new OrderStatusUpdate($order->id, 'approved', 'Your order has been approved and is being processed.'));
            Log::info('Customer notification sent successfully', ['order_id' => $order->id, 'customer_id' => $order->customer_id]);
        } catch (\Exception $e) {
            Log::error('Failed to send customer notification', [
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'error' => $e->getMessage()
            ]);
        }

        // Send order receipt email to customer
        try {
            $order->customer?->notify(new OrderReceipt($order));
            Log::info('Receipt email sent successfully', ['order_id' => $order->id, 'customer_id' => $order->customer_id]);
        } catch (\Exception $e) {
            Log::error('Failed to send receipt email', [
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'error' => $e->getMessage()
            ]);
        }

        Log::info('Order approval process completed successfully', [
            'order_id' => $order->id,
            'final_status' => $order->fresh()->status,
            'redirect_route' => 'admin.orders.show'
        ]);

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', 'Order approved successfully. Receipt email sent to customer. Please assign a logistic provider.');
    }

    public function reject(Request $request, SalesAudit $order)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        // Prevent rejection of cancelled orders
        if ($order->status === 'cancelled') {
            return redirect()->back()->with('error', 'Cannot reject a cancelled order.');
        }

        // Release pending orders or reverse stock changes
        foreach ($order->auditTrail as $trail) {
            if ($trail->stock) {
                if ($order->status === 'approved') {
                    // If order was already approved, reverse the stock changes
                    // Store quantity before reversal
                    $quantityBeforeReversal = $trail->stock->quantity;

                    // Restore available quantity
                    $trail->stock->quantity += $trail->quantity;

                    // Deduct from sold quantity
                    $trail->stock->sold_quantity -= $trail->quantity;

                    $trail->stock->save();

                    // Record stock reversal in stock_trails table
                    StockTrail::record(
                        stockId: $trail->stock->id,
                        productId: $trail->stock->product_id,
                        actionType: 'reversal',
                        oldQuantity: $quantityBeforeReversal,
                        newQuantity: $trail->stock->quantity,
                        memberId: $trail->stock->member_id,
                        category: $trail->stock->category,
                        notes: "Stock reversed due to order rejection (Order #{$order->id})",
                        performedBy: $request->user()->id,
                        performedByType: $request->user()->type
                    );

                    // Log stock reversal
                    SystemLogger::logStockUpdate(
                        $trail->stock->id,
                        $trail->stock->product_id,
                        $trail->quantity,
                        $trail->stock->quantity,
                        $request->user()->id,
                        $request->user()->type,
                        'stock_reversal',
                        [
                            'order_id' => $order->id,
                            'reason' => 'order_rejected',
                            'sold_quantity' => $trail->stock->sold_quantity,
                            'available_quantity' => $trail->stock->quantity
                        ]
                    );
                } else {
                    // If order is still pending, just release the pending order quantity
                    $trail->stock->processPendingOrderRejection($trail->quantity);

                    // Log pending order release
                    SystemLogger::logStockUpdate(
                        $trail->stock->id,
                        $trail->stock->product_id,
                        0,
                        $trail->stock->quantity,
                        $request->user()->id,
                        $request->user()->type,
                        'pending_order_released',
                        [
                            'order_id' => $order->id,
                            'reason' => 'order_rejected',
                            'released_quantity' => $trail->quantity,
                            'pending_order_qty' => $trail->stock->pending_order_qty
                        ]
                    );
                }
            }
        }

        $order->update([
            'status' => 'rejected',
            'delivery_status' => null,
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->input('admin_notes'),
            'is_suspicious' => false, // Clear suspicious flag when rejected
            'suspicious_reason' => null, // Clear suspicious reason
        ]);

        // Auto-clear suspicious flag for related orders in the same 10-minute window
        $clearedCount = $this->autoClearSuspiciousOrders($order);
        
        if ($clearedCount > 0) {
            Log::info('Auto-cleared suspicious orders after rejection', [
                'order_id' => $order->id,
                'cleared_count' => $clearedCount,
            ]);
        }

        // Log order rejection
        SystemLogger::logOrderStatusChange(
            $order->id,
            $order->status === 'approved' ? 'approved' : 'pending',
            'rejected',
            $request->user()->id,
            $request->user()->type,
            [
                'admin_notes' => $request->input('admin_notes'),
                'total_amount' => $order->total_amount,
                'customer_id' => $order->customer_id,
                'stock_reversed' => $order->status === 'approved'
            ]
        );

        // Notify the customer with detailed rejection notification
        $order->customer?->notify(new OrderRejectionNotification($order));

        return redirect()->route('admin.orders.index')->with('message', 'Order rejected successfully');
    }

    public function markUrgent(Request $request, Sales $order)
    {
        Log::info('Mark urgent called for order: ' . $order->id);

        if ($order->status !== 'pending') {
            Log::info('Order is not pending, status: ' . $order->status);
            return redirect()->back()->with('error', 'Only pending orders can be marked as urgent.');
        }

        $order->update(['is_urgent' => true]);
        Log::info('Order marked as urgent successfully');

        return redirect()->back()->with('message', 'Order marked as urgent successfully.');
    }

    public function unmarkUrgent(Request $request, Sales $order)
    {
        Log::info('Unmark urgent called for order: ' . $order->id);

        $order->update(['is_urgent' => false]);
        Log::info('Order urgency removed successfully');

        return redirect()->back()->with('message', 'Order urgency removed successfully.');
    }



    public function markReady(Request $request, SalesAudit $order)
    {
        // Check if order is approved and pending
        if ($order->status !== 'approved' || $order->delivery_status !== 'pending') {
            return redirect()->back()->with('error', 'Order is not ready to be marked as ready for pickup.');
        }

        // Update delivery status to ready for pickup using unified method
        $order->markAsReady();

        // Log the action
        SystemLogger::logOrderStatusChange(
            $order->id,
            'pending',
            'ready_to_pickup',
            $request->user()->id,
            'admin',
            [
                'delivery_status' => 'ready_to_pickup',
                'delivery_ready_time' => $order->delivery_ready_time?->toISOString(),
            ]
        );

        // Send notification to assigned logistic
        if ($order->logistic_id) {
            $order->logistic->notify(new \App\Notifications\LogisticOrderReadyNotification($order));
        }

        // Send delivery status notification to customer
        $order->customer?->notify(new \App\Notifications\DeliveryStatusUpdate(
            $order->id,
            'ready_to_pickup',
            'Your order is ready for pickup and will be delivered soon.'
        ));

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', 'Order marked as ready for pickup successfully. Logistic and customer have been notified.');
    }

    public function markPickedUp(Request $request, SalesAudit $order)
    {
        // Validate confirmation text
        $request->validate([
            'confirmation_text' => 'required|string|in:Confirm Pick Up',
        ]);

        // Check if order is approved and ready for pickup
        if ($order->status !== 'approved' || $order->delivery_status !== 'ready_to_pickup') {
            return redirect()->back()->with('error', 'Order is not ready for pickup.');
        }

        // Update delivery status to out for delivery using unified method
        $order->markAsPacked();

        // Log the action
        SystemLogger::logOrderStatusChange(
            $order->id,
            'ready_to_pickup',
            'out_for_delivery',
            $request->user()->id,
            'admin',
            [
                'delivery_status' => 'out_for_delivery',
                'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
            ]
        );

        // Send delivery status notification to customer
        $order->customer?->notify(new \App\Notifications\DeliveryStatusUpdate(
            $order->id,
            'out_for_delivery',
            'Your order is out for delivery and on its way to you.'
        ));

        // Send notification to logistic about pickup confirmation
        if ($order->logistic_id) {
            $order->logistic->notify(new \App\Notifications\LogisticOrderPickedUpNotification($order));
        }

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', 'Order marked as picked up and set to out for delivery successfully.');
    }

    public function process(Request $request, Sales $order)
    {
        // This method processes the order (moves from approved to processed)
        // For now, we'll just update the status to approved if it's pending
        if ($order->status === 'pending') {
            $order->update([
                'status' => 'approved',
                'admin_id' => $request->user()->id,
            ]);
        }

        return redirect()->route('admin.orders.index')->with('message', 'Order processed successfully');
    }

    public function generateReport(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $status = $request->get('status', 'all');
        $deliveryStatus = $request->get('delivery_status', 'all');
        $logisticIds = $request->get('logistic_ids', []);
        $adminIds = $request->get('admin_ids', []);
        $search = $request->get('search');
        $minAmount = $request->get('min_amount');
        $maxAmount = $request->get('max_amount');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode
        $paperSize = $request->get('paper_size', 'A4'); // A4, Letter, Legal, A3
        $orientation = $request->get('orientation', 'landscape'); // portrait, landscape

        $query = SalesAudit::with(['customer.defaultAddress', 'address', 'admin', 'logistic', 'auditTrail.product']);

        // Filter by date range
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by delivery status
        if ($deliveryStatus !== 'all') {
            $query->where('delivery_status', $deliveryStatus);
        }

        // Filter by logistics
        if (!empty($logisticIds) && is_array($logisticIds)) {
            $query->whereIn('logistic_id', $logisticIds);
        }

        // Filter by admin/staff (processed by)
        if (!empty($adminIds) && is_array($adminIds)) {
            $query->whereIn('admin_id', $adminIds);
        }

        // Filter by amount range
        if ($minAmount !== null && $minAmount !== '') {
            $query->where('total_amount', '>=', $minAmount);
        }
        if ($maxAmount !== null && $maxAmount !== '') {
            $query->where('total_amount', '<=', $maxAmount);
        }

        // Search functionality
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('admin_notes', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $orders = $query->get();

        // Apply sorting
        $orders = $orders->sortBy(function ($order) use ($sortBy) {
            switch ($sortBy) {
                case 'customer':
                    return $order->customer->name ?? '';
                case 'admin':
                    return $order->admin->name ?? '';
                case 'logistic':
                    return $order->logistic->name ?? '';
                default:
                    return $order->{$sortBy} ?? '';
            }
        }, SORT_REGULAR, $sortOrder === 'desc')->values();

        // Calculate summary statistics
        $summary = [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total_amount'),
            'total_subtotal' => $orders->sum('subtotal'),
            'total_coop_share' => $orders->sum('coop_share'),
            'total_member_share' => $orders->sum('member_share'),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'approved_orders' => $orders->where('status', 'approved')->count(),
            'rejected_orders' => $orders->where('status', 'rejected')->count(),
            'delivered_orders' => $orders->where('delivery_status', 'delivered')->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($orders, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($orders, $summary, $display, $paperSize, $orientation);
        }

        // Get all logistics for filter dropdown (only active logistics)
        $logistics = User::where('type', 'logistic')
            ->where('active', true)
            ->select('id', 'name', 'contact_number')
            ->orderBy('name')
            ->get();

        // Get all admins and staff for filter dropdown
        $admins = User::whereIn('type', ['admin', 'staff'])
            ->select('id', 'name', 'email', 'type')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        // Return view for display
        return Inertia::render('Admin/Orders/report', [
            'orders' => $orders,
            'summary' => $summary,
            'logistics' => $logistics,
            'admins' => $admins,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'delivery_status' => $deliveryStatus,
                'logistic_ids' => $logisticIds,
                'admin_ids' => $adminIds,
                'search' => $search,
                'min_amount' => $minAmount,
                'max_amount' => $maxAmount,
            ],
        ]);
    }

    private function exportToCsv($orders, $summary, $display = false)
    {
        $filename = 'orders_report_' . date('Y-m-d_H-i-s') . '.csv';

        if ($display) {
            // For display mode, return as plain text to show in browser
            $headers = [
                'Content-Type' => 'text/plain',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ];
        } else {
            // For download mode, return as CSV attachment
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];
        }

        $callback = function () use ($orders, $summary) {
            $file = fopen('php://output', 'w');

            // Write headers
            fputcsv($file, [
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Customer Contact',
                'Total Amount',
                'Subtotal',
                'Co-op Share',
                'Member Share',
                'Status',
                'Delivery Status',
                'Created Date',
                'Processed By',
                'Admin Notes',
                'Logistic',
                'Logistic Contact',
                'Items Count'
            ]);

            // Write order data
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->customer?->name ?? 'N/A',
                    $order->customer?->email ?? 'N/A',
                    $order->customer?->contact_number ?? 'N/A',
                    '₱' . number_format($order->total_amount, 2),
                    '₱' . number_format($order->subtotal ?? 0, 2),
                    '₱' . number_format($order->coop_share ?? 0, 2),
                    '₱' . number_format($order->member_share ?? 0, 2),
                    $order->status,
                    $order->delivery_status ?? 'N/A',
                    $order->created_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    $order->admin?->name ?? 'N/A',
                    $order->admin_notes ?? 'N/A',
                    $order->logistic?->name ?? 'N/A',
                    $order->logistic?->contact_number ?? 'N/A',
                    $order->auditTrail->count()
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($orders, $summary, $display = false, $paperSize = 'A4', $orientation = 'landscape')
    {
        // Encode logo as base64 for PDF embedding
        $logoPath = storage_path('app/public/logo/smmc-logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
        }

        $html = view('reports.orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'logo_base64' => $logoBase64
        ])->render();

        $pdf = Pdf::loadHTML($html);
        
        // Set paper size and orientation (supports: A4, Letter, Legal, A3, etc.)
        $pdf->setPaper($paperSize, $orientation);

        $filename = 'orders_report_' . date('Y-m-d_H-i-s') . '.pdf';

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }
}
