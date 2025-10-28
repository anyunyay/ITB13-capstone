<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Services\SortablePaginationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

class SortablePaginationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test users
        User::factory()->count(25)->create([
            'type' => 'staff'
        ]);
    }

    /** @test */
    public function pagination_response_includes_sort_metadata()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc&page=1');

        $response->assertStatus(200);
        
        // Check that pagination data includes sort metadata
        $paginationData = $response->viewData('staff');
        
        $this->assertArrayHasKey('sort_by', $paginationData->toArray());
        $this->assertArrayHasKey('sort_order', $paginationData->toArray());
        $this->assertEquals('name', $paginationData->appends['sort_by']);
        $this->assertEquals('asc', $paginationData->appends['sort_order']);
    }

    /** @test */
    public function sort_state_persists_across_page_navigation()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        // First request with sort parameters
        $response1 = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=created_at&sort_order=desc&page=1');

        $response1->assertStatus(200);
        
        // Navigate to page 2 - sort should persist
        $response2 = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=created_at&sort_order=desc&page=2');

        $response2->assertStatus(200);
        
        $paginationData = $response2->viewData('staff');
        $this->assertEquals('created_at', $paginationData->appends['sort_by']);
        $this->assertEquals('desc', $paginationData->appends['sort_order']);
    }

    /** @test */
    public function pagination_resets_to_page_1_when_sort_changes()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        // Start on page 2 with one sort
        $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=asc&page=2');
        
        // Change sort - should reset to page 1
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=email&sort_order=desc&page=2');

        $response->assertStatus(200);
        
        // The controller should have reset page to 1 due to sort change
        $paginationData = $response->viewData('staff');
        $this->assertEquals(1, $paginationData->currentPage());
    }

    /** @test */
    public function sort_parameters_with_page_reset_service_works_correctly()
    {
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc',
            'page' => 3
        ]);

        // Mock route name for session key
        $request->setRouteResolver(function () {
            return (object) ['getName' => function () { return 'test.route'; }];
        });

        $params = SortablePaginationService::getSortParametersWithPageReset($request);

        $this->assertEquals('name', $params['sort_by']);
        $this->assertEquals('asc', $params['sort_order']);
        $this->assertEquals(3, $params['page']); // Should not reset on first call
        $this->assertTrue($params['sort_changed']); // First time is considered changed
        $this->assertTrue($params['sort_persisted']);
        $this->assertTrue($params['page_reset_applied']);
    }

    /** @test */
    public function enhanced_pagination_data_includes_all_required_metadata()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=name&sort_order=desc&page=1');

        $response->assertStatus(200);
        
        $paginationData = $response->viewData('staff');
        
        // Check that sortMetadata is present
        $this->assertObjectHasAttribute('sortMetadata', $paginationData);
        
        $sortMetadata = $paginationData->sortMetadata;
        $this->assertArrayHasKey('sort_by', $sortMetadata);
        $this->assertArrayHasKey('sort_order', $sortMetadata);
        $this->assertArrayHasKey('has_sort', $sortMetadata);
        $this->assertArrayHasKey('sort_persisted', $sortMetadata);
        
        $this->assertEquals('name', $sortMetadata['sort_by']);
        $this->assertEquals('desc', $sortMetadata['sort_order']);
        $this->assertTrue($sortMetadata['has_sort']);
        $this->assertTrue($sortMetadata['sort_persisted']);
    }

    /** @test */
    public function pagination_links_preserve_sort_parameters()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/admin/staff?sort_by=email&sort_order=asc&page=1');

        $response->assertStatus(200);
        
        $sortableLinks = $response->viewData('sortableLinks');
        
        // Check that pagination links include sort parameters
        if (isset($sortableLinks['next'])) {
            $this->assertStringContains('sort_by=email', $sortableLinks['next']);
            $this->assertStringContains('sort_order=asc', $sortableLinks['next']);
        }
        
        // Check page links
        if (isset($sortableLinks['pages'])) {
            foreach ($sortableLinks['pages'] as $pageLink) {
                $this->assertStringContains('sort_by=email', $pageLink['url']);
                $this->assertStringContains('sort_order=asc', $pageLink['url']);
            }
        }
    }
}