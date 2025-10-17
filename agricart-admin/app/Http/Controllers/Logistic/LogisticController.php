<?php

namespace App\Http\Controllers\Logistic;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Sales;
use App\Models\SalesAudit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\DeliveryStatusUpdate;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class LogisticController extends Controller
{
    public function dashboard()
    {
        $logistic = Auth::user();
        
        // Get assigned orders for this logistic
        $assignedOrders = SalesAudit::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->with(['customer', 'address', 'auditTrail.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer' => [
                        'name' => $order->customer->name,
                        'email' => $order->customer->email,
                        'contact_number' => $order->customer->contact_number,
                    ],
                    'delivery_address' => $order->address ? 
                        $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province : 
                        null,
                    'total_amount' => $order->total_amount,
                    'delivery_status' => $order->delivery_status,
                    'created_at' => $order->created_at->toISOString(),
                    'audit_trail' => $order->getAggregatedAuditTrail(),
                ];
            });

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
        $logistic = Auth::user();
        $status = $request->get('status', 'all');
        
        $query = SalesAudit::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->with(['customer', 'address', 'auditTrail.product']);

        // Filter by delivery status
        if ($status !== 'all') {
            $query->where('delivery_status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer' => [
                        'name' => $order->customer->name,
                        'email' => $order->customer->email,
                        'contact_number' => $order->customer->contact_number,
                    ],
                    'delivery_address' => $order->address ? 
                        $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province : 
                        null,
                    'total_amount' => $order->total_amount,
                    'delivery_status' => $order->delivery_status,
                    'created_at' => $order->created_at->toISOString(),
                    'audit_trail' => $order->getAggregatedAuditTrail(),
                ];
            });

        return Inertia::render('Logistic/assignedOrders', [
            'orders' => $orders,
            'currentStatus' => $status,
        ]);
    }

    public function showOrder(SalesAudit $order)
    {
        // Ensure the order is assigned to the current logistic
        if ($order->logistic_id !== Auth::id()) {
            abort(403, 'You are not authorized to view this order.');
        }

        $order->load(['customer', 'address', 'auditTrail.product', 'auditTrail.stock']);

        // Transform the order data to include product price information
        $transformedOrder = [
            'id' => $order->id,
            'customer' => [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'contact_number' => $order->customer->contact_number,
            ],
            'delivery_address' => $order->address ? 
                $order->address->street . ', ' . $order->address->barangay . ', ' . $order->address->city . ', ' . $order->address->province : 
                null,
            'total_amount' => $order->total_amount,
            'delivery_status' => $order->delivery_status,
            'created_at' => $order->created_at->toISOString(),
            'audit_trail' => $order->getAggregatedAuditTrail(),
        ];

        return Inertia::render('Logistic/showOrder', [
            'order' => $transformedOrder,
        ]);
    }

    public function updateDeliveryStatus(Request $request, SalesAudit $order)
    {
        // Ensure the order is assigned to the current logistic
        if ($order->logistic_id !== Auth::id()) {
            abort(403, 'You are not authorized to update this order.');
        }

        // Prevent any changes to delivered orders
        if ($order->delivery_status === 'delivered') {
            abort(403, 'This order has already been delivered and cannot be modified.');
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

        // If status is set to 'delivered', create a Sales record
        if ($newStatus === 'delivered' && $oldStatus !== 'delivered') {
            // Get the delivery address as plain text
            $deliveryAddress = null;
            if ($order->address) {
                $deliveryAddress = $order->address->street . ', ' . 
                                 $order->address->barangay . ', ' . 
                                 $order->address->city . ', ' . 
                                 $order->address->province;
            }

            // Use financial data from sales_audit (already calculated during checkout)
            $subtotal = $order->subtotal ?? $order->total_amount;
            $coopShare = $order->coop_share ?? ($subtotal * 0.10);
            $memberShare = $order->member_share ?? $subtotal;
            $totalAmount = $order->total_amount; // Already includes co-op share
            
            // Create a Sales record for the delivered order
            Sales::create([
                'customer_id' => $order->customer_id,
                'subtotal' => $subtotal, // Product prices from sales_audit
                'coop_share' => $coopShare, // Co-op share from sales_audit
                'member_share' => $memberShare, // Member share from sales_audit
                'total_amount' => $totalAmount, // Total amount from sales_audit
                'delivery_address' => $deliveryAddress,
                'admin_id' => $order->admin_id,
                'admin_notes' => $order->admin_notes,
                'logistic_id' => $order->logistic_id,
                'sales_audit_id' => $order->id,
                'delivered_at' => now(),
            ]);
        }

        // Log delivery status change
        if ($oldStatus !== $newStatus) {
            SystemLogger::logDeliveryStatusChange(
                $order->id,
                $oldStatus,
                $newStatus,
                Auth::id(),
                [
                    'customer_id' => $order->customer_id,
                    'order_status' => $order->status,
                    'total_amount' => $order->total_amount
                ]
            );
        }

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
        $logistic = Auth::user();
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $deliveryStatus = $request->get('delivery_status', 'all');
        $format = $request->get('format', 'view'); // view, csv, pdf
        $display = $request->get('display', false); // true for display mode

        $query = SalesAudit::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->with(['customer', 'address', 'auditTrail.product']);

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
            return $this->exportToCsv($orders, $summary, $display);
        } elseif ($format === 'pdf') {
            return $this->exportToPdf($orders, $summary, $display);
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

    private function exportToCsv($orders, $summary, $display = false)
    {
        $filename = 'logistic_orders_report_' . date('Y-m-d_H-i-s') . '.csv';
        
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
                'Delivery Status',
                'Created Date',
                'Items'
            ]);

            // Write order data
            foreach ($orders as $order) {
                $items = [];
                $aggregatedTrail = $order->getAggregatedAuditTrail();
                foreach ($aggregatedTrail as $item) {
                    $items[] = $item['product']['name'] . ' (' . $item['category'] . ') - ' . $item['quantity'];
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

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($orders, $summary, $display = false)
    {
        $logistic = Auth::user();
        $html = view('reports.logistic-orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'logistic' => $logistic,
            'generated_at' => now()->format('Y-m-d H:i:s')
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'logistic_orders_report_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }
}
