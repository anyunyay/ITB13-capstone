# Manual Migration Steps for Sales Index Page

## Issue
The automated migration encountered JSX syntax errors. Here are the manual steps to complete the migration.

## Step-by-Step Instructions

### Step 1: Update Imports (Lines 1-18)

**Replace:**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
```

**With:**
```tsx
// Remove the above lines
```

**Add after other imports:**
```tsx
import { BaseTable } from '@/components/common/base-table';
import { createSalesTableColumns, SalesMobileCard, Sale } from '@/components/sales/sales-table-columns';
import { createMemberSalesTableColumns, MemberSalesMobileCard, MemberSale } from '@/components/sales/member-sales-table-columns';
```

**Change:**
```tsx
import { useState, useEffect } from 'react';
```

**To:**
```tsx
import { useState, useEffect, useMemo } from 'react';
```

**Change:**
```tsx
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
```

**To:**
```tsx
import { DollarSign, ShoppingCart, Users, TrendingUp, Package } from 'lucide-react';
```

### Step 2: Remove Interface Definitions (Lines 19-70)

**Delete these interfaces** (they're now imported):
```tsx
interface Sale {
  // ... delete entire interface
}

interface MemberSale {
  // ... delete entire interface
}
```

**Keep only:**
```tsx
interface SalesPageProps {
  sales: Sale[];
  summary: {
    // ... keep as is
  };
  memberSales: MemberSale[];
  filters: {
    // ... keep as is
  };
}
```

### Step 3: Remove Sort Icon Functions (Around line 90-105)

**Delete these functions:**
```tsx
const getSalesSortIcon = (field: string) => {
  // ... delete entire function
};

const getMemberSortIcon = (field: string) => {
  // ... delete entire function
};
```

### Step 4: Wrap Sorting Logic in useMemo (Around line 110)

**Change:**
```tsx
const sortedSales = [...sales].sort((a, b) => {
```

**To:**
```tsx
const sortedSales = useMemo(() => {
  return [...sales].sort((a, b) => {
```

**At the end of the sort function, change:**
```tsx
    return salesSortOrder === 'asc' ? comparison : -comparison;
  });
```

**To:**
```tsx
    return salesSortOrder === 'asc' ? comparison : -comparison;
  });
}, [sales, salesSortBy, salesSortOrder]);
```

### Step 5: Wrap Paginated Sales in useMemo

**Change:**
```tsx
const paginatedSales = sortedSales.slice(
  (salesCurrentPage - 1) * itemsPerPage,
  salesCurrentPage * itemsPerPage
);
```

**To:**
```tsx
const paginatedSales = useMemo(() => {
  return sortedSales.slice(
    (salesCurrentPage - 1) * itemsPerPage,
    salesCurrentPage * itemsPerPage
  );
}, [sortedSales, salesCurrentPage, itemsPerPage]);
```

### Step 6: Wrap Member Sales Sorting in useMemo

**Change:**
```tsx
const sortedMemberSales = [...memberSales].sort((a, b) => {
```

**To:**
```tsx
const sortedMemberSales = useMemo(() => {
  return [...memberSales].sort((a, b) => {
```

**At the end, change:**
```tsx
    return memberSortOrder === 'asc' ? comparison : -comparison;
  });
```

**To:**
```tsx
    return memberSortOrder === 'asc' ? comparison : -comparison;
  });
}, [memberSales, memberSortBy, memberSortOrder]);
```

### Step 7: Wrap Paginated Member Sales in useMemo

**Change:**
```tsx
const paginatedMemberSales = sortedMemberSales.slice(
  (memberCurrentPage - 1) * itemsPerPage,
  memberCurrentPage * itemsPerPage
);
```

**To:**
```tsx
const paginatedMemberSales = useMemo(() => {
  return sortedMemberSales.slice(
    (memberCurrentPage - 1) * itemsPerPage,
    memberCurrentPage * itemsPerPage
  );
}, [sortedMemberSales, memberCurrentPage, itemsPerPage]);
```

### Step 8: Remove handleSalesPageChange and handleMemberPageChange

**Delete:**
```tsx
const handleSalesPageChange = (page: number) => {
  setSalesCurrentPage(page);
};

const handleMemberPageChange = (page: number) => {
  setMemberCurrentPage(page);
};
```

### Step 9: Add Column Definitions (Before return statement)

**Add:**
```tsx
// Create column definitions
const salesColumns = useMemo(() => createSalesTableColumns(t), [t]);
const memberSalesColumns = useMemo(() => {
  const totalRevenue = memberSales.reduce((sum, m) => sum + Number(m.total_revenue || 0), 0);
  return createMemberSalesTableColumns(t, totalRevenue);
}, [t, memberSales]);
```

### Step 10: Replace Sales Table (Around line 340-490)

**Find this section:**
```tsx
<CardContent>
  <div className="rounded-md border">
    <Table className="w-full border-collapse text-sm">
      <TableHeader className="bg-muted/50 border-b-2">
        {/* ... lots of TableHead elements ... */}
      </TableHeader>
      <TableBody>
        {/* ... lots of TableRow elements ... */}
      </TableBody>
    </Table>
  </div>

  {/* Pagination Controls */}
  {salesTotalPages > 1 && (
    <PaginationControls
      currentPage={salesCurrentPage}
      totalPages={salesTotalPages}
      onPageChange={handleSalesPageChange}
      itemsPerPage={itemsPerPage}
      totalItems={sortedSales.length}
    />
  )}
</CardContent>
```

**Replace with:**
```tsx
<CardContent>
  <BaseTable
    data={paginatedSales}
    columns={salesColumns}
    keyExtractor={(sale) => sale.id}
    sortBy={salesSortBy}
    sortOrder={salesSortOrder}
    onSort={handleSalesSort}
    renderMobileCard={(sale) => <SalesMobileCard sale={sale} t={t} />}
    emptyState={
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_sales_found')}</h3>
        <p className="text-muted-foreground">{t('admin.no_sales_match_filters')}</p>
      </div>
    }
  />

  {/* Pagination Controls */}
  {salesTotalPages > 1 && (
    <PaginationControls
      currentPage={salesCurrentPage}
      totalPages={salesTotalPages}
      onPageChange={setSalesCurrentPage}
      itemsPerPage={itemsPerPage}
      totalItems={sortedSales.length}
    />
  )}
</CardContent>
```

### Step 11: Replace Member Sales Table (Around line 500-650)

**Find the member sales table section (similar to step 10)**

**Replace with:**
```tsx
<CardContent>
  <BaseTable
    data={paginatedMemberSales}
    columns={memberSalesColumns}
    keyExtractor={(member) => member.member_id}
    sortBy={memberSortBy}
    sortOrder={memberSortOrder}
    onSort={handleMemberSort}
    renderMobileCard={(member, index) => {
      const totalRevenue = memberSales.reduce((sum, m) => sum + Number(m.total_revenue || 0), 0);
      return <MemberSalesMobileCard member={member} index={index} totalRevenue={totalRevenue} t={t} />;
    }}
    emptyState={
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.no_member_sales_found')}</h3>
        <p className="text-muted-foreground">{t('admin.no_member_sales_data')}</p>
      </div>
    }
  />

  {/* Pagination Controls */}
  {memberTotalPages > 1 && (
    <PaginationControls
      currentPage={memberCurrentPage}
      totalPages={memberTotalPages}
      onPageChange={setMemberCurrentPage}
      itemsPerPage={itemsPerPage}
      totalItems={sortedMemberSales.length}
    />
  )}
</CardContent>
```

## Verification

After making these changes:

1. Save the file
2. Check for TypeScript errors
3. Test in browser:
   - Sales table displays correctly
   - Sorting works
   - Pagination works
   - Mobile view shows cards
   - Member sales tab works

## Alternative: Use Pre-Made File

If manual editing is too complex, you can:

1. Copy the working implementation from another project
2. Or request a complete file replacement

## Support

If you encounter issues:
- Check `IMPLEMENTATION_COMPLETE.md` for reference
- See `BASE_TABLE_QUICK_START.md` for usage examples
- Review the backup file: `index.tsx.backup`
