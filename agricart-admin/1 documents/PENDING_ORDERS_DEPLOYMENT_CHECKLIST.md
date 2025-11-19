# Pending Orders System - Deployment Checklist

## Pre-Deployment

### 1. Code Review
- [x] Stock model updated with new methods
- [x] CartController checkout updated
- [x] OrderController approve/reject updated
- [x] HomeController product queries updated
- [x] Migration file created
- [x] No syntax errors (diagnostics passed)

### 2. Database Backup
```bash
# Backup database before migration
php artisan db:backup
# Or manually backup via phpMyAdmin/MySQL
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Testing Environment
- [x] Test script executed successfully
- [x] All model methods verified
- [x] Stock calculations working correctly
- [ ] Manual testing in development environment

## Deployment Steps

### Step 1: Run Migration
```bash
php artisan migrate
```

**Expected Output:**
```
INFO  Running migrations.
2025_11_19_172510_add_pending_order_qty_to_stocks_table ... DONE
```

**Verify:**
```sql
DESCRIBE stocks;
-- Should show pending_order_qty column
```

### Step 2: Clear Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Step 3: Restart Services
```bash
# If using queue workers
php artisan queue:restart

# If using Laravel Octane
php artisan octane:reload
```

### Step 4: Verify Database
```sql
-- Check that all stocks have pending_order_qty = 0
SELECT COUNT(*) as total_stocks,
       SUM(CASE WHEN pending_order_qty = 0 THEN 1 ELSE 0 END) as zero_pending
FROM stocks;

-- Should show all stocks with 0 pending orders initially
```

## Post-Deployment Testing

### Test 1: Customer Checkout Flow
- [ ] Login as customer
- [ ] Browse products - verify stock displays
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Verify order created with status 'pending'
- [ ] Check database: `pending_order_qty` should be incremented

**SQL Check:**
```sql
SELECT s.id, s.quantity, s.pending_order_qty, s.sold_quantity,
       (s.quantity - s.pending_order_qty) as available_stock
FROM stocks s
WHERE s.pending_order_qty > 0;
```

### Test 2: Admin Order Approval
- [ ] Login as admin
- [ ] View pending orders
- [ ] Approve an order
- [ ] Verify stock decreased
- [ ] Verify sold_quantity increased
- [ ] Verify pending_order_qty decreased

**SQL Check:**
```sql
SELECT sa.id, sa.status, 
       s.quantity, s.pending_order_qty, s.sold_quantity
FROM sales_audit sa
JOIN audit_trail at ON sa.id = at.sale_id
JOIN stocks s ON at.stock_id = s.id
WHERE sa.id = [ORDER_ID];
```

### Test 3: Admin Order Rejection
- [ ] Create another test order
- [ ] Login as admin
- [ ] Reject the order
- [ ] Verify pending_order_qty decreased
- [ ] Verify stock quantity unchanged

**SQL Check:**
```sql
SELECT s.id, s.quantity, s.pending_order_qty, s.sold_quantity
FROM stocks s
WHERE s.id = [STOCK_ID];
```

### Test 4: Stock Addition
- [ ] Login as admin
- [ ] Add new stock to a product with pending orders
- [ ] Verify available stock increased
- [ ] Verify pending orders unchanged
- [ ] Customer can order from new stock

### Test 5: Multiple Concurrent Orders
- [ ] Open multiple browser sessions
- [ ] Login as different customers
- [ ] Order same product simultaneously
- [ ] Verify stock calculations are correct
- [ ] No negative available stock

## Monitoring

### Key Metrics to Watch

1. **Stock Consistency**
```sql
-- Check for any inconsistencies
SELECT s.id, s.product_id, s.quantity, s.pending_order_qty, s.sold_quantity,
       (s.quantity - s.pending_order_qty) as available_stock
FROM stocks s
WHERE (s.quantity - s.pending_order_qty) < 0;
-- Should return 0 rows
```

2. **Pending Orders**
```sql
-- Monitor pending orders
SELECT COUNT(*) as pending_orders,
       SUM(at.quantity) as total_pending_qty
FROM sales_audit sa
JOIN audit_trail at ON sa.id = at.sale_id
WHERE sa.status = 'pending';
```

3. **Stock Availability**
```sql
-- Products with low availability
SELECT p.name, s.category,
       s.quantity as physical_stock,
       s.pending_order_qty,
       (s.quantity - s.pending_order_qty) as available_stock
FROM stocks s
JOIN products p ON s.product_id = p.id
WHERE s.removed_at IS NULL
  AND (s.quantity - s.pending_order_qty) < 10
ORDER BY available_stock ASC;
```

### Log Files to Monitor
```bash
# Application logs
tail -f storage/logs/laravel.log

# Look for:
# - Stock update errors
# - Checkout failures
# - Order approval/rejection issues
```

## Rollback Procedure

If critical issues occur:

### Step 1: Revert Migration
```bash
php artisan migrate:rollback --step=1
```

### Step 2: Revert Code Changes
```bash
git revert [COMMIT_HASH]
# Or manually restore files from backup
```

### Step 3: Clear Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Step 4: Verify System
- [ ] Test customer checkout
- [ ] Test admin order management
- [ ] Verify stock displays correctly

## Success Criteria

- [x] Migration completed without errors
- [ ] All caches cleared
- [ ] Customer checkout works correctly
- [ ] Admin order approval/rejection works
- [ ] Stock displays accurately
- [ ] No negative available stock
- [ ] Pending orders tracked correctly
- [ ] No errors in logs
- [ ] Performance acceptable

## Known Issues & Solutions

### Issue 1: Negative Available Stock
**Symptom:** Available stock shows negative numbers
**Cause:** pending_order_qty > quantity
**Solution:** 
```php
$availableStock = max(0, $stock->quantity - $stock->pending_order_qty);
```

### Issue 2: Pending Orders Not Releasing
**Symptom:** pending_order_qty not decreasing on rejection
**Cause:** Wrong method called or transaction failed
**Solution:** Check logs, verify `processPendingOrderRejection()` is called

### Issue 3: Stock Not Decreasing on Approval
**Symptom:** Stock quantity unchanged after approval
**Cause:** `processPendingOrderApproval()` not called
**Solution:** Verify method is called in OrderController

## Support Contacts

- **Development Team:** [Your Team]
- **Database Admin:** [DBA Contact]
- **System Admin:** [SysAdmin Contact]

## Documentation

- [x] Implementation guide created
- [x] Quick reference created
- [x] Flow diagrams created
- [x] Deployment checklist created

## Sign-Off

- [ ] Development Team Lead: _________________ Date: _______
- [ ] QA Team Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] System Administrator: _________________ Date: _______

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** 1.0
**Status:** Ready for Production
