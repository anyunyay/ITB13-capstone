<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;

class SortablePaginationService
{
    /**
     * Create a paginator with sort metadata.
     *
     * @param \Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Query\Builder $query
     * @param Request $request
     * @param int $perPage
     * @param array $options
     * @return LengthAwarePaginator
     */
    public static function paginate($query, Request $request, int $perPage = 10, array $options = []): LengthAwarePaginator
    {
        $page = $request->get('page', 1);
        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order', 'asc');

        // Get total count before pagination
        $total = $query->count();

        // Apply pagination
        $results = $query->forPage($page, $perPage)->get();

        // Create paginator
        $paginator = new LengthAwarePaginator(
            $results,
            $total,
            $perPage,
            $page,
            array_merge([
                'path' => $request->url(),
                'pageName' => 'page',
            ], $options)
        );

        // Add sort metadata to the paginator
        $paginator->appends([
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
        ]);

        // Add custom sort metadata
        $paginator->sortMetadata = [
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'has_sort' => !empty($sortBy),
        ];

        return $paginator;
    }

    /**
     * Transform paginated results to include sort metadata in response.
     *
     * @param LengthAwarePaginator $paginator
     * @param Request $request
     * @return array
     */
    public static function transformPaginatedResponse(LengthAwarePaginator $paginator, Request $request): array
    {
        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order', 'asc');

        return [
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'links' => $paginator->linkCollection()->toArray(),
            'path' => $paginator->path(),
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'has_sort' => !empty($sortBy),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
            // Enhanced sort metadata for better frontend integration
            'sort_metadata' => [
                'current_sort_column' => $sortBy,
                'current_sort_direction' => $sortOrder,
                'is_sorted' => !empty($sortBy),
                'sort_state_persisted' => true,
            ],
        ];
    }

    /**
     * Handle page reset when sort parameters change.
     *
     * @param Request $request
     * @param string|null $previousSortBy
     * @param string|null $previousSortOrder
     * @return bool
     */
    public static function shouldResetPage(Request $request, ?string $previousSortBy = null, ?string $previousSortOrder = null): bool
    {
        $currentSortBy = $request->get('sort_by');
        $currentSortOrder = $request->get('sort_order');

        // Reset page if sort parameters changed
        return ($currentSortBy !== $previousSortBy) || ($currentSortOrder !== $previousSortOrder);
    }

    /**
     * Get sort parameters with page reset logic.
     *
     * @param Request $request
     * @param array $defaultSort
     * @return array
     */
    public static function getSortParametersWithPageReset(Request $request, array $defaultSort = []): array
    {
        $sortBy = $request->get('sort_by', $defaultSort['column'] ?? null);
        $sortOrder = $request->get('sort_order', $defaultSort['direction'] ?? 'asc');
        $page = $request->get('page', 1);

        // Store previous sort in session to detect changes
        $routeName = 'default';
        if ($request->route() && method_exists($request->route(), 'getName')) {
            $routeName = $request->route()->getName() ?: 'default';
        }
        $sessionKey = 'sort_state_' . $routeName;
        $previousSort = session($sessionKey, []);

        $sortChanged = (
            ($previousSort['sort_by'] ?? null) !== $sortBy ||
            ($previousSort['sort_order'] ?? null) !== $sortOrder
        );

        // Always reset page to 1 when sort changes (requirement 5.4)
        if ($sortChanged) {
            $page = 1;
        }

        // Store current sort state in session for persistence across page navigation
        session([$sessionKey => [
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'timestamp' => now()->timestamp,
        ]]);

        return [
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'page' => $page,
            'sort_changed' => $sortChanged,
            'sort_persisted' => !empty($sortBy),
            'page_reset_applied' => $sortChanged,
        ];
    }

    /**
     * Create pagination links with sort parameters preserved.
     *
     * @param LengthAwarePaginator $paginator
     * @param Request $request
     * @return array
     */
    public static function createSortableLinks(LengthAwarePaginator $paginator, Request $request): array
    {
        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order');

        $links = [];

        // Build query parameters for sort state persistence
        $sortParams = [];
        if ($sortBy) $sortParams['sort_by'] = $sortBy;
        if ($sortOrder) $sortParams['sort_order'] = $sortOrder;
        $sortQuery = !empty($sortParams) ? '&' . http_build_query($sortParams) : '';

        // Previous page link with sort state preserved
        if ($paginator->previousPageUrl()) {
            $links['prev'] = $paginator->previousPageUrl() . $sortQuery;
        }

        // Next page link with sort state preserved
        if ($paginator->nextPageUrl()) {
            $links['next'] = $paginator->nextPageUrl() . $sortQuery;
        }

        // Page number links with sort state preserved
        $links['pages'] = [];
        for ($i = 1; $i <= $paginator->lastPage(); $i++) {
            $url = $paginator->url($i) . $sortQuery;
            
            $links['pages'][$i] = [
                'url' => $url,
                'active' => $i === $paginator->currentPage(),
                'page' => $i,
            ];
        }

        // Enhanced metadata for frontend
        $links['metadata'] = [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'has_sort' => !empty($sortBy),
        ];

        return $links;
    }
}