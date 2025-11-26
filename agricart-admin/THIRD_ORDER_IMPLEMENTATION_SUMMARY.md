# Third Order Suspicious Detection - Implementation Summary

## ✅ Implementation Complete

The system now automatically detects and marks a third order as suspicious when it's created within 10 minutes of a merged & approved suspicious order.

## What Was Implemented

### 1. Database Changes
- ✅ Added `linked_merged_order_id` column to `sales_audit` table
- ✅ Created migration: `2025_11_27_002630_add_linked_merged_order_id_to_sales_audit_table.php`
- ✅ Added foreign key constraint linking to the merged order

### 2. Backend Logic
- ✅ Updated `SuspiciousOrderDetectionService::checkForSuspiciousPattern()`
  - Detects merged & approved orders within 10-minute window
  - Marks new order as single suspicious order
  - Links to the merged order
- ✅ Updated `SuspiciousOrderDetectionService::markAsSuspicious()`
  - Handles single suspicious orders
  - Stores `linked_merged_order_id` reference
- ✅ Updated `SalesAudit` model
  - Added `linked_merged_order_id` to fillable fields

### 3. Controller Updates
- ✅ Updated `OrderController::index()`
  - Includes `linked_merged_order_id` in queries
  - Passes field to frontend
- ✅ Updated `OrderController::suspicious()`
  - Includes `linked_merged_order_id` in queries
  - Passes field to frontend
- ✅ Updated `OrderController::show()`
  - Includes `linked_merged_order_id` in queries
  - Passes field to frontend

### 4. Documentation
- ✅ Created `THIRD_ORDER_SUSPICIOUS_DETECTION.md` - Complete implementation guide
- ✅ Created `THIRD_ORDER_VISUAL_FLOW.md` - Visual flow diagrams
- ✅ Created `test_third_order_detection.php` - Test script

## How It Works

### Scenario
```
10:00 AM - Order #1 created
10:05 AM - Order #2 created → Both marked as suspicious
10:07 AM - Admin merges #1 and #2 → Order #1 approved
10:12 AM - Order #3 created → Automatically marked as suspicious
                            → Linked to Order #1
                            → Displayed as single order
```

### Detection Logic
1. When a new order is created, check for merged & approved orders within 10 minutes
2. If found, mark the new order as suspicious with:
   - `is_suspicious = true`
   - `suspicious_reason = "New order placed X minutes after merged & approved order #Y"`
   - `linked_merged_order_id = Y`
3. Return special flag `is_single_suspicious = true` to indicate no merge button needed

### Database Structure
```sql
sales_audit:
- id
- customer_id
- is_suspicious (BOOLEAN)
- suspicious_reason (TEXT)
- linked_merged_order_id (INT, nullable, foreign key to sales_audit.id)
- admin_notes (TEXT)
- status (ENUM)
- created_at (TIMESTAMP)
```

## Testing Results

✅ **Test Case 1**: Two orders merged successfully
✅ **Test Case 2**: Third order detected as single suspicious order
✅ **Test Case 3**: Fourth order after 10 minutes not marked as suspicious

### Test Output
```
Order #1: Merged & Approved (ID: 33)
Order #2: Merged into Order #1 (ID: 34)
Order #3: Single Suspicious (ID: 35, Linked to: 33)
  - is_suspicious: true
  - linked_merged_order_id: 33
  - suspicious_reason: "New order placed 0 minutes after merged & approved order #33"
```

## Frontend Requirements

The frontend needs to be updated to handle the new field:

### 1. Display Badge
```javascript
if (order.is_suspicious && order.linked_merged_order_id) {
  return (
    <Badge variant="warning">
      Suspicious - Related to{' '}
      <Link to={`/admin/orders/${order.linked_merged_order_id}`}>
        Merged Order #{order.linked_merged_order_id}
      </Link>
    </Badge>
  );
}
```

### 2. Hide Merge Button
```javascript
const isSingleSuspicious = order.is_suspicious && order.linked_merged_order_id;

if (!isSingleSuspicious) {
  // Show merge button
}
```

### 3. Show Only Approve/Reject
```javascript
if (isSingleSuspicious) {
  return (
    <>
      <Button onClick={handleApprove}>Approve</Button>
      <Button onClick={handleReject}>Reject</Button>
    </>
  );
}
```

## API Response Format

The order object now includes:

```json
{
  "id": 35,
  "customer_id": 41,
  "status": "pending",
  "is_suspicious": true,
  "suspicious_reason": "New order placed 5 minutes after merged & approved order #33",
  "linked_merged_order_id": 33,
  "total_amount": 200.00,
  "created_at": "2025-11-27T00:31:21.000000Z"
}
```

## Configuration

**Time Window**: 10 minutes (configurable in `SuspiciousOrderDetectionService.php`)

```php
const TIME_WINDOW_MINUTES = 10;
```

## Files Modified

1. ✅ `app/Services/SuspiciousOrderDetectionService.php`
2. ✅ `app/Models/SalesAudit.php`
3. ✅ `app/Http/Controllers/Admin/OrderController.php`
4. ✅ `database/migrations/2025_11_27_002630_add_linked_merged_order_id_to_sales_audit_table.php`

## Files Created

1. ✅ `THIRD_ORDER_SUSPICIOUS_DETECTION.md`
2. ✅ `THIRD_ORDER_VISUAL_FLOW.md`
3. ✅ `THIRD_ORDER_IMPLEMENTATION_SUMMARY.md`
4. ✅ `test_third_order_detection.php`

## Next Steps

### Required: Frontend Implementation
- [ ] Update order card component to display linked order badge
- [ ] Hide merge button for single suspicious orders
- [ ] Show only Approve/Reject buttons for single suspicious orders
- [ ] Make badge clickable to navigate to merged order

### Optional: Enhancements
- [ ] Add notification when third order is detected
- [ ] Add admin dashboard widget showing third order statistics
- [ ] Add filter to view only single suspicious orders

## Benefits

1. ✅ **Better Fraud Detection**: Catches customers who continue placing orders after merge
2. ✅ **Independent Handling**: Each suspicious order handled separately
3. ✅ **Clear Audit Trail**: Links between orders tracked in database
4. ✅ **No False Positives**: Only triggers on clear patterns
5. ✅ **Automatic Cleanup**: Suspicious flags still auto-clear after 10 minutes

## Troubleshooting

### Check if feature is working:
```sql
SELECT 
    id,
    customer_id,
    is_suspicious,
    suspicious_reason,
    linked_merged_order_id,
    status,
    created_at
FROM sales_audit
WHERE linked_merged_order_id IS NOT NULL
ORDER BY created_at DESC;
```

### Verify merged order:
```sql
SELECT 
    id,
    status,
    admin_notes,
    is_suspicious,
    created_at
FROM sales_audit
WHERE admin_notes LIKE '%Merged from orders:%'
ORDER BY created_at DESC;
```

## Support

For questions or issues:
1. Check logs: `storage/logs/laravel.log`
2. Search for: "Third order detected after merged & approved suspicious order"
3. Review documentation: `THIRD_ORDER_SUSPICIOUS_DETECTION.md`

---

**Status**: ✅ Backend Implementation Complete
**Date**: November 27, 2025
**Version**: 1.0
