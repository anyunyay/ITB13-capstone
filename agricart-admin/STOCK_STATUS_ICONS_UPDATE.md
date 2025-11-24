# Stock Status Icons Update

## Summary
Updated stock status icons across Member and Admin interfaces to use more intuitive package-based icons with appropriate colors.

## Changes Made

### Icon Mapping
- **Available / In Stock**: `PackageCheck` icon with green color (`bg-green-600`)
- **Sold Stock / Sold Out**: `PackageOpen` icon with gray color (`bg-gray-600`)
- **Damaged / Defective / Removed**: `PackageX` icon with red color (`bg-red-600`)

### Files Updated

#### Member Interface
1. **resources/js/components/member/StockOverviewCards.tsx**
   - Updated imports to include `PackageCheck`, `PackageOpen`, `PackageX`
   - Updated status badges in card header
   - Updated stock information icons (sold, available, damaged)
   - Updated financial details loss icon

2. **resources/js/components/member/StockOverviewTable.tsx**
   - Updated imports to include new package icons
   - Updated table cell icons for sold, available, and damaged quantities
   - Updated status badge column with new icons and colors

3. **resources/js/components/member/SummaryCards.tsx**
   - Updated imports to replace old icons
   - Updated Available Stock card icon
   - Updated Sold Out card icon and color (changed from red to blue)
   - Updated Sold Quantity card icon and color
   - Updated Loss card icon

4. **resources/js/pages/Member/dashboard.tsx**
   - Updated imports to include `PackageCheck` and `PackageOpen`
   - Updated Available badge icon
   - Updated Sold badge icon and color (changed from red to blue)

#### Admin Interface
5. **resources/js/components/inventory/stock-table.tsx**
   - Updated imports to include package icons
   - Updated `getStatusBadge` function with new icons and colors
   - Applied to both mobile card view and desktop table view

6. **resources/js/components/inventory/stock-card.tsx**
   - Updated imports to include package icons
   - Updated `getStatusBadge` function with new icons and colors

7. **resources/js/components/inventory/report-stock-table-columns.tsx**
   - Updated imports to include package icons
   - Updated `getStatusBadge` function with new icons and colors
   - Applied to both table columns and mobile cards

## Color Scheme
- **Green (`bg-green-600`)**: Success/Available - indicates stock is ready and available
- **Gray (`bg-gray-600`)**: Neutral/Info - indicates stock has been sold (neutral transaction)
- **Red (`bg-red-600`)**: Warning/Danger - indicates damaged, defective, or removed stock (loss)

## Testing
All files compiled successfully with no TypeScript errors or warnings.

## Impact
- Improved visual clarity for stock status across the application
- Consistent icon usage between Member and Admin interfaces
- Better color coding that matches the semantic meaning of each status
- No changes to existing stock logic or data handling
