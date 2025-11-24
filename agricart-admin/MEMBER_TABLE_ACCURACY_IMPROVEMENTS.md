# Member Table Accuracy and Loss Calculation Improvements

## Summary
Fixed the member stock table to show accurate data, properly calculate losses based on removal reasons, and ensure all stock records remain visible regardless of their status.

## Changes Made

### 1. Stock Data Inclusion

#### Before:
- Only included stocks where `removed_at IS NULL`
- Stocks that were fully removed disappeared from member view
- Incomplete picture of member's stock history

#### After:
```php
$allStocks = Stock::where('member_id', $memberId)
    ->with(['product'])
    ->get();
```
- Includes ALL stocks for the member (active and removed)
- Provides complete stock history
- Shows accurate totals including removed quantities

### 2. Loss Calculation Fix

#### Before:
- Used exact string matching: `whereIn('notes', ['Damaged/Defective', 'Damaged', 'Defective'])`
- Missed records because actual notes contain additional text (e.g., "Damaged / Defective - Loss recorded: ₱150.00")
- Counted ALL removals as loss regardless of reason

#### After:
```php
// In calculateComprehensiveStockData
$damagedDefectiveData = \App\Models\StockTrail::where('member_id', $memberId)
    ->where('action_type', 'removed')
    ->where(function ($query) {
        $query->where('notes', 'LIKE', '%Damaged%')
              ->orWhere('notes', 'LIKE', '%Defective%');
    })
    ->get();

// In calculateStockTrailSummary
$isDamagedDefective = $trail->notes && (
    stripos($trail->notes, 'Damaged') !== false || 
    stripos($trail->notes, 'Defective') !== false
);

if ($isDamagedDefective && $trail->product && $trail->new_quantity !== null) {
    // Calculate loss only for damaged/defective
    $removedQuantity = ($trail->old_quantity ?? 0) - ($trail->new_quantity ?? 0);
    $totalRemovedValue += $removedQuantity * $price;
}
```

**Key Improvements:**
- Uses `LIKE` query to match partial strings
- Case-insensitive matching with `stripos()`
- Only counts damaged/defective removals as loss
- Ignores "Sold Outside" and "Listing Error" removals

### 3. Total Quantity Calculation

#### Before:
```php
$stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity;
```
- Didn't account for removed quantities
- Total was inaccurate when stock was partially removed

#### After:
```php
if ($stock->initial_quantity) {
    $stockGroups[$key]['total_quantity'] += $stock->initial_quantity;
} else {
    $stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity + ($stock->removed_quantity ?? 0);
}
```

**Benefits:**
- Uses `initial_quantity` if available (most accurate)
- Falls back to calculated total: current + sold + removed
- Accounts for all stock movements
- Provides accurate historical totals

### 4. Stock Grouping Enhancement

Added `removed_quantity` tracking to stock groups:

```php
$stockGroups[$key] = [
    'product_id' => $stock->product_id,
    'product_name' => $stock->product->name,
    'category' => $stock->category,
    'total_quantity' => 0,
    'available_quantity' => 0,
    'sold_quantity' => 0,
    'removed_quantity' => 0,  // NEW
    'balance_quantity' => 0,
    'damaged_defective_count' => 0,
    'damaged_defective_loss' => 0,
    // ... other fields
];

// Track removed quantity
$stockGroups[$key]['removed_quantity'] += $stock->removed_quantity ?? 0;
```

### 5. Filter Logic Update

#### Before:
```php
elseif ($statusFilter === 'sold_out') {
    return $item['balance_quantity'] <= 0 && $item['sold_quantity'] > 0;
}
```

#### After:
```php
elseif ($statusFilter === 'sold_out') {
    // Include items with sold stock OR damaged/defective stock
    return $item['balance_quantity'] <= 0 && 
           ($item['sold_quantity'] > 0 || $item['damaged_defective_count'] > 0);
}
```

**Added Documentation:**
```php
// IMPORTANT: Never filter out items with sold_quantity > 0 or damaged_defective_count > 0
// These must always remain visible for accurate member tracking
```

## Loss Calculation Logic

### What Counts as Loss:
✅ **Damaged / Defective**
- Reason contains "Damaged" or "Defective"
- Loss = removed_quantity × unit_price
- Displayed in loss column
- Included in loss summary

### What Does NOT Count as Loss:
❌ **Sold Outside**
- No financial impact on system
- Tracked but not counted as loss
- Not included in loss calculations

❌ **Listing Error**
- No financial impact on system
- Tracked but not counted as loss
- Not included in loss calculations

## Data Integrity

### Stock Visibility Rules:
1. **Always Show** stocks with:
   - `sold_quantity > 0` (has sales history)
   - `damaged_defective_count > 0` (has loss history)
   - `balance_quantity > 0` (has available stock)

2. **Never Hide** stocks that:
   - Have been partially removed
   - Have been fully sold
   - Have damaged/defective removals

3. **Filter Behavior**:
   - "All" status: Shows everything
   - "Available" status: Shows items with balance > 0
   - "Sold Out" status: Shows items with no balance but has sold OR damaged/defective stock

### Relationship Integrity:
- Member → Stocks: All stocks remain linked to member
- Stocks → Stock Trails: Complete removal history maintained
- Stock Trails → Loss Calculation: Only damaged/defective counted

## Calculation Examples

### Example 1: Partial Damaged Removal
```
Initial Stock: 100 units @ ₱50/unit
Removed (Damaged): 20 units
Sold: 30 units
Remaining: 50 units

Calculations:
- Total Quantity: 100 (initial)
- Available: 50
- Sold: 30
- Removed: 20
- Damaged/Defective Count: 20
- Loss: 20 × ₱50 = ₱1,000
```

### Example 2: Mixed Removals
```
Initial Stock: 100 units @ ₱50/unit
Removed (Sold Outside): 10 units
Removed (Damaged): 15 units
Sold: 40 units
Remaining: 35 units

Calculations:
- Total Quantity: 100 (initial)
- Available: 35
- Sold: 40
- Removed: 25 (10 + 15)
- Damaged/Defective Count: 15 (only damaged)
- Loss: 15 × ₱50 = ₱750 (only damaged, not sold outside)
```

### Example 3: Listing Error
```
Initial Stock: 100 units @ ₱50/unit
Removed (Listing Error): 20 units
Sold: 50 units
Remaining: 30 units

Calculations:
- Total Quantity: 100 (initial)
- Available: 30
- Sold: 50
- Removed: 20
- Damaged/Defective Count: 0 (listing error doesn't count)
- Loss: ₱0 (no loss for listing errors)
```

## Testing Checklist

### 1. Stock Visibility
- [ ] Stocks with sold quantity remain visible
- [ ] Stocks with damaged/defective removals remain visible
- [ ] Partially removed stocks show correct remaining quantity
- [ ] Fully removed stocks still appear in member table

### 2. Loss Calculation
- [ ] Damaged/Defective removals create loss
- [ ] Sold Outside removals don't create loss
- [ ] Listing Error removals don't create loss
- [ ] Loss amount = removed_quantity × unit_price
- [ ] Loss appears in member's loss column

### 3. Total Quantity
- [ ] Uses initial_quantity when available
- [ ] Falls back to calculated total (current + sold + removed)
- [ ] Totals match across all views
- [ ] Totals remain accurate after multiple removals

### 4. Filters
- [ ] "All" shows all stocks
- [ ] "Available" shows stocks with balance > 0
- [ ] "Sold Out" shows stocks with sold OR damaged/defective
- [ ] No stocks disappear inappropriately

### 5. Stock Trail
- [ ] Each removal creates trail entry
- [ ] Notes contain removal reason
- [ ] Old and new quantities are correct
- [ ] Trail summary shows correct loss total

## Files Modified

1. `app/Http/Controllers/Member/MemberController.php`
   - `calculateComprehensiveStockData()` method
   - `calculateStockTrailSummary()` method
   - `applyStockFilters()` method

## Benefits

1. **Accurate Member Data**
   - Complete stock history visible
   - All quantities properly tracked
   - No missing records

2. **Correct Loss Tracking**
   - Only damaged/defective counted as loss
   - Proper financial reporting
   - Clear distinction between removal types

3. **Better User Experience**
   - Members see complete picture
   - No confusion about missing stocks
   - Clear loss information

4. **Data Integrity**
   - All relationships maintained
   - Complete audit trail
   - Accurate historical data

## Notes

- The changes are backward compatible
- Existing data remains valid
- No data migration required
- Filter logic preserves all important records
- Loss calculation now matches business rules
