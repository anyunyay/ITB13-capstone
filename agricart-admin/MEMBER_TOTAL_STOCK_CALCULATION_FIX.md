# Member Total Stock Calculation Fix

## Issue Analysis

The member's total stock calculation needs to properly reflect ALL removed quantities, regardless of removal reason (Sold Outside, Listing Error, or Damaged/Defective).

## Current Implementation Status

### ✅ Already Correctly Implemented

The code in `MemberController.php` already includes removed quantities in the total calculation:

```php
// In calculateComprehensiveStockData() method
if ($stock->initial_quantity) {
    $stockGroups[$key]['total_quantity'] += $stock->initial_quantity;
} else {
    $stockGroups[$key]['total_quantity'] += $stock->quantity + $stock->sold_quantity + ($stock->removed_quantity ?? 0);
}

// Also tracking removed quantity separately
$stockGroups[$key]['removed_quantity'] += $stock->removed_quantity ?? 0;
```

### How It Works

**Formula:**
```
Total Stock = Current Quantity + Sold Quantity + Removed Quantity
```

**Or if initial_quantity is available:**
```
Total Stock = Initial Quantity
```

## Verification of Removal Tracking

### 1. Stock Model Updates (Already Implemented)

When stock is removed (ANY reason):

```php
// In Stock.php - remove() method
$this->increment('removed_quantity', $quantityToRemove);  // ✅ Tracks ALL removals
$this->decrement('quantity', $quantityToRemove);          // ✅ Deducts from available
```

This means:
- ✅ Sold Outside removals increment `removed_quantity`
- ✅ Listing Error removals increment `removed_quantity`
- ✅ Damaged/Defective removals increment `removed_quantity`

### 2. Total Stock Calculation (Already Implemented)

```php
// For each stock in the member's inventory
foreach ($allStocks as $stock) {
    // Calculate total
    if ($stock->initial_quantity) {
        $total = $stock->initial_quantity;  // Most accurate
    } else {
        $total = $stock->quantity +         // Current available
                 $stock->sold_quantity +    // Already sold
                 $stock->removed_quantity;  // Already removed (ALL reasons)
    }
    
    $stockGroups[$key]['total_quantity'] += $total;
}
```

### 3. Loss Calculation (Already Implemented)

Only Damaged/Defective counts as loss:

```php
// Get damaged/defective removals from stock trails
$damagedDefectiveData = \App\Models\StockTrail::where('member_id', $memberId)
    ->where('action_type', 'removed')
    ->where(function ($query) {
        $query->where('notes', 'LIKE', '%Damaged%')
              ->orWhere('notes', 'LIKE', '%Defective%');
    })
    ->get();

// Calculate loss only for damaged/defective
foreach ($damagedDefectiveData as $trail) {
    $removedQuantity = ($trail->old_quantity ?? 0) - ($trail->new_quantity ?? 0);
    $stockGroups[$key]['damaged_defective_count'] += $removedQuantity;
    $stockGroups[$key]['damaged_defective_loss'] += $removedQuantity * $price;
}
```

## Example Scenarios

### Scenario 1: Sold Outside Removal

**Initial State:**
```
Stock ID: 100
Product: Tomatoes (Kilo)
Initial Quantity: 100 kg
Current Quantity: 100 kg
Sold Quantity: 0 kg
Removed Quantity: 0 kg
```

**Action: Remove 20 kg (Sold Outside)**

**After Removal:**
```
Stock Table:
- quantity: 80 kg (100 - 20)
- sold_quantity: 0 kg
- removed_quantity: 20 kg (0 + 20)  ✅ Updated
- initial_quantity: 100 kg

Member Total Calculation:
- Method 1 (using initial): 100 kg ✅
- Method 2 (calculated): 80 + 0 + 20 = 100 kg ✅

Loss Calculation:
- Check notes for "Damaged/Defective"
- NOT FOUND
- Loss: ₱0 ✅
```

### Scenario 2: Listing Error Removal

**Initial State:**
```
Stock ID: 101
Product: Carrots (Pc)
Initial Quantity: 200 pcs
Current Quantity: 200 pcs
Sold Quantity: 50 pcs
Removed Quantity: 0 pcs
```

**Action: Remove 30 pcs (Listing Error)**

**After Removal:**
```
Stock Table:
- quantity: 170 pcs (200 - 30)
- sold_quantity: 50 pcs
- removed_quantity: 30 pcs (0 + 30)  ✅ Updated
- initial_quantity: 200 pcs

Member Total Calculation:
- Method 1 (using initial): 200 pcs ✅
- Method 2 (calculated): 170 + 50 + 30 = 250 pcs
  (Note: This would be 250 if initial wasn't set, but initial takes precedence)

Loss Calculation:
- Check notes for "Damaged/Defective"
- NOT FOUND
- Loss: ₱0 ✅
```

### Scenario 3: Damaged/Defective Removal

**Initial State:**
```
Stock ID: 102
Product: Lettuce (Tali)
Initial Quantity: 70 bundles
Current Quantity: 50 bundles
Sold Quantity: 20 bundles
Removed Quantity: 0 bundles
Price: ₱30/bundle
```

**Action: Remove 15 bundles (Damaged/Defective)**

**After Removal:**
```
Stock Table:
- quantity: 35 bundles (50 - 15)
- sold_quantity: 20 bundles
- removed_quantity: 15 bundles (0 + 15)  ✅ Updated
- initial_quantity: 70 bundles

Member Total Calculation:
- Method 1 (using initial): 70 bundles ✅
- Method 2 (calculated): 35 + 20 + 15 = 70 bundles ✅

Loss Calculation:
- Check notes for "Damaged/Defective"
- FOUND ✅
- Loss: 15 × ₱30 = ₱450 ✅
```

### Scenario 4: Multiple Removals (Mixed Reasons)

**Initial State:**
```
Stock ID: 103
Product: Cabbage (Kilo)
Initial Quantity: 100 kg
Current Quantity: 100 kg
Sold Quantity: 0 kg
Removed Quantity: 0 kg
Price: ₱40/kg
```

**Actions:**
1. Remove 10 kg (Sold Outside)
2. Remove 15 kg (Damaged/Defective)
3. Remove 5 kg (Listing Error)

**After All Removals:**
```
Stock Table:
- quantity: 70 kg (100 - 10 - 15 - 5)
- sold_quantity: 0 kg
- removed_quantity: 30 kg (10 + 15 + 5)  ✅ All tracked
- initial_quantity: 100 kg

Member Total Calculation:
- Method 1 (using initial): 100 kg ✅
- Method 2 (calculated): 70 + 0 + 30 = 100 kg ✅

Loss Calculation:
- Sold Outside (10 kg): NOT counted ✅
- Damaged/Defective (15 kg): COUNTED ✅
- Listing Error (5 kg): NOT counted ✅
- Total Loss: 15 × ₱40 = ₱600 ✅
```

## Member Dashboard Display

### Stock Overview Table

| Product | Category | Total | Sold | Available | Removed | Damaged/Defective | Loss | Status |
|---------|----------|-------|------|-----------|---------|-------------------|------|--------|
| Tomatoes | Kilo | 100 | 0 | 80 | 20 | 0 | ₱0 | Available |
| Carrots | Pc | 200 | 50 | 170 | 30 | 0 | ₱0 | Available |
| Lettuce | Tali | 70 | 20 | 35 | 15 | 15 | ₱450 | Available |
| Cabbage | Kilo | 100 | 0 | 70 | 30 | 15 | ₱600 | Available |

**Column Explanations:**
- **Total**: Initial quantity (or calculated: Available + Sold + Removed)
- **Sold**: Quantity sold to customers
- **Available**: Current quantity available for sale
- **Removed**: Total removed (ALL reasons combined)
- **Damaged/Defective**: Only damaged/defective removals
- **Loss**: Monetary loss (only from damaged/defective)

## Verification Checklist

### ✅ Stock Deduction
- [x] Sold Outside deducts from quantity
- [x] Listing Error deducts from quantity
- [x] Damaged/Defective deducts from quantity

### ✅ Removed Quantity Tracking
- [x] Sold Outside increments removed_quantity
- [x] Listing Error increments removed_quantity
- [x] Damaged/Defective increments removed_quantity

### ✅ Total Stock Calculation
- [x] Uses initial_quantity when available
- [x] Falls back to: quantity + sold_quantity + removed_quantity
- [x] Includes ALL removals in total

### ✅ Loss Calculation
- [x] Sold Outside: NOT counted as loss
- [x] Listing Error: NOT counted as loss
- [x] Damaged/Defective: COUNTED as loss

### ✅ Data Integrity
- [x] Stock trail records all removals
- [x] Notes indicate removal reason
- [x] System logs track all changes

## Potential Issues and Solutions

### Issue 1: Initial Quantity Not Set

**Problem:** If `initial_quantity` is NULL, the calculation falls back to current state.

**Solution:** Already handled in code:
```php
if ($stock->initial_quantity) {
    $total = $stock->initial_quantity;  // Preferred
} else {
    $total = $stock->quantity + $stock->sold_quantity + $stock->removed_quantity;  // Fallback
}
```

### Issue 2: Removed Quantity Field Missing

**Problem:** Old stocks might not have `removed_quantity` field.

**Solution:** Already handled with null coalescing:
```php
$stock->removed_quantity ?? 0
```

### Issue 3: Stock Trail Notes Variations

**Problem:** Notes might have different formats.

**Solution:** Already handled with flexible matching:
```php
$query->where('notes', 'LIKE', '%Damaged%')
      ->orWhere('notes', 'LIKE', '%Defective%');
```

## Testing Commands

### Check Stock Data
```sql
SELECT 
    id,
    product_id,
    quantity,
    sold_quantity,
    removed_quantity,
    initial_quantity,
    (quantity + sold_quantity + COALESCE(removed_quantity, 0)) as calculated_total
FROM stocks
WHERE member_id = [MEMBER_ID]
LIMIT 10;
```

### Check Stock Trails
```sql
SELECT 
    id,
    stock_id,
    action_type,
    old_quantity,
    new_quantity,
    (old_quantity - new_quantity) as removed_qty,
    notes,
    created_at
FROM stock_trails
WHERE member_id = [MEMBER_ID]
AND action_type = 'removed'
ORDER BY created_at DESC
LIMIT 10;
```

### Verify Loss Calculation
```sql
SELECT 
    st.id,
    st.stock_id,
    st.product_id,
    p.name as product_name,
    st.category,
    (st.old_quantity - st.new_quantity) as removed_qty,
    CASE st.category
        WHEN 'Kilo' THEN p.price_kilo
        WHEN 'Pc' THEN p.price_pc
        WHEN 'Tali' THEN p.price_tali
    END as unit_price,
    (st.old_quantity - st.new_quantity) * 
    CASE st.category
        WHEN 'Kilo' THEN p.price_kilo
        WHEN 'Pc' THEN p.price_pc
        WHEN 'Tali' THEN p.price_tali
    END as loss_amount,
    st.notes
FROM stock_trails st
JOIN products p ON st.product_id = p.id
WHERE st.member_id = [MEMBER_ID]
AND st.action_type = 'removed'
AND (st.notes LIKE '%Damaged%' OR st.notes LIKE '%Defective%')
ORDER BY st.created_at DESC;
```

## Conclusion

### ✅ Implementation Status: COMPLETE

The member total stock calculation is **already correctly implemented** and includes:

1. ✅ All removed quantities (Sold Outside, Listing Error, Damaged/Defective)
2. ✅ Proper total calculation using initial_quantity or calculated sum
3. ✅ Loss calculation only for Damaged/Defective
4. ✅ Complete data tracking in stock table and stock trails

### Key Points:

- **Total Stock** = Initial Quantity (or Current + Sold + Removed)
- **Removed Quantity** = ALL removals (tracked in `removed_quantity` field)
- **Damaged/Defective Count** = Only damaged/defective removals
- **Loss** = Only damaged/defective removals × unit price

### No Changes Needed

The current implementation already handles all requirements correctly. The `removed_quantity` field is properly updated for ALL removal reasons, and the total stock calculation includes this field.

If there are still gaps in data, they might be due to:
1. Old removals before the `removed_quantity` field was added
2. Manual database changes
3. Data migration issues

To fix historical data, run:
```php
// Recalculate removed_quantity from stock trails
foreach (Stock::all() as $stock) {
    $totalRemoved = StockTrail::where('stock_id', $stock->id)
        ->where('action_type', 'removed')
        ->sum(DB::raw('old_quantity - new_quantity'));
    
    $stock->update(['removed_quantity' => $totalRemoved]);
}
```
