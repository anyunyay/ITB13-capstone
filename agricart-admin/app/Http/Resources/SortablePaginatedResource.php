<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class SortablePaginatedResource extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        $paginator = $this->resource;
        
        if (!$paginator instanceof LengthAwarePaginator) {
            return parent::toArray($request);
        }

        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order', 'asc');

        return [
            'data' => $this->collection,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'path' => $paginator->path(),
            'links' => $this->buildSortableLinks($paginator, $request),
            'sort_metadata' => [
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'has_sort' => !empty($sortBy),
                'sort_changed' => $paginator->sortMetadata['sort_changed'] ?? false,
            ],
        ];
    }

    /**
     * Build pagination links that preserve sort parameters.
     *
     * @param LengthAwarePaginator $paginator
     * @param Request $request
     * @return array
     */
    protected function buildSortableLinks(LengthAwarePaginator $paginator, Request $request): array
    {
        $sortBy = $request->get('sort_by');
        $sortOrder = $request->get('sort_order');
        
        $links = [];
        
        // Build query parameters for sort
        $sortParams = [];
        if ($sortBy) $sortParams['sort_by'] = $sortBy;
        if ($sortOrder) $sortParams['sort_order'] = $sortOrder;
        
        // Previous page
        if ($paginator->previousPageUrl()) {
            $prevParams = array_merge($sortParams, ['page' => $paginator->currentPage() - 1]);
            $links[] = [
                'url' => $paginator->path() . '?' . http_build_query($prevParams),
                'label' => '&laquo; Previous',
                'active' => false,
            ];
        } else {
            $links[] = [
                'url' => null,
                'label' => '&laquo; Previous',
                'active' => false,
            ];
        }
        
        // Page numbers
        for ($i = 1; $i <= $paginator->lastPage(); $i++) {
            $pageParams = array_merge($sortParams, ['page' => $i]);
            $links[] = [
                'url' => $paginator->path() . '?' . http_build_query($pageParams),
                'label' => (string) $i,
                'active' => $i === $paginator->currentPage(),
            ];
        }
        
        // Next page
        if ($paginator->nextPageUrl()) {
            $nextParams = array_merge($sortParams, ['page' => $paginator->currentPage() + 1]);
            $links[] = [
                'url' => $paginator->path() . '?' . http_build_query($nextParams),
                'label' => 'Next &raquo;',
                'active' => false,
            ];
        } else {
            $links[] = [
                'url' => null,
                'label' => 'Next &raquo;',
                'active' => false,
            ];
        }
        
        return $links;
    }
}