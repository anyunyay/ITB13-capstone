<?php

namespace App\Services;

use App\Models\SalesAudit;
use App\Models\User;
use App\Notifications\SuspiciousOrderNotification;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SuspiciousOrderDetectionService
{
    /**
     * Time window in minutes to check for successive orders
     */
    const TIME_WINDOW_MINUTES = 10;

    /**
     * Minimum number of orders to be considered suspicious
     */
    const MIN_ORDERS_FOR_SUSPICIOUS = 2;

    /**
     * Check if a new order is part of a suspicious pattern
     * 
     * @param SalesAudit $newOrder
     * @return array|null Returns array with suspicious info or null if not suspicious
     */
    public static function checkForSuspiciousPattern(SalesAudit $newOrder): ?array
    {
        // Only check for pending orders
        if ($newOrder->status !== 'pending') {
            return null;
        }

        $customerId = $newOrder->customer_id;
        $orderTime = $newOrder->created_at;

        // Find the most recent suspicious order from this customer
        $mostRecentSuspiciousOrder = SalesAudit::where('customer_id', $customerId)
            ->where('id', '!=', $newOrder->id)
            ->where('is_suspicious', true)
            ->whereIn('status', ['pending', 'delayed'])
            ->orderBy('created_at', 'desc')
            ->first();

        // If there's a recent suspicious order, check if it's within the 10-minute window
        if ($mostRecentSuspiciousOrder) {
            $minutesSinceLastSuspicious = Carbon::parse($mostRecentSuspiciousOrder->created_at)
                ->diffInMinutes($orderTime);

            // If more than 10 minutes have passed, this is a fresh window - don't flag as suspicious yet
            if ($minutesSinceLastSuspicious > self::TIME_WINDOW_MINUTES) {
                Log::info('Suspicious order window expired - starting fresh window', [
                    'customer_id' => $customerId,
                    'new_order_id' => $newOrder->id,
                    'last_suspicious_order_id' => $mostRecentSuspiciousOrder->id,
                    'minutes_since_last' => $minutesSinceLastSuspicious,
                    'window_minutes' => self::TIME_WINDOW_MINUTES,
                ]);
                return null;
            }
        }

        // Find all orders from the same customer within the time window (looking back only)
        $timeWindowStart = Carbon::parse($orderTime)->subMinutes(self::TIME_WINDOW_MINUTES);

        $relatedOrders = SalesAudit::where('customer_id', $customerId)
            ->where('id', '!=', $newOrder->id)
            ->where('created_at', '>=', $timeWindowStart)
            ->where('created_at', '<=', $orderTime)
            ->whereIn('status', ['pending', 'delayed'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Check if there are enough orders to be suspicious
        if ($relatedOrders->count() + 1 >= self::MIN_ORDERS_FOR_SUSPICIOUS) {
            $allOrders = $relatedOrders->push($newOrder)->sortBy('created_at');
            
            $orderIds = $allOrders->pluck('id')->toArray();
            $totalAmount = $allOrders->sum('total_amount');
            
            $reason = sprintf(
                '%d orders placed within %d minutes (Total: ₱%.2f)',
                count($orderIds),
                self::TIME_WINDOW_MINUTES,
                $totalAmount
            );

            Log::info('Suspicious order pattern detected', [
                'customer_id' => $customerId,
                'order_ids' => $orderIds,
                'time_window' => self::TIME_WINDOW_MINUTES,
                'total_amount' => $totalAmount
            ]);

            return [
                'order_ids' => $orderIds,
                'related_orders' => $relatedOrders->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'total_amount' => $order->total_amount,
                        'created_at' => $order->created_at->toISOString(),
                    ];
                })->toArray(),
                'reason' => $reason,
                'total_amount' => $totalAmount,
            ];
        }

        return null;
    }

    /**
     * Mark orders as suspicious and notify relevant users
     * 
     * @param SalesAudit $triggerOrder The order that triggered the detection
     * @param array $suspiciousInfo Information about the suspicious pattern
     */
    public static function markAsSuspicious(SalesAudit $triggerOrder, array $suspiciousInfo): void
    {
        $orderIds = $suspiciousInfo['order_ids'];
        $reason = $suspiciousInfo['reason'];

        // Mark all related orders as suspicious
        SalesAudit::whereIn('id', $orderIds)->update([
            'is_suspicious' => true,
            'suspicious_reason' => $reason,
        ]);

        Log::info('Orders marked as suspicious', [
            'order_ids' => $orderIds,
            'reason' => $reason
        ]);

        // Notify all users with permission to view orders
        self::notifyAuthorizedUsers($triggerOrder, $suspiciousInfo['related_orders'], $reason);
    }

    /**
     * Notify all users with permission to view orders
     * 
     * @param SalesAudit $order
     * @param array $relatedOrders
     * @param string $reason
     */
    protected static function notifyAuthorizedUsers(SalesAudit $order, array $relatedOrders, string $reason): void
    {
        // Get all users with permission to view orders (admin, staff with permission)
        $authorizedUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->orWhereHas('permissions', function ($query) {
            $query->where('name', 'view orders');
        })->get();

        foreach ($authorizedUsers as $user) {
            $user->notify(new SuspiciousOrderNotification($order, $relatedOrders, $reason));
        }

        Log::info('Suspicious order notifications sent', [
            'order_id' => $order->id,
            'notified_users' => $authorizedUsers->count()
        ]);
    }

    /**
     * Get all suspicious orders
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getSuspiciousOrders()
    {
        return SalesAudit::where('is_suspicious', true)
            ->with(['customer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Clear suspicious flag from an order
     * 
     * @param SalesAudit $order
     */
    public static function clearSuspiciousFlag(SalesAudit $order): void
    {
        $order->update([
            'is_suspicious' => false,
            'suspicious_reason' => null,
        ]);

        Log::info('Suspicious flag cleared', [
            'order_id' => $order->id
        ]);
    }
}
