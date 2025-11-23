# Reject All Suspicious Orders - Implementation

## Overview
Added a "Reject All Orders" button to the Suspicious Orders Group page that allows admins to reject all orders in a suspicious group at once, with a single click.

## Implementation

### Backend Changes

#### 1. New Controller Method
**File:** `app/Http/Controllers/Admin/OrderController.php`  
**Method:** `rejectGroup()`

```php
public function rejectGroup(Request $request)
{
    // Validates order IDs and rejection reason
    // Verifies all orders can be rejected (pending/delayed status)
    // Releases pending stock quantities
    // Updates all orders to rejected status
    // Clears is_suspicious flag
    // Logs all rejections
    // Returns success message
}
```

**Features:**
- Validates all orders exist and can be rejected
- Releases stock back to inventory (decrements pending_order_qty)
- Updates order status to "rejected"
- Clears `is_suspicious` flag from all orders
- Logs each rejection with system logger
- Transaction-based (all or nothing)
- Includes rejection reason in admin_notes

#### 2. New Route
**File:** `routes/web.php`

```php
Route::middleware(['can:manage orders'])->group(function () {
    Route::post('/orders/reject-group', [OrderController::class, 'rejectGroup'])
        ->name('admin.orders.reject-group');
});
```

**Permission Required:** `manage orders`

### Frontend Changes

#### 1. Updated Component
**File:** `resources/js/pages/Admin/Orders/group-show.tsx`

**New State Variables:**
```typescript
const [showRejectDialog, setShowRejectDialog] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
const [isRejecting, setIsRejecting] = useState(false);
const canReject = orders.every(order => ['pending', 'delayed'].includes(order.status));
```

**New Handler:**
```typescript
const handleRejectAllOrders = () => {
    setIsRejecting(true);
    
    router.post(route('admin.orders.reject-group'), {
        order_ids: orders.map(o => o.id),
        rejection_reason: rejectionReason || 'Rejected as part of suspicious order group',
    }, {
        onSuccess: () => {
            setShowRejectDialog(false);
            setIsRejecting(false);
        },
        onError: () => {
            setIsRejecting(false);
        }
    });
};
```

#### 2. New UI Elements

**Reject All Button:**
- Positioned between "Merge Orders" and "Back" buttons
- Red color scheme (destructive variant)
- Only visible if all orders can be rejected
- Requires "manage orders" permission

**Reject All Dialog:**
- Confirmation dialog with warning
- Shows order details and impact
- Optional rejection reason textarea
- Default reason if none provided
- Cancel and Reject buttons

## User Flow

```
1. Admin views Suspicious Orders page
   ↓
2. Admin clicks "View Group Details" on a suspicious group
   ↓
3. Admin reviews the orders in the group
   ↓
4. Admin clicks "Reject All Orders" button (red)
   ↓
5. Confirmation dialog appears with:
   - Warning about permanent action
   - List of orders to be rejected
   - Total amount
   - Customer information
   - What will happen
   - Optional rejection reason field
   ↓
6. Admin enters rejection reason (optional)
   ↓
7. Admin clicks "Reject All X Orders" button
   ↓
8. System processes rejection:
   - Releases stock quantities
   - Updates order statuses
   - Clears suspicious flags
   - Logs all actions
   ↓
9. Admin redirected to Suspicious Orders page
   ↓
10. Success message displayed
    ↓
11. Orders removed from suspicious list
```

## UI Design

### Button Placement
```
┌─────────────────────────────────────────────────────────┐
│  Suspicious Order Group                                 │
│  3 orders from John Doe                                 │
│                                                         │
│  [Merge Orders] [Reject All Orders] [Back to Suspicious]│
│     (Blue)           (Red)              (Gray)          │
└─────────────────────────────────────────────────────────┘
```

### Reject All Dialog
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Reject All Orders in Group                          │
│  This will reject all 3 orders in this suspicious group │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠️ Warning: This action cannot be undone              │
│  All 3 orders will be permanently rejected. Stock       │
│  quantities will be released back to inventory.         │
│                                                         │
│  Orders to Reject: #101, #102, #103                    │
│  Total Amount: ₱450.00                                  │
│  Customer: John Doe                                     │
│  Total Items: 12 items                                  │
│                                                         │
│  What will happen:                                      │
│  • All 3 orders will be marked as "rejected"           │
│  • Stock quantities will be released back to inventory  │
│  • Customer will be notified of the rejection          │
│  • Orders will be removed from suspicious orders list  │
│  • This action cannot be reversed                      │
│                                                         │
│  Rejection Reason (Optional):                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Textarea for rejection reason]                 │   │
│  └─────────────────────────────────────────────────┘   │
│  If no reason provided: "Rejected as part of           │
│  suspicious order group"                                │
│                                                         │
│                    [Cancel] [Reject All 3 Orders]       │
└─────────────────────────────────────────────────────────┘
```

## Database Impact

### Before Rejection
```sql
-- Order #101
status: pending
is_suspicious: true
suspicious_reason: "3 orders within 10 minutes"
admin_notes: null

-- Order #102
status: pending
is_suspicious: true
suspicious_reason: "3 orders within 10 minutes"
admin_notes: null

-- Order #103
status: pending
is_suspicious: true
suspicious_reason: "3 orders within 10 minutes"
admin_notes: null

-- Stock records
pending_order_qty: 10 (for each product)
```

### After Rejection
```sql
-- Order #101
status: rejected
is_suspicious: false ✓
suspicious_reason: "3 orders within 10 minutes" (preserved)
admin_notes: "Suspicious ordering pattern detected"
admin_id: 1

-- Order #102
status: rejected
is_suspicious: false ✓
suspicious_reason: "3 orders within 10 minutes" (preserved)
admin_notes: "Suspicious ordering pattern detected"
admin_id: 1

-- Order #103
status: rejected
is_suspicious: false ✓
suspicious_reason: "3 orders within 10 minutes" (preserved)
admin_notes: "Suspicious ordering pattern detected"
admin_id: 1

-- Stock records
pending_order_qty: 0 ✓ (released back to inventory)
```

## Key Features

### 1. Bulk Rejection
- Reject multiple orders with one action
- No need to reject each order individually
- Saves time for admins

### 2. Stock Management
- Automatically releases pending stock quantities
- Stock becomes available for other customers
- Maintains inventory accuracy

### 3. Audit Trail
- All rejections logged with system logger
- Includes rejection reason
- Tracks admin who performed action
- Preserves suspicious_reason for historical record

### 4. Safety Features
- Confirmation dialog prevents accidental rejection
- Clear warning about permanent action
- Shows impact before confirming
- Transaction-based (rollback on error)

### 5. Suspicious Flag Clearing
- Automatically clears `is_suspicious` flag
- Orders removed from suspicious orders page
- Consistent with merge behavior

## Validation & Error Handling

### Validation Rules
```php
'order_ids' => 'required|array|min:1',
'order_ids.*' => 'required|integer|exists:sales_audit,id',
'rejection_reason' => 'nullable|string|max:1000',
```

### Error Cases

**Case 1: No orders found**
```
Error: "No orders found to reject."
Action: Redirect back with error message
```

**Case 2: Invalid order status**
```
Error: "Can only reject orders with pending or delayed status."
Action: Redirect back with error message
```

**Case 3: Database error**
```
Error: "Failed to reject orders. Please try again or contact support."
Action: Rollback transaction, log error, redirect back
```

## Permissions

**Required Permission:** `manage orders`

**Permission Check:**
```typescript
<PermissionGate permission="manage orders">
    {canReject && (
        <Button onClick={() => setShowRejectDialog(true)}>
            Reject All Orders
        </Button>
    )}
</PermissionGate>
```

## System Logging

### Log Entry Format
```php
SystemLogger::logOrderStatusChange(
    $order->id,
    'pending', // old status
    'rejected', // new status
    $admin->id,
    'admin',
    [
        'rejection_reason' => 'Suspicious ordering pattern detected',
        'rejected_as_group' => true,
        'group_order_ids' => [101, 102, 103],
    ]
);
```

### Log Details
- Order ID
- Status change (pending → rejected)
- Admin who performed action
- Rejection reason
- Group context (rejected_as_group: true)
- All order IDs in the group

## Testing Checklist

- [ ] Button appears on group page
- [ ] Button only visible with correct permission
- [ ] Button only enabled for pending/delayed orders
- [ ] Dialog opens when button clicked
- [ ] Dialog shows correct order information
- [ ] Rejection reason is optional
- [ ] Default reason used if none provided
- [ ] Cancel button closes dialog
- [ ] Reject button processes all orders
- [ ] Stock quantities released correctly
- [ ] Order statuses updated to rejected
- [ ] is_suspicious flags cleared
- [ ] Orders removed from suspicious page
- [ ] Success message displayed
- [ ] System logs created
- [ ] Transaction rollback on error
- [ ] Customer notifications sent (if implemented)

## API Endpoint

**Route:** `POST /admin/orders/reject-group`  
**Permission:** `manage orders`  
**Controller:** `OrderController@rejectGroup`

**Request:**
```json
{
  "order_ids": [101, 102, 103],
  "rejection_reason": "Suspicious ordering pattern detected"
}
```

**Response (Success):**
```
Redirect to: /admin/orders/suspicious
Message: "Successfully rejected 3 order(s) from the suspicious group."
```

**Response (Error):**
```
Redirect to: previous page
Error: "Failed to reject orders. Please try again or contact support."
```

## Comparison with Individual Rejection

### Individual Rejection
- Reject one order at a time
- Navigate to each order detail page
- Click reject button for each
- Enter reason for each
- Time-consuming for multiple orders

### Group Rejection (New Feature)
- Reject all orders at once
- Single confirmation dialog
- One rejection reason for all
- Much faster for suspicious groups
- Consistent handling

## Security Considerations

### 1. Permission Check
```php
Route::middleware(['can:manage orders'])->group(function () {
    Route::post('/orders/reject-group', ...);
});
```

### 2. Validation
- All order IDs must exist
- All orders must be rejectable status
- Rejection reason length limited

### 3. Transaction Safety
- All updates in single transaction
- Rollback on any error
- No partial rejections

### 4. Audit Trail
- All actions logged
- Admin ID recorded
- Rejection reason preserved

## Future Enhancements

Possible improvements:
- [ ] Bulk email notification to customer
- [ ] Add to admin activity dashboard
- [ ] Export rejection report
- [ ] Undo rejection within time window
- [ ] Blacklist customer option
- [ ] Automatic rejection based on rules
- [ ] Rejection statistics and analytics

## Summary

✅ **Implemented:** "Reject All Orders" button on Suspicious Orders Group page  
✅ **Location:** Between "Merge Orders" and "Back" buttons  
✅ **Permission:** Requires "manage orders" permission  
✅ **Features:**
- Bulk rejection of all orders in group
- Stock quantities released automatically
- Suspicious flags cleared
- Comprehensive logging
- Transaction-safe
- User-friendly confirmation dialog

The implementation provides admins with a quick and efficient way to reject suspicious order groups while maintaining data integrity and audit trails.
