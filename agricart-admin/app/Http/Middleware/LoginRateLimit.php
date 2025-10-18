<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class LoginRateLimit
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestSignature($request);
        
        // Rate limit: 10 requests per minute per IP
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            
            return response()->json([
                'error' => 'Too many requests',
                'message' => "Please wait {$seconds} seconds before trying again.",
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, 60); // 1 minute decay

        return $next($request);
    }

    /**
     * Resolve request signature for rate limiting
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $identifier = $request->input('email') ?? $request->input('member_id');
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        
        return Str::transliterate(Str::lower($identifier . '|' . $ip . '|' . hash('sha256', $userAgent)));
    }
}
