<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->get('status', 'all');
        $deliveryStatus = $request->get('delivery_status', 'all');

        $query = $user->sales()
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
                    'audit_trail' => $sale->auditTrail->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product' => [
                                'name' => $item->product->name ?? 'Unknown',
                                'price_kilo' => $item->product->price_kilo ?? null,
                                'price_pc' => $item->product->price_pc ?? null,
                                'price_tali' => $item->product->price_tali ?? null,
                            ],
                            'category' => $item->category,
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
            });

        // Get counts for delivery status tabs
        $allOrders = $user->sales()->count();
        $pendingDeliveryOrders = $user->sales()->where('delivery_status', 'pending')->count();
        $outForDeliveryOrders = $user->sales()->where('delivery_status', 'out_for_delivery')->count();
        $deliveredOrders = $user->sales()->where('delivery_status', 'delivered')->count();

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

        $query = $user->sales()->with(['auditTrail.product', 'admin', 'logistic']);

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
            
            // Write summary
            fputcsv($file, ['My Orders Report Summary']);
            fputcsv($file, ['']);
            fputcsv($file, ['Total Orders', $summary['total_orders']]);
            fputcsv($file, ['Total Spent', '₱' . number_format($summary['total_spent'], 2)]);
            fputcsv($file, ['Pending Orders', $summary['pending_orders']]);
            fputcsv($file, ['Approved Orders', $summary['approved_orders']]);
            fputcsv($file, ['Rejected Orders', $summary['rejected_orders']]);
            fputcsv($file, ['Delivered Orders', $summary['delivered_orders']]);
            fputcsv($file, ['']);
            
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
                $items = $order->auditTrail->map(function($item) {
                    return $item->product->name . ' (' . $item->category . ' x' . $item->quantity . ')';
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
}
