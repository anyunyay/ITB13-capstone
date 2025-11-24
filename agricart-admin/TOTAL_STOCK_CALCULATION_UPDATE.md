# Total Stock Calculation Update

## Issue
The "Total Stock" column was showing the historical total (initial quantity) and not decreasing when stock was removed, causing confusion.

## Solution
Updated the calculation so "Total Stock" represents the **current total** in the system, which decreases when stock is removed.

## Change Made

### Before:
```php
// Total included removed quantities
if ($stock->initial_quantity) {
    $stockGroups[$key]['total_quantity'] += $stock->initial_quantity;
} else {
    $stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity + ($stock->removed_quantity ?? 0);
}
```

**Result:** Total Stock = 14 (never changed even after removing 1)

### After:
```php
// Total represents current inventory (available + sold)
// Removed stock is NOT included as it's no longer part of the inventory
$stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity;
```

**Result:** Total Stock = 13 (decreases when stock is removed)

## Column Meanings

### Updated Definitions:

| Column | Meaning | Changes When |
|--------|---------|--------------|
| **Total Stock** | Current total in system (Available + Sold) | Decreases with removals ✅ |
| **Sold Quantity** | Amount sold to customers | Increases with sales |
| **Available Balance** | Current available for sale | Decreases with sales & removals |
| **Damaged/Defective** | Amount removed due to damage | Increases with damaged removals |
| **Loss** | Monetary loss from damage | Increases with damaged removals |

## Example Scenarios

### Scenario 1: Initial Stock
```
Initial: 14 units added
Total Stock: 14
Sold: 0
Available: 14
Removed: 0
```

### Scenario 2: After Removing 1 Unit (Any Reason)
```
Action: Remove 1 unit (Sold Outside/Listing Error/Damaged)

Total Stock: 13 ✅ (decreased from 14)
Sold: 0
Available: 13
Removed: 1 (tracked separately)
```

### Scenario 3: After Selling 5 Units
```
Action: Sell 5 units

Total Stock: 13 (unchanged - still in system, just sold)
Sold: 5
Available: 8
Removed: 1
```

### Scenario 4: After Removing 2 More Units (Damaged)
```
Action: Remove 2 units (Damaged/Defective)

Total Stock: 11 ✅ (decreased from 13)
Sold: 5
Available: 6
Removed: 3 (1 + 2)
Damaged/Defective: 2
Loss: 2 × price
```

## Formula

### Total Stock Calculation:
```
Total Stock = Available + Sold
```

**NOT including:**
- Removed quantities (tracked separately in "Removed" field)

### Why This Makes Sense:
1. **Total Stock** = What's currently in the system (either available or sold)
2. **Removed Stock** = What's been taken out of the system (no longer counted)
3. **Available** = What can still be sold
4. **Sold** = What's been sold but still part of the system total

## Verification

### Before Removal:
```
Stock: 14 units
Total = 14 + 0 = 14 ✅
```

### After Removing 1 Unit:
```
Stock: 13 units
Sold: 0 units
Removed: 1 unit

Total = 13 + 0 = 13 ✅ (decreased as expected)
```

### After Selling 5 Units:
```
Stock: 8 units
Sold: 5 units
Removed: 1 unit

Total = 8 + 5 = 13 ✅ (unchanged - sold items still count)
```

### After Removing 2 More Units:
```
Stock: 6 units
Sold: 5 units
Removed: 3 units (1 + 2)

Total = 6 + 5 = 11 ✅ (decreased by 2)
```

## Impact on Reports

### Member Dashboard:
- ✅ Total Stock now accurately reflects current inventory
- ✅ Decreases when stock is removed
- ✅ Removed quantities tracked separately
- ✅ Loss calculation unchanged (still only damaged/defective)

### Exports (CSV/PDF):
- ✅ Total Stock column shows current total
- ✅ All other columns unchanged

## Files Modified

1. `app/Http/Controllers/Member/MemberController.php`
   - `calculateComprehensiveStockData()` method
   - Updated total_quantity calculation

## Testing

### Test Case 1: Remove Stock (Sold Outside)
```
Initial: Total = 14, Available = 14
Remove 1 (Sold Outside)
Expected: Total = 13, Available = 13 ✅
Loss: ₱0 ✅
```

### Test Case 2: Remove Stock (Damaged)
```
Initial: Total = 14, Available = 14
Remove 3 (Damaged/Defective @ ₱50)
Expected: Total = 11, Available = 11 ✅
Loss: ₱150 ✅
```

### Test Case 3: Mixed Operations
```
Initial: Total = 14, Available = 14
Sell 5: Total = 14, Available = 9, Sold = 5 ✅
Remove 2 (Listing Error): Total = 12, Available = 7, Sold = 5 ✅
Remove 3 (Damaged): Total = 9, Available = 4, Sold = 5 ✅
Loss: ₱150 (only damaged) ✅
```

## Summary

✅ **Fixed:** Total Stock now decreases when stock is removed
✅ **Formula:** Total = Available + Sold (removed quantities excluded)
✅ **Behavior:** Matches user expectations
✅ **Loss Calculation:** Unchanged (still only damaged/defective)

The Total Stock column now accurately represents the current inventory in the system, excluding removed items.
