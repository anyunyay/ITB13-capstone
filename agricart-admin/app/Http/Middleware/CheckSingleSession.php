<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
            $request->routeIs('admin.login') ||
            $request->routeIs('member.login') ||
            $request->routeIs('logistic.login') ||
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

            // Debug logging
            Log::info('CheckSingleSession middleware', [
                'user_id' => $user->id,
                'current_session_id' => $currentSessionId,
                'stored_session_id' => $user->current_session_id,
                'has_active_session' => $user->hasActiveSession(),
                'is_current_session' => $user->isCurrentSession($currentSessionId),
                'is_session_valid' => $user->isSessionValid(),
                'route' => $request->route()?->getName(),
                'url' => $request->url()
            ]);

            // If user has no active session set, set the current one
            // This handles cases where session was cleared but user is still authenticated
            if (!$user->hasActiveSession()) {
                try {
                    $user->update(['current_session_id' => $currentSessionId]);
                    Log::info('Set initial session for user ' . $user->id . ' to: ' . $currentSessionId);
                } catch (\Exception $e) {
                    // If update fails, log it but don't break the request
                    Log::warning('Failed to update session ID for user ' . $user->id . ': ' . $e->getMessage());
                }
            }
            // Check if the current session is the user's active session
            elseif (!$user->isCurrentSession($currentSessionId)) {
                // Verify the stored session still exists in the database
                if (!$user->isSessionValid()) {
                    // The stored session is invalid (expired/deleted), update to current session
                    // This is normal behavior when sessions expire or are cleaned up
                    try {
                        $user->update(['current_session_id' => $currentSessionId]);
                        Log::info('Updated expired session for user ' . $user->id . ' to new session: ' . $currentSessionId);
                    } catch (\Exception $e) {
                        Log::warning('Failed to update expired session ID for user ' . $user->id . ': ' . $e->getMessage());
                    }
                } else {
                    // Check if the stored session is very recent (within 5 minutes)
                    // This handles session regeneration during the same browser session
                    $storedSession = \DB::table('sessions')
                        ->where('id', $user->current_session_id)
                        ->where('user_id', $user->id)
                        ->first();
                    
                    if ($storedSession && $storedSession->last_activity > (time() - 300)) {
                        // Session is recent, this might be session regeneration
                        // Allow it and update to the new session ID
                        try {
                            $user->update(['current_session_id' => $currentSessionId]);
                            Log::info('Updated regenerated session for user ' . $user->id . ' to new session: ' . $currentSessionId);
                        } catch (\Exception $e) {
                            Log::warning('Failed to update regenerated session ID for user ' . $user->id . ': ' . $e->getMessage());
                        }
                    } else {
                        // This session is not the current active session and the stored session is valid and old
                        // User has been kicked out by another session - log them out and redirect to appropriate login
                        $userType = $user->type;

                        Log::warning('Logging out user ' . $user->id . ' due to session mismatch', [
                            'current_session' => $currentSessionId,
                            'stored_session' => $user->current_session_id,
                            'stored_session_activity' => $storedSession ? $storedSession->last_activity : 'not found'
                        ]);

                        // Clear the session
                        Auth::guard('web')->logout();
                        $request->session()->invalidate();
                        $request->session()->regenerateToken();

                        // Determine the correct login route based on user type
                        $loginRoute = match ($userType) {
                            'admin', 'staff' => 'admin.login',
                            'member' => 'member.login',
                            'logistic' => 'logistic.login',
                            default => 'login', // customer
                        };

                        // Redirect to appropriate login page with a message
                        return redirect()->route($loginRoute)->with('error', 'Your account is logged in from another device or browser. Please log in again.');
                    }
                }
            }
        }

        return $next($request);
    }
}
