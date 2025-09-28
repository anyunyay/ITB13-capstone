<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Spatie\Permission\Models\Permission;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $shared = [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ], 
            // Dynamically generate permissions based on the current user
            'permissions' => collect(Permission::all()->pluck('name'))->mapWithKeys(function ($permission) use ($request) { 
                $key = lcfirst(str_replace(' ', '', ucwords($permission))); // Convert permission name to camelCase
                $user = $request->user();
                $canPermission = $user ? $user->can($permission) : false;
                return [$key => $canPermission]; // Check if the user has the permission
            }),
            'flash' => fn() => $request->session()->get('flash') ?: [
                'message' => $request->session()->get('message')
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];

        // Share notifications for authenticated users based on their type
        if ($request->user()) {
            $user = $request->user();
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

            if (!empty($notificationTypes)) {
                $shared['notifications'] = $user->unreadNotifications()
                    ->whereIn('type', $notificationTypes)
                    ->orderBy('created_at', 'desc')
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

            // Share urgent orders for admin/staff users
            if (in_array($user->type, ['admin', 'staff'])) {
                $urgentOrders = \App\Models\Sales::with(['customer', 'admin', 'logistic', 'auditTrail.product'])
                    ->where('status', 'pending')
                    ->get()
                    ->filter(function ($order) {
                        // Check if manually marked as urgent
                        if ($order->is_urgent) return true;
                        // Check if within 8 hours of 24-hour limit
                        $orderAge = now()->diffInHours($order->created_at);
                        return $orderAge >= 16; // 16+ hours old (8 hours left)
                    })
                    ->values();

                $shared['urgentOrders'] = $urgentOrders;
            }
        }

        return $shared;
    }
}
