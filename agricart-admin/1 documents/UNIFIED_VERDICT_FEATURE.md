# Unified Verdict for Suspicious Order Groups - Feature Guide

## Overview
This feature allows admins to apply a **unified verdict** (approve or reject) to all orders within a suspicious group with a single action. All orders in the group will receive the same decision and status.

## New Features Added

### 1. **View Details Button**
- Added to the suspicious orders alert banner
- Opens a detailed modal showing all suspicious groups
- Provides comprehensive overview of all flagged patterns

### 2. **Suspicious Orders Modal**
- Displays all suspicious order groups
- Shows summary statistics
- Provides group-level actions
- Lists individual orders in each group

### 3. **Unified Verdict System**
- **Approve All** - Approves all orders in a group
- **Reject All** - Rejects all orders in a group
- Single action affects entire group
- Maintains data consistency

## Visual Components

### Alert Banner with View Details Button

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Suspicious Order Patterns Detected                      │
│ Found 2 suspicious order group(s) with 6 orders            │
│ (Total: ₱900.00)                          [View Details]   │
└─────────────────────────────────────────────────────────────┘
```

### Suspicious Orders Modal

```
┌═══════════════════════════════════════════════════════════┐
║ ⚠️ Suspicious Order Groups - Detailed View              ║
╠═══════════════════════════════════════════════════════════╣
║ Summary                                                    ║
║ Total Groups: 2    Total Orders: 6                        ║
║ Total Amount: ₱900.00    Unique Customers: 2             ║
╠═══════════════════════════════════════════════════════════╣
║ Group 1 - 3 orders in 8 minutes                          ║
║ John Doe (john@example.com)                               ║
║ Total: ₱450.00                                            ║
║                                                            ║
║ [✓ Approve All]  [✗ Reject All]                          ║
║                                                            ║
║ Orders in this group:                                      ║
║ • Order #101 [Pending] ₱150.00 [View]                    ║
║ • Order #102 [Pending] ₱200.00 [View]                    ║
║ • Order #103 [Pending] ₱100.00 [View]                    ║
╠═══════════════════════════════════════════════════════════╣
║ Group 2 - 3 orders in 5 minutes                          ║
║ Jane Smith (jane@example.com)                             ║
║ Total: ₱450.00                                            ║
║                                                            ║
║ [✓ Approve All]  [✗ Reject All]                          ║
║                                                            ║
║ Orders in this group:                                      ║
║ • Order #104 [Pending] ₱150.00 [View]                    ║
║ • Order #105 [Pending] ₱150.00 [View]                    ║
║ • Order #106 [Pending] ₱150.00 [View]                    ║
╠═══════════════════════════════════════════════════════════╣
║                                    [Close]                 ║
└═══════════════════════════════════════════════════════════┘
```

## How It Works

### Workflow

```
1. Admin sees alert banner
   ↓
2. Clicks "View Details" button
   ↓
3. Modal opens showing all suspicious groups
   ↓
4. Admin reviews each group
   ↓
5. Clicks "Approve All" or "Reject All" for a group
   ↓
6. System applies verdict to all orders in group
   ↓
7. All orders receive same status
   ↓
8. Customers notified
   ↓
9. Modal updates to show new status
```

### Unified Verdict Process

**When "Approve All" is clicked:**
1. Validates all orders are pending/delayed
2. Checks stock availability for all orders
3. Processes stock deduction for each order
4. Updates all orders to "approved" status
5. Sends approval notifications to customer
6. Sends receipt emails
7. Logs all actions

**When "Reject All" is clicked:**
1. Validates all orders are pending/delayed
2. Releases pending stock for all orders
3. Updates all orders to "rejected" status
4. Sends rejection notifications to customer
5. Logs all actions

## Technical Implementation

### Frontend Components

#### 1. **SuspiciousOrdersModal Component**
```
resources/js/components/orders/suspicious-orders-modal.tsx
```

**Features:**
- Displays all suspicious groups
- Shows summary statistics
- Provides group-level actions
- Lists individual orders
- Handles verdict submission

**Props:**
```typescript
interface SuspiciousOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    suspiciousGroups: OrderGroup[];
}
```

#### 2. **Updated OrderManagement Component**
```
resources/js/components/orders/order-management.tsx
```

**Changes:**
- Added "View Details" button to alert banner
- Integrated SuspiciousOrdersModal
- Manages modal open/close state

### Backend Components

#### 1. **GroupVerdictController**
```
app/Http/Controllers/Admin/GroupVerdictController.php
```

**Method:** `applyGroupVerdict(Request $request)`

**Validates:**
- All order IDs exist
- All orders from same customer
- All orders in pending/delayed status
- Verdict is either 'approve' or 'reject'

**Processes:**
- Applies verdict to each order in group
- Maintains transaction integrity
- Handles stock operations
- Sends notifications
- Logs all actions

**Request Payload:**
```json
{
  "order_ids": [101, 102, 103],
  "verdict": "approve",
  "admin_notes": "Bulk approve - Suspicious order group (3 orders within 8 minutes)"
}
```

**Response:**
- Success: Redirects with success message
- Error: Redirects with error message

#### 2. **Route**
```
routes/web.php
```

**Added Route:**
```php
Route::post('/orders/group-verdict', 
    [GroupVerdictController::class, 'applyGroupVerdict'])
    ->name('admin.orders.group-verdict');
```

**Middleware:** `can:manage orders`

## Usage Guide

### For Admins

#### Step 1: Identify Suspicious Patterns
1. Navigate to Orders page
2. Look for red alert banner
3. Note the number of suspicious groups

#### Step 2: Open Details Modal
1. Click "View Details" button on alert banner
2. Modal opens showing all groups

#### Step 3: Review Each Group
1. Check customer information
2. Review order details
3. Verify total amount
4. Check time span
5. Click "View" on individual orders if needed

#### Step 4: Apply Verdict
1. Decide if group is legitimate or suspicious
2. Click "Approve All" for legitimate orders
3. Click "Reject All" for suspicious orders
4. Wait for processing confirmation

#### Step 5: Verify Results
1. Check success message
2. Verify orders updated
3. Confirm notifications sent
4. Close modal

### Example Scenarios

#### Scenario 1: Legitimate Bulk Order
```
Customer: Restaurant owner
Orders: 3 orders in 5 minutes
Total: ₱1,200.00
Reason: Bulk order for event

Action: Click "Approve All"
Result: All 3 orders approved
        Customer receives 3 approval emails
        Stock deducted for all orders
```

#### Scenario 2: Fraudulent Activity
```
Customer: Unknown user
Orders: 5 orders in 3 minutes
Total: ₱500.00
Reason: Testing payment system

Action: Click "Reject All"
Result: All 5 orders rejected
        Customer receives rejection emails
        Stock released for all orders
```

#### Scenario 3: Mixed Verdict
```
Group 1: Legitimate (Approve All)
Group 2: Suspicious (Reject All)

Action: Process each group separately
Result: Group 1 approved, Group 2 rejected
        Each customer notified accordingly
```

## Benefits

### 1. **Efficiency**
- Single action for multiple orders
- Saves time reviewing each order
- Reduces repetitive tasks

### 2. **Consistency**
- All orders in group receive same verdict
- No mixed statuses within group
- Clear decision trail

### 3. **Better UX**
- Easy to review all suspicious patterns
- Clear overview of all groups
- Quick access to individual orders

### 4. **Data Integrity**
- Transaction-based processing
- All-or-nothing approach
- Rollback on errors

### 5. **Audit Trail**
- All actions logged
- Group verdict noted
- Admin notes recorded

## Validation & Safety

### Pre-Processing Checks

1. **Order Validation**
   - All order IDs must exist
   - All orders must be from same customer
   - All orders must be pending/delayed

2. **Stock Validation** (for approval)
   - Sufficient stock for all orders
   - No duplicate processing
   - Stock availability verified

3. **Permission Check**
   - User must have "manage orders" permission
   - Action logged with user ID

### Error Handling

**If any order fails:**
- Transaction rolled back
- No orders processed
- Error message displayed
- Admin can retry

**Common Errors:**
- Insufficient stock for one or more orders
- Order already processed
- Orders from different customers
- Invalid order status

## Configuration

### Adjust Modal Behavior

Edit `resources/js/components/orders/suspicious-orders-modal.tsx`:

```typescript
// Auto-close modal after successful verdict
onSuccess: () => {
    setProcessingGroupIndex(null);
    onClose(); // Add this to close modal
}
```

### Customize Admin Notes

Edit `app/Http/Controllers/Admin/GroupVerdictController.php`:

```php
// Customize default admin notes
$adminNotes = $validated['admin_notes'] ?? 
    "Bulk {$verdict} - Suspicious order group ({$orders->count()} orders)";
```

## API Reference

### Group Verdict Endpoint

**URL:** `POST /admin/orders/group-verdict`

**Request Body:**
```json
{
  "order_ids": [101, 102, 103],
  "verdict": "approve",
  "admin_notes": "Optional notes"
}
```

**Validation Rules:**
- `order_ids`: required, array, min:1
- `order_ids.*`: required, integer, exists in sales_audit
- `verdict`: required, in:approve,reject
- `admin_notes`: nullable, string, max:1000

**Success Response:**
```
Redirect back with message:
"Successfully approved 3 orders in the group."
```

**Error Response:**
```
Redirect back with error:
"Failed to process some orders: [details]"
```

## Database Impact

### For Approval
- Updates `status` to 'approved'
- Updates `delivery_status` to 'pending'
- Sets `admin_id` and `admin_notes`
- Decreases stock quantities
- Increases sold quantities
- Creates stock trail records

### For Rejection
- Updates `status` to 'rejected'
- Sets `delivery_status` to null
- Sets `admin_id` and `admin_notes`
- Releases pending stock quantities
- Creates stock trail records

### Logging
- System logs for each order
- Group verdict flag set
- Admin action recorded
- Timestamps updated

## Testing

### Manual Testing Steps

1. **Create Test Group**
   ```
   - Login as customer
   - Place 3 orders within 10 minutes
   - Logout
   ```

2. **View as Admin**
   ```
   - Login as admin
   - Go to Orders page
   - Verify alert banner shows
   - Click "View Details"
   ```

3. **Test Approve All**
   ```
   - Click "Approve All" on a group
   - Verify processing indicator
   - Check success message
   - Verify all orders approved
   - Check customer notifications
   ```

4. **Test Reject All**
   ```
   - Create another test group
   - Click "Reject All"
   - Verify processing indicator
   - Check success message
   - Verify all orders rejected
   - Check customer notifications
   ```

5. **Test Error Handling**
   ```
   - Try to approve group with insufficient stock
   - Verify error message
   - Verify no orders processed
   - Verify transaction rolled back
   ```

### Verification Checklist

- [ ] Alert banner shows "View Details" button
- [ ] Modal opens when button clicked
- [ ] All suspicious groups displayed
- [ ] Summary statistics correct
- [ ] "Approve All" button works
- [ ] "Reject All" button works
- [ ] Processing indicator shows
- [ ] Success message displays
- [ ] Orders status updated
- [ ] Customers notified
- [ ] Stock updated correctly
- [ ] Logs created
- [ ] Modal can be closed

## Troubleshooting

### Issue: Button Not Appearing

**Cause:** No suspicious groups detected

**Solution:**
- Verify orders within 10-minute window
- Check same customer email
- Ensure at least 2 orders

### Issue: Verdict Not Applied

**Cause:** Validation failed

**Solution:**
- Check all orders are pending/delayed
- Verify sufficient stock
- Check user permissions
- Review error message

### Issue: Modal Not Opening

**Cause:** JavaScript error

**Solution:**
- Check browser console
- Verify component imported
- Clear cache and reload

### Issue: Processing Hangs

**Cause:** Backend error

**Solution:**
- Check Laravel logs
- Verify database connection
- Check stock availability
- Review transaction logs

## Best Practices

### 1. **Review Before Action**
- Always review all orders in group
- Check customer history
- Verify order details
- Consider context

### 2. **Use Appropriate Verdict**
- Approve legitimate bulk orders
- Reject clear fraud attempts
- Contact customer if unsure

### 3. **Document Decisions**
- Use admin notes field
- Record reasoning
- Note any special circumstances

### 4. **Monitor Results**
- Check success messages
- Verify order statuses
- Confirm notifications sent
- Review stock updates

### 5. **Handle Errors Gracefully**
- Read error messages carefully
- Don't retry immediately
- Investigate root cause
- Contact support if needed

## Future Enhancements

### Potential Improvements

1. **Partial Verdict**
   - Select specific orders to approve/reject
   - Mixed verdicts within group

2. **Custom Admin Notes**
   - Pre-filled templates
   - Quick reason selection

3. **Bulk Contact**
   - Send message to customer
   - Request verification
   - Ask for clarification

4. **Whitelist Feature**
   - Mark customer as trusted
   - Exclude from future detection

5. **Analytics**
   - Track verdict patterns
   - False positive rate
   - Processing time metrics

## Support

For issues or questions:
1. Check browser console for errors
2. Review Laravel logs
3. Verify user permissions
4. Test with sample orders
5. Contact development team

---

**Implementation Date:** November 22, 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Ready for Use
