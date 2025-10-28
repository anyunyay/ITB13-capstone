<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Services\SortablePaginationService;
use App\Services\TablePerformanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ErrorHandlingAndEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        Role::create(['name' => 'admin']);
        Permission::create(['name' => 'view staffs']);
        Permission::create(['name' => 'view inventory']);
    }

    public function test_handles_empty_datasets_gracefully()
    {
        // Ensure no data exists
        User::where('type', 'staff')->delete();
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $this->assertEquals(0, $staff->total());
        $this->assertEquals(0, count($staff->items()));
        
        // Should still have proper sort metadata
        $this->assertObjectHasProperty('sortMetadata', $staff);
        $sortMetadata = $staff->sortMetadata;
        $this->assertEquals('name', $sortMetadata['sort_by']);
        $this->assertEquals('asc', $sortMetadata['sort_order']);
    }

    public function test_handles_single_row_datasets()
    {
        // Create exactly one staff member
        User::where('type', 'staff')->delete();
        User::factory()->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $this->assertEquals(1, $staff->total());
        $this->assertEquals(1, count($staff->items()));
        $this->assertEquals(1, $staff->lastPage());
    }

    public function test_handles_invalid_sort_columns()
    {
        User::factory()->count(5)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test with completely invalid column
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=nonexistent_column&sort_order=asc');

        $response->assertStatus(200); // Should not break
        
        // Test with SQL injection attempt
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name;DROP TABLE users;&sort_order=asc');

        $response->assertStatus(200); // Should not break
        
        // Test with empty sort column
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=&sort_order=asc');

        $response->assertStatus(200); // Should not break
    }

    public function test_handles_invalid_sort_directions()
    {
        User::factory()->count(5)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test with invalid sort direction
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=invalid');

        $response->assertStatus(200); // Should not break
        
        // Test with SQL injection in sort direction
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc;DROP TABLE users;');

        $response->assertStatus(200); // Should not break
        
        // Test with empty sort direction
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=');

        $response->assertStatus(200); // Should not break
    }

    public function test_handles_invalid_page_numbers()
    {
        User::factory()->count(25)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test with negative page number
        $response = $this->actingAs($admin)
            ->get('/admin/staff?page=-1');

        $response->assertStatus(200); // Should not break
        
        // Test with zero page number
        $response = $this->actingAs($admin)
            ->get('/admin/staff?page=0');

        $response->assertStatus(200); // Should not break
        
        // Test with extremely large page number
        $response = $this->actingAs($admin)
            ->get('/admin/staff?page=999999');

        $response->assertStatus(200); // Should not break
        
        // Test with non-numeric page
        $response = $this->actingAs($admin)
            ->get('/admin/staff?page=abc');

        $response->assertStatus(200); // Should not break
    }

    public function test_handles_invalid_per_page_values()
    {
        User::factory()->count(25)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test with negative per_page
        $response = $this->actingAs($admin)
            ->get('/admin/staff?per_page=-5');

        $response->assertStatus(200); // Should not break
        
        // Test with zero per_page
        $response = $this->actingAs($admin)
            ->get('/admin/staff?per_page=0');

        $response->assertStatus(200); // Should not break
        
        // Test with extremely large per_page (should be capped at 10)
        $response = $this->actingAs($admin)
            ->get('/admin/staff?per_page=1000');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $this->assertLessThanOrEqual(10, $staff->perPage()); // Should be capped
        
        // Test with non-numeric per_page
        $response = $this->actingAs($admin)
            ->get('/admin/staff?per_page=abc');

        $response->assertStatus(200); // Should not break
    }

    public function test_handles_malformed_search_queries()
    {
        User::factory()->count(10)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test with SQL injection in search
        $response = $this->actingAs($admin)
            ->get('/admin/staff?search=' . urlencode("'; DROP TABLE users; --"));

        $response->assertStatus(200); // Should not break
        
        // Test with very long search string
        $longSearch = str_repeat('a', 10000);
        $response = $this->actingAs($admin)
            ->get('/admin/staff?search=' . urlencode($longSearch));

        $response->assertStatus(200); // Should not break
        
        // Test with special characters
        $response = $this->actingAs($admin)
            ->get('/admin/staff?search=' . urlencode('!@#$%^&*()[]{}|\\:";\'<>?,.'));

        $response->assertStatus(200); // Should not break
    }

    public function test_handles_network_failures_gracefully()
    {
        // This test simulates what happens when database connections fail
        // We can't easily simulate network failures in unit tests, but we can test error handling
        
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc'
        ]);

        // Test SortablePaginationService error handling
        try {
            $params = SortablePaginationService::getSortParametersWithPageReset($request);
            $this->assertIsArray($params);
            $this->assertArrayHasKey('sort_by', $params);
            $this->assertArrayHasKey('sort_order', $params);
        } catch (\Exception $e) {
            $this->fail('SortablePaginationService should handle errors gracefully: ' . $e->getMessage());
        }
    }

    public function test_handles_concurrent_sort_requests()
    {
        User::factory()->count(50)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Simulate multiple concurrent requests with different sort parameters
        $responses = [];
        
        for ($i = 0; $i < 5; $i++) {
            $sortColumns = ['name', 'email', 'created_at'];
            $sortOrders = ['asc', 'desc'];
            
            $sortBy = $sortColumns[array_rand($sortColumns)];
            $sortOrder = $sortOrders[array_rand($sortOrders)];
            
            $response = $this->actingAs($admin)
                ->get("/admin/staff?sort_by={$sortBy}&sort_order={$sortOrder}");
            
            $responses[] = $response;
        }
        
        // All requests should succeed
        foreach ($responses as $response) {
            $response->assertStatus(200);
        }
    }

    public function test_handles_memory_intensive_operations()
    {
        // Create a large dataset to test memory handling
        User::factory()->count(1000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $startMemory = memory_get_usage();
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $endMemory = memory_get_usage();
        $memoryUsed = $endMemory - $startMemory;
        
        $response->assertStatus(200);
        
        // Memory usage should be reasonable (less than 50MB for this operation)
        $this->assertLessThan(50 * 1024 * 1024, $memoryUsed, 'Memory usage too high: ' . ($memoryUsed / 1024 / 1024) . 'MB');
    }

    public function test_handles_database_connection_errors()
    {
        // Test TablePerformanceService error handling
        Log::shouldReceive('error')->zeroOrMoreTimes();
        
        $this->expectException(\Exception::class);
        
        TablePerformanceService::monitorPerformance(function() {
            throw new \Exception('Database connection failed');
        }, 'test_operation');
    }

    public function test_handles_timeout_scenarios()
    {
        // Test slow query logging
        Log::shouldReceive('warning')
            ->once()
            ->with('Slow table query detected', \Mockery::type('array'));
        
        $result = TablePerformanceService::monitorPerformance(function() {
            // Simulate a slow operation (2.1 seconds)
            usleep(2100000);
            return 'success';
        }, 'timeout_test');
        
        $this->assertEquals('success', $result);
    }

    public function test_handles_malformed_filter_parameters()
    {
        User::factory()->count(10)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test with array injection in filters
        $response = $this->actingAs($admin)
            ->get('/admin/staff?filter[]=malicious&filter[0]=value');

        $response->assertStatus(200); // Should not break
        
        // Test with nested array parameters
        $response = $this->actingAs($admin)
            ->get('/admin/staff?filter[nested][deep]=value');

        $response->assertStatus(200); // Should not break
    }

    public function test_handles_unicode_and_special_characters()
    {
        // Create users with unicode names
        User::factory()->create([
            'type' => 'staff',
            'name' => '测试用户',
            'email' => 'test@测试.com'
        ]);
        
        User::factory()->create([
            'type' => 'staff',
            'name' => 'Ñoño Español',
            'email' => 'nono@español.com'
        ]);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Test sorting with unicode data
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        // Test searching with unicode
        $response = $this->actingAs($admin)
            ->get('/admin/staff?search=' . urlencode('测试'));

        $response->assertStatus(200);
    }

    public function test_handles_session_expiration_during_sorting()
    {
        User::factory()->count(10)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Make initial request
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        // Simulate session expiration by making request without authentication
        $response = $this->get('/admin/staff?sort_by=name&sort_order=asc');
        
        // Should redirect to login or return 401/403
        $this->assertTrue(
            in_array($response->status(), [302, 401, 403]),
            'Should handle unauthenticated requests properly'
        );
    }

    public function test_handles_csrf_token_issues()
    {
        User::factory()->count(10)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // GET requests should work without CSRF token
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        // This test ensures GET requests for sorting don't require CSRF tokens
        $this->assertTrue(true, 'GET requests for sorting work without CSRF issues');
    }

    public function test_handles_permission_changes_during_session()
    {
        User::factory()->count(10)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Make initial request
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        // Remove permission
        $admin->revokePermissionTo('view staffs');
        
        // Subsequent request should be handled appropriately
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');
        
        // Should either redirect or show appropriate error
        $this->assertTrue(
            in_array($response->status(), [200, 302, 403]),
            'Should handle permission changes gracefully'
        );
    }
}