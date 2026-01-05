<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // If user is authenticated but account is deactivated
        if ($user && !$user->active) {
            // Clear the user's current session if method exists
            if (method_exists($user, 'clearCurrentSession')) {
                $user->clearCurrentSession();
            }
            
            // Log the user out
            Auth::logout();
            
            // Invalidate the session
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            // Redirect with error message
            return redirect()->route('login')->withErrors([
                'email' => __('auth.deactivated')
            ]);
        }

        return $next($request);
    }
}
