<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User; // Added this import for the new_code
use App\Notifications\OrderStatusUpdate;
use App\Notifications\OrderReceipt;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        
        $query = Sales::with(['customer', 'admin', 'logistic', 'auditTrail.product']);
        
        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->get();
        
        // Get available logistics for assignment
        $logistics = User::where('type', 'logistic')->get(['id', 'name', 'contact_number']);
        
        return Inertia::render('Admin/Orders/index', [
            'orders' => $orders,
            'currentStatus' => $status,
            'logistics' => $logistics,
        ]);
    }

    public function show(Sales $order)
    {
        $order->load(['customer', 'admin', 'logistic', 'auditTrail.product', 'auditTrail.stock']);
        
        // Get available logistics for assignment
        $logistics = User::where('type', 'logistic')->get(['id', 'name', 'contact_number']);
        
        return Inertia::render('Admin/Orders/show', [
            'order' => $order,
            'logistics' => $logistics,
        ]);
    }

    public function receiptPreview(Sales $order)
    {
        $order->load(['customer', 'admin', 'auditTrail.product']);
        
        return Inertia::render('Admin/Orders/receipt-preview', [
            'order' => $order,
        ]);
    }

    public function assignLogistic(Request $request, Sales $order)
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

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', "Order assigned to {$logistic->name} successfully");
    }

    public function approve(Request $request, Sales $order)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Process the stock only when approving
        foreach ($order->auditTrail as $trail) {
            if ($trail->stock) {
                $trail->stock->quantity -= $trail->quantity;
                $trail->stock->customer_id = $order->customer_id;
                $trail->stock->save();

                // Automatically set status based on quantity
                if ($trail->stock->quantity == 0) {
                    $trail->stock->setSoldStatus();
                } else {
                    $trail->stock->setPartialStatus();
                }
            }
        }

        $order->update([
            'status' => 'approved',
            'delivery_status' => 'pending',
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->input('admin_notes'),
        ]);

        // Notify the customer with status update
        $order->customer?->notify(new OrderStatusUpdate($order->id, 'approved', 'Your order has been approved and is being processed.'));
        
        // Send order receipt email to customer
        $order->customer?->notify(new OrderReceipt($order));

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', 'Order approved successfully. Receipt email sent to customer. Please assign a logistic provider.');
    }

    public function reject(Request $request, Sales $order)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        // If order was already processed, we need to reverse the stock changes
        if ($order->status === 'approved') {
            // Reverse stock changes
            foreach ($order->auditTrail as $trail) {
                if ($trail->stock) {
                    $trail->stock->quantity += $trail->quantity;
                    $trail->stock->customer_id = null;
                    $trail->stock->status = 'available';
                    $trail->stock->save();
                }
            }
        }

        $order->update([
            'status' => 'rejected',
            'delivery_status' => null,
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->input('admin_notes'),
        ]);

        // Notify the customer
        $order->customer?->notify(new OrderStatusUpdate($order->id, 'rejected', 'Your order has been declined. Please check your order history for details.'));

        return redirect()->route('admin.orders.index')->with('message', 'Order rejected successfully');
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
        $format = $request->get('format', 'view'); // view, csv, pdf

        $query = Sales::with(['customer', 'admin', 'logistic', 'auditTrail.product']);

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

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total_amount'),
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
        return Inertia::render('Admin/Orders/report', [
            'orders' => $orders,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    private function exportToCsv($orders, $summary)
    {
        $filename = 'orders_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders, $summary) {
            $file = fopen('php://output', 'w');
            
            // Write summary
            fputcsv($file, ['Order Report Summary']);
            fputcsv($file, ['']);
            fputcsv($file, ['Total Orders', $summary['total_orders']]);
            fputcsv($file, ['Total Revenue', '₱' . number_format($summary['total_revenue'], 2)]);
            fputcsv($file, ['Pending Orders', $summary['pending_orders']]);
            fputcsv($file, ['Approved Orders', $summary['approved_orders']]);
            fputcsv($file, ['Rejected Orders', $summary['rejected_orders']]);
            fputcsv($file, ['Delivered Orders', $summary['delivered_orders']]);
            fputcsv($file, ['']);
            
            // Write headers
            fputcsv($file, [
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Total Amount',
                'Status',
                'Delivery Status',
                'Created Date',
                'Processed By',
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
                    $order->customer->name ?? 'N/A',
                    $order->customer->email ?? 'N/A',
                    '₱' . number_format($order->total_amount, 2),
                    $order->status,
                    $order->delivery_status ?? 'N/A',
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->admin->name ?? 'N/A',
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
        $html = view('reports.orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        
        $filename = 'orders_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}
