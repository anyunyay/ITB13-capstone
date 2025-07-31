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
}
