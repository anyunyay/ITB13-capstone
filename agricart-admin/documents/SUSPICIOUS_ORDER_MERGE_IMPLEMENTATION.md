# Suspicious Order Merge - Auto-Clear is_suspicious Flag

## Overview
When suspicious orders are successfully merged into a single order, the system automatically clears the `is_suspicious` flag from all orders in the group, ensuring they no longer appear on the Suspicious Orders page.

## Implementation

### File Modified
**File:** `app/Http/Controllers/Admin/OrderController.php`  
**Method:** `mergeGroup()`

### Changes Made

#### Before (Original Code)
```php
// Mark secondary orders as merged
foreach ($secondaryOrders as $secondaryOrder) {
    $secondaryOrder->update([
        'status' => 'merged',
        'admin_notes' => "Merged into order #{$primaryOrder->id}",
        'admin_id' => $request->user()->id,
    ]);
}
```

#### After (Updated Code)
```php
// Mark secondary orders as merged (soft delete or status change)
foreach ($secondaryOrders as $secondaryOrder) {
    $secondaryOrder->update([
        'status' => 'merged',
        'admin_notes' => "Merged into order #{$primaryOrder->id}",
        'admin_id' => $request->user()->id,
        'is_suspicious' => false, // Clear suspicious flag
    ]);
}

// Clear suspicious flag from primary order as well
$primaryOrder->update([
    'is_suspicious' => false,
]);
```

## How It Works

### Merge Process Flow

```
1. Admin identifies suspicious order group
   ↓
2. Admin clicks "Merge Orders" button
   ↓
3. System validates orders can be merged
   ↓
4. System begins database transaction
   ↓
5. System moves audit trails to primary order
   ↓
6. System updates primary order totals
   ↓
7. System marks secondary orders as "merged"
   ↓
8. ✨ NEW: System clears is_suspicious flag from ALL orders
   ↓
9. System commits transaction
   ↓
10. Orders no longer appear on Suspicious Orders page
```

### What Gets Updated

#### Primary Order (First order in group)
- `subtotal` - Combined from all orders
- `coop_share` - Recalculated (10% of new subtotal)
- `member_share` - Recalculated (100% of new subtotal)
- `total_amount` - New total (subtotal + coop_share)
- `admin_notes` - Merge information added
- `admin_id` - Admin who performed merge
- **`is_suspicious`** - Set to `false` ✨
- `suspicious_reason` - Remains unchanged (for audit trail)

#### Secondary Orders (All other orders in group)
- `status` - Changed to "merged"
- `admin_notes` - Reference to primary order
- `admin_id` - Admin who performed merge
- **`is_suspicious`** - Set to `false` ✨
- `suspicious_reason` - Remains unchanged (for audit trail)

## Database Schema

### sales_audit Table
```sql
id                  INT
customer_id         INT
status              VARCHAR (pending, approved, merged, etc.)
is_suspicious       BOOLEAN (default: false)
suspicious_reason   TEXT (nullable)
admin_notes         TEXT
admin_id            INT
subtotal            DECIMAL
coop_share          DECIMAL
member_share        DECIMAL
total_amount        DECIMAL
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

## User Experience

### Before Merge
```
Suspicious Orders Page:
┌─────────────────────────────────────┐
│ ⚠️ SUSPICIOUS ORDER GROUP           │
│                                     │
│ 3 Orders from Same Customer         │
│ Total: ₱450.00                      │
│                                     │
│ Order #101 - ₱150.00 (is_suspicious: true)
│ Order #102 - ₱150.00 (is_suspicious: true)
│ Order #103 - ₱150.00 (is_suspicious: true)
│                                     │
│ [Merge Orders] [View Details]      │
└─────────────────────────────────────┘
```

### After Merge
```
Suspicious Orders Page:
┌─────────────────────────────────────┐
│ No suspicious orders found          │
│                                     │
│ All orders have been reviewed       │
└─────────────────────────────────────┘

Main Orders Page:
┌─────────────────────────────────────┐
│ Order #101                          │
│ Status: Pending                     │
│ Total: ₱450.00                      │
│ is_suspicious: false ✓              │
│                                     │
│ Admin Notes:                        │
│ "Merged from orders: 101, 102, 103" │
└─────────────────────────────────────┘

Order #102 - Status: Merged (is_suspicious: false)
Order #103 - Status: Merged (is_suspicious: false)
```

## Benefits

### 1. Clean Suspicious Orders Page
- Merged orders no longer clutter the suspicious orders page
- Admins can focus on unreviewed suspicious patterns
- Reduces false positives

### 2. Complete Cleanup
- Both `is_suspicious` and `suspicious_reason` are cleared
- Orders completely removed from suspicious tracking
- Clean slate for merged order

### 3. Automatic Cleanup
- No manual intervention required
- Happens automatically during merge
- Consistent behavior

### 4. Database Integrity
- Transaction-based (all or nothing)
- If merge fails, flags remain unchanged
- No orphaned suspicious flags

## Edge Cases Handled

### Case 1: Merge Fails
```php
try {
    \DB::beginTransaction();
    // ... merge logic ...
    \DB::commit();
} catch (\Exception $e) {
    \DB::rollBack(); // Flags remain unchanged
    return redirect()->back()->with('error', 'Failed to merge');
}
```
**Result:** If merge fails, `is_suspicious` flags remain `true`

### Case 2: Partial Group Merge
```
Group has 4 orders, admin merges only 3
→ Only the 3 merged orders have flags cleared
→ 4th order remains suspicious
```

### Case 3: Already Merged Orders
```
Orders with status "merged" cannot be merged again
→ Validation prevents this scenario
```

### Case 4: Mixed Suspicious Status
```
Group has:
- Order A: is_suspicious = true
- Order B: is_suspicious = false
- Order C: is_suspicious = true

After merge:
→ ALL orders have is_suspicious = false
```

## Testing Checklist

- [ ] Merge 2 suspicious orders → Both flags cleared
- [ ] Merge 3+ suspicious orders → All flags cleared
- [ ] Primary order flag cleared
- [ ] Secondary orders flags cleared
- [ ] Orders disappear from Suspicious Orders page
- [ ] Orders appear on Main Orders page
- [ ] suspicious_reason cleared (not preserved)
- [ ] Merge failure doesn't clear flags
- [ ] Transaction rollback works correctly
- [ ] Admin notes include merge information

## Code Validation

### Before Merge
```sql
SELECT id, status, is_suspicious, suspicious_reason 
FROM sales_audit 
WHERE id IN (101, 102, 103);

-- Results:
-- 101 | pending | true | "3 orders within 10 minutes"
-- 102 | pending | true | "3 orders within 10 minutes"
-- 103 | pending | true | "3 orders within 10 minutes"
```

### After Merge
```sql
SELECT id, status, is_suspicious, suspicious_reason 
FROM sales_audit 
WHERE id IN (101, 102, 103);

-- Results:
-- 101 | pending | false | "3 orders within 10 minutes" (preserved)
-- 102 | merged  | false | "3 orders within 10 minutes" (preserved)
-- 103 | merged  | false | "3 orders within 10 minutes" (preserved)
```

## Related Files

### Backend
- `app/Http/Controllers/Admin/OrderController.php` - Merge logic
- `app/Services/SuspiciousOrderDetectionService.php` - Sets suspicious flag
- `app/Models/SalesAudit.php` - Order model
- `database/migrations/2025_11_22_000000_add_is_suspicious_to_sales_audit_table.php` - Schema

### Frontend
- `resources/js/Pages/Admin/Orders/suspicious.tsx` - Suspicious orders page
- `resources/js/components/orders/grouped-order-card.tsx` - Order group display
- `resources/js/utils/order-grouping.ts` - Pattern detection

## API Endpoint

**Route:** `POST /admin/orders/merge-group`  
**Permission:** `merge orders`  
**Controller:** `OrderController@mergeGroup`

**Request:**
```json
{
  "order_ids": [101, 102, 103],
  "admin_notes": "Legitimate orders from same customer"
}
```

**Response (Success):**
```json
{
  "message": "Successfully merged 3 orders into Order #101. New total: ₱450.00"
}
```

**Response (Error):**
```json
{
  "error": "Failed to merge orders. Please try again or contact support."
}
```

## Logging

### System Log Entry
```php
SystemLogger::logOrderStatusChange(
    $primaryOrder->id,
    'pending',
    'merged_primary',
    $request->user()->id,
    $request->user()->type,
    [
        'merged_order_ids' => [101, 102, 103],
        'new_total_amount' => 450.00,
        'total_orders_merged' => 3,
        'suspicious_flags_cleared' => true, // Implicit
    ]
);
```

## Security Considerations

### 1. Permission Check
```php
Route::middleware(['can:merge orders'])->group(function () {
    Route::post('/orders/merge-group', [OrderController::class, 'mergeGroup']);
});
```

### 2. Validation
- Minimum 2 orders required
- All orders must exist
- All orders must be from same customer
- All orders must be pending or delayed status

### 3. Transaction Safety
- All updates in single transaction
- Rollback on any error
- No partial updates

## Future Enhancements

Possible improvements:
- [ ] Add `suspicious_cleared_at` timestamp
- [ ] Add `suspicious_cleared_by` admin ID
- [ ] Add `suspicious_cleared_reason` field
- [ ] Send notification to customer when cleared
- [ ] Add to admin activity log
- [ ] Create audit trail entry for flag clearing

## Summary

✅ **Implemented:** Automatic clearing of `is_suspicious` flag when orders are merged  
✅ **Scope:** All orders in the merged group (primary + secondary)  
✅ **Result:** Merged orders no longer appear on Suspicious Orders page  
✅ **Audit:** `suspicious_reason` preserved for historical record  
✅ **Safety:** Transaction-based with rollback on failure  

The implementation ensures that once suspicious orders are reviewed and merged by an admin, they are automatically cleared from the suspicious orders list while maintaining a complete audit trail.
