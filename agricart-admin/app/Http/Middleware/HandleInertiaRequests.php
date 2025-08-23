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

        // Share notifications for authenticated customers
        if ($request->user() && $request->user()->type === 'customer') {
            $shared['customerNotifications'] = $request->user()->unreadNotifications()
                ->whereIn('type', ['App\\Notifications\\OrderStatusUpdate', 'App\\Notifications\\DeliveryStatusUpdate'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'order_id' => $notification->data['order_id'] ?? null,
                        'status' => $notification->data['status'] ?? null,
                        'delivery_status' => $notification->data['delivery_status'] ?? null,
                        'message' => $notification->data['message'] ?? '',
                        'created_at' => $notification->created_at->toISOString(),
                        'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    ];
                });
        }

        return $shared;
    }
}
