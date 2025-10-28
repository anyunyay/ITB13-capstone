<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TablePerformanceService
{
    /**
     * Optimize query performance for large datasets.
     *
     * @param Builder $query
     * @param Request $request
     * @param array $options
     * @return Builder
     */
    public static function optimizeQuery(Builder $query, Request $request, array $options = []): Builder
    {
        $maxRows = $options['max_rows'] ?? 10000;
        $enableCaching = $options['enable_caching'] ?? false;
        $cacheKey = $options['cache_key'] ?? null;
        
        // Limit query scope for performance
        if ($maxRows > 0) {
            $query->limit($maxRows);
        }

        // Add query hints for better performance
        $query->getQuery()->from = DB::raw($query->getModel()->getTable() . ' USE INDEX (PRIMARY)');

        // Enable query caching for read-heavy operations
        if ($enableCaching && $cacheKey) {
            $query = self::addQueryCaching($query, $cacheKey);
        }

        return $query;
    }

    /**
     * Add intelligent query caching.
     *
     * @param Builder $query
     * @param string $cacheKey
     * @param int $ttl
     * @return Builder
     */
    private static function addQueryCaching(Builder $query, string $cacheKey, int $ttl = 300): Builder
    {
        // Only cache if no write operations are pending
        if (!self::hasRecentWrites($query->getModel()->getTable())) {
            $query->remember($ttl)->cacheTags(['table_data', $query->getModel()->getTable()]);
        }

        return $query;
    }

    /**
     * Check if there have been recent write operations.
     *
     * @param string $table
     * @return bool
     */
    private static function hasRecentWrites(string $table): bool
    {
        $lastWrite = Cache::get("last_write_{$table}");
        return $lastWrite && (time() - $lastWrite) < 60; // 1 minute threshold
    }

    /**
     * Record write operation for cache invalidation.
     *
     * @param string $table
     * @return void
     */
    public static function recordWrite(string $table): void
    {
        Cache::put("last_write_{$table}", time(), 300);
        Cache::tags(['table_data', $table])->flush();
    }

    /**
     * Optimize sorting queries with proper indexing hints.
     *
     * @param Builder $query
     * @param string $sortColumn
     * @param string $sortDirection
     * @return Builder
     */
    public static function optimizeSorting(Builder $query, string $sortColumn, string $sortDirection = 'asc'): Builder
    {
        $table = $query->getModel()->getTable();
        
        // Use index hints for common sort columns
        $indexHints = [
            'created_at' => "{$table}_created_at_index",
            'updated_at' => "{$table}_updated_at_index",
            'name' => "{$table}_name_index",
            'email' => "{$table}_email_index",
        ];

        if (isset($indexHints[$sortColumn])) {
            $query->getQuery()->from = DB::raw("{$table} USE INDEX ({$indexHints[$sortColumn]})");
        }

        return $query->orderBy($sortColumn, $sortDirection);
    }

    /**
     * Optimize pagination queries to prevent offset performance issues.
     *
     * @param Builder $query
     * @param int $page
     * @param int $perPage
     * @param string $sortColumn
     * @return Builder
     */
    public static function optimizePagination(Builder $query, int $page, int $perPage, string $sortColumn = 'id'): Builder
    {
        // For large offsets, use cursor-based pagination when possible
        if ($page > 100 && in_array($sortColumn, ['id', 'created_at', 'updated_at'])) {
            return self::applyCursorPagination($query, $page, $perPage, $sortColumn);
        }

        return $query;
    }

    /**
     * Apply cursor-based pagination for better performance on large datasets.
     *
     * @param Builder $query
     * @param int $page
     * @param int $perPage
     * @param string $cursorColumn
     * @return Builder
     */
    private static function applyCursorPagination(Builder $query, int $page, int $perPage, string $cursorColumn): Builder
    {
        // This is a simplified cursor pagination implementation
        // In a real scenario, you'd need to track the cursor value from the previous page
        $offset = ($page - 1) * $perPage;
        
        // Use a subquery to find the cursor value
        $cursorValue = $query->clone()
            ->select($cursorColumn)
            ->orderBy($cursorColumn)
            ->offset($offset)
            ->limit(1)
            ->value($cursorColumn);

        if ($cursorValue) {
            $query->where($cursorColumn, '>=', $cursorValue);
        }

        return $query;
    }

    /**
     * Monitor query performance and log slow queries.
     *
     * @param callable $queryCallback
     * @param string $operation
     * @return mixed
     */
    public static function monitorPerformance(callable $queryCallback, string $operation = 'table_query')
    {
        $startTime = microtime(true);
        
        try {
            $result = $queryCallback();
            
            $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
            
            // Log slow queries (over 2 seconds as per requirement)
            if ($executionTime > 2000) {
                \Log::warning("Slow table query detected", [
                    'operation' => $operation,
                    'execution_time_ms' => $executionTime,
                    'timestamp' => now(),
                ]);
            }
            
            return $result;
            
        } catch (\Exception $e) {
            $executionTime = (microtime(true) - $startTime) * 1000;
            
            \Log::error("Table query failed", [
                'operation' => $operation,
                'execution_time_ms' => $executionTime,
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Get performance metrics for table operations.
     *
     * @param string $table
     * @return array
     */
    public static function getPerformanceMetrics(string $table): array
    {
        return [
            'row_count' => DB::table($table)->count(),
            'table_size' => self::getTableSize($table),
            'index_usage' => self::getIndexUsage($table),
            'last_optimized' => Cache::get("last_optimized_{$table}"),
        ];
    }

    /**
     * Get table size information.
     *
     * @param string $table
     * @return array
     */
    private static function getTableSize(string $table): array
    {
        $result = DB::select("
            SELECT 
                table_name,
                ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb',
                table_rows
            FROM information_schema.TABLES 
            WHERE table_schema = DATABASE() 
            AND table_name = ?
        ", [$table]);

        return $result ? (array) $result[0] : [];
    }

    /**
     * Get index usage statistics.
     *
     * @param string $table
     * @return array
     */
    private static function getIndexUsage(string $table): array
    {
        try {
            $result = DB::select("
                SELECT 
                    index_name,
                    cardinality,
                    sub_part,
                    packed,
                    nullable,
                    index_type
                FROM information_schema.STATISTICS 
                WHERE table_schema = DATABASE() 
                AND table_name = ?
                ORDER BY seq_in_index
            ", [$table]);

            return array_map(fn($row) => (array) $row, $result);
        } catch (\Exception $e) {
            return [];
        }
    }
}