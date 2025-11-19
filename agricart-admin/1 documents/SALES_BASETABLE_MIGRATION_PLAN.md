# Sales Pages BaseTable Migration Plan

## Overview

This document outlines the migration of Sales pages to use the new BaseTable component, replacing custom table implementations while maintaining all existing functionality.

## Current State Analysis

### Sales Pages with Tables

1. **`resources/js/pages/Admin/Sales/index.tsx`**
   - Two tables: All Sales and Member Sales
   - Custom sorting logic for each table
   - Pagination for both tables
   - Complex table structure with 10+ columns

2. **`resources/js/pages/Admin/Sales/report.tsx`**
   - Sales report table with filtering
   - Sorting and pagination
   - Export functionality (CSV/PDF)
   - Advanced filters (date range, amount range, search)

3. **`resources/js/pages/Admin/Sales/memberSales.tsx`**
   - Member sales breakdown table
   - 11 columns including performance metrics
   - Ranking system
   - Progress bars for performance visualization

4. **`resources/js/pages/Admin/Sales/auditTrail.tsx`**
   - Stock audit trail table
   - 10 columns with product/order details
   - Filtering by date, member, order
   - Export functionality

## Migration Strategy

### Phase 1: Create Sales-Specific Table Configurations

Create reusable column definitions for each table type:

1. **Sales Table Columns** (`resources/js/components/sales/sales-table-columns.tsx`)
   - Standard sales columns (ID, Customer, Amount, Shares, COGS, Profit, Date, etc.)
   - Reusable across index and report pages

2. **Member Sales Table Columns** (`resources/js/components/sales/member-sales-table-columns.tsx`)
   - Member-specific columns (Name, Orders, Revenue, Performance, etc.)
   - Performance visualization components

3. **Audit Trail Table Columns** (`resources/js/components/sales/audit-trail-table-columns.tsx`)
   - Audit-specific columns (Timestamp, Order, Member, Product, Stock, etc.)

### Phase 2: Implement BaseTable in Each Page

Replace custom table implementations with BaseTable while preserving:
- Sorting functionality
- Pagination
- Filtering
- Export capabilities
- Mobile responsiveness

### Phase 3: Test and Validate

- Verify all sorting works correctly
- Test pagination
- Validate filtering
- Check mobile responsive views
- Ensure export functions still work

## Benefits

### Code Reduction
- **Before**: ~500 lines of table code per page
- **After**: ~100 lines using BaseTable + column definitions
- **Savings**: ~75% code reduction

### Consistency
- All tables follow the same design system
- Uniform spacing, typography, and interactions
- Easier maintenance

### Maintainability
- Single source of truth for table styling
- Column definitions are reusable
- Easier to add new features

### Mobile Experience
- Automatic mobile card views
- Consistent responsive behavior
- Better UX on small screens

## Implementation Files

### New Files to Create

1. `resources/js/components/sales/sales-table-columns.tsx`
   - Column definitions for sales tables
   - Reusable formatters (currency, date, etc.)

2. `resources/js/components/sales/member-sales-table-columns.tsx`
   - Column definitions for member sales
   - Performance visualization components

3. `resources/js/components/sales/audit-trail-table-columns.tsx`
   - Column definitions for audit trail
   - Status badges and formatters

4. `resources/js/components/sales/mobile-cards.tsx`
   - Mobile card renderers for each table type
   - Consistent mobile UX

### Files to Modify

1. `resources/js/pages/Admin/Sales/index.tsx`
   - Replace custom tables with BaseTable
   - Import column definitions
   - Simplify sorting/pagination logic

2. `resources/js/pages/Admin/Sales/report.tsx`
   - Replace custom table with BaseTable
   - Maintain filter functionality
   - Keep export features

3. `resources/js/pages/Admin/Sales/memberSales.tsx`
   - Replace custom table with BaseTable
   - Preserve performance metrics
   - Keep ranking system

4. `resources/js/pages/Admin/Sales/auditTrail.tsx`
   - Replace custom table with BaseTable
   - Maintain filtering
   - Keep export functionality

## Example: Before and After

### Before (Custom Table)
```tsx
<Table className="w-full border-collapse text-sm">
  <TableHeader className="bg-muted/50 border-b-2">
    <TableRow>
      <TableHead className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
        <button onClick={() => handleSort('id')} className="flex items-center gap-2 hover:text-foreground transition-colors mx-auto">
          Sale ID
          {getSortIcon('id')}
        </button>
      </TableHead>
      {/* ... many more columns ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {sales.map((sale) => (
      <TableRow key={sale.id} className="border-b transition-all hover:bg-muted/20">
        <TableCell className="p-3 align-top border-b">
          <div className="flex justify-center min-h-[40px] py-2 w-full">
            <div className="w-full max-w-[100px] text-center">
              <Badge variant="outline">#{sale.id}</Badge>
            </div>
          </div>
        </TableCell>
        {/* ... many more cells ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### After (BaseTable)
```tsx
<BaseTable
  data={sortedSales}
  columns={salesTableColumns}
  keyExtractor={(sale) => sale.id}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSort={handleSort}
  renderMobileCard={(sale) => <SalesMobileCard sale={sale} />}
/>
```

## Timeline

- **Phase 1**: Create column definitions (1-2 hours)
- **Phase 2**: Migrate each page (2-3 hours)
- **Phase 3**: Testing and validation (1-2 hours)
- **Total**: 4-7 hours

## Success Criteria

✅ All tables use BaseTable component
✅ Sorting works correctly on all columns
✅ Pagination functions properly
✅ Filtering and search work as before
✅ Export functionality preserved
✅ Mobile views render correctly
✅ No visual regressions
✅ Code is cleaner and more maintainable

## Next Steps

1. Review and approve this plan
2. Create column definition files
3. Migrate index.tsx first (as proof of concept)
4. Migrate remaining pages
5. Test thoroughly
6. Deploy

## Notes

- Keep existing state management logic
- Preserve all business logic
- Maintain backward compatibility
- Document any breaking changes
- Update tests if needed
