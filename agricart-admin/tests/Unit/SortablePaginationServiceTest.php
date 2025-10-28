<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\SortablePaginationService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SortablePaginationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_sort_parameters_with_page_reset_handles_sort_changes()
    {
        // Create a request with sort parameters
        $request = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc',
            'page' => 3
        ]);

        $params = SortablePaginationService::getSortParametersWithPageReset($request);

        $this->assertEquals('name', $params['sort_by']);
        $this->assertEquals('asc', $params['sort_order']);
        $this->assertTrue($params['sort_changed']); // First time is considered changed
        $this->assertTrue($params['sort_persisted']);
        $this->assertTrue($params['page_reset_applied']);
    }

    public function test_get_sort_parameters_resets_page_when_sort_changes()
    {
        // First request to establish baseline
        $request1 = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc',
            'page' => 1
        ]);

        SortablePaginationService::getSortParametersWithPageReset($request1);

        // Second request with different sort and higher page
        $request2 = Request::create('/test', 'GET', [
            'sort_by' => 'email',
            'sort_order' => 'desc',
            'page' => 5
        ]);

        $params = SortablePaginationService::getSortParametersWithPageReset($request2);

        $this->assertEquals('email', $params['sort_by']);
        $this->assertEquals('desc', $params['sort_order']);
        $this->assertEquals(1, $params['page']); // Should reset to 1
        $this->assertTrue($params['sort_changed']);
        $this->assertTrue($params['page_reset_applied']);
    }

    public function test_get_sort_parameters_preserves_page_when_sort_unchanged()
    {
        // First request to establish baseline
        $request1 = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc',
            'page' => 1
        ]);

        SortablePaginationService::getSortParametersWithPageReset($request1);

        // Second request with same sort but different page
        $request2 = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'asc',
            'page' => 3
        ]);

        $params = SortablePaginationService::getSortParametersWithPageReset($request2);

        $this->assertEquals('name', $params['sort_by']);
        $this->assertEquals('asc', $params['sort_order']);
        $this->assertEquals(3, $params['page']); // Should preserve page
        $this->assertFalse($params['sort_changed']);
        $this->assertFalse($params['page_reset_applied']);
    }

    public function test_transform_paginated_response_includes_sort_metadata()
    {
        // Create a mock paginator
        $items = collect(['item1', 'item2', 'item3']);
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            10,
            3,
            1,
            ['path' => '/test']
        );

        $request = Request::create('/test', 'GET', [
            'sort_by' => 'name',
            'sort_order' => 'desc'
        ]);

        $response = SortablePaginationService::transformPaginatedResponse($paginator, $request);

        $this->assertArrayHasKey('sort_by', $response);
        $this->assertArrayHasKey('sort_order', $response);
        $this->assertArrayHasKey('sort_metadata', $response);
        
        $this->assertEquals('name', $response['sort_by']);
        $this->assertEquals('desc', $response['sort_order']);
        $this->assertTrue($response['has_sort']);
        
        // Check enhanced sort metadata
        $sortMetadata = $response['sort_metadata'];
        $this->assertEquals('name', $sortMetadata['current_sort_column']);
        $this->assertEquals('desc', $sortMetadata['current_sort_direction']);
        $this->assertTrue($sortMetadata['is_sorted']);
        $this->assertTrue($sortMetadata['sort_state_persisted']);
    }

    public function test_create_sortable_links_preserves_sort_parameters()
    {
        // Create a mock paginator with multiple pages
        $items = collect(['item1', 'item2', 'item3']);
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            20,
            3,
            1,
            ['path' => '/test']
        );

        $request = Request::create('/test', 'GET', [
            'sort_by' => 'email',
            'sort_order' => 'asc'
        ]);

        $links = SortablePaginationService::createSortableLinks($paginator, $request);

        // Check that links include sort parameters
        $this->assertArrayHasKey('next', $links);
        $this->assertStringContainsString('sort_by=email', $links['next']);
        $this->assertStringContainsString('sort_order=asc', $links['next']);

        // Check page links
        $this->assertArrayHasKey('pages', $links);
        foreach ($links['pages'] as $pageLink) {
            $this->assertStringContainsString('sort_by=email', $pageLink['url']);
            $this->assertStringContainsString('sort_order=asc', $pageLink['url']);
        }

        // Check metadata
        $this->assertArrayHasKey('metadata', $links);
        $metadata = $links['metadata'];
        $this->assertEquals('email', $metadata['sort_by']);
        $this->assertEquals('asc', $metadata['sort_order']);
        $this->assertTrue($metadata['has_sort']);
    }

    public function test_handles_default_sort_parameters()
    {
        $request = Request::create('/test', 'GET', []);

        $defaultSort = [
            'column' => 'created_at',
            'direction' => 'desc'
        ];

        $params = SortablePaginationService::getSortParametersWithPageReset($request, $defaultSort);

        $this->assertEquals('created_at', $params['sort_by']);
        $this->assertEquals('desc', $params['sort_order']);
        $this->assertTrue($params['sort_persisted']);
    }
}