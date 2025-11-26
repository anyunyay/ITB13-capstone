# Third Order Suspicious Detection - Quick Reference

## What Changed?

When a customer places a **third order within 10 minutes** of a **merged & approved** suspicious order, the system now:
- ✅ Automatically marks it as suspicious
- ✅ Links it to the merged order
- ✅ Treats it as a single order (no merge button)
- ✅ Shows only Approve/Reject actions

## Example Flow

```
Order #1 + Order #2 → Merged & Approved
         ↓
   (within 10 min)
         ↓
     Order #3 → Marked as Suspicious (Single)
                Linked to Merged Order
                No Merge Button
```

## Database Field

**New Column**: `linked_merged_order_id` in `sales_audit` table
- Type: `unsignedBigInteger` (nullable)
- Foreign Key: References `sales_audit.id`
- Purpose: Links suspicious order to merged order

## API Response

```json
{
  "id": 35,
  "is_suspicious": true,
  "suspicious_reason": "New order placed 5 minutes after merged & approved order #33",
  "linked_merged_order_id": 33
}
```

## Frontend Check

```javascript
// Check if single suspicious order
const isSingleSuspicious = order.is_suspicious && order.linked_merged_order_id;

// Display badge
if (isSingleSuspicious) {
  <Badge>
    Suspicious - Related to Merged Order #{order.linked_merged_order_id}
  </Badge>
}

// Hide merge button
if (!isSingleSuspicious) {
  <Button>Merge Orders</Button>
}
```

## Testing

```bash
# Run test script
php test_third_order_detection.php

# Check database
SELECT id, is_suspicious, linked_merged_order_id 
FROM sales_audit 
WHERE linked_merged_order_id IS NOT NULL;
```

## Files Changed

1. `app/Services/SuspiciousOrderDetectionService.php` - Detection logic
2. `app/Models/SalesAudit.php` - Added fillable field
3. `app/Http/Controllers/Admin/OrderController.php` - Updated queries
4. `database/migrations/2025_11_27_002630_add_linked_merged_order_id_to_sales_audit_table.php` - New column

## Configuration

**Time Window**: 10 minutes (in `SuspiciousOrderDetectionService.php`)

```php
const TIME_WINDOW_MINUTES = 10;
```

## Logs

Search for: `"Third order detected after merged & approved suspicious order"`

Location: `storage/logs/laravel.log`

## Quick Verification

```sql
-- Find single suspicious orders
SELECT * FROM sales_audit 
WHERE is_suspicious = 1 
AND linked_merged_order_id IS NOT NULL;

-- Find their linked merged orders
SELECT * FROM sales_audit 
WHERE admin_notes LIKE '%Merged from orders:%'
AND status = 'approved';
```

---

**Status**: ✅ Complete
**Date**: November 27, 2025
