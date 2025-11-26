# Step-by-Step Test Guide for Third Order Detection

## ⚠️ Important: You Must MERGE the Orders

The third order detection only works when you **MERGE** suspicious orders, not when you approve them individually.

## Complete Test Workflow

### Step 1: Create First Order
1. Log in as a customer
2. Add items to cart
3. Checkout
4. **Note the time** (e.g., 10:00 AM)

### Step 2: Create Second Order (Within 5 Minutes)
1. Still logged in as the same customer
2. Add different items to cart
3. Checkout within 5 minutes of first order
4. **Both orders should now be marked as suspicious**

### Step 3: Check Suspicious Orders Page
1. Log in as admin
2. Go to **Suspicious Orders** page
3. You should see both orders grouped together
4. They should have a "Merge" button

### Step 4: MERGE the Orders (Critical Step!)
1. Click the **"Merge Orders"** button
2. Add any admin notes if needed
3. Confirm the merge
4. The system will:
   - Combine both orders into one
   - Set status to "approved"
   - Add admin_notes: "Merged from orders: X, Y"
   - Mark second order as "merged"

### Step 5: Verify the Merge
Run this command to verify:
```bash
php check_merged_orders.php
```

You should see an approved order with "Merged from orders:" in the notes.

### Step 6: Create Third Order (Within 10 Minutes)
1. Log in as the same customer again
2. Add items to cart
3. Checkout **within 10 minutes** of the merge
4. **This order should be automatically marked as suspicious**

### Step 7: Verify Third Order Detection
Run this command:
```bash
php check_merged_orders.php
```

You should see:
- Latest order is marked as suspicious
- Latest order has `linked_merged_order_id` set
- Latest order has suspicious_reason mentioning the merged order

## Expected Results

### After Merge (Step 4):
```
Order #1: Status = approved, Notes = "Merged from orders: 1, 2"
Order #2: Status = merged, Notes = "Merged into order #1"
```

### After Third Order (Step 6):
```
Order #3: 
  Status = pending
  is_suspicious = true
  linked_merged_order_id = 1
  suspicious_reason = "New order placed X minutes after merged & approved order #1"
```

## Common Mistakes

### ❌ Mistake 1: Approving Orders Individually
**Wrong**: Clicking "Approve" on each suspicious order separately
**Right**: Clicking "Merge Orders" to combine them first

### ❌ Mistake 2: Waiting Too Long
**Wrong**: Creating third order 15 minutes after merge
**Right**: Creating third order within 10 minutes of merge

### ❌ Mistake 3: Different Customer
**Wrong**: Creating third order from a different customer
**Right**: Creating third order from the SAME customer

## Troubleshooting

### Third order not marked as suspicious?

**Check 1**: Was the previous order actually merged?
```bash
php check_order_21.php  # Replace 21 with your order ID
```
Should show: "Has 'Merged from orders:' text: YES"

**Check 2**: Was it within 10 minutes?
Check the timestamps of the merged order and the third order.

**Check 3**: Same customer?
Both orders must be from the same customer.

### How to check logs:
```bash
# Watch logs in real-time
php watch_logs.php

# Then create your third order
```

Look for:
```
"found":true,"merged_order_id":X
"Third order detected after merged & approved suspicious order"
```

## Quick Test Script

Run this to create a complete test scenario:
```bash
php simple_test_third_order.php
```

This will:
1. Create two orders
2. Mark them as suspicious
3. Merge them
4. Create a third order
5. Verify detection

## Database Verification

```sql
-- Check merged orders
SELECT id, status, admin_notes, created_at
FROM sales_audit
WHERE admin_notes LIKE '%Merged from orders:%'
ORDER BY created_at DESC
LIMIT 5;

-- Check third orders
SELECT id, is_suspicious, linked_merged_order_id, suspicious_reason, created_at
FROM sales_audit
WHERE linked_merged_order_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

## Summary

✅ Create two orders within 5 minutes
✅ **MERGE them** (not just approve)
✅ Create third order within 10 minutes
✅ Third order will be automatically suspicious and linked

❌ Don't approve orders individually
❌ Don't wait more than 10 minutes
❌ Don't use different customers
