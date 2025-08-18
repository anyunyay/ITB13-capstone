<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                
                // Redirect based on user role
                if ($user->type === 'admin' || $user->type === 'staff') {
                    return redirect()->route('admin.dashboard');
                } elseif ($user->type === 'customer') {
                    return redirect()->route('home');
                } elseif ($user->type === 'member') {
                    return redirect()->route('member.dashboard');
                } elseif ($user->type === 'logistic') {
                    return redirect()->route('logistic.dashboard');
                }

                // Default fallback
                return redirect()->route('home');
            }
        }

        return $next($request);
    }
} 