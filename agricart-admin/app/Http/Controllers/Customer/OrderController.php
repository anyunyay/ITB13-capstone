<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Notifications\OrderStatusUpdate;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->get('status', 'all');
        $deliveryStatus = $request->get('delivery_status', 'all');

        // Get all orders from both tables but prioritize sales table for delivered orders
        $allOrders = collect();
        
        // First, get delivered orders from sales table (these are the final, confirmed orders)
        if ($deliveryStatus === 'all' || $deliveryStatus === 'delivered') {
            $salesQuery = $user->sales()
                ->with(['auditTrail.product', 'admin', 'logistic', 'salesAudit']);

            $salesOrders = $salesQuery->orderBy('delivered_at', 'desc')
                ->get()
                ->map(function ($sale) {
                    return [
                        'id' => $sale->id,
                        'total_amount' => $sale->total_amount,
                        'status' => 'delivered', // All sales table orders are delivered
                        'delivery_status' => 'delivered',
                        'created_at' => $sale->created_at->toISOString(),
                        'delivered_at' => $sale->delivered_at?->toISOString(),
                        'admin_notes' => $sale->admin_notes,
                        'logistic' => $sale->logistic ? [
                            'id' => $sale->logistic->id,
                            'name' => $sale->logistic->name,
                            'contact_number' => $sale->logistic->contact_number,
                        ] : null,
                        'audit_trail' => $sale->auditTrail->map(function ($trail) {
                            // Calculate unit price based on category
                            $unitPrice = 0;
                            switch ($trail->category) {
                                case 'Kilo':
                                    $unitPrice = $trail->price_kilo ?? $trail->product->price_kilo ?? 0;
                                    break;
                                case 'Pc':
                                    $unitPrice = $trail->price_pc ?? $trail->product->price_pc ?? 0;
                                    break;
                                case 'Tali':
                                    $unitPrice = $trail->price_tali ?? $trail->product->price_tali ?? 0;
                                    break;
                            }
                            
                            $subtotal = $trail->quantity * $unitPrice;
                            $coopShare = $subtotal * 0.10; // 10% co-op share
                            $totalAmount = $subtotal + $coopShare;
                            
                            return [
                                'id' => $trail->id,
                                'product' => [
                                    'id' => $trail->product->id,
                                    'name' => $trail->product->name,
                                    'price_kilo' => $trail->price_kilo ?? $trail->product->price_kilo,
                                    'price_pc' => $trail->price_pc ?? $trail->product->price_pc,
                                    'price_tali' => $trail->price_tali ?? $trail->product->price_tali,
                                ],
                                'category' => $trail->category,
                                'quantity' => $trail->quantity,
                                'unit_price' => $unitPrice,
                                'subtotal' => $subtotal,
                                'coop_share' => $coopShare,
                                'total_amount' => $totalAmount,
                            ];
                        }),
                        'customer_received' => $sale->customer_received,
                        'customer_rate' => $sale->customer_rate,
                        'customer_feedback' => $sale->customer_feedback,
                        'customer_confirmed_at' => $sale->customer_confirmed_at?->toISOString(),
                        'source' => 'sales', // To identify source
                    ];
                });
            
            $allOrders = $allOrders->concat($salesOrders);
        }
        
        // Then, get orders from sales_audit that are NOT already in sales table
        $salesAuditQuery = $user->salesAudit()
            ->with(['auditTrail.product', 'admin', 'logistic']);

        // Filter by delivery status (primary filter for tabs)
        if ($deliveryStatus !== 'all') {
            if ($deliveryStatus === 'pending') {
                // Pending tab: show orders with status 'pending' or 'delayed', or approved orders still being prepared
                $salesAuditQuery->where(function($query) {
                    $query->whereIn('status', ['pending', 'delayed'])
                          ->orWhere(function($subQuery) {
                              $subQuery->where('status', 'approved')
                                       ->where('delivery_status', 'pending');
                          });
                });
            } elseif ($deliveryStatus === 'out_for_delivery') {
                // Out for Delivery tab: show approved orders that are ready for pickup or out for delivery
                $salesAuditQuery->where('status', 'approved')
                    ->whereIn('delivery_status', ['ready_to_pickup', 'out_for_delivery']);
            } elseif ($deliveryStatus === 'delivered') {
                // Delivered tab: show approved orders that are delivered (but not yet in sales table)
                $salesAuditQuery->where('status', 'approved')
                    ->where('delivery_status', 'delivered');
            }
        }

        // Filter by status (secondary filter)
        if ($status !== 'all') {
            $salesAuditQuery->where('status', $status);
        }

        // Exclude orders that already exist in sales table to prevent duplicates
        if ($deliveryStatus === 'all' || $deliveryStatus === 'delivered') {
            $existingSalesIds = $user->sales()->pluck('sales_audit_id')->filter();
            if ($existingSalesIds->isNotEmpty()) {
                $salesAuditQuery->whereNotIn('id', $existingSalesIds);
            }
        }

        $salesAuditOrders = $salesAuditQuery->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                // Check if order should be marked as delayed (over 24 hours and still pending)
                $orderAge = $sale->created_at->diffInHours(now());
                if ($sale->status === 'pending' && $orderAge > 24) {
                    $sale->update(['status' => 'delayed']);
                    $sale->status = 'delayed';
                }
                
                return [
                    'id' => $sale->id,
                    'total_amount' => $sale->total_amount,
                    'status' => $sale->status,
                    'delivery_status' => $sale->delivery_status,
                    'created_at' => $sale->created_at->toISOString(),
                    'admin_notes' => $sale->admin_notes,
                    'logistic' => $sale->logistic ? [
                        'id' => $sale->logistic->id,
                        'name' => $sale->logistic->name,
                        'contact_number' => $sale->logistic->contact_number,
                    ] : null,
                    'audit_trail' => $sale->getAggregatedAuditTrail(),
                    'source' => 'sales_audit', // To identify source
                ];
            });

        // Combine orders and sort by creation date
        $allOrders = $allOrders->concat($salesAuditOrders)
            ->sortByDesc('created_at')
            ->values();

        // Get counts for delivery status tabs (avoid double counting)
        $existingSalesIds = $user->sales()->pluck('sales_audit_id')->filter();
        $salesCount = $user->sales()->count();
        
        // Calculate counts for each tab based on actual status logic
        $pendingOrders = $user->salesAudit()
            ->where(function($query) {
                $query->whereIn('status', ['pending', 'delayed'])
                      ->orWhere(function($subQuery) {
                          $subQuery->where('status', 'approved')
                                   ->where('delivery_status', 'pending');
                      });
            })
            ->whereNotIn('id', $existingSalesIds)
            ->count();
            
        $outForDeliveryOrders = $user->salesAudit()
            ->where('status', 'approved')
            ->whereIn('delivery_status', ['ready_to_pickup', 'out_for_delivery'])
            ->whereNotIn('id', $existingSalesIds)
            ->count();
            
        $deliveredOrders = $user->salesAudit()
            ->where('status', 'approved')
            ->where('delivery_status', 'delivered')
            ->whereNotIn('id', $existingSalesIds)
            ->count() + $salesCount; // Include sales table orders
        
        $allOrdersCount = $pendingOrders + $outForDeliveryOrders + $deliveredOrders;

        // Pagination: 5 items per page
        $page = $request->get('page', 1);
        $perPage = 5;
        $total = $allOrders->count();
        $paginatedOrders = $allOrders->forPage($page, $perPage)->values();

        return Inertia::render('Customer/OrderHistory/index', [
            'orders' => $paginatedOrders,
            'currentStatus' => $status,
            'currentDeliveryStatus' => $deliveryStatus,
            'pagination' => [
                'current_page' => (int) $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
            'counts' => [
                'all' => $allOrdersCount,
                'pending' => $pendingOrders,
                'approved' => $outForDeliveryOrders,
                'rejected' => 0, // Not used for delivery status tabs
                'delivered' => $deliveredOrders,
            ],
        ]);
    }

    public function generateReport(Request $request)
    {
        $user = $request->user();
        
        // Set default date range to 1 month from today if not provided
        $endDate = $request->get('end_date', now()->format('Y-m-d'));
        $startDate = $request->get('start_date', now()->subMonth()->format('Y-m-d'));
        
        $status = $request->get('status', 'all');
        $deliveryStatus = $request->get('delivery_status', 'all');
        $format = $request->get('format', 'view'); // view, csv, pdf

        // Get orders from both tables but avoid duplicates
        $allOrders = collect();
        
        // Get delivered orders from sales table
        if ($deliveryStatus === 'all' || $deliveryStatus === 'delivered') {
            $salesQuery = $user->sales()->with(['auditTrail.product', 'admin', 'logistic']);
            
            // Filter by date range
            if ($startDate) {
                $salesQuery->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $salesQuery->whereDate('created_at', '<=', $endDate);
            }
            
            $salesOrders = $salesQuery->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($sale) {
                    return [
                        'id' => $sale->id,
                        'total_amount' => $sale->total_amount,
                        'status' => 'delivered',
                        'delivery_status' => 'delivered',
                        'created_at' => $sale->created_at,
                        'admin_notes' => $sale->admin_notes,
                        'logistic' => $sale->logistic,
                        'audit_trail' => $sale->auditTrail->map(function ($trail) {
                            // Calculate unit price based on category
                            $unitPrice = 0;
                            switch ($trail->category) {
                                case 'Kilo':
                                    $unitPrice = $trail->price_kilo ?? $trail->product->price_kilo ?? 0;
                                    break;
                                case 'Pc':
                                    $unitPrice = $trail->price_pc ?? $trail->product->price_pc ?? 0;
                                    break;
                                case 'Tali':
                                    $unitPrice = $trail->price_tali ?? $trail->product->price_tali ?? 0;
                                    break;
                            }
                            
                            $subtotal = $trail->quantity * $unitPrice;
                            $coopShare = $subtotal * 0.10;
                            $totalAmount = $subtotal + $coopShare;
                            
                            return [
                                'id' => $trail->id,
                                'product' => [
                                    'id' => $trail->product->id,
                                    'name' => $trail->product->name,
                                    'price_kilo' => $trail->price_kilo ?? $trail->product->price_kilo,
                                    'price_pc' => $trail->price_pc ?? $trail->product->price_pc,
                                    'price_tali' => $trail->price_tali ?? $trail->product->price_tali,
                                ],
                                'category' => $trail->category,
                                'quantity' => $trail->quantity,
                                'unit_price' => $unitPrice,
                                'subtotal' => $subtotal,
                                'coop_share' => $coopShare,
                                'total_amount' => $totalAmount,
                            ];
                        }),
                    ];
                });
            $allOrders = $allOrders->concat($salesOrders);
        }
        
        // Get orders from sales_audit that are NOT in sales table
        $salesAuditQuery = $user->salesAudit()->with(['auditTrail.product', 'admin', 'logistic']);
        
        // Exclude orders that already exist in sales table
        $existingSalesIds = $user->sales()->pluck('sales_audit_id')->filter();
        if ($existingSalesIds->isNotEmpty()) {
            $salesAuditQuery->whereNotIn('id', $existingSalesIds);
        }

        // Filter by date range
        if ($startDate) {
            $salesAuditQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $salesAuditQuery->whereDate('created_at', '<=', $endDate);
        }

        // Filter by delivery status (primary filter)
        if ($deliveryStatus !== 'all') {
            if ($deliveryStatus === 'pending') {
                // Pending tab: show orders with status 'pending' or 'delayed', or approved orders still being prepared
                $salesAuditQuery->where(function($query) {
                    $query->whereIn('status', ['pending', 'delayed'])
                          ->orWhere(function($subQuery) {
                              $subQuery->where('status', 'approved')
                                       ->where('delivery_status', 'pending');
                          });
                });
            } elseif ($deliveryStatus === 'out_for_delivery') {
                // Out for Delivery tab: show approved orders that are ready for pickup or out for delivery
                $salesAuditQuery->where('status', 'approved')
                    ->whereIn('delivery_status', ['ready_to_pickup', 'out_for_delivery']);
            } elseif ($deliveryStatus === 'delivered') {
                // Delivered tab: show approved orders that are delivered (but not yet in sales table)
                $salesAuditQuery->where('status', 'approved')
                    ->where('delivery_status', 'delivered');
            }
        }

        // Filter by status (secondary filter)
        if ($status !== 'all') {
            $salesAuditQuery->where('status', $status);
        }

        $salesAuditOrders = $salesAuditQuery->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'total_amount' => $sale->total_amount,
                    'status' => $sale->status,
                    'delivery_status' => $sale->delivery_status,
                    'created_at' => $sale->created_at,
                    'admin_notes' => $sale->admin_notes,
                    'logistic' => $sale->logistic,
                    'audit_trail' => $sale->auditTrail->map(function ($trail) {
                        // Calculate unit price based on category
                        $unitPrice = 0;
                        switch ($trail->category) {
                            case 'Kilo':
                                $unitPrice = $trail->price_kilo ?? $trail->product->price_kilo ?? 0;
                                break;
                            case 'Pc':
                                $unitPrice = $trail->price_pc ?? $trail->product->price_pc ?? 0;
                                break;
                            case 'Tali':
                                $unitPrice = $trail->price_tali ?? $trail->product->price_tali ?? 0;
                                break;
                        }
                        
                        return [
                            'id' => $trail->id,
                            'product' => [
                                'id' => $trail->product->id,
                                'name' => $trail->product->name,
                            ],
                            'category' => $trail->category,
                            'quantity' => $trail->quantity,
                            'unit_price' => $unitPrice,
                        ];
                    })->toArray(),
                ];
            });
        $allOrders = $allOrders->concat($salesAuditOrders);

        // Calculate summary statistics
        $summary = [
            'total_orders' => $allOrders->count(),
            'total_spent' => $allOrders->sum('total_amount'),
            'pending_orders' => $allOrders->where('status', 'pending')->count(),
            'approved_orders' => $allOrders->where('status', 'approved')->count(),
            'rejected_orders' => $allOrders->where('status', 'rejected')->count(),
            'delivered_orders' => $allOrders->where('delivery_status', 'delivered')->count(),
        ];

        // Always export as PDF
        return $this->exportToPdf($allOrders, $summary);
    }

    private function exportToPdf($orders, $summary)
    {
        $html = view('reports.customer-orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)
            ->setPaper('a4', 'landscape');
        
        $filename = 'my_orders_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }

    public function cancel(Request $request, Sales $order)
    {
        $user = $request->user();
        
        // Verify the order belongs to the authenticated customer
        if ($order->customer_id !== $user->id) {
            return redirect()->back()->with('error', 'You can only cancel your own orders.');
        }
        
        // Only allow cancellation of delayed orders
        if ($order->status !== 'delayed') {
            return redirect()->back()->with('error', 'Only delayed orders can be cancelled.');
        }
        
        // Update order status to cancelled
        $order->update([
            'status' => 'cancelled',
            'delivery_status' => null,
        ]);
        
        // Notify the customer
        $user->notify(new OrderStatusUpdate($order->id, 'cancelled', 'Your order has been cancelled as requested.'));
        
        return redirect()->route('orders.history')
            ->with('message', 'Order #' . $order->id . ' has been cancelled successfully.');
    }

    public function confirmReceived(Request $request, Sales $order)
    {
        $user = $request->user();
        
        // Verify the order belongs to the authenticated customer
        if ($order->customer_id !== $user->id) {
            return redirect()->back()->with('error', 'You can only confirm your own orders.');
        }
        
        // Only allow confirmation of delivered orders
        if (!$order->delivered_at) {
            return redirect()->back()->with('error', 'Order must be delivered before confirmation.');
        }
        
        // Check if already confirmed
        if ($order->customer_received) {
            return redirect()->back()->with('error', 'Order has already been confirmed as received.');
        }
        
        $request->validate([
            'rating' => 'nullable|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);
        
        // Mark order as received
        $order->markAsReceived($request->input('rating'), $request->input('feedback'));
        
        return redirect()->back()->with('success', 'Order confirmed as received successfully!');
    }
}
