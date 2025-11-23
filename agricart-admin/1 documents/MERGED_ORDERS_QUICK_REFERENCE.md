# Merged Orders - Quick Reference

## What Happens When Orders Are Merged?

### Primary Order (First Order)
✅ **Keeps its original ID**
✅ **Status remains** 'pending' or 'delayed'
✅ **Receives all items** from secondary orders
✅ **Total amount updated** to combined total
✅ **Visible in main Orders Index**
✅ **Can be processed normally** (approve, assign logistic, etc.)

### Secondary Orders (Other Orders)
❌ **Status changed to** 'merged'
❌ **Hidden from main Orders Index**
❌ **Hidden from Suspicious Orders page**
❌ **Cannot be processed** (already merged)
✅ **Admin notes show** "Merged into order #X"
✅ **Can still be viewed** individually if needed

## Visual Indicators

### Merged Order Badge
```
🟣 Purple Badge: "Merged"
```
- Displayed on secondary orders
- Indicates order has been merged into another order

### Primary Merged Order
- Shows combined total amount
- Admin notes: "Merged from orders: #1, #2, #3"
- Contains all items from all merged orders
- Highlighted when redirected after merge

## Workflow

```
1. Suspicious Orders Detected
   └─> Multiple orders from same customer within 10 minutes
   
2. Admin Reviews Group
   └─> Views group details page
   └─> Checks order items and totals
   
3. Admin Merges Orders
   └─> Clicks "Merge Orders" button
   └─> Adds optional admin notes
   └─> Confirms merge action
   
4. System Processes Merge
   └─> Moves all audit trails to primary order
   └─> Updates primary order totals
   └─> Marks secondary orders as 'merged'
   └─> Logs merge operation
   
5. Result
   └─> Redirected to main Orders Index
   └─> Primary order highlighted
   └─> Secondary orders hidden
   └─> Suspicious group removed
```

## Where Merged Orders Appear

| Location | Primary Order | Secondary Orders |
|----------|--------------|------------------|
| Main Orders Index | ✅ Visible | ❌ Hidden |
| Suspicious Orders | ❌ Hidden (after merge) | ❌ Hidden |
| Individual Order View | ✅ Accessible | ✅ Accessible (shows merged status) |
| Order Reports | ✅ Included | ❌ Excluded |
| Search Results | ✅ Found | ❌ Not found |

## Admin Notes Format

### Primary Order
```
Merged from orders: 123, 124, 125 | Admin notes: Customer confirmed single delivery
```

### Secondary Orders
```
Merged into order #123
```

## Database Changes

### Primary Order
```php
[
    'subtotal' => $newSubtotal,
    'coop_share' => $newCoopShare,
    'member_share' => $newMemberShare,
    'total_amount' => $newTotalAmount,
    'admin_notes' => 'Merged from orders: ...',
    'admin_id' => $adminId,
]
```

### Secondary Orders
```php
[
    'status' => 'merged',
    'admin_notes' => 'Merged into order #X',
    'admin_id' => $adminId,
]
```

### Audit Trails
```php
// All audit trails moved to primary order
AuditTrail::where('sale_id', $secondaryOrderId)
    ->update(['sale_id' => $primaryOrderId]);
```

## System Logs

```php
SystemLogger::logOrderStatusChange(
    $primaryOrderId,
    'pending',
    'merged_primary',
    $adminId,
    $adminType,
    [
        'merged_order_ids' => [123, 124, 125],
        'new_total_amount' => 5000.00,
        'total_orders_merged' => 3,
    ]
);
```

## Common Scenarios

### Scenario 1: Customer Places Multiple Orders by Mistake
**Before Merge:**
- Order #101: ₱1,500 (2 items)
- Order #102: ₱2,000 (3 items)
- Order #103: ₱1,000 (1 item)

**After Merge:**
- Order #101: ₱4,500 (6 items) ← Primary order
- Order #102: Status = 'merged' (hidden)
- Order #103: Status = 'merged' (hidden)

### Scenario 2: Suspicious Pattern Detected
**Detection:**
- 3 orders within 5 minutes
- Same customer email
- Same delivery address

**Action:**
- Admin reviews group
- Confirms legitimate orders
- Merges into single order

**Result:**
- Group removed from Suspicious Orders
- Single order in main index
- Customer receives one delivery

## Permissions Required

```php
'merge orders' // Required to merge order groups
'view orders'  // Required to view suspicious orders
```

## API Endpoints

### View Suspicious Orders
```
GET /admin/orders/suspicious
```

### View Order Group
```
GET /admin/orders/group?orders=101,102,103
```

### Merge Orders
```
POST /admin/orders/merge-group
Body: {
    order_ids: [101, 102, 103],
    admin_notes: "Optional notes"
}
```

## Success Messages

```
"Successfully merged 3 orders into Order #101. New total: ₱4,500"
```

## Error Messages

```
"At least 2 orders are required to merge."
"Cannot merge orders from different customers."
"Can only merge orders with pending or delayed status."
"Failed to merge orders. Please try again or contact support."
```

## Testing Commands

### Check Merged Orders
```sql
SELECT id, status, admin_notes 
FROM sales_audit 
WHERE status = 'merged';
```

### Check Primary Merged Orders
```sql
SELECT id, total_amount, admin_notes 
FROM sales_audit 
WHERE admin_notes LIKE 'Merged from orders:%';
```

### Verify Audit Trails
```sql
SELECT sale_id, COUNT(*) as item_count 
FROM audit_trails 
WHERE sale_id = 101 
GROUP BY sale_id;
```

## Troubleshooting

### Issue: Merged orders still appearing in suspicious page
**Solution:** Clear cache and refresh page. Orders are filtered at query level.

### Issue: Cannot find merged order in main index
**Solution:** Check if order status is 'merged' (should be hidden). Look for primary order instead.

### Issue: Audit trails missing after merge
**Solution:** Check audit_trails table. All trails should have sale_id = primary order ID.

### Issue: Total amount incorrect after merge
**Solution:** Verify calculation: subtotal + coop_share (10% of subtotal) = total_amount
