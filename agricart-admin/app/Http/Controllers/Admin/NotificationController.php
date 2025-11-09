<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display all notifications for the authenticated admin/staff
     */
    public function index(Request $request)
    {
        $user = $request->user();
        // Optimize: Limit notifications and load only essential data
        $notifications = $user->notifications()
            ->whereIn('type', [
                'App\\Notifications\\NewOrderNotification',
                'App\\Notifications\\InventoryUpdateNotification',
                'App\\Notifications\\MembershipUpdateNotification',
                'App\\Notifications\\PasswordChangeRequestNotification'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(50) // Limit to recent notifications
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'unknown',
                    'message' => $notification->data['message'] ?? '',
                    'action_url' => $notification->data['action_url'] ?? null,
                    'created_at' => $notification->created_at?->toISOString(),
                    'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    // Reduce data payload by excluding full data object
                ];
            });

        return Inertia::render('Admin/notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark specific notifications as read
     */
    public function markRead(Request $request)
    {
        $user = $request->user();
        $ids = $request->input('ids', []);
        
        if (!empty($ids)) {
            $user->unreadNotifications()->whereIn('id', $ids)->update(['read_at' => now()]);
        }

        if ($request->header('X-Inertia')) {
            return redirect()->back(303, [], true);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        if ($request->header('X-Inertia')) {
            return redirect()->back(303, [], true);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Hide a specific notification from header (mark as hidden, not deleted)
     */
    public function hideFromHeader(Request $request, $id)
    {
        $user = $request->user();
        $user->notifications()->where('id', $id)->update(['hidden_from_header' => true]);

        if ($request->header('X-Inertia')) {
            return redirect()->back(303, [], true);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Hide all notifications from header (mark as hidden, not deleted)
     */
    public function hideAllFromHeader(Request $request)
    {
        $user = $request->user();
        // Hide ALL notifications that are not already hidden
        $user->notifications()
            ->where('hidden_from_header', false)
            ->update(['hidden_from_header' => true]);

        if ($request->header('X-Inertia')) {
            return redirect()->back(303, [], true);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Display all notifications page in profile
     */
    public function profileIndex(Request $request)
    {
        $user = $request->user();
        $notifications = $user->notifications()
            ->whereIn('type', [
                'App\\Notifications\\NewOrderNotification',
                'App\\Notifications\\InventoryUpdateNotification',
                'App\\Notifications\\MembershipUpdateNotification',
                'App\\Notifications\\PasswordChangeRequestNotification'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->through(function ($notification) {
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

        return Inertia::render('Profile/all-notifications', [
            'paginatedNotifications' => $notifications,
        ]);
    }
}
