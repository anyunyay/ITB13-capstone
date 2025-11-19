# Pending Orders System - Quick Start Guide

## What Is This?

A system that tracks pending customer orders without immediately decreasing stock. Stock is only deducted when admin approves the order.

## The Formula

```
Available Stock = Current Stock - Pending Orders
```

## Quick Example

```
You have 100 apples in stock.
Customer orders 20 apples.

Old way:
  Stock: 80 apples (decreased immediately)
  Problem: What if admin rejects?

New way:
  Stock: 100 apples (unchanged)
  Pending: 20 apples (reserved)
  Available: 80 apples (what customers see)
  ✅ Stock only decreases when admin approves
```

## For Developers

### Check Available Stock
```php
$available = $stock->quantity - $stock->pending_order_qty;
```

### Customer Checkout
```php
$stock->incrementPendingOrders($quantity);
```

### Admin Approves
```php
$stock->processPendingOrderApproval($quantity);
```

### Admin Rejects
```php
$stock->processPendingOrderRejection($quantity);
```

## For Testers

### Test Checkout
1. Login as customer
2. Add items to cart
3. Checkout
4. Check database: `pending_order_qty` should increase
5. Check frontend: available stock should decrease

### Test Approval
1. Login as admin
2. View pending orders
3. Approve an order
4. Check database:
   - `quantity` decreased
   - `sold_quantity` increased
   - `pending_order_qty` decreased

### Test Rejection
1. Create test order
2. Login as admin
3. Reject the order
4. Check database:
   - `quantity` unchanged
   - `pending_order_qty` decreased

## For Admins

### What You'll See
- Orders show as "pending" until you approve/reject
- Stock doesn't decrease until you approve
- You can add new stock while orders are pending
- New stock is immediately available to customers

### What Changed
- **Before:** Stock decreased when customer ordered
- **After:** Stock decreases when you approve

### Benefits
- More control over inventory
- Can add stock while orders pending
- Clear visibility of pending vs available
- No confusing stock reversals

## Database Check

```sql
-- View stock status
SELECT 
    p.name,
    s.category,
    s.quantity as physical_stock,
    s.pending_order_qty,
    (s.quantity - s.pending_order_qty) as available_stock
FROM stocks s
JOIN products p ON s.product_id = p.id
WHERE s.removed_at IS NULL;
```

## Common Questions

**Q: What happens if I add stock while orders are pending?**
A: New stock is immediately available. Pending orders stay reserved.

**Q: Can customers order more than available stock?**
A: No. System validates against available stock (quantity - pending).

**Q: What if I reject an order?**
A: Pending quantity decreases, stock unchanged, available stock increases.

**Q: What if I approve an order?**
A: Stock decreases, sold increases, pending decreases.

**Q: Can I see pending orders?**
A: Yes, in the admin orders page (status = pending).

## Files to Review

1. **Implementation Guide:** `REAL_TIME_STOCK_AVAILABILITY_IMPLEMENTATION.md`
2. **Quick Reference:** `PENDING_ORDERS_QUICK_REFERENCE.md`
3. **Flow Diagrams:** `PENDING_ORDERS_FLOW_DIAGRAM.md`
4. **Before/After:** `BEFORE_AFTER_STOCK_SYSTEM_COMPARISON.md`
5. **Deployment:** `PENDING_ORDERS_DEPLOYMENT_CHECKLIST.md`

## Need Help?

- Check the logs: `storage/logs/laravel.log`
- Review documentation files above
- Contact development team

## Status

✅ **Implemented and Tested**
- Database migration: Complete
- Code changes: Complete
- Automated tests: Passed
- Documentation: Complete

⏳ **Pending**
- Manual testing
- QA review
- Production deployment

---

**Version:** 1.0
**Last Updated:** November 19, 2025
