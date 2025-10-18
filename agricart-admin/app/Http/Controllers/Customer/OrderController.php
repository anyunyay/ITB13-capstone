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

        // Get orders from sales_audit (pending, approved, rejected, etc.)
        $salesAuditQuery = $user->salesAudit()
            ->with(['auditTrail.product', 'admin', 'logistic']);

        // Filter by delivery status (primary filter for tabs)
        if ($deliveryStatus !== 'all') {
            $salesAuditQuery->where('delivery_status', $deliveryStatus);
        }

        // Filter by status (secondary filter)
        if ($status !== 'all') {
            $salesAuditQuery->where('status', $status);
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

        // Get delivered orders from sales table (for confirmation)
        $salesQuery = $user->sales()
            ->with(['auditTrail.product', 'admin', 'logistic', 'salesAudit']);

        // Only show delivered orders from sales table
        if ($deliveryStatus === 'all' || $deliveryStatus === 'delivered') {
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
                            return [
                                'id' => $trail->id,
                                'product' => [
                                    'name' => $trail->product->name,
                                    'price_kilo' => $trail->price_kilo ?? $trail->product->price_kilo,
                                    'price_pc' => $trail->price_pc ?? $trail->product->price_pc,
                                    'price_tali' => $trail->price_tali ?? $trail->product->price_tali,
                                ],
                                'category' => $trail->category,
                                'quantity' => $trail->quantity,
                            ];
                        }),
                        'customer_received' => $sale->customer_received,
                        'customer_rate' => $sale->customer_rate,
                        'customer_feedback' => $sale->customer_feedback,
                        'customer_confirmed_at' => $sale->customer_confirmed_at?->toISOString(),
                        'source' => 'sales', // To identify source
                    ];
                });
        } else {
            $salesOrders = collect();
        }

        // Combine orders and sort by creation date
        $allOrders = $salesAuditOrders->concat($salesOrders)
            ->sortByDesc('created_at')
            ->values();

        // Get counts for delivery status tabs
        $allOrdersCount = $user->salesAudit()->count() + $user->sales()->count();
        $pendingDeliveryOrders = $user->salesAudit()->where('delivery_status', 'pending')->count();
        $outForDeliveryOrders = $user->salesAudit()->where('delivery_status', 'out_for_delivery')->count();
        $deliveredOrders = $user->salesAudit()->where('delivery_status', 'delivered')->count() + $user->sales()->count();

        return Inertia::render('Customer/Order History/index', [
            'orders' => $allOrders,
            'currentStatus' => $status,
            'currentDeliveryStatus' => $deliveryStatus,
            'counts' => [
                'all' => $allOrdersCount,
                'pending' => $pendingDeliveryOrders,
                'approved' => $outForDeliveryOrders,
                'rejected' => 0, // Not used for delivery status tabs
                'delivered' => $deliveredOrders,
            ],
        ]);
    }

    public function generateReport(Request $request)
    {
        $user = $request->user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $status = $request->get('status', 'all');
        $deliveryStatus = $request->get('delivery_status', 'all');
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = $user->salesAudit()->with(['auditTrail.product', 'admin', 'logistic']);

        // Filter by date range
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Filter by delivery status (primary filter)
        if ($deliveryStatus !== 'all') {
            $query->where('delivery_status', $deliveryStatus);
        }

        // Filter by status (secondary filter)
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_orders' => $orders->count(),
            'total_spent' => $orders->sum('total_amount'),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'approved_orders' => $orders->where('status', 'approved')->count(),
            'rejected_orders' => $orders->where('status', 'rejected')->count(),
            'delivered_orders' => $orders->where('delivery_status', 'delivered')->count(),
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($orders, $summary);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($orders, $summary);
        }

        // Return view for display
        return Inertia::render('Customer/Order History/report', [
            'orders' => $orders,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'delivery_status' => $deliveryStatus,
            ],
        ]);
    }

    private function exportToCsv($orders, $summary)
    {
        $filename = 'my_orders_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders, $summary) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($file, [
                'Order ID',
                'Total Amount',
                'Status',
                'Delivery Status',
                'Created Date',
                'Admin Notes',
                'Logistic',
                'Items'
            ]);

            // Write order data
            foreach ($orders as $order) {
                $aggregatedTrail = $order->getAggregatedAuditTrail();
                $items = collect($aggregatedTrail)->map(function($item) {
                    return $item['product']['name'] . ' (' . $item['category'] . ' x' . $item['quantity'] . ')';
                })->join('; ');

                fputcsv($file, [
                    $order->id,
                    '₱' . number_format($order->total_amount, 2),
                    $order->status,
                    $order->delivery_status ?? 'N/A',
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->admin_notes ?? 'N/A',
                    $order->logistic->name ?? 'N/A',
                    $items
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function exportToPdf($orders, $summary)
    {
        $html = view('reports.customer-orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        
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
