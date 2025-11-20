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
        // Skip single session check for logout routes, single session routes, API routes, and email verification routes
        if (
            $request->routeIs('logout') ||
            $request->routeIs('single-session.*') ||
            $request->routeIs('api.*') ||
            $request->routeIs('verification.*') ||
            $request->routeIs('email.verification.*') ||
            $request->routeIs('login') ||
            $request->routeIs('register') ||
            $request->routeIs('password.*')
        ) {
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

            // If user has no active session set, set the current one
            // This handles cases where session was cleared but user is still authenticated
            if (!$user->hasActiveSession()) {
                try {
                    $user->update(['current_session_id' => $currentSessionId]);
                } catch (\Exception $e) {
                    // If update fails, log it but don't break the request
                    \Log::warning('Failed to update session ID for user ' . $user->id . ': ' . $e->getMessage());
                }
            }
            // Check if the current session is the user's active session
            elseif (!$user->isCurrentSession($currentSessionId)) {
                // Verify the stored session still exists in the database
                if (!$user->isSessionValid()) {
                    // The stored session is invalid, update to current session
                    try {
                        $user->update(['current_session_id' => $currentSessionId]);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to update invalid session ID for user ' . $user->id . ': ' . $e->getMessage());
                    }
                } else {
                    // This session is not the current active session and the stored session is valid
                    // Redirect to single session restriction page
                    return redirect()->route('single-session.restricted');
                }
            }
        }

        return $next($request);
    }
}
