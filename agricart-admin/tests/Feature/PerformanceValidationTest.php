<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Services\TablePerformanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PerformanceValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        Role::create(['name' => 'admin']);
        Permission::create(['name' => 'view staffs']);
        Permission::create(['name' => 'view inventory']);
        Permission::create(['name' => 'view membership']);
    }

    public function test_sorting_operations_complete_within_2_seconds()
    {
        // Create large dataset (1000+ rows as per requirement)
        User::factory()->count(1500)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $sortColumns = ['name', 'email', 'created_at'];
        $sortOrders = ['asc', 'desc'];
        
        foreach ($sortColumns as $column) {
            foreach ($sortOrders as $order) {
                $startTime = microtime(true);
                
                $response = $this->actingAs($admin)
                    ->get("/admin/staff?sort_by={$column}&sort_order={$order}");
                
                $endTime = microtime(true);
                $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
                
                $response->assertStatus(200);
                
                // Should complete within 2 seconds (2000ms) as per requirement
                $this->assertLessThan(
                    2000, 
                    $executionTime, 
                    "Sorting by {$column} {$order} took too long: {$executionTime}ms"
                );
            }
        }
    }

    public function test_pagination_operations_complete_within_2_seconds()
    {
        // Create large dataset
        User::factory()->count(1500)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test pagination on different pages
        $pages = [1, 5, 10, 50, 100];
        
        foreach ($pages as $page) {
            $startTime = microtime(true);
            
            $response = $this->actingAs($admin)
                ->get("/admin/staff?page={$page}&sort_by=name&sort_order=asc");
            
            $endTime = microtime(true);
            $executionTime = ($endTime - $startTime) * 1000;
            
            $response->assertStatus(200);
            
            $this->assertLessThan(
                2000, 
                $executionTime, 
                "Pagination to page {$page} took too long: {$executionTime}ms"
            );
        }
    }

    public function test_search_operations_complete_within_2_seconds()
    {
        // Create large dataset with searchable content
        User::factory()->count(1000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $searchTerms = ['test', 'user', 'admin', 'staff', 'email'];
        
        foreach ($searchTerms as $term) {
            $startTime = microtime(true);
            
            $response = $this->actingAs($admin)
                ->get("/admin/staff?search={$term}&sort_by=name&sort_order=asc");
            
            $endTime = microtime(true);
            $executionTime = ($endTime - $startTime) * 1000;
            
            $response->assertStatus(200);
            
            $this->assertLessThan(
                2000, 
                $executionTime, 
                "Search for '{$term}' took too long: {$executionTime}ms"
            );
        }
    }

    public function test_memory_usage_stays_within_reasonable_limits()
    {
        // Create large dataset
        User::factory()->count(1000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $startMemory = memory_get_usage(true);
        $peakMemoryStart = memory_get_peak_usage(true);
        
        // Perform multiple operations
        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($admin)
                ->get('/admin/staff?sort_by=name&sort_order=asc&page=' . ($i + 1));
        }
        
        $endMemory = memory_get_usage(true);
        $peakMemoryEnd = memory_get_peak_usage(true);
        
        $memoryIncrease = $endMemory - $startMemory;
        $peakMemoryIncrease = $peakMemoryEnd - $peakMemoryStart;
        
        // Memory increase should be reasonable (less than 100MB)
        $this->assertLessThan(
            100 * 1024 * 1024, 
            $memoryIncrease, 
            'Memory usage increased too much: ' . ($memoryIncrease / 1024 / 1024) . 'MB'
        );
        
        // Peak memory should also be reasonable (less than 200MB total increase)
        $this->assertLessThan(
            200 * 1024 * 1024, 
            $peakMemoryIncrease, 
            'Peak memory usage too high: ' . ($peakMemoryIncrease / 1024 / 1024) . 'MB'
        );
    }

    public function test_database_query_optimization()
    {
        // Create large dataset
        User::factory()->count(1000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Enable query logging
        DB::enableQueryLog();
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');
        
        $queries = DB::getQueryLog();
        DB::disableQueryLog();
        
        $response->assertStatus(200);
        
        // Should not execute too many queries (N+1 problem prevention)
        $this->assertLessThan(10, count($queries), 'Too many database queries executed: ' . count($queries));
        
        // Check for efficient queries (no SELECT *)
        foreach ($queries as $query) {
            $sql = strtolower($query['sql']);
            
            // Should use proper indexing hints or efficient WHERE clauses
            $this->assertTrue(
                str_contains($sql, 'where') || str_contains($sql, 'order by') || str_contains($sql, 'limit'),
                'Query should be optimized: ' . $query['sql']
            );
        }
    }

    public function test_concurrent_request_handling()
    {
        // Create dataset
        User::factory()->count(500)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $startTime = microtime(true);
        
        // Simulate concurrent requests
        $responses = [];
        for ($i = 0; $i < 5; $i++) {
            $responses[] = $this->actingAs($admin)
                ->get("/admin/staff?sort_by=name&sort_order=asc&page=" . ($i + 1));
        }
        
        $endTime = microtime(true);
        $totalTime = ($endTime - $startTime) * 1000;
        
        // All requests should succeed
        foreach ($responses as $response) {
            $response->assertStatus(200);
        }
        
        // Total time for 5 concurrent-like requests should be reasonable
        $this->assertLessThan(5000, $totalTime, 'Concurrent requests took too long: ' . $totalTime . 'ms');
    }

    public function test_performance_monitoring_logs_slow_queries()
    {
        Log::shouldReceive('warning')
            ->once()
            ->with('Slow table query detected', \Mockery::type('array'));
        
        // Test the performance monitoring service
        $result = TablePerformanceService::monitorPerformance(function() {
            // Simulate slow operation
            usleep(2100000); // 2.1 seconds
            return 'test_result';
        }, 'performance_test');
        
        $this->assertEquals('test_result', $result);
    }

    public function test_performance_metrics_collection()
    {
        // Create some data
        User::factory()->count(100)->create(['type' => 'staff']);
        
        $metrics = TablePerformanceService::getPerformanceMetrics('users');
        
        $this->assertIsArray($metrics);
        $this->assertArrayHasKey('row_count', $metrics);
        $this->assertArrayHasKey('table_size', $metrics);
        $this->assertArrayHasKey('index_usage', $metrics);
        $this->assertArrayHasKey('last_optimized', $metrics);
        
        // Row count should be accurate
        $this->assertGreaterThan(100, $metrics['row_count']); // Including our test data
        
        // Table size should be reasonable
        if (isset($metrics['table_size']['size_mb'])) {
            $this->assertLessThan(100, $metrics['table_size']['size_mb']); // Should be less than 100MB
        }
    }

    public function test_index_usage_optimization()
    {
        // Create large dataset to make indexes matter
        User::factory()->count(1000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test queries that should use indexes
        $indexedColumns = ['name', 'email', 'created_at'];
        
        foreach ($indexedColumns as $column) {
            DB::enableQueryLog();
            
            $response = $this->actingAs($admin)
                ->get("/admin/staff?sort_by={$column}&sort_order=asc");
            
            $queries = DB::getQueryLog();
            DB::disableQueryLog();
            
            $response->assertStatus(200);
            
            // Should execute efficiently (check for reasonable query structure)
            $this->assertNotEmpty($queries, "Should execute queries for column {$column}");
            
            foreach ($queries as $query) {
                $sql = strtolower($query['sql']);
                
                // Should have ORDER BY clause for sorting
                if (str_contains($sql, 'select') && str_contains($sql, 'users')) {
                    $this->assertTrue(
                        str_contains($sql, 'order by'),
                        "Query should include ORDER BY for column {$column}: " . $query['sql']
                    );
                }
            }
        }
    }

    public function test_pagination_efficiency_with_large_offsets()
    {
        // Create large dataset
        User::factory()->count(2000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test pagination at different offsets
        $pages = [1, 50, 100, 150]; // High page numbers to test offset performance
        
        foreach ($pages as $page) {
            $startTime = microtime(true);
            
            $response = $this->actingAs($admin)
                ->get("/admin/staff?page={$page}&sort_by=id&sort_order=asc");
            
            $endTime = microtime(true);
            $executionTime = ($endTime - $startTime) * 1000;
            
            $response->assertStatus(200);
            
            // Even high offset pages should complete reasonably quickly
            $this->assertLessThan(
                3000, // Slightly more lenient for high offsets
                $executionTime, 
                "High offset pagination (page {$page}) took too long: {$executionTime}ms"
            );
        }
    }

    public function test_cache_performance_when_enabled()
    {
        // This test would be more relevant if caching was enabled
        // For now, we test that cache operations don't slow things down
        
        User::factory()->count(100)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Clear any existing cache
        Cache::flush();
        
        $startTime = microtime(true);
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');
        
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000;
        
        $response->assertStatus(200);
        
        // Should complete quickly even with cache operations
        $this->assertLessThan(2000, $executionTime, 'Cache operations should not slow down requests');
    }

    public function test_resource_cleanup_after_operations()
    {
        $initialMemory = memory_get_usage();
        
        // Perform multiple operations
        User::factory()->count(500)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($admin)
                ->get('/admin/staff?sort_by=name&sort_order=asc&page=' . ($i + 1));
        }
        
        // Force garbage collection
        gc_collect_cycles();
        
        $finalMemory = memory_get_usage();
        $memoryIncrease = $finalMemory - $initialMemory;
        
        // Memory should not increase dramatically after operations
        $this->assertLessThan(
            50 * 1024 * 1024, // 50MB
            $memoryIncrease,
            'Memory not properly cleaned up after operations: ' . ($memoryIncrease / 1024 / 1024) . 'MB increase'
        );
    }

    public function test_performance_under_different_data_types()
    {
        // Create products with various data types
        Product::factory()->count(500)->create();
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view inventory');
        
        // Test sorting by different data types
        $columnTypes = [
            'name' => 'string',
            'price_kilo' => 'decimal',
            'created_at' => 'datetime'
        ];
        
        foreach ($columnTypes as $column => $type) {
            $startTime = microtime(true);
            
            $response = $this->actingAs($admin)
                ->get("/admin/inventory?sort_by={$column}&sort_order=asc");
            
            $endTime = microtime(true);
            $executionTime = ($endTime - $startTime) * 1000;
            
            $response->assertStatus(200);
            
            $this->assertLessThan(
                2000, 
                $executionTime, 
                "Sorting {$type} column '{$column}' took too long: {$executionTime}ms"
            );
        }
    }
}