# Global Search Bar Component Guide

## Overview

The Global Search Bar is a reusable React component that provides dynamic search functionality with context-aware filter buttons. It adapts based on the current page's context or module, making it perfect for use across different admin pages.

## Features

- **Dynamic Filter Buttons**: Adapts filter options based on the current page context
- **Multiple Filter Types**: Supports select, multiselect, toggle, date, and daterange filters
- **Debounced Search**: Optimized search with configurable debounce timing
- **Responsive Design**: Works seamlessly across different screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Customizable Styling**: CSS modules with smooth animations

## Installation

The component is already set up in your project. No additional installation is required.

## Basic Usage

### Toggleable Version (with header)

```tsx
import { GlobalSearchBar } from '@/components/ui/global-search-bar';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { memberSearchConfig } from '@/config/search-configs';
import { UsersRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MyComponent() {
    const {
        searchTerm,
        setSearchTerm,
        showSearch,
        setShowSearch,
        filters,
        setFilters,
        clearSearch
    } = useGlobalSearch({
        config: memberSearchConfig,
        onSearch: (term, filters) => {
            console.log('Search:', term, filters);
        }
    });

    const [showDeactivated, setShowDeactivated] = useState(false);

    return (
        <GlobalSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            config={memberSearchConfig}
            onFiltersChange={setFilters}
            onClearSearch={clearSearch}
            resultsCount={10}
            totalCount={100}
            headerConfig={{
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
            }}
        />
    );
}
```

### Non-toggleable Version (without header)

```tsx
import { GlobalSearchBar } from '@/components/ui/global-search-bar';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { memberSearchConfig } from '@/config/search-configs';

function MyComponent() {
    const {
        searchTerm,
        setSearchTerm,
        showSearch,
        setShowSearch,
        filters,
        setFilters,
        clearSearch
    } = useGlobalSearch({
        config: memberSearchConfig,
        onSearch: (term, filters) => {
            console.log('Search:', term, filters);
        }
    });

    return (
        <GlobalSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showSearch={true} // Always show search
            setShowSearch={setShowSearch}
            config={memberSearchConfig}
            onFiltersChange={setFilters}
            onClearSearch={clearSearch}
            resultsCount={10}
            totalCount={100}
        />
    );
}
```

## Configuration

### Header Configuration

The `headerConfig` prop allows you to create a toggleable search bar with a header section:

```tsx
const headerConfig = {
    title: 'Member Directory',
    description: 'Manage and view all registered members',
    icon: <UsersRound className="h-6 w-6" />,
    showToggleButton: true, // Optional, defaults to true
    additionalButtons: (
        <Button variant="outline" onClick={handleAction}>
            Custom Action
        </Button>
    )
};
```

**Header Config Properties:**
- `title` (string): The main title displayed in the header
- `description` (string): Subtitle or description text
- `icon` (ReactNode): Icon displayed next to the title
- `showToggleButton` (boolean, optional): Whether to show the search toggle button (defaults to true)
- `additionalButtons` (ReactNode, optional): Additional buttons to display in the header

### Search Configuration

Each page/module can have its own search configuration:

```tsx
const mySearchConfig: SearchConfig = {
    placeholder: "Search items...",
    searchFields: ['name', 'email', 'description'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'showArchived',
            label: 'Show Archived',
            type: 'toggle',
            defaultValue: false
        }
    ]
};
```

### Filter Types

#### Select Filter
```tsx
{
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
        { value: 'vegetables', label: 'Vegetables' },
        { value: 'fruits', label: 'Fruits' }
    ],
    defaultValue: 'all'
}
```

#### Multiselect Filter
```tsx
{
    key: 'tags',
    label: 'Tags',
    type: 'multiselect',
    options: [
        { value: 'organic', label: 'Organic' },
        { value: 'local', label: 'Local' }
    ],
    defaultValue: []
}
```

#### Toggle Filter
```tsx
{
    key: 'showArchived',
    label: 'Show Archived',
    type: 'toggle',
    defaultValue: false
}
```

#### Date Filter
```tsx
{
    key: 'createdDate',
    label: 'Created Date',
    type: 'date',
    placeholder: 'Select date'
}
```

#### Date Range Filter
```tsx
{
    key: 'dateRange',
    label: 'Date Range',
    type: 'daterange',
    placeholder: 'Select date range'
}
```

## Pre-configured Search Configs

The following search configurations are available out of the box:

- `memberSearchConfig` - For member management
- `logisticsSearchConfig` - For logistics management
- `inventorySearchConfig` - For inventory management
- `ordersSearchConfig` - For orders management
- `staffSearchConfig` - For staff management
- `salesReportSearchConfig` - For sales reports
- `auditTrailSearchConfig` - For audit trails

## Hooks

### useGlobalSearch

A custom hook that manages search state and provides convenient methods:

```tsx
const {
    searchTerm,           // Current search term
    setSearchTerm,        // Function to update search term
    showSearch,          // Whether search is visible
    setShowSearch,       // Function to toggle search visibility
    filters,             // Current filter values
    setFilters,          // Function to update filters
    clearSearch,         // Function to clear all search and filters
    hasActiveFilters,    // Boolean indicating if any filters are active
    isSearchActive       // Boolean indicating if search is active
} = useGlobalSearch({
    config: mySearchConfig,
    onSearch: (term, filters) => { /* handle search */ },
    onFiltersChange: (filters) => { /* handle filter changes */ },
    debounceMs: 300      // Optional debounce timing
});
```

## Utilities

### Search Utils

The `search-utils.ts` file provides utility functions for filtering and processing data:

```tsx
import { filterItems, sortItems, paginateItems, processItems } from '@/utils/search-utils';

// Filter items based on search term and filters
const filteredItems = filterItems(items, {
    searchTerm: 'john',
    filters: { status: 'active' },
    searchFields: ['name', 'email']
});

// Sort items
const sortedItems = sortItems(items, 'name', 'asc');

// Paginate items
const { items, totalPages, totalItems } = paginateItems(items, 1, 10);

// Process items (filter, sort, and paginate)
const processedData = processItems(items, searchOptions, 'name', 'asc', 1, 10);
```

## Integration Examples

### Member Management Page

```tsx
import { GlobalSearchBar } from '@/components/ui/global-search-bar';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { memberSearchConfig } from '@/config/search-configs';
import { processItems } from '@/utils/search-utils';

function MemberManagement({ members }) {
    const {
        searchTerm,
        setSearchTerm,
        showSearch,
        setShowSearch,
        filters,
        setFilters,
        clearSearch
    } = useGlobalSearch({
        config: memberSearchConfig,
        onSearch: (term, filters) => {
            // Handle search logic
        }
    });

    const processedMembers = useMemo(() => {
        return processItems(members, {
            searchTerm,
            filters,
            searchFields: memberSearchConfig.searchFields
        });
    }, [members, searchTerm, filters]);

    return (
        <div>
            <GlobalSearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                config={memberSearchConfig}
                onFiltersChange={setFilters}
                onClearSearch={clearSearch}
                resultsCount={processedMembers.paginatedItems.length}
                totalCount={processedMembers.totalItems}
            />
            {/* Render members */}
        </div>
    );
}
```

### Custom Configuration

```tsx
const customSearchConfig: SearchConfig = {
    placeholder: "Search products...",
    searchFields: ['name', 'description', 'category'],
    resultsCount: true,
    clearable: true,
    filters: [
        {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'priceRange',
            label: 'Price Range',
            type: 'select',
            options: [
                { value: '0-50', label: '$0 - $50' },
                { value: '50-100', label: '$50 - $100' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'inStock',
            label: 'In Stock Only',
            type: 'toggle',
            defaultValue: false
        }
    ]
};
```

## Styling

The component uses CSS modules for styling. You can customize the appearance by modifying `global-search-bar.module.css`:

```css
/* Custom styles */
.searchContainer {
    /* Your custom styles */
}

.searchContainer.expanded {
    /* Expanded state styles */
}

.searchContainer.collapsed {
    /* Collapsed state styles */
}
```

## Accessibility

The component is built with accessibility in mind:

- Full keyboard navigation support
- Screen reader friendly
- Proper ARIA labels and roles
- Focus management
- Reduced motion support

## Performance

- Debounced search to prevent excessive API calls
- Memoized filter calculations
- Optimized re-renders
- Lazy loading support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Mobile browsers

## Troubleshooting

### Common Issues

1. **Filters not updating**: Make sure you're using the `setFilters` function from the hook
2. **Search not working**: Check that `searchFields` are correctly configured
3. **Styling issues**: Ensure CSS modules are properly imported

### Debug Mode

Enable debug logging by setting the `NODE_ENV` to `development`:

```tsx
const { searchTerm, filters } = useGlobalSearch({
    config: myConfig,
    onSearch: (term, filters) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Search:', { term, filters });
        }
    }
});
```

## Contributing

When adding new filter types or features:

1. Update the `FilterConfig` interface in `types/global-search.ts`
2. Add the new filter type to the `renderFilter` function in `GlobalSearchBar`
3. Update the documentation
4. Add tests for the new functionality

## License

This component is part of the Agricart Admin project and follows the same license terms.
