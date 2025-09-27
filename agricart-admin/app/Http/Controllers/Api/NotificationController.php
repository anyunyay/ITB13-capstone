<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get latest notifications for the authenticated user
     */
    public function getLatest(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['notifications' => []]);
        }

        // Add caching for better performance with frequent requests
        $cacheKey = "notifications_latest_{$user->id}";
        $cached = cache()->get($cacheKey);
        
        // Return cached data if it's less than 2 seconds old
        if ($cached && $cached['timestamp'] > now()->subSeconds(2)->timestamp) {
            return response()->json($cached['data']);
        }

        $notificationTypes = [];
        
        switch ($user->type) {
            case 'customer':
                $notificationTypes = [
                    'App\\Notifications\\OrderConfirmationNotification',
                    'App\\Notifications\\OrderStatusUpdate',
                    'App\\Notifications\\DeliveryStatusUpdate'
                ];
                break;
            case 'admin':
            case 'staff':
                $notificationTypes = [
                    'App\\Notifications\\NewOrderNotification',
                    'App\\Notifications\\InventoryUpdateNotification',
                    'App\\Notifications\\MembershipUpdateNotification'
                ];
                break;
            case 'member':
                $notificationTypes = [
                    'App\\Notifications\\ProductSaleNotification',
                    'App\\Notifications\\EarningsUpdateNotification',
                    'App\\Notifications\\LowStockAlertNotification'
                ];
                break;
            case 'logistic':
                $notificationTypes = [
                    'App\\Notifications\\DeliveryTaskNotification',
                    'App\\Notifications\\OrderStatusUpdate'
                ];
                break;
        }

        $notifications = [];
        
        if (!empty($notificationTypes)) {
            $notifications = $user->notifications()
                ->whereIn('type', $notificationTypes)
                ->orderBy('created_at', 'desc')
                ->limit(20) // Limit to recent 20 notifications for performance
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->data['type'] ?? 'unknown',
                        'message' => $notification->data['message'] ?? '',
                        'action_url' => $notification->data['action_url'] ?? null,
                        'created_at' => $notification->created_at->toISOString(),
                        'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                        'data' => $notification->data,
                    ];
                });
        }

        $responseData = [
            'notifications' => $notifications,
            'unread_count' => $notifications->where('read_at', null)->count(),
            'total_count' => $notifications->count(),
        ];

        // Cache the response for 2 seconds to handle frequent requests
        cache()->put($cacheKey, [
            'data' => $responseData,
            'timestamp' => now()->timestamp
        ], 2);

        return response()->json($responseData)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
