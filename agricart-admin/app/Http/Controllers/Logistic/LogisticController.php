<?php

namespace App\Http\Controllers\Logistic;

use App\Http\Controllers\Controller;
use App\Helpers\SystemLogger;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\DeliveryStatusUpdate;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class LogisticController extends Controller
{
    public function dashboard(Request $request)
    {
        $logistic = Auth::user();
        $perPage = $request->get('per_page', 5);

        // Get base query for this logistic
        $baseQuery = SalesAudit::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->whereIn('delivery_status', ['pending', 'ready_to_pickup', 'out_for_delivery', 'delivered']);

        // Get stats using efficient count queries
        $pendingCount = (clone $baseQuery)->where('delivery_status', 'pending')->count();
        $readyToPickupCount = (clone $baseQuery)->where('delivery_status', 'ready_to_pickup')->count();
        $outForDeliveryCount = (clone $baseQuery)->where('delivery_status', 'out_for_delivery')->count();
        $deliveredCount = (clone $baseQuery)->where('delivery_status', 'delivered')->count();
        $totalCount = $baseQuery->count();

        // Paginate orders with relationships
        $assignedOrders = $baseQuery
            ->with(['customer', 'address', 'auditTrail.product'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->through(function ($order) {
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
                    'delivery_ready_time' => $order->delivery_ready_time?->toISOString(),
                    'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
                    'delivered_time' => $order->delivered_time?->toISOString(),
                    'delivery_timeline' => $order->getDeliveryTimeline(),
                    'created_at' => $order->created_at->toISOString(),
                    'audit_trail' => $order->getAggregatedAuditTrail(),
                ];
            });

        return Inertia::render('Logistic/dashboard', [
            'assignedOrders' => $assignedOrders,
            'stats' => [
                'pending' => $pendingCount,
                'ready_to_pickup' => $readyToPickupCount,
                'out_for_delivery' => $outForDeliveryCount,
                'delivered' => $deliveredCount,
                'total' => $totalCount,
            ],
        ]);
    }

    public function assignedOrders(Request $request)
    {
        $logistic = Auth::user();
        $status = $request->get('status', 'all');
        $perPage = $request->get('per_page', 10);

        // Get base query for all orders
        $baseQuery = SalesAudit::where('logistic_id', $logistic->id)
            ->where('status', 'approved')
            ->whereIn('delivery_status', ['pending', 'ready_to_pickup', 'out_for_delivery', 'delivered']);

        // Get counts for each status using efficient queries
        $statusCounts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('delivery_status', 'pending')->count(),
            'ready_to_pickup' => (clone $baseQuery)->where('delivery_status', 'ready_to_pickup')->count(),
            'out_for_delivery' => (clone $baseQuery)->where('delivery_status', 'out_for_delivery')->count(),
            'delivered' => (clone $baseQuery)->where('delivery_status', 'delivered')->count(),
        ];

        // Build query for paginated results
        $query = (clone $baseQuery)->with(['customer', 'address', 'auditTrail.product']);

        // Filter by delivery status
        if ($status !== 'all') {
            $query->where('delivery_status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage)->through(function ($order) {
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
                'delivery_ready_time' => $order->delivery_ready_time?->toISOString(),
                'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
                'delivered_time' => $order->delivered_time?->toISOString(),
                'delivery_timeline' => $order->getDeliveryTimeline(),
                'created_at' => $order->created_at->toISOString(),
                'audit_trail' => $order->getAggregatedAuditTrail(),
            ];
        });

        return Inertia::render('Logistic/assignedOrders', [
            'orders' => $orders,
            'currentStatus' => $status,
            'statusCounts' => $statusCounts,
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
            'delivery_ready_time' => $order->delivery_ready_time?->toISOString(),
            'delivery_packed_time' => $order->delivery_packed_time?->toISOString(),
            'delivered_time' => $order->delivered_time?->toISOString(),
            'delivery_timeline' => $order->getDeliveryTimeline(),
            'delivery_proof_image' => $order->delivery_proof_image ? route('private-file.show', ['folder' => 'delivery-proofs', 'filename' => basename($order->delivery_proof_image)]) : null,
            'delivery_confirmed' => $order->delivery_confirmed,
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

        // Ensure order is approved before allowing delivery status updates
        if ($order->status !== 'approved') {
            abort(403, 'Order must be approved before delivery status can be updated.');
        }

        // Validate the delivery status value
        $request->validate([
            'delivery_status' => 'required|in:pending,ready_to_pickup,out_for_delivery,delivered',
        ]);

        // Get the new delivery status
        $newStatus = $request->input('delivery_status');

        // Get the old status for comparison
        $oldStatus = $order->delivery_status;

        // Validate status transitions to prevent bypassing workflow
        if ($newStatus === 'delivered' && $oldStatus !== 'out_for_delivery') {
            abort(403, 'Order must be marked as "Out for Delivery" before it can be marked as delivered. Current status: ' . $oldStatus);
        }


        // Update the delivery status using unified method
        $order->updateDeliveryStatus($newStatus);

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
            $sale = Sales::create([
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

            // Log sales creation
            SystemLogger::logLogisticActivity(
                'sales_created',
                Auth::id(),
                [
                    'sale_id' => $sale->id,
                    'order_id' => $order->id,
                    'customer_id' => $order->customer_id,
                    'total_amount' => $totalAmount,
                    'subtotal' => $subtotal,
                    'coop_share' => $coopShare,
                    'member_share' => $memberShare
                ]
            );
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

    public function markDelivered(Request $request, SalesAudit $order, FileUploadService $fileService)
    {
        // Ensure the order is assigned to the current logistic
        if ($order->logistic_id !== Auth::id()) {
            abort(403, 'You are not authorized to update this order.');
        }

        // Prevent any changes to delivered orders
        if ($order->delivery_status === 'delivered') {
            abort(403, 'This order has already been delivered and cannot be modified.');
        }

        // Ensure order is approved and out for delivery
        if ($order->status !== 'approved') {
            abort(403, 'Order must be approved before it can be marked as delivered.');
        }

        if ($order->delivery_status !== 'out_for_delivery') {
            abort(403, 'Order must be marked as "Out for Delivery" before it can be marked as delivered. Current status: ' . $order->delivery_status);
        }

        // Validate the request using FileUploadService validation rules
        $validationRules = [
            'delivery_proof_image' => FileUploadService::getValidationRules('delivery-proofs', true),
            'confirmation_text' => 'required|string|in:I Confirm',
        ];

        $request->validate($validationRules);

        // Handle image upload using FileUploadService
        $imagePath = null;
        if ($request->hasFile('delivery_proof_image')) {
            try {
                $imagePath = $fileService->uploadFile(
                    $request->file('delivery_proof_image'),
                    'delivery-proofs',
                    'delivery_proof_' . $order->id . '_' . time()
                );
            } catch (\Exception $e) {
                return redirect()->back()->withErrors([
                    'delivery_proof_image' => 'Failed to upload delivery proof image: ' . $e->getMessage()
                ])->withInput();
            }
        }

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

        // Update the order with delivery proof and confirmation using unified method
        $order->markAsDelivered();
        $order->update([
            'delivery_proof_image' => $imagePath,
            'delivery_confirmed' => true,
        ]);

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

        // Log delivery completion
        SystemLogger::logDeliveryStatusChange(
            $order->id,
            'out_for_delivery',
            'delivered',
            Auth::id(),
            [
                'customer_id' => $order->customer_id,
                'order_status' => $order->status,
                'total_amount' => $order->total_amount,
                'delivery_proof_image' => $imagePath,
                'delivery_confirmed' => true
            ]
        );

        // Send notification to customer
        if ($order->customer) {
            $message = $this->getDeliveryStatusMessage('delivered');
            $order->customer->notify(new DeliveryStatusUpdate($order->id, 'delivered', $message));
        }

        // Return redirect response for Inertia
        return redirect()->route('logistic.orders.show', $order->id)
            ->with('message', 'Order marked as delivered successfully with proof image.');
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
        $paperSize = $request->get('paper_size', 'A4'); // A4, Letter, Legal, A3
        $orientation = $request->get('orientation', 'landscape'); // portrait, landscape
        $search = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validate sort parameters
        $allowedSortFields = ['id', 'customer', 'total_amount', 'delivery_status', 'created_at', 'delivered_time'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

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

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // For exports, get all data
        if ($format === 'csv' || $format === 'pdf') {
            // Get all orders without database sorting
            $orders = $query->get();

            // Apply sorting using collection methods (same pattern as sales report)
            $orders = $orders->sortBy(function ($order) use ($sortBy) {
                switch ($sortBy) {
                    case 'customer':
                        return $order->customer->name ?? '';
                    case 'delivered_time':
                        return $order->delivered_time ? $order->delivered_time->timestamp : 0;
                    case 'created_at':
                        return $order->created_at->timestamp;
                    default:
                        return $order->{$sortBy} ?? 0;
                }
            }, SORT_REGULAR, $sortOrder === 'desc')->values();

            // Calculate summary statistics
            $summary = [
                'total_orders' => $orders->count(),
                'total_revenue' => $orders->sum('total_amount'),
                'pending_orders' => $orders->where('delivery_status', 'pending')->count(),
                'out_for_delivery_orders' => $orders->where('delivery_status', 'out_for_delivery')->count(),
                'delivered_orders' => $orders->where('delivery_status', 'delivered')->count(),
                'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
            ];

            if ($format === 'csv') {
                return $this->exportToCsv($orders, $summary, $display);
            } else {
                return $this->exportToPdf($orders, $summary, $display, $paperSize, $orientation);
            }
        }

        // For view, get summary from all matching records (before applying sorting)
        $allOrders = (clone $query)->get();
        $summary = [
            'total_orders' => $allOrders->count(),
            'total_revenue' => $allOrders->sum('total_amount'),
            'pending_orders' => $allOrders->where('delivery_status', 'pending')->count(),
            'out_for_delivery_orders' => $allOrders->where('delivery_status', 'out_for_delivery')->count(),
            'delivered_orders' => $allOrders->where('delivery_status', 'delivered')->count(),
            'average_order_value' => $allOrders->count() > 0 ? $allOrders->avg('total_amount') : 0,
        ];

        // Apply sorting using collection methods (same pattern as sales report)
        $sortedOrders = $allOrders->sortBy(function ($order) use ($sortBy) {
            switch ($sortBy) {
                case 'customer':
                    return $order->customer->name ?? '';
                case 'delivered_time':
                    return $order->delivered_time ? $order->delivered_time->timestamp : 0;
                case 'created_at':
                    return $order->created_at->timestamp;
                default:
                    return $order->{$sortBy} ?? 0;
            }
        }, SORT_REGULAR, $sortOrder === 'desc')->values();

        // Paginate the sorted collection
        $currentPage = $request->get('page', 1);
        $orders = new \Illuminate\Pagination\LengthAwarePaginator(
            $sortedOrders->forPage($currentPage, $perPage),
            $sortedOrders->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Return view for display
        return Inertia::render('Logistic/report', [
            'orders' => $orders,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'delivery_status' => $deliveryStatus,
                'search' => $search,
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

        $callback = function () use ($orders, $summary) {
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

    private function exportToPdf($orders, $summary, $display = false, $paperSize = 'A4', $orientation = 'landscape')
    {
        $logistic = Auth::user();
        
        // Encode logo as base64 for PDF embedding
        $logoPath = public_path('images/logo/smmc-logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $imageData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
        }
        
        $html = view('reports.logistic-orders-pdf', [
            'orders' => $orders,
            'summary' => $summary,
            'logistic' => $logistic,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'logo_base64' => $logoBase64
        ])->render();

        $pdf = Pdf::loadHTML($html);
        
        // Set paper size and orientation (supports: A4, Letter, Legal, A3, etc.)
        $pdf->setPaper($paperSize, $orientation);

        $filename = 'logistic_orders_report_' . date('Y-m-d_H-i-s') . '.pdf';

        return $display ? $pdf->stream($filename) : $pdf->download($filename);
    }
}
