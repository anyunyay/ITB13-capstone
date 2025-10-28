<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use InvalidArgumentException;

trait Sortable
{
    /**
     * Define sortable columns for the model.
     * Override this method in your model to specify which columns can be sorted.
     *
     * @return array
     */
    public function getSortableColumns(): array
    {
        return [];
    }

    /**
     * Define column data types for proper sorting.
     * Override this method in your model to specify data types for columns.
     *
     * @return array
     */
    public function getColumnDataTypes(): array
    {
        return [];
    }

    /**
     * Apply sorting to the query based on request parameters.
     *
     * @param Builder $query
     * @param Request|array $request
     * @return Builder
     */
    public function scopeApplySort(Builder $query, $request = null): Builder
    {
        if ($request === null) {
            $request = request();
        }

        // Handle array input (for direct parameter passing)
        if (is_array($request)) {
            $sortBy = $request['sort_by'] ?? null;
            $sortOrder = $request['sort_order'] ?? null;
        } else {
            // Handle Request object
            $sortBy = $request->get('sort_by');
            $sortOrder = $request->get('sort_order');
        }

        if (!$sortBy || !$sortOrder) {
            return $query;
        }

        return $this->applySortToQuery($query, $sortBy, $sortOrder);
    }

    /**
     * Apply sorting to query with validation.
     *
     * @param Builder $query
     * @param string $column
     * @param string $direction
     * @return Builder
     * @throws InvalidArgumentException
     */
    protected function applySortToQuery(Builder $query, string $column, string $direction): Builder
    {
        // Validate sort direction
        $direction = strtolower($direction);
        if (!in_array($direction, ['asc', 'desc'])) {
            throw new InvalidArgumentException("Invalid sort direction: {$direction}. Must be 'asc' or 'desc'.");
        }

        // Validate sortable column
        $sortableColumns = $this->getSortableColumns();
        if (empty($sortableColumns)) {
            throw new InvalidArgumentException("No sortable columns defined for model: " . get_class($this));
        }

        if (!in_array($column, $sortableColumns)) {
            throw new InvalidArgumentException("Column '{$column}' is not sortable for model: " . get_class($this));
        }

        // Apply sorting based on data type
        return $this->applySortByDataType($query, $column, $direction);
    }

    /**
     * Apply sorting based on column data type.
     *
     * @param Builder $query
     * @param string $column
     * @param string $direction
     * @return Builder
     */
    protected function applySortByDataType(Builder $query, string $column, string $direction): Builder
    {
        $dataTypes = $this->getColumnDataTypes();
        $dataType = $dataTypes[$column] ?? 'string';

        switch ($dataType) {
            case 'date':
            case 'datetime':
                return $query->orderBy($column, $direction);

            case 'number':
            case 'integer':
            case 'decimal':
            case 'float':
                return $query->orderByRaw("CAST({$column} AS DECIMAL(15,2)) {$direction}");

            case 'string':
            case 'text':
            default:
                return $query->orderBy($column, $direction);
        }
    }

    /**
     * Validate sort parameters from request.
     *
     * @param Request|array $request
     * @return array
     * @throws InvalidArgumentException
     */
    public function validateSortParameters($request): array
    {
        if (is_array($request)) {
            $sortBy = $request['sort_by'] ?? null;
            $sortOrder = $request['sort_order'] ?? null;
        } else {
            $sortBy = $request->get('sort_by');
            $sortOrder = $request->get('sort_order');
        }

        $result = [
            'sort_by' => null,
            'sort_order' => null,
            'is_valid' => false
        ];

        if (!$sortBy || !$sortOrder) {
            return $result;
        }

        try {
            // Validate direction
            $sortOrder = strtolower($sortOrder);
            if (!in_array($sortOrder, ['asc', 'desc'])) {
                throw new InvalidArgumentException("Invalid sort direction: {$sortOrder}");
            }

            // Validate column
            $sortableColumns = $this->getSortableColumns();
            if (empty($sortableColumns)) {
                throw new InvalidArgumentException("No sortable columns defined");
            }

            if (!in_array($sortBy, $sortableColumns)) {
                throw new InvalidArgumentException("Column '{$sortBy}' is not sortable");
            }

            $result['sort_by'] = $sortBy;
            $result['sort_order'] = $sortOrder;
            $result['is_valid'] = true;

        } catch (InvalidArgumentException $e) {
            // Log the validation error but don't throw - return invalid result
            \Log::warning("Sort parameter validation failed: " . $e->getMessage());
        }

        return $result;
    }

    /**
     * Get default sort configuration for the model.
     * Override this method to set default sorting.
     *
     * @return array
     */
    public function getDefaultSort(): array
    {
        return [
            'column' => 'created_at',
            'direction' => 'desc'
        ];
    }

    /**
     * Apply default sorting if no sort parameters provided.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeApplyDefaultSort(Builder $query): Builder
    {
        $defaultSort = $this->getDefaultSort();
        
        if (empty($defaultSort['column'])) {
            return $query;
        }

        $column = $defaultSort['column'];
        $direction = $defaultSort['direction'] ?? 'asc';

        // Only apply default sort if column is in sortable columns
        $sortableColumns = $this->getSortableColumns();
        if (in_array($column, $sortableColumns)) {
            return $this->applySortByDataType($query, $column, $direction);
        }

        return $query;
    }

    /**
     * Combine sort application with default fallback.
     *
     * @param Builder $query
     * @param Request|array|null $request
     * @return Builder
     */
    public function scopeApplySortWithDefault(Builder $query, $request = null): Builder
    {
        if ($request === null) {
            $request = request();
        }

        // Try to apply requested sort
        $sortParams = $this->validateSortParameters($request);
        
        if ($sortParams['is_valid']) {
            return $this->applySortToQuery($query, $sortParams['sort_by'], $sortParams['sort_order']);
        }

        // Fall back to default sort
        return $query->applyDefaultSort();
    }
}