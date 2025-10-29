<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'en'; // Default to English for non-members

        // Check if user is authenticated
        if (auth()->check()) {
            $user = auth()->user();
            
            // For members, always default to English unless they have a preference
            if ($user->type === 'member') {
                $locale = $user->language ?? 'en';
            } else {
                // For other user types, use their preference or session
                $locale = $user->language ?? session('locale', 'en');
            }
        } 
        // Check session for non-authenticated users
        elseif (session()->has('locale')) {
            $locale = session('locale');
        }

        // Set the application locale
        app()->setLocale($locale);

        return $next($request);
    }
}
