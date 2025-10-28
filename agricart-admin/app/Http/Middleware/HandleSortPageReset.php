<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleSortPageReset
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if this is a request with sort parameters
        if ($request->has(['sort_by', 'sort_order'])) {
            $routeName = $request->route()->getName();
            $sessionKey = 'sort_state_' . $routeName;
            
            // Get previous sort state from session
            $previousSort = session($sessionKey, []);
            
            $currentSortBy = $request->get('sort_by');
            $currentSortOrder = $request->get('sort_order');
            
            // Check if sort parameters changed
            $sortChanged = (
                ($previousSort['sort_by'] ?? null) !== $currentSortBy ||
                ($previousSort['sort_order'] ?? null) !== $currentSortOrder
            );
            
            // If sort changed and we're not on page 1, redirect to page 1
            if ($sortChanged && $request->get('page', 1) > 1) {
                $queryParams = $request->query();
                $queryParams['page'] = 1;
                
                return redirect($request->url() . '?' . http_build_query($queryParams));
            }
            
            // Store current sort state in session
            session([$sessionKey => [
                'sort_by' => $currentSortBy,
                'sort_order' => $currentSortOrder,
            ]]);
        }

        return $next($request);
    }
}