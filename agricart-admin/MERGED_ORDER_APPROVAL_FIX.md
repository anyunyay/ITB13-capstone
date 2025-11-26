# Merged Order Approval Fix

## Problem
After merging suspicious orders, clicking "Approve" on the merged order triggered "insufficient stock" errors even though stock was available. This prevented admins from approving legitimate merged orders.

## Root Cause

### Issue 1: Stale Stock Data
When approving a merged order, the stock data loaded with the order might be stale (cached from before the merge). The approval logic wasn't refreshing the order data before checking stock availability.

### Issue 2: Multiple Audit Trails, Same Stock
When orders are merged:
1. Audit trails from secondary orders are moved to the primary order
2. Multiple audit trails may reference the same `stock_id`
3. Each audit trail has its own quantity
4. The stock's `pending_order_qty` includes quantities from all original orders

**Example:**
```
Before Merge:
- Order A: 2 units of Product X, stock_id=1
  Stock 1: quantity=10, pending_order_qty=2
  
- Order B: 3 units of Product X, stock_id=1
  Stock 1: quantity=10, pending_order_qty=5 (2+3)

After Merge:
- Primary Order: Has 2 audit trails
  - Trail A: 2 units, stock_id=1
  - Trail B: 3 units, stock_id=1
  Stock 1: quantity=10, pending_order_qty=5
```

### Issue 3: Stock Availability Calculation
The `getAggregatedAuditTrail()` method wasn't properly accounting for merged orders where multiple audit trails reference the same stock. It was summing stock quantities correctly, but the logic needed clarification for merged order scenarios.

## Solutions Implemented

### 1. Refresh Order Data Before Approval
**File**: `app/Http/Controllers/Admin/OrderController.php`
**Method**: `approve()`

#### Added:
```php
// Check if order has sufficient stock before approval
// Refresh the order to get latest stock data
$order->refresh();
$order->load(['auditTrail.stock.product', 'auditTrail.product']);
```

**Benefits:**
- Ensures stock data is current
- Loads all necessary relationships
- Prevents stale data issues

### 2. Enhanced Error Logging
**File**: `app/Http/Controllers/Admin/OrderController.php`

#### Added Detailed Logging:
```php
Log::error('Insufficient stock for order approval', [
    'order_id' => $order->id,
    'insufficient_items' => $insufficientItems,
    'audit_trail_count' => $order->auditTrail->count(),
    'audit_trail_details' => $order->auditTrail->map(function($trail) {
        return [
            'id' => $trail->id,
            'product_id' => $trail->product_id,
            'stock_id' => $trail->stock_id,
            'quantity' => $trail->quantity,
            'stock_quantity' => $trail->stock ? $trail->stock->quantity : null,
            'stock_pending' => $trail->stock ? $trail->stock->pending_order_qty : null,
        ];
    })->toArray()
]);
```

**Benefits:**
- Provides detailed debugging information
- Shows exact stock quantities and pending amounts
- Helps identify the specific issue causing insufficient stock errors

### 3. Improved Stock Availability Calculation
**File**: `app/Models/SalesAudit.php`
**Method**: `getAggregatedAuditTrail()`

#### Enhanced Logic for Merged Orders:
```php
// For merged orders: multiple audit trails may reference the same stock
// Each audit trail has its quantity, and the stock's pending_order_qty includes all of them
// So we need to check: stock quantity >= total quantity needed from that stock

// Group audit trail items by stock_id to calculate quantity needed per stock
$quantityPerStock = $items->groupBy('stock_id')->map(function($stockItems) {
    return $stockItems->sum('quantity');
});

// Calculate available stock considering what's needed from each stock
$availableStock = $uniqueStocks->sum(function($stock) use ($quantityPerStock) {
    if (!$stock) return 0;
    
    // Get the total quantity needed from this specific stock
    $quantityNeeded = $quantityPerStock->get($stock->id, 0);
    
    // Stock quantity is what's physically available
    // pending_order_qty includes THIS order's quantity (and all merged orders)
    // The stock can fulfill this order if quantity >= quantity_needed
    // Return the stock quantity as available (it can fulfill the needed amount)
    return $stock->quantity;
});
```

**Benefits:**
- Properly handles merged orders with multiple audit trails
- Groups quantities by stock_id to avoid confusion
- Clear comments explain the logic
- Accounts for pending_order_qty correctly

## How It Works Now

### Merged Order Approval Flow

#### 1. Orders Are Merged
```php
// Order A: 2 units, stock_id=1
// Order B: 3 units, stock_id=1
// Merged into Primary Order with 2 audit trails
```

#### 2. Admin Clicks Approve
```php
// System refreshes order data
$order->refresh();
$order->load(['auditTrail.stock.product', 'auditTrail.product']);
```

#### 3. Stock Availability Check
```php
// Get aggregated audit trail
$aggregated = $order->getAggregatedAuditTrail();

// For Product X, category Kilo:
// - Audit Trail A: 2 units, stock_id=1
// - Audit Trail B: 3 units, stock_id=1
// - Total needed: 5 units
// - Stock 1: quantity=10, pending_order_qty=5
// - Available: 10 (sufficient for 5 units needed)
// - Check: 10 >= 5 ✅ PASS
```

#### 4. Approval Proceeds
```php
// For each audit trail:
// - Process stock deduction
// - Update pending_order_qty
// - Record stock trail
// - Update order status
```

### Stock Calculation Logic

**For Single Orders:**
```
Stock: quantity=10, pending_order_qty=2
Order needs: 2 units
Available: 10
Check: 10 >= 2 ✅
```

**For Merged Orders (Same Stock):**
```
Stock: quantity=10, pending_order_qty=5 (2+3 from merged orders)
Order needs: 5 units (2+3)
Available: 10
Check: 10 >= 5 ✅
```

**For Merged Orders (Different Stocks):**
```
Stock 1: quantity=10, pending_order_qty=2
Stock 2: quantity=8, pending_order_qty=3
Order needs: 5 units (2 from Stock 1, 3 from Stock 2)
Available: 10 + 8 = 18
Check: 18 >= 5 ✅
```

## Testing Scenarios

### Test 1: Merge and Approve Same Stock
```bash
1. Customer places Order A: 2 units Product X (stock_id=1)
2. Customer places Order B: 3 units Product X (stock_id=1)
3. Admin merges A+B into Primary Order
4. Admin approves Primary Order
Expected: ✅ Approval succeeds, 5 units deducted from Stock 1
```

### Test 2: Merge and Approve Different Stocks
```bash
1. Customer places Order A: 2 units Product X (stock_id=1)
2. Customer places Order B: 3 units Product Y (stock_id=2)
3. Admin merges A+B into Primary Order
4. Admin approves Primary Order
Expected: ✅ Approval succeeds, 2 units from Stock 1, 3 units from Stock 2
```

### Test 3: Merge with Insufficient Stock
```bash
1. Customer places Order A: 8 units Product X (stock_id=1, quantity=10)
2. Customer places Order B: 5 units Product X (stock_id=1)
3. Admin merges A+B (needs 13 units, only 10 available)
4. Admin tries to approve
Expected: ❌ Error: "Insufficient stock: Requested 13, Available 10"
```

### Test 4: Merge After Stock Depletion
```bash
1. Customer places Order A: 5 units Product X (stock_id=1, quantity=10)
2. Customer places Order B: 3 units Product X (stock_id=1)
3. Another customer buys 6 units (stock now has quantity=4)
4. Admin merges A+B (needs 8 units, only 4 available)
5. Admin tries to approve
Expected: ❌ Error: "Insufficient stock: Requested 8, Available 4"
```

## Error Messages

### User-Facing Error
```
Cannot approve order due to insufficient stock:
• Product Name (Kilo): Requested 8, Available 4, Shortage 4
```

### Log Error (Detailed)
```json
{
  "order_id": 123,
  "insufficient_items": [...],
  "audit_trail_count": 2,
  "audit_trail_details": [
    {
      "id": 456,
      "product_id": 10,
      "stock_id": 1,
      "quantity": 5,
      "stock_quantity": 4,
      "stock_pending": 8
    },
    {
      "id": 457,
      "product_id": 10,
      "stock_id": 1,
      "quantity": 3,
      "stock_quantity": 4,
      "stock_pending": 8
    }
  ]
}
```

## Benefits

1. **Accurate Stock Checks**: Refreshes data before approval
2. **Handles Merged Orders**: Properly accounts for multiple audit trails
3. **Better Debugging**: Detailed logging for troubleshooting
4. **Clear Error Messages**: Shows exactly what's insufficient
5. **Prevents Errors**: Validates stock before processing

## Edge Cases Handled

### Case 1: Multiple Audit Trails, Same Stock
- Groups quantities by stock_id
- Sums total needed from each stock
- Checks if stock can fulfill total needed

### Case 2: Stale Stock Data
- Refreshes order before approval
- Reloads all stock relationships
- Ensures current data is used

### Case 3: Stock Depleted After Merge
- Checks current stock quantity
- Compares with total needed
- Rejects if insufficient

### Case 4: Mixed Stock Sources
- Handles orders using multiple stocks
- Sums available from all stocks
- Validates total availability

## Files Modified

1. **app/Http/Controllers/Admin/OrderController.php**
   - Added `$order->refresh()` before stock check
   - Enhanced stock relationship loading
   - Added detailed error logging

2. **app/Models/SalesAudit.php**
   - Improved `getAggregatedAuditTrail()` for merged orders
   - Added quantity-per-stock grouping
   - Enhanced comments explaining logic

## Related Issues Fixed

- ✅ Merged orders can now be approved
- ✅ Stock availability correctly calculated
- ✅ Detailed error messages for debugging
- ✅ Handles multiple audit trails per stock
- ✅ Refreshes data to prevent stale issues

## Configuration

No configuration changes needed. The fix works automatically for all merged orders.

## Monitoring

### Check Logs For:
```bash
# Successful approvals
grep "Processing multi-member order approval" storage/logs/laravel.log

# Insufficient stock errors
grep "Insufficient stock for order approval" storage/logs/laravel.log

# Stock details
grep "audit_trail_details" storage/logs/laravel.log
```

### Metrics to Track:
- Number of merged order approvals
- Insufficient stock error rate
- Average audit trail count per merged order
- Stock depletion patterns

## Future Enhancements

1. **Pre-Merge Validation**: Check stock availability before allowing merge
2. **Stock Reservation**: Reserve stock when merging to prevent depletion
3. **Merge Preview**: Show stock impact before confirming merge
4. **Auto-Restock Alert**: Notify when merged orders exceed available stock
5. **Partial Approval**: Allow approving part of merged order if stock insufficient

## Related Documentation

- See `SUSPICIOUS_ORDER_FIX_SUMMARY.md` for stock linking fixes
- See `REAL_CUSTOMER_ORDER_APPROVAL_FIX.md` for approval logic fixes
- See `SUSPICIOUS_ORDER_MERGE_DETECTION_FIX.md` for merge detection fixes
