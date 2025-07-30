<?php

namespace App\Http\Controllers\Logistic;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\DeliveryStatusUpdate;

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
        
        // Update the delivery status in the database
        $order->update([
            'delivery_status' => $newStatus,
        ]);

        // Return redirect response for Inertia
        return redirect()->route('logistic.orders.show', $order->id)
            ->with('message', 'Delivery status updated successfully');
    }
}
