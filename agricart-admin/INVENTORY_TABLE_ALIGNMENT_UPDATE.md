# Inventory Table Alignment Update

## Summary
Updated all Admin Inventory table cells to use configurable individual alignment (text-left, text-right, text-center) while maintaining centered headers. This follows the pattern established in the Member area (allStocks.tsx).

## Pattern Applied
Each table cell now uses a wrapper structure:
```tsx
<TableCell>
  <div className="flex justify-center min-h-[40px] py-2 w-full">
    <div className="w-full max-w-[XXXpx] text-{left|right|center}">
      {/* Cell content */}
    </div>
  </div>
</TableCell>
```

## Files Updated

### 1. Stock Table Component
**File:** `resources/js/components/inventory/stock-table.tsx`
- Stock ID: centered
- Product Name: left-aligned
- Quantity: centered (badges)
- Category: centered (badges)
- Member: left-aligned
- Status: centered (badges)
- Created Date: centered
- Notes: left-aligned

### 2. Stock Management Component
**File:** `resources/js/components/inventory/stock-management.tsx`
- Updated three table row types:
  - Trail view (audit trail)
  - Sold stocks view
  - Regular stocks view
- Applied consistent alignment across all views
- Dates: centered
- Product names: left-aligned
- Quantities: right-aligned
- Categories: centered (badges)
- Members: left-aligned
- Status/Actions: centered (badges)
- Amounts: right-aligned
- Notes: left-aligned
- Action buttons: centered

### 3. Product Table Component
**File:** `resources/js/components/inventory/product-table.tsx`
- Product (with image): left-aligned
- Type: centered (badges)
- Prices: right-aligned
- Status: centered (badges)
- Actions: centered

### 4. Removed Stock Page
**File:** `resources/js/pages/Admin/Inventory/Stock/removedStock.tsx`
- Stock ID: centered
- Product Name: left-aligned
- Quantity: right-aligned
- Category: centered
- Removal Notes: left-aligned
- Removed At: centered
- Actions: centered

### 5. Sold Stock Page
**File:** `resources/js/pages/Admin/Inventory/Stock/soldStock.tsx`
- Stock ID: centered
- Product Name: left-aligned
- Category: centered
- Status: centered
- Sold At: centered

## Alignment Logic
- **IDs/Numbers**: Centered for visual balance
- **Text/Names**: Left-aligned for readability
- **Monetary Values**: Right-aligned (standard for numbers)
- **Badges/Status**: Centered for visual emphasis
- **Dates/Times**: Centered for consistency
- **Action Buttons**: Centered for accessibility
- **Notes/Descriptions**: Left-aligned for readability

## Benefits
1. **Consistent Spacing**: All cells have min-h-[40px] for uniform row heights
2. **Responsive**: Max-width constraints prevent excessive stretching
3. **Flexible**: Easy to adjust individual cell alignment
4. **Maintainable**: Clear pattern for future updates
5. **Accessible**: Proper spacing and alignment improve readability

## Header Alignment
All table headers have been updated to use `text-center` for consistent visual presentation:
- **stock-table.tsx**: Already centered (using `<th>` with text-center)
- **stock-management.tsx**: Updated all three table types (trail, sold, regular) to text-center
- **product-table.tsx**: Updated to text-center with mx-auto on sortable buttons
- **removedStock.tsx**: Already centered (using TableHead with text-center)
- **soldStock.tsx**: Already centered (using TableHead with text-center)

Sortable header buttons now include `mx-auto` class to ensure proper centering within the header cells.

## Testing
All files passed TypeScript diagnostics with no errors.
