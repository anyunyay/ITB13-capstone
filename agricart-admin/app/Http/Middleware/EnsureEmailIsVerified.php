<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     * Only require email verification for customers.
     * Staff, member, and logistics users are considered verified by default.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Staff, member, and logistics don't need email verification
        if (in_array($user->type, ['staff', 'member', 'logistic'])) {
            return $next($request);
        }

        // For customers, check if email is verified
        if ($user->type === 'customer' && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        return $next($request);
    }
}
