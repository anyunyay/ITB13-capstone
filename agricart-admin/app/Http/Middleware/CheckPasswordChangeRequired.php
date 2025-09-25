<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPasswordChangeRequired
{
    /**
     * Handle an incoming request.
     * Check if staff or logistics users need to change their password.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only check for staff and logistics users
        if ($user && in_array($user->type, ['staff', 'logistic']) && $user->password_change_required) {
            // Allow access to password change routes and logout
            $allowedRoutes = [
                'password.change',
                'password.change.store',
                'logout',
            ];

            $currentRoute = $request->route()?->getName();
            
            if (!in_array($currentRoute, $allowedRoutes)) {
                return redirect()->route('password.change');
            }
        }

        return $next($request);
    }
}
