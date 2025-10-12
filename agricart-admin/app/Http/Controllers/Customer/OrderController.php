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

        $query = $user->salesAudit()
            ->with(['auditTrail.product', 'admin', 'logistic']);

        // Filter by delivery status (primary filter for tabs)
        if ($deliveryStatus !== 'all') {
            $query->where('delivery_status', $deliveryStatus);
        }

        // Filter by status (secondary filter)
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')
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
                ];
            });

        // Get counts for delivery status tabs
        $allOrders = $user->salesAudit()->count();
        $pendingDeliveryOrders = $user->salesAudit()->where('delivery_status', 'pending')->count();
        $outForDeliveryOrders = $user->salesAudit()->where('delivery_status', 'out_for_delivery')->count();
        $deliveredOrders = $user->salesAudit()->where('delivery_status', 'delivered')->count();

        return Inertia::render('Customer/Order History/index', [
            'orders' => $orders,
            'currentStatus' => $status,
            'currentDeliveryStatus' => $deliveryStatus,
            'counts' => [
                'all' => $allOrders,
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
}
