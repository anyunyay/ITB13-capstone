# Before vs After: Stock System Comparison

## System Behavior Comparison

### Scenario: Customer Orders 20 Units

#### BEFORE (Old System)
```
Initial State:
┌────────────────────────────┐
│ Stock: 100 units           │
│ Sold: 0 units              │
└────────────────────────────┘

Customer Checkout:
┌────────────────────────────┐
│ Stock: 80 units  ← Decreased immediately
│ Sold: 20 units   ← Increased immediately
└────────────────────────────┘

❌ Problem: Stock decreased before admin approval
❌ Problem: If rejected, need to reverse changes
❌ Problem: Confusing for customers
```

#### AFTER (New System)
```
Initial State:
┌────────────────────────────┐
│ Stock: 100 units           │
│ Pending: 0 units           │
│ Sold: 0 units              │
│ Available: 100 units       │
└────────────────────────────┘

Customer Checkout:
┌────────────────────────────┐
│ Stock: 100 units    ← Unchanged
│ Pending: 20 units   ← Increased
│ Sold: 0 units       ← Unchanged
│ Available: 80 units ← Decreased
└────────────────────────────┘

✅ Stock not decreased until approval
✅ Clear tracking of pending orders
✅ Accurate availability for customers
```

## Code Comparison

### CartController Checkout Method

#### BEFORE
```php
// Old approach - immediately decrease stock
foreach ($stocks as $stock) {
    $deduct = min($stock->quantity, $remainingQty);
    
    // Immediately decrease stock
    $stock->quantity -= $deduct;
    $stock->sold_quantity += $deduct;
    $stock->save();
    
    $remainingQty -= $deduct;
}
```

#### AFTER
```php
// New approach - track pending orders
foreach ($stocks as $stock) {
    $availableForThisStock = max(0, $stock->quantity - $stock->pending_order_qty);
    $deduct = min($availableForThisStock, $remainingQty);
    
    // Only increment pending orders
    $stock->incrementPendingOrders($deduct);
    
    $remainingQty -= $deduct;
}
```

### OrderController Approve Method

#### BEFORE
```php
// Old approach - stock already decreased
public function approve(Request $request, SalesAudit $order)
{
    // Stock was already decreased during checkout
    // Just update order status
    $order->update(['status' => 'approved']);
}
```

#### AFTER
```php
// New approach - decrease stock on approval
public function approve(Request $request, SalesAudit $order)
{
    foreach ($order->auditTrail as $trail) {
        if ($trail->stock) {
            // Now decrease stock and release pending
            $trail->stock->processPendingOrderApproval($trail->quantity);
            // This does:
            // - quantity -= qty
            // - sold_quantity += qty
            // - pending_order_qty -= qty
        }
    }
    
    $order->update(['status' => 'approved']);
}
```

### OrderController Reject Method

#### BEFORE
```php
// Old approach - need to reverse stock changes
public function reject(Request $request, SalesAudit $order)
{
    // Reverse the stock changes
    foreach ($order->auditTrail as $trail) {
        if ($trail->stock) {
            $trail->stock->quantity += $trail->quantity;
            $trail->stock->sold_quantity -= $trail->quantity;
            $trail->stock->save();
        }
    }
    
    $order->update(['status' => 'rejected']);
}
```

#### AFTER
```php
// New approach - just release pending orders
public function reject(Request $request, SalesAudit $order)
{
    foreach ($order->auditTrail as $trail) {
        if ($trail->stock) {
            // Simply release pending orders
            $trail->stock->processPendingOrderRejection($trail->quantity);
            // This does:
            // - pending_order_qty -= qty
            // (stock quantity unchanged)
        }
    }
    
    $order->update(['status' => 'rejected']);
}
```

## Customer Experience Comparison

### Scenario: Two Customers Order Same Product

#### BEFORE
```
Initial Stock: 100 units

Customer A orders 60 units:
├─ Stock immediately: 40 units
└─ Customer B sees: 40 units available

Admin rejects Customer A's order:
├─ Stock reverts to: 100 units
└─ Customer B confused: "Stock went back up?"

❌ Confusing stock changes
❌ Poor user experience
```

#### AFTER
```
Initial Stock: 100 units
Pending: 0 units
Available: 100 units

Customer A orders 60 units:
├─ Stock: 100 units (unchanged)
├─ Pending: 60 units
└─ Available: 40 units

Customer B sees: 40 units available
Customer B orders 30 units:
├─ Stock: 100 units (unchanged)
├─ Pending: 90 units
└─ Available: 10 units

Admin rejects Customer A's order:
├─ Stock: 100 units (unchanged)
├─ Pending: 30 units (released 60)
└─ Available: 70 units

✅ Clear and consistent
✅ No confusing reversals
✅ Accurate availability
```

## Admin Experience Comparison

### Scenario: Admin Adds Stock While Orders Pending

#### BEFORE
```
Current Stock: 20 units
Pending Order: 15 units (already deducted)

Admin adds 50 units:
├─ New Stock: 70 units
└─ But 15 already sold to pending order

Customer sees: 70 units
But 15 might be rejected and returned

❌ Unclear what's actually available
❌ Risk of overselling
```

#### AFTER
```
Current Stock: 20 units
Pending Orders: 15 units
Available: 5 units

Admin adds 50 units:
├─ New Stock: 70 units
├─ Pending: 15 units (unchanged)
└─ Available: 55 units

Customer sees: 55 units (accurate!)

✅ Clear separation of pending vs available
✅ New stock immediately available
✅ No risk of overselling
```

## Database State Comparison

### BEFORE (Old Schema)
```sql
CREATE TABLE stocks (
    id BIGINT PRIMARY KEY,
    product_id BIGINT,
    quantity DECIMAL(10,2),      -- Decreased on checkout
    sold_quantity DECIMAL(10,2), -- Increased on checkout
    member_id BIGINT,
    category VARCHAR(255)
);

-- Problem: Can't distinguish between:
-- - Actually sold stock
-- - Pending order stock
```

### AFTER (New Schema)
```sql
CREATE TABLE stocks (
    id BIGINT PRIMARY KEY,
    product_id BIGINT,
    quantity DECIMAL(10,2),           -- Physical stock
    pending_order_qty DECIMAL(10,2),  -- Reserved by pending orders
    sold_quantity DECIMAL(10,2),      -- Actually sold
    member_id BIGINT,
    category VARCHAR(255)
);

-- Clear separation:
-- - quantity: Physical inventory
-- - pending_order_qty: Reserved but not sold
-- - sold_quantity: Actually sold
-- - available: quantity - pending_order_qty
```

## Query Comparison

### Get Available Stock

#### BEFORE
```php
// Simple but inaccurate
$availableStock = Stock::where('product_id', $productId)
    ->where('category', $category)
    ->sum('quantity');

// Problem: Doesn't account for pending orders
```

#### AFTER
```php
// Accurate with pending orders
$availableStock = Stock::where('product_id', $productId)
    ->where('category', $category)
    ->get()
    ->sum(function($stock) {
        return max(0, $stock->quantity - $stock->pending_order_qty);
    });

// Accurate: Accounts for pending orders
```

## Performance Comparison

### BEFORE
```
Checkout:
├─ Update stock quantity (1 query per stock)
├─ Update sold quantity (1 query per stock)
└─ Create order record

Rejection:
├─ Reverse stock quantity (1 query per stock)
├─ Reverse sold quantity (1 query per stock)
└─ Update order status

Total: 4 queries per stock on rejection
```

### AFTER
```
Checkout:
├─ Increment pending_order_qty (1 query per stock)
└─ Create order record

Approval:
├─ Process approval (1 transaction per stock)
│  ├─ Decrease quantity
│  ├─ Increase sold_quantity
│  └─ Decrease pending_order_qty
└─ Update order status

Rejection:
├─ Decrement pending_order_qty (1 query per stock)
└─ Update order status

Total: 2 queries per stock on rejection
✅ 50% fewer queries on rejection
```

## Error Handling Comparison

### BEFORE
```
Checkout → Stock decreased
Order pending
Admin rejects
Need to reverse stock changes

❌ If reversal fails:
   - Stock permanently decreased
   - Data inconsistency
   - Manual correction needed
```

### AFTER
```
Checkout → Pending increased
Order pending
Admin rejects
Release pending orders

✅ If release fails:
   - Stock unchanged
   - Only pending affected
   - Easy to retry
   - No data loss
```

## Summary of Improvements

### Technical
| Aspect | Before | After |
|--------|--------|-------|
| Stock tracking | Immediate deduction | Pending orders |
| Data integrity | Risk of inconsistency | Better separation |
| Error handling | Complex reversals | Simple releases |
| Query efficiency | More queries on rejection | Fewer queries |
| Code clarity | Mixed concerns | Clear separation |

### User Experience
| Aspect | Before | After |
|--------|--------|-------|
| Stock display | Confusing changes | Consistent display |
| Availability | Inaccurate | Accurate |
| Admin flexibility | Limited | High |
| Customer trust | Lower | Higher |
| Order management | Complex | Straightforward |

### Business Impact
| Metric | Before | After |
|--------|--------|-------|
| Inventory accuracy | Medium | High |
| Customer satisfaction | Lower | Higher |
| Admin efficiency | Lower | Higher |
| Data reliability | Medium | High |
| System maintainability | Complex | Simple |

---

**Conclusion:** The new pending orders system provides clearer separation of concerns, better data integrity, improved user experience, and more accurate stock tracking compared to the old system.

**Version:** 1.0
**Date:** November 19, 2025
