<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SuspiciousOrderNotification;
use App\Models\SalesAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SuspiciousOrderNotificationController extends Controller
{
    /**
     * Send notification about suspicious order pattern detected on frontend
     * This does NOT modify any order data, only sends notifications
     */
    public function notifySuspicious(Request $request)
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:2',
            'order_ids.*' => 'required|integer|exists:sales_audit,id',
            'customer_name' => 'required|string',
            'total_amount' => 'required|numeric',
            'minutes_diff' => 'required|integer',
            'order_count' => 'required|integer|min:2'
        ]);

        // Get the orders (for notification data only, not modifying them)
        $orders = SalesAudit::whereIn('id', $validated['order_ids'])
            ->with('customer')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json(['error' => 'Orders not found'], 404);
        }

        // Use the first order as the trigger order for notification
        $triggerOrder = $orders->first();

        // Build related orders array
        $relatedOrders = $orders->skip(1)->map(function ($order) {
            return [
                'id' => $order->id,
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at->toISOString(),
            ];
        })->toArray();

        // Build reason message
        $reason = sprintf(
            '%d orders placed within %d minutes (Total: ₱%.2f)',
            $validated['order_count'],
            $validated['minutes_diff'],
            $validated['total_amount']
        );

        // Get all users with permission to view orders
        $authorizedUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->orWhereHas('permissions', function ($query) {
            $query->where('name', 'view orders');
        })->get();

        // Send notifications
        foreach ($authorizedUsers as $user) {
            $user->notify(new SuspiciousOrderNotification($triggerOrder, $relatedOrders, $reason));
        }

        Log::info('Frontend suspicious order notification sent', [
            'order_ids' => $validated['order_ids'],
            'customer_name' => $validated['customer_name'],
            'notified_users' => $authorizedUsers->count()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notifications sent successfully',
            'notified_users' => $authorizedUsers->count()
        ]);
    }
}
