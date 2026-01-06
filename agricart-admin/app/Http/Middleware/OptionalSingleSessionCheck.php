<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class OptionalSingleSessionCheck
{
    /**
     * Handle an incoming request.
     * This is a safer alternative that only warns users about multiple sessions
     * without forcing logout.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for logout, API routes, and auth routes
        if (
            $request->routeIs('logout') ||
            $request->routeIs('api.*') ||
            $request->routeIs('verification.*') ||
            $request->routeIs('login*') ||
            $request->routeIs('register') ||
            $request->routeIs('password.*') ||
            app()->environment('testing')
        ) {
            return $next($request);
        }

        // Only check for authenticated users
        if (Auth::check()) {
            $user = Auth::user();
            $currentSessionId = Session::getId();

            // Count active sessions for this user (sessions active in last 30 minutes)
            $activeSessions = DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('last_activity', '>', time() - 1800) // 30 minutes
                ->count();

            // If more than 1 active session, add a warning to the session
            if ($activeSessions > 1) {
                $request->session()->flash('multiple_sessions_warning', 
                    'Your account is active on multiple devices. For security, consider logging out from unused devices.'
                );
            }
        }

        return $next($request);
    }
}