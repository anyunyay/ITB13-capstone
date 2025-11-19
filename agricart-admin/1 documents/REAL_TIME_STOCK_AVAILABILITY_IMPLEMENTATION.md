# Real-Time Stock Availability with Pending Orders Implementation

## Overview

This implementation ensures that product stock displays accurately reflect real-time availability by accounting for pending customer orders. The system now shows:

**Available Stock = Current Stock in Database - Pending Order Quantities**

## Key Features

### 1. **Pending Order Tracking**
- When customers checkout, stock is NOT immediately decreased
- Instead, a `pending_order_qty` counter is incremented on each stock record
- This reserves stock for pending orders without actually deducting it

### 2. **Real-Time Stock Calculation**
- Frontend displays: `Available Stock = stock - pending_order_qty`
- Customers see accurate availability that accounts for unapproved orders
- Admin stock additions are immediately reflected in available stock

### 3. **Order Approval/Rejection Flow**
- **On Approval**: Stock is decreased, sold_quantity increased, pending_order_qty decreased
- **On Rejection**: pending_order_qty is decreased, stock remains unchanged
- Stock is never prematurely reserved

## Database Changes

### Migration: `add_pending_order_qty_to_stocks_table`

```php
Schema::table('stocks', function (Blueprint $table) {
    $table->decimal('pending_order_qty', 10, 2)->default(0)->after('sold_quantity');
});
```

**New Field:**
- `pending_order_qty`: Tracks the quantity reserved by pending orders

## Backend Changes

### 1. Stock Model (`app/Models/Stock.php`)

**New Methods:**

```php
// Get available quantity for customers
public function getCustomerAvailableQuantityAttribute()
{
    return max(0, $this->quantity - $this->pending_order_qty);
}

// Increment pending orders when customer checks out
public function incrementPendingOrders($quantity)
{
    $this->increment('pending_order_qty', $quantity);
}

// Decrement pending orders when order is rejected
public function decrementPendingOrders($quantity)
{
    $this->decrement('pending_order_qty', max(0, $quantity));
}

// Process order approval - convert pending to sold
public function processPendingOrderApproval($quantity)
{
    DB::transaction(function () use ($quantity) {
        $this->decrement('quantity', $quantity);
        $this->increment('sold_quantity', $quantity);
        $this->decrement('pending_order_qty', $quantity);
    });
}

// Process order rejection - release pending stock
public function processPendingOrderRejection($quantity)
{
    $this->decrement('pending_order_qty', $quantity);
}
```

### 2. CartController (`app/Http/Controllers/Customer/CartController.php`)

**Checkout Method Updates:**

```php
// Calculate available stock considering pending orders
$totalAvailable = $stocks->sum(function($stock) {
    return max(0, $stock->quantity - $stock->pending_order_qty);
});

// When processing checkout, increment pending orders instead of decreasing stock
foreach ($stocks as $stock) {
    $availableForThisStock = max(0, $stock->quantity - $stock->pending_order_qty);
    if ($availableForThisStock <= 0) continue;
    $deduct = min($availableForThisStock, $remainingQty);
    
    // Increment pending order quantity
    $stock->incrementPendingOrders($deduct);
    
    // ... rest of checkout logic
}
```

**Cart Index Method:**
- Updated to calculate available stock considering pending orders
- Returns accurate stock availability to frontend

**Update Cart Item Method:**
- Validates against available stock (quantity - pending_order_qty)
- Prevents customers from adding more than available

### 3. OrderController (`app/Http/Controllers/Admin/OrderController.php`)

**Approve Method:**

```php
// Process pending order approval
$trail->stock->processPendingOrderApproval($trail->quantity);
```

This single method call:
1. Decreases actual stock
2. Increases sold quantity
3. Decreases pending_order_qty

**Reject Method:**

```php
if ($order->status === 'approved') {
    // Reverse stock changes if already approved
    // ... reversal logic
} else {
    // Release pending order quantity
    $trail->stock->processPendingOrderRejection($trail->quantity);
}
```

### 4. HomeController (`app/Http/Controllers/Customer/HomeController.php`)

**Product Stock Calculation:**

```php
$products->each(function ($product) {
    $stockSums = $product->stocks
        ->groupBy('category')
        ->map(function($group) {
            // Calculate available stock = quantity - pending_order_qty
            return $group->sum(function($stock) {
                return max(0, $stock->quantity - $stock->pending_order_qty);
            });
        });

    $product->stock_by_category = $stockSums;
});
```

Applied to:
- `index()` - Home page
- `produce()` - Products page
- `search()` - Product search

## Frontend Integration

### Current Implementation

The frontend already receives `stock_by_category` from the backend, which now includes the pending order calculation. No frontend changes are required as the calculation happens server-side.

### Data Flow

1. **Customer Views Products**
   - Backend calculates: `available_stock = quantity - pending_order_qty`
   - Frontend displays this calculated value

2. **Customer Adds to Cart**
   - Validates against available stock
   - Optimistic UI updates

3. **Customer Checks Out**
   - Backend increments `pending_order_qty`
   - Stock quantity remains unchanged
   - Available stock decreases for other customers

4. **Admin Approves Order**
   - Stock quantity decreases
   - Sold quantity increases
   - Pending order quantity decreases
   - Available stock remains the same (already accounted for)

5. **Admin Rejects Order**
   - Pending order quantity decreases
   - Stock quantity unchanged
   - Available stock increases (released back)

6. **Admin Adds New Stock**
   - Stock quantity increases
   - Available stock immediately increases
   - Pending orders unaffected

## Benefits

### 1. **Real-Time Accuracy**
- Customers always see accurate stock availability
- No confusion from stock appearing to "revert" after checkout
- Pending orders are properly accounted for

### 2. **No Premature Reservation**
- Stock is only deducted when admin approves
- Rejected orders don't affect actual stock
- Inventory remains accurate

### 3. **Smooth User Experience**
- Optimistic updates work correctly
- Stock displays update in real-time
- No unexpected stock availability changes

### 4. **Admin Flexibility**
- Can add stock while orders are pending
- New stock is immediately available
- Clear visibility of pending vs available stock

## Testing Checklist

### Customer Flow
- [ ] View products - stock displays correctly
- [ ] Add to cart - validates against available stock
- [ ] Checkout - pending_order_qty increments
- [ ] View products after checkout - available stock decreased
- [ ] Another customer cannot order beyond available stock

### Admin Flow
- [ ] View pending order - shows correct quantities
- [ ] Approve order - stock decreases, pending_order_qty decreases
- [ ] Reject order - pending_order_qty decreases, stock unchanged
- [ ] Add new stock - available stock increases immediately
- [ ] View inventory - shows actual stock and pending orders

### Edge Cases
- [ ] Multiple pending orders for same product
- [ ] Order approval with insufficient stock (should fail)
- [ ] Order rejection after approval (reverses stock)
- [ ] Concurrent checkouts (race conditions handled)
- [ ] Stock reaches zero with pending orders

## Database Schema

### stocks Table

| Field | Type | Description |
|-------|------|-------------|
| quantity | decimal(10,2) | Current physical stock |
| sold_quantity | decimal(10,2) | Total sold (historical) |
| **pending_order_qty** | **decimal(10,2)** | **Reserved by pending orders** |
| initial_quantity | decimal(10,2) | Original stock amount |

**Available Stock Formula:**
```
available_stock = quantity - pending_order_qty
```

## Migration Instructions

1. **Run Migration:**
   ```bash
   php artisan migrate
   ```

2. **Verify Database:**
   ```sql
   SELECT id, quantity, pending_order_qty, sold_quantity 
   FROM stocks 
   LIMIT 10;
   ```

3. **Test Checkout Flow:**
   - Create test order
   - Verify pending_order_qty increments
   - Approve order
   - Verify stock decreases and pending_order_qty decreases

4. **Monitor Logs:**
   - Check for any stock update errors
   - Verify audit trails are created correctly

## Rollback Plan

If issues occur:

1. **Revert Migration:**
   ```bash
   php artisan migrate:rollback
   ```

2. **Revert Code Changes:**
   - Restore CartController checkout method
   - Restore OrderController approve/reject methods
   - Restore HomeController product queries
   - Restore Stock model

3. **Clear Cache:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

## Future Enhancements

1. **Admin Dashboard:**
   - Show pending order quantities in inventory view
   - Add "Reserved Stock" column
   - Display pending vs available stock

2. **Reporting:**
   - Include pending orders in stock reports
   - Track pending order trends
   - Alert on high pending order ratios

3. **Automatic Cleanup:**
   - Release pending orders after X days
   - Notify customers of expired reservations
   - Auto-reject stale orders

## Support

For issues or questions:
- Check system logs: `storage/logs/laravel.log`
- Review audit trails in database
- Contact development team

---

**Implementation Date:** November 19, 2025
**Version:** 1.0
**Status:** ✅ Complete
