# Stock Zero Auto-Trail Testing Checklist

## Pre-Testing Setup

- [ ] Backup your database
- [ ] Ensure you have test data (products, stocks, users)
- [ ] Clear browser cache and refresh the application

## 1. Stock Locking Tests

### Test 1.1: Stock Reaches Zero Through Order
- [ ] Create a stock with quantity = 5
- [ ] Create an order for 5 units
- [ ] Approve the order
- [ ] **Expected:** Stock quantity = 0, sold_quantity = 5
- [ ] **Expected:** Stock Trail entry created with action 'completed'
- [ ] **Expected:** Stock shows as locked in UI
- [ ] **Expected:** Edit button is disabled
- [ ] **Expected:** Remove button is disabled

### Test 1.2: Partial Stock Sale
- [ ] Create a stock with quantity = 10
- [ ] Create an order for 5 units
- [ ] Approve the order
- [ ] **Expected:** Stock quantity = 5, sold_quantity = 5
- [ ] **Expected:** No Stock Trail entry created
- [ ] **Expected:** Stock remains editable
- [ ] **Expected:** Edit and Remove buttons are enabled

### Test 1.3: Multiple Orders to Zero
- [ ] Create a stock with quantity = 10
- [ ] Create order 1 for 7 units, approve it
- [ ] Create order 2 for 3 units, approve it
- [ ] **Expected:** Stock quantity = 0, sold_quantity = 10
- [ ] **Expected:** Stock Trail entry created for order 2
- [ ] **Expected:** Stock is locked after order 2

## 2. Edit Locked Stock Tests

### Test 2.1: Attempt to Edit Locked Stock
- [ ] Find a stock with quantity = 0 and sold_quantity > 0
- [ ] Click the Edit button
- [ ] **Expected:** Redirected to inventory index
- [ ] **Expected:** Error message: "Cannot edit stock that has been fully sold..."
- [ ] **Expected:** Stock data remains unchanged

### Test 2.2: Edit Available Stock
- [ ] Find a stock with quantity > 0
- [ ] Click the Edit button
- [ ] Change quantity or member
- [ ] Save changes
- [ ] **Expected:** Changes saved successfully
- [ ] **Expected:** Stock Trail entry created with action 'updated'

## 3. Remove Locked Stock Tests

### Test 3.1: Attempt to Remove Locked Stock
- [ ] Find a stock with quantity = 0 and sold_quantity > 0
- [ ] Click the Remove button
- [ ] **Expected:** Redirected to inventory index
- [ ] **Expected:** Error message: "Cannot remove stock that has been fully sold..."
- [ ] **Expected:** Stock remains in database

### Test 3.2: Remove Available Stock
- [ ] Find a stock with quantity > 0
- [ ] Click the Remove button
- [ ] Provide a reason
- [ ] Confirm removal
- [ ] **Expected:** Stock marked as removed (removed_at set)
- [ ] **Expected:** Stock Trail entry created with action 'removed'

## 4. Stock Trail Tests

### Test 4.1: View Stock Trail
- [ ] Navigate to Stock Trail tab
- [ ] **Expected:** See entries with action 'completed' for locked stocks
- [ ] **Expected:** Notes include order number and total sold
- [ ] **Expected:** All data is accurate (product, member, quantity)

### Test 4.2: Stock Trail Data Integrity
- [ ] Find a locked stock in Stock Trail
- [ ] Verify old_quantity matches the last sale quantity
- [ ] Verify new_quantity = 0
- [ ] Verify member_id matches the stock's member
- [ ] Verify notes include order ID and total sold

## 5. UI/UX Tests

### Test 5.1: Locked Stock Badge
- [ ] View stocks list
- [ ] Find a locked stock (quantity = 0, sold_quantity > 0)
- [ ] **Expected:** Lock icon and "Locked" badge visible
- [ ] Hover over the badge
- [ ] **Expected:** Tooltip shows explanation and total sold

### Test 5.2: Quantity Display
- [ ] View stocks list
- [ ] Find a locked stock
- [ ] **Expected:** Shows "X kg sold" or "X pc sold" instead of available quantity
- [ ] **Expected:** Status badge shows "Out of Stock"

### Test 5.3: Button States
- [ ] View stocks list
- [ ] Find a locked stock
- [ ] **Expected:** Edit button is disabled or hidden
- [ ] **Expected:** Remove button is disabled or hidden
- [ ] Find an available stock
- [ ] **Expected:** Edit and Remove buttons are enabled

## 6. Seeder Tests

### Test 6.1: Fresh Seeding
- [ ] Clear sales data: `php artisan db:seed --class=ComprehensiveSalesSeeder`
- [ ] **Expected:** Sales orders created successfully
- [ ] **Expected:** Stocks are reduced but not locked
- [ ] **Expected:** No errors or warnings

### Test 6.2: Seeding with Low Stock
- [ ] Manually set some stocks to quantity = 2
- [ ] Run seeder: `php artisan db:seed --class=ComprehensiveSalesSeeder`
- [ ] **Expected:** Some stocks may reach zero
- [ ] **Expected:** Stock Trail entries created for zero stocks
- [ ] **Expected:** Those stocks are locked

### Test 6.3: Seeding with Locked Stocks
- [ ] Ensure some stocks are locked (quantity = 0, sold_quantity > 0)
- [ ] Run seeder: `php artisan db:seed --class=ComprehensiveSalesSeeder`
- [ ] **Expected:** Locked stocks are skipped
- [ ] **Expected:** Only available stocks are used
- [ ] **Expected:** No errors about locked stocks

## 7. Edge Cases

### Test 7.1: Order Rejection After Approval
- [ ] Create and approve an order (stock reaches zero)
- [ ] Reject the order
- [ ] **Expected:** Stock quantity restored
- [ ] **Expected:** Stock unlocked (quantity > 0)
- [ ] **Expected:** Stock Trail entry for reversal

### Test 7.2: Concurrent Orders
- [ ] Create two orders for the same stock
- [ ] Approve both orders
- [ ] **Expected:** Stock quantity correctly reduced
- [ ] **Expected:** Only one Stock Trail entry if stock reaches zero
- [ ] **Expected:** No negative quantities

### Test 7.3: Zero Quantity with Zero Sold
- [ ] Manually set stock: quantity = 0, sold_quantity = 0
- [ ] **Expected:** Stock is NOT locked (no sales)
- [ ] **Expected:** Can still edit or remove
- [ ] **Expected:** No Stock Trail entry

## 8. Translation Tests

### Test 8.1: English Translations
- [ ] Set language to English
- [ ] View locked stock
- [ ] **Expected:** "Locked" badge in English
- [ ] **Expected:** Tooltip message in English
- [ ] **Expected:** Error messages in English

### Test 8.2: Tagalog Translations
- [ ] Set language to Tagalog
- [ ] View locked stock
- [ ] **Expected:** "Nakakandado" badge in Tagalog
- [ ] **Expected:** Tooltip message in Tagalog
- [ ] **Expected:** Error messages in Tagalog

## 9. Performance Tests

### Test 9.1: Large Dataset
- [ ] Create 100+ stocks
- [ ] Create 50+ orders
- [ ] Approve all orders
- [ ] **Expected:** Page loads in reasonable time
- [ ] **Expected:** Stock Trail entries created correctly
- [ ] **Expected:** No performance degradation

### Test 9.2: Stock List Pagination
- [ ] Navigate through stock pages
- [ ] **Expected:** Locked stocks display correctly on all pages
- [ ] **Expected:** Pagination works smoothly
- [ ] **Expected:** Filters work with locked stocks

## 10. Data Consistency Tests

### Test 10.1: Database Integrity
- [ ] Check stocks table: `SELECT * FROM stocks WHERE quantity = 0 AND sold_quantity > 0`
- [ ] **Expected:** All have corresponding Stock Trail entries
- [ ] Check stock_trails table: `SELECT * FROM stock_trails WHERE action_type = 'completed'`
- [ ] **Expected:** All reference valid stocks

### Test 10.2: Audit Trail Consistency
- [ ] Check audit_trails table for completed orders
- [ ] **Expected:** available_stock_after_sale matches current stock quantity
- [ ] **Expected:** All data is consistent across tables

## Test Results Summary

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| Stock Locking | ☐ | ☐ | |
| Edit Locked Stock | ☐ | ☐ | |
| Remove Locked Stock | ☐ | ☐ | |
| Stock Trail | ☐ | ☐ | |
| UI/UX | ☐ | ☐ | |
| Seeder | ☐ | ☐ | |
| Edge Cases | ☐ | ☐ | |
| Translations | ☐ | ☐ | |
| Performance | ☐ | ☐ | |
| Data Consistency | ☐ | ☐ | |

## Issues Found

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| | | | |

## Sign-off

- [ ] All critical tests passed
- [ ] All issues documented
- [ ] Ready for production deployment

**Tested by:** _______________  
**Date:** _______________  
**Environment:** _______________
