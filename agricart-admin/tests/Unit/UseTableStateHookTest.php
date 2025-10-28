<?php

namespace Tests\Unit;

use Tests\TestCase;

class UseTableStateHookTest extends TestCase
{
    /**
     * Test that the useTableState hook file exists and has correct structure.
     * 
     * Note: This is a basic test since we can't directly test React hooks in PHP.
     * In a real scenario, you'd use Jest or similar for frontend testing.
     */
    public function test_use_table_state_hook_file_exists()
    {
        $hookPath = resource_path('js/hooks/use-table-state.ts');
        
        $this->assertFileExists($hookPath);
        
        $content = file_get_contents($hookPath);
        
        // Check for key exports and functions
        $this->assertStringContains('export function useTableState', $content);
        $this->assertStringContains('export interface TableState', $content);
        $this->assertStringContains('export interface TableStateOptions', $content);
        
        // Check for debouncing implementation
        $this->assertStringContains('searchDebounceRef', $content);
        $this->assertStringContains('filterDebounceRef', $content);
        $this->assertStringContains('setTimeout', $content);
        $this->assertStringContains('clearTimeout', $content);
        
        // Check for key methods
        $this->assertStringContains('handleSort', $content);
        $this->assertStringContains('handlePageChange', $content);
        $this->assertStringContains('handleSearch', $content);
        $this->assertStringContains('handleFilterChange', $content);
        $this->assertStringContains('resetState', $content);
        
        // Check for URL persistence
        $this->assertStringContains('updateUrl', $content);
        $this->assertStringContains('persistInUrl', $content);
        
        // Check for performance optimizations
        $this->assertStringContains('maxPerPage', $content);
        $this->assertStringContains('debounce', $content);
    }

    public function test_unified_table_component_file_exists()
    {
        $componentPath = resource_path('js/components/ui/unified-table.tsx');
        
        $this->assertFileExists($componentPath);
        
        $content = file_get_contents($componentPath);
        
        // Check for key exports and interfaces
        $this->assertStringContains('export function UnifiedTable', $content);
        $this->assertStringContains('export interface PaginationData', $content);
        
        // Check for table state integration
        $this->assertStringContains('useTableState', $content);
        $this->assertStringContains('onDataChange', $content);
        
        // Check for search and filter functionality
        $this->assertStringContains('showSearch', $content);
        $this->assertStringContains('showFilters', $content);
        $this->assertStringContains('searchPlaceholder', $content);
        
        // Check for loading states
        $this->assertStringContains('loading', $content);
        $this->assertStringContains('Loading data', $content);
        
        // Check for pagination integration
        $this->assertStringContains('PaginationControls', $content);
        $this->assertStringContains('maxPerPage', $content);
    }

    public function test_pagination_controls_component_has_sort_support()
    {
        $componentPath = resource_path('js/components/inventory/pagination-controls.tsx');
        
        $this->assertFileExists($componentPath);
        
        $content = file_get_contents($componentPath);
        
        // Check for sort-related props
        $this->assertStringContains('sortBy?:', $content);
        $this->assertStringContains('sortOrder?:', $content);
        $this->assertStringContains('onSortChange?:', $content);
        $this->assertStringContains('maxItemsPerPage?:', $content);
        
        // Check for 10 rows per page enforcement
        $this->assertStringContains('maxItemsPerPage = 10', $content);
        $this->assertStringContains('effectiveItemsPerPage', $content);
        $this->assertStringContains('Math.min(itemsPerPage, maxItemsPerPage)', $content);
        
        // Check for sort state display
        $this->assertStringContains('sorted by', $content);
    }

    public function test_table_components_use_unified_structure()
    {
        $components = [
            'staff/staff-management.tsx',
            'membership/member-management.tsx',
            'inventory/product-management.tsx',
            'inventory/stock-management.tsx',
            'orders/order-management.tsx',
            'logistics/logistic-management.tsx'
        ];

        foreach ($components as $component) {
            $componentPath = resource_path("js/components/{$component}");
            
            $this->assertFileExists($componentPath, "Component {$component} should exist");
            
            $content = file_get_contents($componentPath);
            
            // Check that components use UnifiedTable
            $this->assertStringContains('UnifiedTable', $content, "Component {$component} should use UnifiedTable");
            $this->assertStringContains('ColumnDefinition', $content, "Component {$component} should define columns");
            $this->assertStringContains('PaginationData', $content, "Component {$component} should handle pagination");
            
            // Check for proper column definitions
            $this->assertStringContains('columns:', $content, "Component {$component} should define columns");
            $this->assertStringContains('sortable:', $content, "Component {$component} should specify sortable columns");
            
            // Check for render row function
            $this->assertStringContains('renderRow', $content, "Component {$component} should have renderRow function");
            $this->assertStringContains('TableRow', $content, "Component {$component} should use TableRow");
            $this->assertStringContains('TableCell', $content, "Component {$component} should use TableCell");
            
            // Check for data change handling
            $this->assertStringContains('onDataChange', $content, "Component {$component} should handle data changes");
            
            // Check for table state options
            $this->assertStringContains('tableStateOptions', $content, "Component {$component} should configure table state");
            $this->assertStringContains('maxPerPage: 10', $content, "Component {$component} should enforce 10 rows per page");
        }
    }

    public function test_performance_service_integration()
    {
        $traitPath = app_path('Traits/HandlesSorting.php');
        
        $this->assertFileExists($traitPath);
        
        $content = file_get_contents($traitPath);
        
        // Check for performance service integration
        $this->assertStringContains('TablePerformanceService', $content);
        $this->assertStringContains('optimizeQuery', $content);
        $this->assertStringContains('optimizePagination', $content);
        $this->assertStringContains('optimizeSorting', $content);
        $this->assertStringContains('monitorPerformance', $content);
        
        // Check for performance monitoring
        $this->assertStringContains('paginated_query', $content);
    }

    public function test_database_indexes_migration_exists()
    {
        $migrationFiles = glob(database_path('migrations/*_add_sorting_indexes_to_tables.php'));
        
        $this->assertNotEmpty($migrationFiles, 'Sorting indexes migration should exist');
        
        $migrationPath = $migrationFiles[0];
        $content = file_get_contents($migrationPath);
        
        // Check for key indexes
        $this->assertStringContains('users_type_created_at_index', $content);
        $this->assertStringContains('users_type_name_index', $content);
        $this->assertStringContains('products_name_index', $content);
        $this->assertStringContains('products_price_kilo_index', $content);
        $this->assertStringContains('stocks_created_at_index', $content);
        $this->assertStringContains('stocks_quantity_index', $content);
        
        // Check for proper index dropping in down method
        $this->assertStringContains('dropIndex', $content);
    }
}