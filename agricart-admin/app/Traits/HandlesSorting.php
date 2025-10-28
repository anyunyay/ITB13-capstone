<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use App\Services\SortablePaginationService;
use App\Services\TablePerformanceService;

trait HandlesSorting
{
    /**
     * Apply sorting to a query based on request parameters with performance optimization.
     *
     * @param Builder $query
     * @param Request $request
     * @param array $defaultSort
     * @return Builder
     */
    protected function applySorting(Builder $query, Request $request, array $defaultSort = []): Builder
    {
        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order', 'asc');

        // If no sort parameters provided, apply default sort if available
        if (!$sortBy && !empty($defaultSort)) {
            $sortBy = $defaultSort['column'] ?? null;
            $sortOrder = $defaultSort['direction'] ?? 'asc';
        }

        if ($sortBy) {
            // Use the model's sortable trait if available
            if (method_exists($query->getModel(), 'applySortWithDefault')) {
                return $query->applySortWithDefault([
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]);
            }

            // Apply optimized sorting with proper indexing
            return TablePerformanceService::optimizeSorting($query, $sortBy, $sortOrder);
        }

        return $query;
    }

    /**
     * Get pagination data with sort metadata and performance optimization.
     *
     * @param Builder $query
     * @param Request $request
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    protected function getPaginatedResults(Builder $query, Request $request, int $perPage = 10)
    {
        // Handle page reset when sort changes
        $sortParams = SortablePaginationService::getSortParametersWithPageReset($request);
        
        // Override page parameter if sort changed - reset to page 1
        if ($sortParams['sort_changed']) {
            $request->merge(['page' => 1]);
        }

        // Apply performance optimizations
        $query = TablePerformanceService::optimizeQuery($query, $request, [
            'max_rows' => 10000, // Limit for performance
            'enable_caching' => false, // Disable for real-time data
        ]);

        // Optimize pagination for large datasets
        $page = $request->get('page', 1);
        $query = TablePerformanceService::optimizePagination($query, $page, $perPage, $sortParams['sort_by'] ?? 'id');

        // Monitor performance and execute pagination
        $results = TablePerformanceService::monitorPerformance(
            fn() => $query->paginate($perPage),
            'paginated_query'
        );

        // Add sort metadata to pagination data - ensure sort state persists across page navigation
        $results->appends([
            'sort_by' => $sortParams['sort_by'],
            'sort_order' => $sortParams['sort_order'],
        ]);

        // Add enhanced custom sort metadata to pagination response
        $results->sortMetadata = [
            'sort_by' => $sortParams['sort_by'],
            'sort_order' => $sortParams['sort_order'],
            'has_sort' => !empty($sortParams['sort_by']),
            'sort_changed' => $sortParams['sort_changed'],
            'page_reset_on_sort' => $sortParams['sort_changed'],
            'sort_persisted' => !empty($sortParams['sort_by']),
        ];

        return $results;
    }

    /**
     * Validate sort parameters against allowed columns.
     *
     * @param Request $request
     * @param array $allowedColumns
     * @return array
     */
    protected function validateSortParameters(Request $request, array $allowedColumns = []): array
    {
        $sortBy = $request->get('sort_by');
        $sortOrder = strtolower($request->get('sort_order', 'asc'));

        // Validate sort direction
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        // Validate sort column if allowed columns are specified
        if (!empty($allowedColumns) && $sortBy && !in_array($sortBy, $allowedColumns)) {
            $sortBy = null;
        }

        return [
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
            'is_valid' => !empty($sortBy)
        ];
    }

    /**
     * Get sort parameters for response/view data.
     *
     * @param Request $request
     * @param array $defaultSort
     * @return array
     */
    protected function getSortFilters(Request $request, array $defaultSort = []): array
    {
        $sortBy = $request->get('sort_by', $defaultSort['column'] ?? null);
        $sortOrder = $request->get('sort_order', $defaultSort['direction'] ?? 'asc');

        return [
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
        ];
    }

    /**
     * Get enhanced pagination response with sort metadata.
     *
     * @param Builder $query
     * @param Request $request
     * @param int $perPage
     * @return array
     */
    protected function getPaginatedResponseWithSort(Builder $query, Request $request, int $perPage = 10): array
    {
        $results = $this->getPaginatedResults($query, $request, $perPage);
        
        return SortablePaginationService::transformPaginatedResponse($results, $request);
    }

    /**
     * Create sortable pagination links.
     *
     * @param \Illuminate\Contracts\Pagination\LengthAwarePaginator $paginator
     * @param Request $request
     * @return array
     */
    protected function createSortableLinks($paginator, Request $request): array
    {
        return SortablePaginationService::createSortableLinks($paginator, $request);
    }

    /**
     * Get enhanced pagination data structure with complete sort metadata.
     *
     * @param Builder $query
     * @param Request $request
     * @param int $perPage
     * @return array
     */
    protected function getEnhancedPaginationData(Builder $query, Request $request, int $perPage = 10): array
    {
        $results = $this->getPaginatedResults($query, $request, $perPage);
        
        // Transform to enhanced format with all sort metadata
        $paginationData = [
            'data' => $results->items(),
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'per_page' => $results->perPage(),
            'total' => $results->total(),
            'from' => $results->firstItem(),
            'to' => $results->lastItem(),
            'sort_by' => $request->get('sort_by'),
            'sort_order' => $request->get('sort_order', 'asc'),
            'sort_metadata' => $results->sortMetadata ?? [],
            'links' => $results->linkCollection()->toArray(),
            'next_page_url' => $results->nextPageUrl(),
            'prev_page_url' => $results->previousPageUrl(),
        ];

        return $paginationData;
    }
}