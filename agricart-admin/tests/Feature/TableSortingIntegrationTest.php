<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Traits\HandlesSorting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TableSortingIntegrationTest extends TestCase
{
    use RefreshDatabase;
    use HandlesSorting;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        Role::create(['name' => 'admin']);
        Permission::create(['name' => 'view staffs']);
        Permission::create(['name' => 'view inventory']);
        
        // Create test data
        User::factory()->count(25)->create(['type' => 'staff']);
        Product::factory()->count(20)->create();
    }

    public function test_staff_table_sorting_by_name_ascending()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        // Verify that the response contains sorted data
        $staff = $response->viewData('staff');
        $this->assertNotNull($staff);
        
        // Check sort metadata
        $this->assertObjectHasProperty('sortMetadata', $staff);
        $sortMetadata = $staff->sortMetadata;
        $this->assertEquals('name', $sortMetadata['sort_by']);
        $this->assertEquals('asc', $sortMetadata['sort_order']);
    }

    public function test_staff_table_sorting_by_created_at_descending()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=created_at&sort_order=desc');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $sortMetadata = $staff->sortMetadata;
        $this->assertEquals('created_at', $sortMetadata['sort_by']);
        $this->assertEquals('desc', $sortMetadata['sort_order']);
    }

    public function test_pagination_resets_when_sort_changes()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // First request on page 2 with one sort
        $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc&page=2');
        
        // Change sort - should reset to page 1
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=email&sort_order=desc&page=2');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $this->assertEquals(1, $staff->currentPage());
    }

    public function test_sort_state_persists_across_page_navigation()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Set sort on page 1
        $response1 = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc&page=1');

        $response1->assertStatus(200);
        
        // Navigate to page 2 with same sort
        $response2 = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc&page=2');

        $response2->assertStatus(200);
        
        $staff = $response2->viewData('staff');
        $sortMetadata = $staff->sortMetadata;
        $this->assertEquals('name', $sortMetadata['sort_by']);
        $this->assertEquals('asc', $sortMetadata['sort_order']);
        $this->assertEquals(2, $staff->currentPage());
    }

    public function test_inventory_table_sorting_by_price()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view inventory');
        
        $response = $this->actingAs($admin)
            ->get('/admin/inventory?sort_by=price_kilo&sort_order=desc');

        $response->assertStatus(200);
        
        // Check that filters include sort parameters
        $filters = $response->viewData('filters');
        $this->assertArrayHasKey('sort_by', $filters);
        $this->assertArrayHasKey('sort_order', $filters);
        $this->assertEquals('price_kilo', $filters['sort_by']);
        $this->assertEquals('desc', $filters['sort_order']);
    }

    public function test_handles_sorting_trait_with_invalid_sort_column()
    {
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'invalid_column',
            'sort_order' => 'asc'
        ]);

        $query = User::where('type', 'staff');
        
        // Should not throw an error with invalid column
        $sortedQuery = $this->applySorting($query, $request);
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Builder::class, $sortedQuery);
    }

    public function test_handles_sorting_trait_with_invalid_sort_direction()
    {
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'invalid_direction'
        ]);

        $query = User::where('type', 'staff');
        $sortedQuery = $this->applySorting($query, $request);
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Builder::class, $sortedQuery);
    }

    public function test_pagination_enforces_10_rows_per_page_limit()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        // Try to request more than 10 items per page
        $response = $this->actingAs($admin)
            ->get('/admin/staff?per_page=50');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $this->assertLessThanOrEqual(10, $staff->perPage());
    }

    public function test_sort_metadata_includes_all_required_fields()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $response->assertStatus(200);
        
        $staff = $response->viewData('staff');
        $sortMetadata = $staff->sortMetadata;
        
        // Check all required metadata fields
        $this->assertArrayHasKey('sort_by', $sortMetadata);
        $this->assertArrayHasKey('sort_order', $sortMetadata);
        $this->assertArrayHasKey('has_sort', $sortMetadata);
        $this->assertArrayHasKey('sort_changed', $sortMetadata);
        $this->assertArrayHasKey('page_reset_on_sort', $sortMetadata);
        $this->assertArrayHasKey('sort_persisted', $sortMetadata);
        
        $this->assertTrue($sortMetadata['has_sort']);
        $this->assertTrue($sortMetadata['sort_persisted']);
    }

    public function test_performance_with_large_dataset()
    {
        // Create a larger dataset
        User::factory()->count(1000)->create(['type' => 'staff']);
        
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');
        $admin->givePermissionTo('view staffs');
        
        $startTime = microtime(true);
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc');

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        $response->assertStatus(200);
        
        // Should complete within 2 seconds (2000ms) as per requirement
        $this->assertLessThan(2000, $executionTime, 'Query took too long: ' . $executionTime . 'ms');
    }

    public function test_empty_dataset_handling()
    {
        // Clear all staff
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
    }

    public function test_single_row_dataset_handling()
    {
        // Clear all staff and create just one
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
    }
}