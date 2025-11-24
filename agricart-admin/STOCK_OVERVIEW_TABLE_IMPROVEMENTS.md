# Stock Quantity Overview Table Improvements

## Summary
Updated the Stock Quantity Overview table with two new columns to track damaged/defective stock and associated losses, plus improved table validation to ensure all items remain visible.

## Changes Made

### 1. Backend Updates (PHP)

#### `app/Http/Controllers/Member/MemberController.php`

**Added Damaged/Defective Tracking:**
- Modified `calculateComprehensiveStockData()` method to query stock trails for removed items with "Damaged/Defective" notes
- Added two new fields to comprehensive stock data:
  - `damaged_defective_count`: Total quantity removed due to damage/defects
  - `damaged_defective_loss`: Total monetary loss from damaged/defective removals (quantity × unit price)

**Updated Sorting:**
- Added sorting support for `damaged_defective_count` column
- Added sorting support for `damaged_defective_loss` column

**Updated Export Functions:**
- Modified `exportStocksToCsv()` to include:
  - Damaged/Defective Count column
  - Loss column
  - Summary statistics for total damaged/defective and total loss
  
- Modified `exportStocksToPdf()` to include:
  - Damaged/Defective Count in summary
  - Loss amount in summary
  - Both columns in the data array

### 2. Frontend Updates (TypeScript/React)

#### `resources/js/pages/Member/allStocks.tsx`
- Updated `ComprehensiveStockData` interface to include:
  - `damaged_defective_count: number`
  - `damaged_defective_loss: number`

#### `resources/js/components/member/StockOverviewTable.tsx`
- Updated `ComprehensiveStockData` interface with new fields
- Added "Damaged/Defective Count" column header (sortable)
  - Positioned to the right of "Available Balance" column
  - Shows count with orange AlertCircle icon
  - Displays 0 if no damaged/defective items
  
- Added "Loss" column header (sortable)
  - Positioned after "Gross Profit" column, before "Status"
  - Shows monetary loss in red text
  - Displays ₱0.00 if no losses

#### `resources/js/components/member/StockOverviewCards.tsx` (Mobile View)
- Updated `ComprehensiveStockData` interface with new fields
- Modified stock information grid from 3 columns to 4 columns
- Added "Damaged/Defective Count" card with orange AlertCircle icon
- Modified financial details grid from 3 columns to 4 columns
- Added "Loss" card with red AlertCircle icon showing monetary loss in red text

### 3. PDF Export Template

#### `resources/views/exports/member-stocks-pdf.blade.php`
- Added "Damaged" column header in table
- Added "Loss" column header in table
- Updated table rows to display:
  - `damaged_defective_count` (defaults to 0 if not set)
  - `damaged_defective_loss` (defaults to 0.00 if not set)

## Features

### 1. Loss Column
- **Location**: Positioned after Gross Profit, before Status
- **Purpose**: Shows total monetary loss from damaged/defective removals
- **Calculation**: Sum of (removed quantity × unit price) for all "Damaged/Defective" removals
- **Display**: Red text with peso sign (₱) and formatted with commas
- **Sortable**: Yes

### 2. Damaged/Defective Count Column
- **Location**: Positioned to the right of Available Balance
- **Purpose**: Shows total quantity removed due to damage/defects
- **Calculation**: Sum of removed quantities from stock trails with "Damaged/Defective" notes
- **Display**: Number with orange AlertCircle icon
- **Sortable**: Yes

### 3. Table Validation
The table now ensures that items are NOT filtered out or hidden when they have:
- Sold stock (sold_quantity > 0)
- Defective stock (damaged_defective_count > 0)

These items will always remain visible in the table regardless of filters or status conditions.

## Data Source
- Damaged/Defective data is sourced from the `stock_trails` table
- Filters for `action_type = 'removed'`
- Matches `notes` field containing: 'Damaged/Defective', 'Damaged', or 'Defective'
- Respects date range filters if applied

## Export Support
Both CSV and PDF exports now include:
- Damaged/Defective Count column
- Loss column
- Summary statistics showing:
  - Total Damaged/Defective items
  - Total Loss amount

## Mobile Responsiveness
The mobile card view has been updated to display all new information in a 4-column grid layout for both stock quantities and financial details.

## Testing Recommendations

1. **Verify Column Display:**
   - Check that both new columns appear in the correct positions
   - Verify icons and colors are correct
   - Test sorting on both new columns

2. **Verify Data Accuracy:**
   - Add stock with damaged/defective removals
   - Verify count matches stock trail records
   - Verify loss calculation (quantity × unit price)

3. **Test Exports:**
   - Export to CSV and verify new columns appear
   - Export to PDF and verify new columns appear
   - Check summary statistics include new totals

4. **Test Mobile View:**
   - Verify 4-column grid displays correctly
   - Check that all data is readable on small screens

5. **Test Filters:**
   - Verify items with sold stock remain visible
   - Verify items with damaged/defective stock remain visible
   - Test date range filters affect damaged/defective data correctly

## Files Modified

1. `app/Http/Controllers/Member/MemberController.php`
2. `resources/js/pages/Member/allStocks.tsx`
3. `resources/js/components/member/StockOverviewTable.tsx`
4. `resources/js/components/member/StockOverviewCards.tsx`
5. `resources/views/exports/member-stocks-pdf.blade.php`
6. `resources/lang/en/member.php`
7. `resources/lang/tl/member.php`

## Translation Keys Added

### English (`resources/lang/en/member.php`)
- `damaged_defective_count` => 'Damaged/Defective'
- `loss` => 'Loss'

### Tagalog (`resources/lang/tl/member.php`)
- `damaged_defective_count` => 'Sira/Depektibo'
- `loss` => 'Lugi'

## Notes

- The implementation preserves all existing functionality
- Sorting, filtering, and pagination continue to work as before
- The new columns default to 0 if no damaged/defective data exists
- Date range filters apply to damaged/defective data queries
- The loss calculation uses the unit price from the product at the time of calculation
- Translation keys support both English and Tagalog languages
