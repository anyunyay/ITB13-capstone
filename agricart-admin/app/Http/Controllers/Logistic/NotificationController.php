<?php

namespace App\Http\Controllers\Logistic;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display all notifications for the authenticated logistic
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $locale = $user->language ?? app()->getLocale();
        
        $notificationTypes = NotificationService::getNotificationTypesForUser('logistic');
        
        $notifications = $user->notifications()
            ->whereIn('type', $notificationTypes)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) use ($locale) {
                return NotificationService::formatNotification($notification, $locale);
            });

        return Inertia::render('Logistic/notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Display all notifications page in profile
     */
    public function profileIndex(Request $request)
    {
        $user = $request->user();
        
        // AUTHORIZATION: Ensure only logistics can access this endpoint
        if ($user->type !== 'logistic') {
            abort(403, 'Unauthorized access. This page is only accessible to logistics personnel.');
        }
        
        $locale = $user->language ?? app()->getLocale();
        $notificationTypes = NotificationService::getNotificationTypesForUser('logistic');
        
        $notifications = $user->notifications()
            ->whereIn('type', $notificationTypes)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($notification) use ($locale) {
                return NotificationService::formatNotification($notification, $locale);
            });

        return Inertia::render('Profile/all-notifications', [
            'paginatedNotifications' => $notifications,
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
}
