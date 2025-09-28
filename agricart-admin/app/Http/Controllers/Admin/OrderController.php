<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Notifications\OrderStatusUpdate;
use App\Notifications\OrderReceipt;
use App\Notifications\OrderRejectionNotification;
use App\Notifications\DeliveryTaskNotification;
use App\Notifications\ProductSaleNotification;
use App\Notifications\OrderDelayedNotification;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $highlightOrderId = $request->get('highlight_order');
        $showUrgentApproval = $request->get('urgent_approval', false);
        
        // Get all orders for tab counts
        $allOrders = Sales::with(['customer', 'admin', 'logistic', 'auditTrail.product'])
            ->orderBy('created_at', 'desc')
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
            
            return $order;
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
            if ($order->status !== 'pending') return false;
            // Check if manually marked as urgent
            if ($order->is_urgent) return true;
            // Check if within 8 hours of 24-hour limit
            $orderAge = $order->created_at->diffInHours(now());
            return $orderAge >= 16; // 16+ hours old (8 hours left)
        })->values(); // Convert to array
        
        return Inertia::render('Admin/Orders/index', [
            'orders' => $orders,
            'allOrders' => $allOrders,
            'currentStatus' => $status,
            'logistics' => $logistics,
            'highlightOrderId' => $highlightOrderId,
            'urgentOrders' => $urgentOrders,
            'showUrgentApproval' => $showUrgentApproval,
        ]);
    }

    public function show(Request $request, Sales $order)
    {
        $order->load(['customer', 'admin', 'logistic', 'auditTrail.product', 'auditTrail.stock']);
        
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
        $canApprove = $order->status === 'pending' && $orderAge <= 24;
        
        return Inertia::render('Admin/Orders/show', [
            'order' => $order,
            'logistics' => $logistics,
            'highlight' => $highlight,
            'isUrgent' => $isUrgent,
            'canApprove' => $canApprove,
            'orderAge' => $orderAge,
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

        // Notify logistic about delivery task
        $logistic->notify(new DeliveryTaskNotification($order));

        return redirect()->route('admin.orders.show', $order->id)
            ->with('message', "Order assigned to {$logistic->name} successfully");
    }

    public function approve(Request $request, Sales $order)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Check if order is within 24-hour approval window
        $orderAge = $order->created_at->diffInHours(now());
        if ($orderAge > 24) {
            return redirect()->back()->with('error', 'Order approval time has expired. Orders must be approved within 24 hours.');
        }

        // Process the stock only when approving
        foreach ($order->auditTrail as $trail) {
            if ($trail->stock) {
                $trail->stock->quantity -= $trail->quantity;
                $trail->stock->last_customer_id = $order->customer_id;
                $trail->stock->save();

                // Automatically set status based on quantity
                if ($trail->stock->quantity == 0) {
                    $trail->stock->setSoldStatus();
                } else {
                    $trail->stock->setPartialStatus();
                }

                // Notify member about product sale
                $trail->stock->member->notify(new ProductSaleNotification($trail->stock, $order, $order->customer));
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
                    $trail->stock->last_customer_id = null;
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
        $display = $request->get('display', false); // true for display mode

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
            return $this->exportToCsv($orders, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($orders, $summary, $display);
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

        $callback = function() use ($orders, $summary) {
            $file = fopen('php://output', 'w');
            
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
                'Logistic'
            ]);

            // Write order data
            foreach ($orders as $order) {
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
                    $order->logistic->name ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($orders, $summary, $display = false)
    {
        $html = view('reports.orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'orders_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }

}
