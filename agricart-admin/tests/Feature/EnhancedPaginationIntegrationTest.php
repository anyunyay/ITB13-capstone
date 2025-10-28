<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Traits\HandlesSorting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

class EnhancedPaginationIntegrationTest extends TestCase
{
    use RefreshDatabase;
    use HandlesSorting;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test users
        User::factory()->count(25)->create([
            'type' => 'staff'
        ]);
    }

    public function test_handles_sorting_trait_provides_enhanced_pagination_data()
    {
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc',
            'per_page' => 5
        ]);

        $query = User::where('type', 'staff');
        $query = $this->applySorting($query, $request);
        
        $paginatedResults = $this->getPaginatedResults($query, $request, 5);
        
        // Verify pagination structure
        $this->assertNotNull($paginatedResults);
        $this->assertEquals(5, $paginatedResults->perPage());
        $this->assertTrue($paginatedResults->total() > 0);
        
        // Verify sort metadata is attached
        $this->assertObjectHasProperty('sortMetadata', $paginatedResults);
        $sortMetadata = $paginatedResults->sortMetadata;
        
        $this->assertArrayHasKey('sort_by', $sortMetadata);
        $this->assertArrayHasKey('sort_order', $sortMetadata);
        $this->assertArrayHasKey('has_sort', $sortMetadata);
        $this->assertArrayHasKey('sort_persisted', $sortMetadata);
        
        $this->assertEquals('name', $sortMetadata['sort_by']);
        $this->assertEquals('asc', $sortMetadata['sort_order']);
        $this->assertTrue($sortMetadata['has_sort']);
        $this->assertTrue($sortMetadata['sort_persisted']);
    }

    public function test_enhanced_pagination_data_method_returns_complete_structure()
    {
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'created_at',
            'sort_order' => 'desc',
            'per_page' => 10
        ]);

        $query = User::where('type', 'staff');
        $query = $this->applySorting($query, $request);
        
        $enhancedData = $this->getEnhancedPaginationData($query, $request, 10);
        
        // Verify all required fields are present
        $this->assertArrayHasKey('data', $enhancedData);
        $this->assertArrayHasKey('current_page', $enhancedData);
        $this->assertArrayHasKey('last_page', $enhancedData);
        $this->assertArrayHasKey('per_page', $enhancedData);
        $this->assertArrayHasKey('total', $enhancedData);
        $this->assertArrayHasKey('from', $enhancedData);
        $this->assertArrayHasKey('to', $enhancedData);
        $this->assertArrayHasKey('sort_by', $enhancedData);
        $this->assertArrayHasKey('sort_order', $enhancedData);
        $this->assertArrayHasKey('sort_metadata', $enhancedData);
        $this->assertArrayHasKey('links', $enhancedData);
        $this->assertArrayHasKey('next_page_url', $enhancedData);
        $this->assertArrayHasKey('prev_page_url', $enhancedData);
        
        // Verify sort values
        $this->assertEquals('created_at', $enhancedData['sort_by']);
        $this->assertEquals('desc', $enhancedData['sort_order']);
        
        // Verify sort metadata structure
        $sortMetadata = $enhancedData['sort_metadata'];
        $this->assertArrayHasKey('sort_by', $sortMetadata);
        $this->assertArrayHasKey('sort_order', $sortMetadata);
        $this->assertArrayHasKey('has_sort', $sortMetadata);
        $this->assertArrayHasKey('sort_persisted', $sortMetadata);
    }

    public function test_sort_filters_method_returns_correct_parameters()
    {
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'email',
            'sort_order' => 'asc'
        ]);

        $filters = $this->getSortFilters($request, [
            'column' => 'created_at',
            'direction' => 'desc'
        ]);
        
        $this->assertArrayHasKey('sort_by', $filters);
        $this->assertArrayHasKey('sort_order', $filters);
        $this->assertEquals('email', $filters['sort_by']);
        $this->assertEquals('asc', $filters['sort_order']);
    }

    public function test_sort_filters_uses_defaults_when_no_parameters()
    {
        $request = Request::create('/test', 'GET', []);

        $filters = $this->getSortFilters($request, [
            'column' => 'name',
            'direction' => 'asc'
        ]);
        
        $this->assertArrayHasKey('sort_by', $filters);
        $this->assertArrayHasKey('sort_order', $filters);
        $this->assertEquals('name', $filters['sort_by']);
        $this->assertEquals('asc', $filters['sort_order']);
    }
}