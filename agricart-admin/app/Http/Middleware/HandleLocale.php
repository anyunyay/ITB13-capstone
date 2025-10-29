<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'en'; // Default to English
        
        // Check if user is authenticated and has a language preference
        if (Auth::check()) {
            $user = Auth::user();
            $userLocale = $user->language ?? null;
            
            // Validate locale (must be 'en' or 'tl')
            if (in_array($userLocale, ['en', 'tl'])) {
                $locale = $userLocale;
            } else {
                // For non-members or users without preference, default to English
                $locale = 'en';
            }
        }
        
        // Set the application locale
        app()->setLocale($locale);
        
        return $next($request);
    }
}
