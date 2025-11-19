# Pending Orders System - Quick Reference

## Formula

```
Available Stock = Current Stock - Pending Order Quantity
```

## Key Concepts

### Stock States

| State | Description | Formula |
|-------|-------------|---------|
| **Physical Stock** | Actual inventory | `quantity` |
| **Pending Orders** | Reserved by unapproved orders | `pending_order_qty` |
| **Available Stock** | What customers can order | `quantity - pending_order_qty` |
| **Sold Stock** | Historical sales | `sold_quantity` |

## Workflow

### Customer Checkout
```
1. Customer adds items to cart
2. Customer clicks checkout
3. System checks: available_stock >= order_quantity
4. If yes: pending_order_qty += order_quantity
5. Order status = 'pending'
6. Available stock decreases for other customers
```

### Admin Approves Order
```
1. Admin clicks approve
2. System executes:
   - quantity -= order_quantity
   - sold_quantity += order_quantity
   - pending_order_qty -= order_quantity
3. Order status = 'approved'
4. Available stock remains same (already accounted for)
```

### Admin Rejects Order
```
1. Admin clicks reject
2. System executes:
   - pending_order_qty -= order_quantity
3. Order status = 'rejected'
4. Available stock increases (released)
```

### Admin Adds Stock
```
1. Admin adds new stock
2. System executes:
   - quantity += new_stock
3. Available stock immediately increases
4. Pending orders unaffected
```

## Code Examples

### Check Available Stock
```php
$availableStock = $stock->quantity - $stock->pending_order_qty;
```

### Increment Pending Orders (Checkout)
```php
$stock->incrementPendingOrders($quantity);
```

### Process Approval
```php
$stock->processPendingOrderApproval($quantity);
// Decreases stock, increases sold, decreases pending
```

### Process Rejection
```php
$stock->processPendingOrderRejection($quantity);
// Decreases pending only
```

## Database Queries

### Get Available Stock by Product
```sql
SELECT 
    p.name,
    s.category,
    s.quantity as physical_stock,
    s.pending_order_qty,
    (s.quantity - s.pending_order_qty) as available_stock
FROM stocks s
JOIN products p ON s.product_id = p.id
WHERE s.removed_at IS NULL
ORDER BY p.name, s.category;
```

### Find Products with High Pending Orders
```sql
SELECT 
    p.name,
    s.category,
    s.quantity,
    s.pending_order_qty,
    ROUND((s.pending_order_qty / s.quantity * 100), 2) as pending_percentage
FROM stocks s
JOIN products p ON s.product_id = p.id
WHERE s.removed_at IS NULL
  AND s.quantity > 0
  AND (s.pending_order_qty / s.quantity) > 0.5
ORDER BY pending_percentage DESC;
```

### Check Pending Orders by Customer
```sql
SELECT 
    sa.id as order_id,
    u.name as customer_name,
    p.name as product_name,
    at.category,
    at.quantity,
    sa.status,
    sa.created_at
FROM sales_audit sa
JOIN users u ON sa.customer_id = u.id
JOIN audit_trail at ON sa.id = at.sale_id
JOIN products p ON at.product_id = p.id
WHERE sa.status = 'pending'
ORDER BY sa.created_at DESC;
```

## Troubleshooting

### Issue: Available stock shows negative
**Cause:** pending_order_qty > quantity
**Solution:** 
```php
$availableStock = max(0, $stock->quantity - $stock->pending_order_qty);
```

### Issue: Stock not updating after approval
**Check:**
1. Verify `processPendingOrderApproval()` is called
2. Check database transaction completed
3. Review system logs for errors

### Issue: Pending orders not releasing on rejection
**Check:**
1. Verify `processPendingOrderRejection()` is called
2. Check order status is 'pending' not 'approved'
3. Review audit trail records

## Testing Commands

### Check Stock Status
```bash
php artisan tinker
```
```php
$stock = Stock::find(1);
echo "Physical: {$stock->quantity}\n";
echo "Pending: {$stock->pending_order_qty}\n";
echo "Available: " . ($stock->quantity - $stock->pending_order_qty) . "\n";
```

### Simulate Checkout
```php
$stock = Stock::find(1);
$stock->incrementPendingOrders(5);
$stock->refresh();
echo "Pending after checkout: {$stock->pending_order_qty}\n";
```

### Simulate Approval
```php
$stock = Stock::find(1);
$stock->processPendingOrderApproval(5);
$stock->refresh();
echo "Stock: {$stock->quantity}, Sold: {$stock->sold_quantity}, Pending: {$stock->pending_order_qty}\n";
```

## API Response Format

### Product with Stock
```json
{
  "id": 1,
  "name": "Tomato",
  "stock_by_category": {
    "Kilo": 45.5,    // This is available stock (quantity - pending_order_qty)
    "Pc": 100
  }
}
```

### Cart Item
```json
{
  "item_id": 1,
  "product_id": 5,
  "name": "Tomato",
  "category": "Kilo",
  "quantity": 2.5,
  "available_stock": 45.5,  // quantity - pending_order_qty
  "total_price": 125.00
}
```

## Important Notes

1. **Always use available stock for customer-facing displays**
   ```php
   $available = $stock->quantity - $stock->pending_order_qty;
   ```

2. **Never decrease stock on checkout**
   ```php
   // ❌ Wrong
   $stock->decrement('quantity', $orderQty);
   
   // ✅ Correct
   $stock->incrementPendingOrders($orderQty);
   ```

3. **Use transactions for approval**
   ```php
   DB::transaction(function () use ($stock, $quantity) {
       $stock->processPendingOrderApproval($quantity);
   });
   ```

4. **Handle race conditions**
   - Use database locks when checking availability
   - Validate stock in transaction
   - Recheck before final commit

## Performance Tips

1. **Eager load stocks with products**
   ```php
   Product::with(['stocks' => function($query) {
       $query->customerVisible();
   }])->get();
   ```

2. **Cache available stock calculations**
   ```php
   Cache::remember("product_{$id}_available_stock", 60, function() {
       return $this->calculateAvailableStock();
   });
   ```

3. **Index pending_order_qty column**
   ```php
   $table->index('pending_order_qty');
   ```

---

**Last Updated:** November 19, 2025
**Version:** 1.0
