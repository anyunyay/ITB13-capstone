<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class CheckSingleSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip single session check for logout routes, single session routes, and email verification routes
        if ($request->routeIs('logout') || 
            $request->routeIs('single-session.*') || 
            $request->routeIs('verification.*') ||
            $request->routeIs('email.verification.*')) {
            return $next($request);
        }

        // Skip single session check in testing environment
        if (app()->environment('testing')) {
            return $next($request);
        }

        // Only check for authenticated users
        if (Auth::check()) {
            $user = Auth::user();
            $currentSessionId = Session::getId();

            // Check if the current session is the user's active session
            if (!$user->isCurrentSession($currentSessionId)) {
                // This session is not the current active session
                // Redirect to single session restriction page
                return redirect()->route('single-session.restricted');
            }
        }

        return $next($request);
    }
}
