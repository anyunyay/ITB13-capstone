<?php

namespace App\Http\Middleware;

use App\Models\SystemStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSystemLock
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $systemStatus = SystemStatus::getCustomerAccessStatus();
        
        if ($systemStatus && $systemStatus->isLocked()) {
            // Block customer actions when system is locked
            if ($request->is('customer/*') || $request->is('cart/*') || $request->is('checkout/*')) {
                return response()->json([
                    'error' => 'System is currently locked for maintenance. Please try again later.',
                    'locked' => true
                ], 423); // 423 Locked status code
            }
        }
        
        return $next($request);
    }
}
