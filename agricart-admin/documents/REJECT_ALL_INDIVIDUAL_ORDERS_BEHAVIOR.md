# Reject All - Individual Order Behavior

## Overview
When the "Reject All" button is clicked on a suspicious order group, each order is processed **individually** and will appear as **separate rejected orders** in the main order index.

## How It Works

### Current Implementation ✅

When admin clicks "Reject All Orders" on a suspicious group:

```php
foreach ($orders as $order) {
    // Each order is updated individually
    $order->update([
        'status' => 'rejected',              // ✅ Individual rejection
        'admin_notes' => $rejectionReason,   // ✅ Same reason for all
        'admin_id' => $request->user()->id,  // ✅ Admin who rejected
        'is_suspicious' => false,            // ✅ Clear suspicious flag
        'suspicious_reason' => null,         // ✅ Clear suspicious reason
    ]);
    
    // Each rejection is logged individually
    SystemLogger::logOrderStatusChange($order->id, ...);
}
```

### Result

Each order becomes a **separate rejected order**:
- Order #101: `status = 'rejected'`, `is_suspicious = false`
- Order #102: `status = 'rejected'`, `is_suspicious = false`
- Order #103: `status = 'rejected'`, `is_suspicious = false`

## Where They Appear

### ❌ Removed From:
- **Suspicious Orders Page** (because `is_suspicious = false`)
- **Suspicious Order Groups** (no longer flagged)

### ✅ Appear In:
- **Main Order Index** (as individual rejected orders)
- **Rejected Orders Filter** (when filtering by status)
- **Order History** (customer can see each rejection)

## Visual Example

### Before Rejection (Suspicious Orders Page)
```
┌─────────────────────────────────────────┐
│ ⚠️ SUSPICIOUS ORDER GROUP               │
│                                         │
│ 3 Orders from John Doe                  │
│ Total: ₱450.00                          │
│                                         │
│ • Order #101 - ₱150.00 (pending)       │
│ • Order #102 - ₱150.00 (pending)       │
│ • Order #103 - ₱150.00 (pending)       │
│                                         │
│ [Merge] [Reject All] [Back]            │
└─────────────────────────────────────────┘
```

### After Rejection (Main Order Index)
```
┌─────────────────────────────────────────┐
│ All Orders                              │
│ Filter: [All] [Pending] [Rejected] ✓   │
├─────────────────────────────────────────┤
│                                         │
│ Order #101                              │
│ Status: Rejected                        │
│ Customer: John Doe                      │
│ Total: ₱150.00                          │
│ Admin Notes: "Suspicious pattern..."   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Order #102                              │
│ Status: Rejected                        │
│ Customer: John Doe                      │
│ Total: ₱150.00                          │
│ Admin Notes: "Suspicious pattern..."   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Order #103                              │
│ Status: Rejected                        │
│ Customer: John Doe                      │
│ Total: ₱150.00                          │
│ Admin Notes: "Suspicious pattern..."   │
│                                         │
└─────────────────────────────────────────┘
```

## Database State

### Before Rejection
```sql
SELECT id, status, is_suspicious, suspicious_reason 
FROM sales_audit 
WHERE id IN (101, 102, 103);

-- Results:
-- 101 | pending  | true  | "3 orders within 10 minutes"
-- 102 | pending  | true  | "3 orders within 10 minutes"
-- 103 | pending  | true  | "3 orders within 10 minutes"
```

### After Rejection
```sql
SELECT id, status, is_suspicious, suspicious_reason 
FROM sales_audit 
WHERE id IN (101, 102, 103);

-- Results:
-- 101 | rejected | false | null
-- 102 | rejected | false | null
-- 103 | rejected | false | null
```

### Query for Rejected Orders
```sql
-- These orders will appear in this query:
SELECT * FROM sales_audit 
WHERE status = 'rejected' 
ORDER BY created_at DESC;

-- Results include:
-- Order #101 (individually rejected)
-- Order #102 (individually rejected)
-- Order #103 (individually rejected)
```

## Key Points

### 1. Individual Processing ✅
- Each order is updated separately
- Each order gets its own database update
- Each order is logged individually

### 2. Same Rejection Reason ✅
- All orders get the same `admin_notes`
- Consistent rejection reason across group
- Admin can provide custom reason

### 3. Separate Display ✅
- Orders appear as individual entries
- Not grouped together in main index
- Each can be viewed independently

### 4. Complete Cleanup ✅
- `is_suspicious` cleared from all
- `suspicious_reason` cleared from all
- No trace of suspicious grouping

## Comparison with Merge

### Merge Behavior
```
3 orders → 1 merged order
- Primary order: status = 'pending'
- Secondary orders: status = 'merged'
- Result: 1 order in main index
```

### Reject All Behavior
```
3 orders → 3 rejected orders
- Order #101: status = 'rejected'
- Order #102: status = 'rejected'
- Order #103: status = 'rejected'
- Result: 3 orders in main index
```

## Admin Notes

All orders receive the same admin notes:
```
Default: "Rejected as part of suspicious order group"

Custom: "Suspicious ordering pattern detected"
         "Potential fraud - multiple orders"
         "Customer verification failed"
         etc.
```

## System Logs

Each order gets its own log entry:
```php
// Order #101 log
SystemLogger::logOrderStatusChange(
    101,
    'pending',
    'rejected',
    $admin->id,
    'admin',
    [
        'rejection_reason' => 'Suspicious pattern...',
        'rejected_as_group' => true,
        'group_order_ids' => [101, 102, 103],
    ]
);

// Order #102 log
SystemLogger::logOrderStatusChange(
    102,
    'pending',
    'rejected',
    ...
);

// Order #103 log
SystemLogger::logOrderStatusChange(
    103,
    'pending',
    'rejected',
    ...
);
```

## Customer View

Customer sees **3 separate rejected orders** in their order history:

```
┌─────────────────────────────────────────┐
│ My Orders                               │
├─────────────────────────────────────────┤
│                                         │
│ Order #101 - Rejected                   │
│ Date: Nov 23, 2025 10:00 AM            │
│ Total: ₱150.00                          │
│ Reason: Suspicious pattern detected     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Order #102 - Rejected                   │
│ Date: Nov 23, 2025 10:05 AM            │
│ Total: ₱150.00                          │
│ Reason: Suspicious pattern detected     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Order #103 - Rejected                   │
│ Date: Nov 23, 2025 10:08 AM            │
│ Total: ₱150.00                          │
│ Reason: Suspicious pattern detected     │
│                                         │
└─────────────────────────────────────────┘
```

## Filtering & Searching

### Filter by Status
```
Status: Rejected
→ Shows Order #101, #102, #103 individually
```

### Search by Customer
```
Customer: John Doe
Status: Rejected
→ Shows all 3 orders
```

### Search by Order ID
```
Order ID: 101
→ Shows only Order #101
```

## Benefits of Individual Rejection

### 1. Transparency ✅
- Customer sees each order separately
- Clear rejection for each order
- No confusion about grouped rejection

### 2. Audit Trail ✅
- Each order has its own log entry
- Individual tracking
- Complete history

### 3. Flexibility ✅
- Can view each order independently
- Can generate reports per order
- Can track metrics per order

### 4. Consistency ✅
- Same behavior as individual rejection
- No special handling needed
- Standard order processing

## Summary

✅ **Behavior:** Each order is individually rejected  
✅ **Display:** Separate entries in main order index  
✅ **Status:** All marked as `status = 'rejected'`  
✅ **Flags:** `is_suspicious = false`, `suspicious_reason = null`  
✅ **Grouping:** No longer grouped together  
✅ **Visibility:** Appear as normal rejected orders  

The "Reject All" button provides a **bulk action** that processes each order **individually**, resulting in separate rejected orders that appear independently in the main order index.
