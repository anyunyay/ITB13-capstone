# How to Migrate Remaining Pages to BaseTable

## Overview

This guide shows you exactly how to migrate Logistics, Membership, and Staff pages to use BaseTable, following the proven pattern from Sales and Orders migrations.

## Step-by-Step Migration Pattern

### Step 1: Create Column Definitions

Create a new file: `resources/js/components/[section]/[section]-table-columns.tsx`

**Template:**
```tsx
import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, Mail, Phone } from 'lucide-react';

export interface YourDataType {
    id: number;
    name: string;
    email: string;
    // ... other fields
}

export const createYourTableColumns = (t: (key: string) => string): BaseTableColumn<YourDataType>[] => [
    {
        key: 'id',
        label: t('admin.id'),
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (item) => (
            <Badge variant="outline">#{item.id}</Badge>
        ),
    },
    {
        key: 'name',
        label: t('admin.name'),
        icon: User,
        sortable: true,
        align: 'left',
        maxWidth: '200px',
        render: (item) => (
            <div className="font-medium text-sm">{item.name}</div>
        ),
    },
    // ... more columns
];

// Mobile card component
export const YourMobileCard = ({ item, t }: { item: YourDataType; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <Badge variant="outline">#{item.id}</Badge>
        </div>
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-muted-foreground">{item.email}</div>
    </div>
);
```

### Step 2: Update Page/Component Imports

**Add these imports:**
```tsx
import { useState, useEffect, useMemo } from 'react'; // Add useMemo if not present
import { BaseTable } from '@/components/common/base-table';
import { createYourTableColumns, YourMobileCard, type YourDataType } from '@/components/[section]/[section]-table-columns';
import { Package } from 'lucide-react'; // For empty state
```

**Remove these imports:**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'; // If only used for sorting
```

### Step 3: Add Column Definitions

**Add before the return statement:**
```tsx
// Create column definitions
const columns = useMemo(() => createYourTableColumns(t), [t]);
```

### Step 4: Remove Old Sort Icon Functions

**Delete functions like:**
```tsx
const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ? 
        <ArrowUp className="h-4 w-4 ml-1" /> : 
        <ArrowDown className="h-4 w-4 ml-1" />;
};
```

### Step 5: Wrap Sorting Logic in useMemo

**Change from:**
```tsx
const sortedData = [...data].sort((a, b) => {
    // sorting logic
});
```

**To:**
```tsx
const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
        // sorting logic
    });
}, [data, sortBy, sortOrder]);
```

### Step 6: Replace Table with BaseTable

**Find the old table section:**
```tsx
<div className="rounded-md border">
    <Table className="w-full border-collapse text-sm">
        <TableHeader className="bg-muted/50 border-b-2">
            <TableRow>
                <TableHead>...</TableHead>
                {/* Many more TableHead elements */}
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map((item) => (
                <TableRow key={item.id}>
                    <TableCell>...</TableCell>
                    {/* Many more TableCell elements */}
                </TableRow>
            ))}
        </TableBody>
    </Table>
</div>
```

**Replace with:**
```tsx
<BaseTable
    data={paginatedData}
    columns={columns}
    keyExtractor={(item) => item.id}
    sortBy={sortBy}
    sortOrder={sortOrder}
    onSort={handleSort}
    renderMobileCard={(item) => <YourMobileCard item={item} t={t} />}
    emptyState={
        <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_data_found')}</h3>
            <p className="text-muted-foreground">{t('admin.no_data_description')}</p>
        </div>
    }
/>
```

### Step 7: Test

1. Check for TypeScript errors: `getDiagnostics`
2. Test in browser:
   - Desktop table displays correctly
   - Mobile cards work
   - Sorting functions
   - Pagination works
   - Search/filters work

## Example: Logistics Migration

### 1. Create Column Definitions

**File**: `resources/js/components/logistics/logistics-table-columns.tsx`

```tsx
import { BaseTableColumn } from '@/components/common/base-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { User, Mail, Phone, MapPin, Eye } from 'lucide-react';

export interface Logistic {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    active: boolean;
    registration_date?: string;
}

export const createLogisticsTableColumns = (t: (key: string) => string): BaseTableColumn<Logistic>[] => [
    {
        key: 'id',
        label: t('admin.id'),
        sortable: true,
        align: 'center',
        maxWidth: '100px',
        render: (logistic) => (
            <Badge variant="outline" className="font-mono">
                #{logistic.id}
            </Badge>
        ),
    },
    {
        key: 'name',
        label: t('admin.name'),
        icon: User,
        sortable: true,
        align: 'left',
        maxWidth: '200px',
        render: (logistic) => (
            <div className="font-medium text-sm">{logistic.name}</div>
        ),
    },
    {
        key: 'email',
        label: t('admin.email'),
        icon: Mail,
        sortable: true,
        align: 'left',
        maxWidth: '200px',
        render: (logistic) => (
            <div className="text-sm text-muted-foreground">{logistic.email}</div>
        ),
    },
    {
        key: 'contact_number',
        label: t('admin.contact'),
        icon: Phone,
        align: 'center',
        maxWidth: '150px',
        render: (logistic) => (
            <div className="text-sm">{logistic.contact_number || '-'}</div>
        ),
    },
    {
        key: 'address',
        label: t('admin.address'),
        icon: MapPin,
        align: 'left',
        maxWidth: '200px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm text-muted-foreground">{logistic.address || '-'}</div>
        ),
    },
    {
        key: 'active',
        label: t('admin.status'),
        sortable: true,
        align: 'center',
        maxWidth: '120px',
        render: (logistic) => (
            <Badge variant={logistic.active ? 'default' : 'secondary'}>
                {logistic.active ? t('admin.active') : t('admin.inactive')}
            </Badge>
        ),
    },
    {
        key: 'registration_date',
        label: t('admin.registered'),
        sortable: true,
        align: 'left',
        maxWidth: '150px',
        hideOnMobile: true,
        render: (logistic) => (
            <div className="text-sm">
                {logistic.registration_date 
                    ? format(new Date(logistic.registration_date), 'MMM dd, yyyy')
                    : '-'
                }
            </div>
        ),
    },
    {
        key: 'actions',
        label: t('admin.actions'),
        align: 'center',
        maxWidth: '150px',
        render: (logistic) => (
            <div className="flex gap-2 justify-center">
                <Button asChild variant="outline" size="sm">
                    <Link href={route('admin.logistics.edit', logistic.id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        {t('admin.view')}
                    </Link>
                </Button>
            </div>
        ),
    },
];

// Mobile card component
export const LogisticsMobileCard = ({ logistic, t }: { logistic: Logistic; t: (key: string) => string }) => (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="font-mono">
                #{logistic.id}
            </Badge>
            <Badge variant={logistic.active ? 'default' : 'secondary'}>
                {logistic.active ? t('admin.active') : t('admin.inactive')}
            </Badge>
        </div>

        <div className="space-y-2 mb-3">
            <div className="font-medium text-sm">{logistic.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {logistic.email}
            </div>
            {logistic.contact_number && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {logistic.contact_number}
                </div>
            )}
            {logistic.address && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {logistic.address}
                </div>
            )}
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={route('admin.logistics.edit', logistic.id)}>
                <Eye className="h-3 w-3 mr-1" />
                {t('admin.view_details')}
            </Link>
        </Button>
    </div>
);
```

### 2. Update Component

In the component that renders the table (e.g., `LogisticManagement.tsx`):

**Add imports:**
```tsx
import { BaseTable } from '@/components/common/base-table';
import { createLogisticsTableColumns, LogisticsMobileCard } from '@/components/logistics/logistics-table-columns';
import { Package } from 'lucide-react';
```

**Add column definitions:**
```tsx
const columns = useMemo(() => createLogisticsTableColumns(t), [t]);
```

**Replace table with:**
```tsx
<BaseTable
    data={paginatedLogistics}
    columns={columns}
    keyExtractor={(logistic) => logistic.id}
    sortBy={sortBy}
    sortOrder={sortOrder}
    onSort={handleSort}
    renderMobileCard={(logistic) => <LogisticsMobileCard logistic={logistic} t={t} />}
    emptyState={
        <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_logistics_found')}</h3>
            <p className="text-muted-foreground">{t('admin.no_logistics_description')}</p>
        </div>
    }
/>
```

## Common Patterns

### Status Badge
```tsx
{
    key: 'status',
    label: 'Status',
    render: (item) => (
        <Badge variant={item.active ? 'default' : 'secondary'}>
            {item.active ? 'Active' : 'Inactive'}
        </Badge>
    ),
}
```

### Date Column
```tsx
{
    key: 'created_at',
    label: 'Date',
    sortable: true,
    render: (item) => (
        <div className="text-sm">
            {format(new Date(item.created_at), 'MMM dd, yyyy')}
        </div>
    ),
}
```

### Actions Column
```tsx
{
    key: 'actions',
    label: 'Actions',
    align: 'center',
    render: (item) => (
        <div className="flex gap-2 justify-center">
            <Button asChild variant="outline" size="sm">
                <Link href={route('admin.items.edit', item.id)}>
                    Edit
                </Link>
            </Button>
        </div>
    ),
}
```

## Checklist

For each page migration:

- [ ] Create column definitions file
- [ ] Create mobile card component
- [ ] Update imports
- [ ] Add column definitions with useMemo
- [ ] Remove old sort icon functions
- [ ] Wrap sorting in useMemo
- [ ] Replace table with BaseTable
- [ ] Test desktop view
- [ ] Test mobile view
- [ ] Test sorting
- [ ] Test pagination
- [ ] Test search/filters
- [ ] Check for TypeScript errors
- [ ] Create backup of original file

## Benefits

After migration, each page will have:
- ~60% less code
- Consistent design
- Mobile responsive
- Type-safe
- Reusable components
- Better maintainability

## Support

- See `BASE_TABLE_QUICK_START.md` for quick reference
- See `BASE_TABLE_README.md` for complete API
- See migrated Sales/Orders pages for examples
- All column definition files for reference patterns

---

**Ready to migrate!** Follow this guide for Logistics, Membership, and Staff pages.
