<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\StockTrail;
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
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $highlightOrderId = $request->get('highlight_order');
        $showUrgentApproval = $request->get('urgent_approval', false);

        // Optimize: Load only recent orders with essential data including audit trail for order cards
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
            'auditTrail.product.stocks' => function ($query) {
                $query->where('quantity', '>', 0)->whereNull('removed_at');
            }
        ])
            ->select('id', 'customer_id', 'address_id', 'admin_id', 'logistic_id', 'total_amount', 'status', 'delivery_status', 'delivery_packed_time', 'delivered_time', 'created_at', 'admin_notes', 'is_urgent')
            ->orderBy('created_at', 'desc')
            ->limit(200) // Reduced limit for better performance
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
            ];
        });

        // Filter orders by status if needed
        if ($status === 'all') {
            $orders = $processedOrders;
        } else {
            $orders = $processedOrders->where('status', $status)->values();
        }

        // Get available logistics for assignment
        $logistics = User::where('type', 'logistic')->get(['id', 'name', 'contact_number']);

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

    public function show(Request $request, SalesAudit $order)
    {
        $order->load(['customer.defaultAddress', 'address', 'admin', 'logistic', 'auditTrail.product', 'auditTrail.stock']);

        // Get available logistics for assignment
        $logistics = User::where('type', 'logistic')->get(['id', 'name', 'contact_number']);

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

    public function approve(Request $request, SalesAudit $order)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Prevent approval of cancelled orders
        if ($order->status === 'cancelled') {
            return redirect()->back()->with('error', 'Cannot approve a cancelled order.');
        }

        // Allow approval for pending and delayed orders
        if (!in_array($order->status, ['pending', 'delayed'])) {
            return redirect()->back()->with('error', 'Only pending or delayed orders can be approved.');
        }

        // Check if order has sufficient stock before approval
        if (!$order->hasSufficientStock()) {
            $insufficientItems = $order->getInsufficientStockItems();
            $errorMessage = 'Cannot approve order due to insufficient stock:\n';
            foreach ($insufficientItems as $item) {
                $errorMessage .= "• {$item['product_name']} ({$item['category']}): Requested {$item['requested_quantity']}, Available {$item['available_stock']}, Shortage {$item['shortage']}\n";
            }

            return redirect()->back()->with('error', $errorMessage);
        }

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
            if ($trail->stock) {
                // Validate no duplicate processing
                $memberStockKey = $trail->stock->member_id . '_' . $trail->stock->id;
                if ($processedStocks->contains($memberStockKey)) {
                    Log::error('Duplicate stock processing detected', [
                        'order_id' => $order->id,
                        'member_id' => $trail->stock->member_id,
                        'stock_id' => $trail->stock->id
                    ]);
                    continue;
                }

                $processedStocks->push($memberStockKey);
                $processedMembers->push($trail->stock->member_id);

                // Store the quantity before deduction for audit trail
                $quantityBeforeDeduction = $trail->stock->quantity;
                $quantitySold = $trail->quantity;

                // Deduct from available quantity
                $trail->stock->quantity -= $trail->quantity;

                // Add to sold quantity
                $trail->stock->sold_quantity += $trail->quantity;

                $trail->stock->save();

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

        // Validate multi-member order processing completeness
        $validation = AuditTrailService::validateMultiMemberAuditTrails($order, $involvedMembers);

        if (!$validation['is_complete']) {
            Log::error('Multi-member order validation failed during approval', [
                'order_id' => $order->id,
                'validation' => $validation
            ]);

            return redirect()->back()->with('error', 'Order processing validation failed. Please contact support.');
        }

        // Log successful multi-member order processing
        Log::info('Multi-member order approved successfully', [
            'order_id' => $order->id,
            'processed_members' => $processedMembers->unique()->toArray(),
            'total_audit_entries' => $validation['total_entries'],
            'member_breakdown' => $validation['member_breakdown']
        ]);

        $order->update([
            'status' => 'approved',
            'delivery_status' => 'pending',
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->input('admin_notes'),
        ]);

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
                'customer_id' => $order->customer_id
            ]
        );

        // Notify the customer with status update
        $order->customer?->notify(new OrderStatusUpdate($order->id, 'approved', 'Your order has been approved and is being processed.'));

        // Send order receipt email to customer
        $order->customer?->notify(new OrderReceipt($order));

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

        // If order was already processed, we need to reverse the stock changes
        if ($order->status === 'approved') {
            // Reverse stock changes
            foreach ($order->auditTrail as $trail) {
                if ($trail->stock) {
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
                }
            }
        }

        $order->update([
            'status' => 'rejected',
            'delivery_status' => null,
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->input('admin_notes'),
        ]);

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

        // Get all logistics for filter dropdown
        $logistics = User::where('type', 'logistic')
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
        $logoPath = storage_path('app/public/logo/SMMC Logo-1.png');
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
