import React, { useState, useMemo } from 'react';
import { GlobalSearchBar } from '@/components/ui/global-search-bar';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { processItems } from '@/utils/search-utils';
import { memberSearchConfig, logisticsSearchConfig, inventorySearchConfig, ordersSearchConfig } from '@/config/search-configs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound, IdCard, Package, ShoppingCart, Eye, EyeOff } from 'lucide-react';

// Example data types
interface ExampleMember {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    status: 'active' | 'inactive' | 'pending';
    type: 'regular' | 'premium' | 'vip';
    created_at: string;
}

interface ExampleLogistic {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    status: 'active' | 'inactive' | 'pending';
    created_at: string;
}

interface ExampleProduct {
    id: number;
    name: string;
    description: string;
    produce_type: 'vegetables' | 'fruits' | 'herbs' | 'grains';
    price_kilo: number;
    created_at: string;
}

interface ExampleOrder {
    id: number;
    customer: {
        name: string;
        email: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'delayed' | 'cancelled';
    delivery_status: 'pending' | 'out_for_delivery' | 'delivered';
    created_at: string;
}

// Example data
const exampleMembers: ExampleMember[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', contact_number: '123-456-7890', status: 'active', type: 'regular', created_at: '2024-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', contact_number: '123-456-7891', status: 'active', type: 'premium', created_at: '2024-01-02' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', contact_number: '123-456-7892', status: 'inactive', type: 'vip', created_at: '2024-01-03' },
];

const exampleLogistics: ExampleLogistic[] = [
    { id: 1, name: 'ABC Logistics', email: 'contact@abclogistics.com', contact_number: '555-0001', status: 'active', created_at: '2024-01-01' },
    { id: 2, name: 'XYZ Delivery', email: 'info@xyzdelivery.com', contact_number: '555-0002', status: 'pending', created_at: '2024-01-02' },
];

const exampleProducts: ExampleProduct[] = [
    { id: 1, name: 'Fresh Tomatoes', description: 'Organic red tomatoes', produce_type: 'vegetables', price_kilo: 150, created_at: '2024-01-01' },
    { id: 2, name: 'Sweet Mangoes', description: 'Ripe sweet mangoes', produce_type: 'fruits', price_kilo: 200, created_at: '2024-01-02' },
    { id: 3, name: 'Basil Leaves', description: 'Fresh basil herbs', produce_type: 'herbs', price_kilo: 100, created_at: '2024-01-03' },
];

const exampleOrders: ExampleOrder[] = [
    { id: 1, customer: { name: 'John Doe', email: 'john@example.com' }, status: 'pending', delivery_status: 'pending', created_at: '2024-01-01' },
    { id: 2, customer: { name: 'Jane Smith', email: 'jane@example.com' }, status: 'approved', delivery_status: 'out_for_delivery', created_at: '2024-01-02' },
];

export const GlobalSearchExample = () => {
    const [currentModule, setCurrentModule] = useState<'members' | 'logistics' | 'inventory' | 'orders'>('members');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeactivated, setShowDeactivated] = useState(false);

    // Get configuration based on current module
    const getConfig = () => {
        switch (currentModule) {
            case 'members': return memberSearchConfig;
            case 'logistics': return logisticsSearchConfig;
            case 'inventory': return inventorySearchConfig;
            case 'orders': return ordersSearchConfig;
            default: return memberSearchConfig;
        }
    };

    const config = getConfig();

    // Get header configuration based on current module
    const getHeaderConfig = () => {
        switch (currentModule) {
            case 'members':
                return {
                    title: 'Member Directory',
                    description: showDeactivated ? 'Viewing deactivated members' : 'Manage and view all registered members',
                    icon: <UsersRound className="h-6 w-6" />,
                    showToggleButton: true,
                    additionalButtons: (
                        <Button
                            variant={showDeactivated ? "default" : "outline"}
                            onClick={() => setShowDeactivated(!showDeactivated)}
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {showDeactivated ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide Deactivated
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Deactivated
                                </>
                            )}
                        </Button>
                    )
                };
            case 'logistics':
                return {
                    title: 'Logistics Directory',
                    description: showDeactivated ? 'Viewing deactivated logistics' : 'Manage and view all registered logistics partners',
                    icon: <IdCard className="h-6 w-6" />,
                    showToggleButton: true,
                    additionalButtons: (
                        <Button
                            variant={showDeactivated ? "default" : "outline"}
                            onClick={() => setShowDeactivated(!showDeactivated)}
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {showDeactivated ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide Deactivated
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Deactivated
                                </>
                            )}
                        </Button>
                    )
                };
            case 'inventory':
                return {
                    title: 'Inventory Management',
                    description: 'Manage products and stock levels',
                    icon: <Package className="h-6 w-6" />,
                    showToggleButton: true,
                    additionalButtons: (
                        <Button
                            variant={showDeactivated ? "default" : "outline"}
                            onClick={() => setShowDeactivated(!showDeactivated)}
                            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {showDeactivated ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide Archived
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Archived
                                </>
                            )}
                        </Button>
                    )
                };
            case 'orders':
                return {
                    title: 'Order Management',
                    description: 'Manage customer orders and deliveries',
                    icon: <ShoppingCart className="h-6 w-6" />,
                    showToggleButton: true
                };
            default:
                return null;
        }
    };

    // Use the global search hook
    const {
        searchTerm,
        setSearchTerm,
        showSearch,
        setShowSearch,
        filters,
        setFilters,
        clearSearch,
        hasActiveFilters,
        isSearchActive
    } = useGlobalSearch({
        config,
        onSearch: (term, currentFilters) => {
            console.log('Search triggered:', { term, filters: currentFilters });
            setCurrentPage(1); // Reset to first page on new search
        },
        onFiltersChange: (currentFilters) => {
            console.log('Filters changed:', currentFilters);
            setCurrentPage(1); // Reset to first page on filter change
        }
    });

    // Get current data based on module
    const getCurrentData = () => {
        switch (currentModule) {
            case 'members': return exampleMembers;
            case 'logistics': return exampleLogistics;
            case 'inventory': return exampleProducts;
            case 'orders': return exampleOrders;
            default: return exampleMembers;
        }
    };

    // Process data with search and filters
    const processedData = useMemo(() => {
        const data = getCurrentData();
        return processItems(
            data,
            {
                searchTerm,
                filters,
                searchFields: config.searchFields
            },
            'name', // Default sort field
            'asc',
            currentPage,
            itemsPerPage
        );
    }, [currentModule, searchTerm, filters, currentPage, itemsPerPage, config.searchFields]);

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Global Search Bar Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Module Selection */}
                    <div className="flex gap-2 flex-wrap">
                        {(['members', 'logistics', 'inventory', 'orders'] as const).map((module) => (
                            <Button
                                key={module}
                                variant={currentModule === module ? "default" : "outline"}
                                onClick={() => setCurrentModule(module)}
                                className="capitalize"
                            >
                                {module}
                            </Button>
                        ))}
                    </div>

                    {/* Toggleable Global Search Bar */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Toggleable Version (with header)</h3>
                        <GlobalSearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            config={config}
                            onFiltersChange={setFilters}
                            onClearSearch={clearSearch}
                            resultsCount={processedData.paginatedItems.length}
                            totalCount={processedData.totalItems}
                            headerConfig={getHeaderConfig()}
                        />
                    </div>

                    {/* Non-toggleable Global Search Bar */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Non-toggleable Version (without header)</h3>
                        <GlobalSearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showSearch={true} // Always show search
                            setShowSearch={setShowSearch}
                            config={config}
                            onFiltersChange={setFilters}
                            onClearSearch={clearSearch}
                            resultsCount={processedData.paginatedItems.length}
                            totalCount={processedData.totalItems}
                        />
                    </div>

                    {/* Search Status */}
                    <div className="text-sm text-muted-foreground">
                        <p>Search Term: "{searchTerm}"</p>
                        <p>Active Filters: {hasActiveFilters ? 'Yes' : 'No'}</p>
                        <p>Search Active: {isSearchActive ? 'Yes' : 'No'}</p>
                        <p>Current Module: {currentModule}</p>
                    </div>

                    {/* Results */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                            Results ({processedData.paginatedItems.length} of {processedData.totalItems})
                        </h3>
                        
                        {processedData.paginatedItems.length === 0 ? (
                            <p className="text-muted-foreground">No results found</p>
                        ) : (
                            <div className="grid gap-2">
                                {processedData.paginatedItems.map((item: any) => (
                                    <Card key={item.id} className="p-3">
                                        <div className="space-y-1">
                                            {Object.entries(item).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="font-medium capitalize">{key}:</span>{' '}
                                                    <span className="text-muted-foreground">
                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {processedData.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {processedData.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.min(processedData.totalPages, currentPage + 1))}
                                    disabled={currentPage === processedData.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
