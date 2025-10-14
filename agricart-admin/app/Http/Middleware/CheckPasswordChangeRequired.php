<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPasswordChangeRequired
{
    /**
     * Handle an incoming request.
     * Check if users with is_default = true need to change their password.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is a default account and needs to update credentials
        if ($user && $user->is_default) {
            // Allow access to credential update routes and logout
            $allowedRoutes = [
                'credentials.update.show',
                'credentials.update',
                'logout',
                'single-session.logout',
            ];

            $currentRoute = $request->route()?->getName();
            
            if (!in_array($currentRoute, $allowedRoutes)) {
                return redirect()->route('credentials.update.show');
            }
        }

        return $next($request);
    }
}
