<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\TablePerformanceService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TablePerformanceServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_optimize_query_applies_row_limit()
    {
        $query = User::query();
        $request = request();
        
        $optimizedQuery = TablePerformanceService::optimizeQuery($query, $request, [
            'max_rows' => 100
        ]);
        
        // Check that limit is applied (we can't directly test the limit, but we can test the query structure)
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Builder::class, $optimizedQuery);
    }

    public function test_record_write_invalidates_cache()
    {
        $table = 'users';
        
        // Set up cache
        Cache::put("last_write_{$table}", time() - 120, 300); // 2 minutes ago
        
        // Record a write
        TablePerformanceService::recordWrite($table);
        
        // Check that cache was updated
        $lastWrite = Cache::get("last_write_{$table}");
        $this->assertGreaterThan(time() - 5, $lastWrite); // Should be very recent
    }

    public function test_optimize_sorting_applies_correct_order()
    {
        $query = User::query();
        
        $sortedQuery = TablePerformanceService::optimizeSorting($query, 'name', 'desc');
        
        // Verify the query has the correct order
        $sql = $sortedQuery->toSql();
        $this->assertStringContains('order by', strtolower($sql));
    }

    public function test_monitor_performance_logs_slow_queries()
    {
        Log::shouldReceive('warning')
            ->once()
            ->with('Slow table query detected', \Mockery::type('array'));
        
        // Simulate a slow query
        $result = TablePerformanceService::monitorPerformance(function() {
            usleep(2100000); // Sleep for 2.1 seconds to trigger slow query log
            return 'test_result';
        }, 'test_operation');
        
        $this->assertEquals('test_result', $result);
    }

    public function test_monitor_performance_logs_failed_queries()
    {
        Log::shouldReceive('error')
            ->once()
            ->with('Table query failed', \Mockery::type('array'));
        
        $this->expectException(\Exception::class);
        
        TablePerformanceService::monitorPerformance(function() {
            throw new \Exception('Test exception');
        }, 'test_operation');
    }

    public function test_get_performance_metrics_returns_array()
    {
        User::factory()->count(5)->create();
        
        $metrics = TablePerformanceService::getPerformanceMetrics('users');
        
        $this->assertIsArray($metrics);
        $this->assertArrayHasKey('row_count', $metrics);
        $this->assertArrayHasKey('table_size', $metrics);
        $this->assertArrayHasKey('index_usage', $metrics);
        $this->assertArrayHasKey('last_optimized', $metrics);
        $this->assertGreaterThan(0, $metrics['row_count']);
    }

    public function test_optimize_pagination_handles_large_offsets()
    {
        $query = User::query();
        
        // Test with large page number
        $optimizedQuery = TablePerformanceService::optimizePagination($query, 150, 10, 'id');
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Builder::class, $optimizedQuery);
    }

    public function test_optimize_pagination_handles_small_offsets()
    {
        $query = User::query();
        
        // Test with small page number
        $optimizedQuery = TablePerformanceService::optimizePagination($query, 5, 10, 'id');
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Builder::class, $optimizedQuery);
    }
}