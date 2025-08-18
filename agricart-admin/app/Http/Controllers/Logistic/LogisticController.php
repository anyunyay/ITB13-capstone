<?php

namespace App\Http\Controllers\Logistic;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\DeliveryStatusUpdate;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class LogisticController extends Controller
{
    public function dashboard()
    {
        $logistic = auth()->user();
        
        // Get assigned orders for this logistic
        $assignedOrders = Sales::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->with(['customer', 'auditTrail.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Count orders by delivery status
        $pendingCount = $assignedOrders->where('delivery_status', 'pending')->count();
        $outForDeliveryCount = $assignedOrders->where('delivery_status', 'out_for_delivery')->count();
        $deliveredCount = $assignedOrders->where('delivery_status', 'delivered')->count();

        return Inertia::render('Logistic/dashboard', [
            'assignedOrders' => $assignedOrders,
            'stats' => [
                'pending' => $pendingCount,
                'out_for_delivery' => $outForDeliveryCount,
                'delivered' => $deliveredCount,
                'total' => $assignedOrders->count(),
            ],
        ]);
    }

    public function assignedOrders(Request $request)
    {
        $logistic = auth()->user();
        $status = $request->get('status', 'all');
        
        $query = Sales::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->with(['customer', 'auditTrail.product']);

        // Filter by delivery status
        if ($status !== 'all') {
            $query->where('delivery_status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Logistic/assignedOrders', [
            'orders' => $orders,
            'currentStatus' => $status,
        ]);
    }

    public function showOrder(Sales $order)
    {
        // Ensure the order is assigned to the current logistic
        if ($order->logistic_id !== auth()->id()) {
            abort(403, 'You are not authorized to view this order.');
        }

        $order->load(['customer', 'auditTrail.product', 'auditTrail.stock']);

        return Inertia::render('Logistic/showOrder', [
            'order' => $order,
        ]);
    }

    public function updateDeliveryStatus(Request $request, Sales $order)
    {
        // Ensure the order is assigned to the current logistic
        if ($order->logistic_id !== auth()->id()) {
            abort(403, 'You are not authorized to update this order.');
        }

        // Validate the delivery status value
        $request->validate([
            'delivery_status' => 'required|in:pending,out_for_delivery,delivered',
        ]);

        // Get the new delivery status
        $newStatus = $request->input('delivery_status');
        
        // Get the old status for comparison
        $oldStatus = $order->delivery_status;
        
        // Update the delivery status in the database
        $order->update([
            'delivery_status' => $newStatus,
        ]);

        // Send notification to customer if status changed
        if ($oldStatus !== $newStatus && $order->customer) {
            $message = $this->getDeliveryStatusMessage($newStatus);
            $order->customer->notify(new DeliveryStatusUpdate($order->id, $newStatus, $message));
        }

        // Return redirect response for Inertia
        return redirect()->route('logistic.orders.show', $order->id)
            ->with('message', 'Delivery status updated successfully');
    }

    private function getDeliveryStatusMessage($status)
    {
        switch ($status) {
            case 'pending':
                return 'Your order is being prepared for delivery.';
            case 'out_for_delivery':
                return 'Your order is out for delivery and will arrive soon!';
            case 'delivered':
                return 'Your order has been delivered successfully. Thank you for your purchase!';
            default:
                return 'Your order delivery status has been updated.';
        }
    }

    public function generateReport(Request $request)
    {
        $logistic = auth()->user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $deliveryStatus = $request->get('delivery_status', 'all');
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = Sales::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->with(['customer', 'auditTrail.product']);

        // Filter by date range
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Filter by delivery status
        if ($deliveryStatus !== 'all') {
            $query->where('delivery_status', $deliveryStatus);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total_amount'),
            'pending_orders' => $orders->where('delivery_status', 'pending')->count(),
            'out_for_delivery_orders' => $orders->where('delivery_status', 'out_for_delivery')->count(),
            'delivered_orders' => $orders->where('delivery_status', 'delivered')->count(),
            'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
        ];

        // If export is requested
        if ($format === 'csv') {
            return $this->exportToCsv($orders, $summary);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($orders, $summary);
        }

        // Return view for display
        return Inertia::render('Logistic/report', [
            'orders' => $orders,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'delivery_status' => $deliveryStatus,
            ],
        ]);
    }

    private function exportToCsv($orders, $summary)
    {
        $filename = 'logistic_orders_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders, $summary) {
            $file = fopen('php://output', 'w');
            
            // Write summary
            fputcsv($file, ['Logistic Orders Report Summary']);
            fputcsv($file, ['']);
            fputcsv($file, ['Total Orders', $summary['total_orders']]);
            fputcsv($file, ['Total Revenue', 'PHP ' . number_format($summary['total_revenue'], 2)]);
            fputcsv($file, ['Pending Orders', $summary['pending_orders']]);
            fputcsv($file, ['Out for Delivery Orders', $summary['out_for_delivery_orders']]);
            fputcsv($file, ['Delivered Orders', $summary['delivered_orders']]);
            fputcsv($file, ['Average Order Value', 'PHP ' . number_format($summary['average_order_value'], 2)]);
            fputcsv($file, ['']);
            
            // Write headers
            fputcsv($file, [
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Total Amount',
                'Delivery Status',
                'Created Date',
                'Items'
            ]);

            // Write order data
            foreach ($orders as $order) {
                $items = [];
                foreach ($order->auditTrail as $trail) {
                    $items[] = $trail->product->name . ' (' . $trail->category . ') - ' . $trail->quantity;
                }
                
                fputcsv($file, [
                    $order->id,
                    $order->customer->name,
                    $order->customer->email,
                    'PHP ' . number_format($order->total_amount, 2),
                    ucfirst(str_replace('_', ' ', $order->delivery_status)),
                    $order->created_at->format('Y-m-d H:i:s'),
                    implode('; ', $items)
                ]);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function exportToPdf($orders, $summary)
    {
        $logistic = auth()->user();
        $html = view('reports.logistic-orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'logistic' => $logistic,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        
        $filename = 'logistic_orders_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}
