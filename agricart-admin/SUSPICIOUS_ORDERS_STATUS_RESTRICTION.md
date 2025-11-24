# Suspicious Orders Status Restriction Implementation

## Overview
Updated the Suspicious Orders system to ensure that only orders with **pending** or **delayed** status can be marked or displayed as suspicious. Orders that are **approved** or **rejected** are automatically excluded from the suspicious orders list.

## Changes Made

### 1. Backend Controller Updates (`app/Http/Controllers/Admin/OrderController.php`)

#### A. Suspicious Orders Page Query
**Before:**
```php
->whereNotIn('status', ['merged', 'rejected', 'cancelled'])
```

**After:**
```php
->whereIn('status', ['pending', 'delayed']) // Only pending/delayed orders can be suspicious
```

#### B. Reject Group Validation
Enhanced error message to clarify status restrictions:
```php
return redirect()->back()->with('error', 'Can only reject orders with pending or delayed status. Approved or rejected orders cannot be marked as suspicious.');
```

#### C. Merge Group Validation
Enhanced error message to clarify status restrictions:
```php
return redirect()->back()->with('error', 'Can only merge orders with pending or delayed status. Approved or rejected orders cannot be marked as suspicious.');
```

#### D. Auto-Clear Suspicious Flag on Approval
```php
$order->update([
    'status' => 'approved',
    'delivery_status' => 'pending',
    'admin_id' => $request->user()->id,
    'admin_notes' => $request->input('admin_notes'),
    'is_suspicious' => false, // Clear suspicious flag when approved
    'suspicious_reason' => null, // Clear suspicious reason
]);
```

#### E. Auto-Clear Suspicious Flag on Rejection
```php
$order->update([
    'status' => 'rejected',
    'delivery_status' => null,
    'admin_id' => $request->user()->id,
    'admin_notes' => $request->input('admin_notes'),
    'is_suspicious' => false, // Clear suspicious flag when rejected
    'suspicious_reason' => null, // Clear suspicious reason
]);
```

### 2. Frontend Utility Updates (`resources/js/utils/order-grouping.ts`)

#### Pattern Detection Filter
**Before:**
```typescript
const activeOrders = orders.filter(order => order.status !== 'merged');
```

**After:**
```typescript
// Filter out merged, approved, and rejected orders before grouping
// Only pending and delayed orders can be suspicious
const activeOrders = orders.filter(order => 
    order.status !== 'merged' && 
    order.status !== 'approved' && 
    order.status !== 'rejected'
);
```

### 3. Suspicious Orders Page Updates (`resources/js/pages/Admin/Orders/suspicious.tsx`)

#### Marked Suspicious Orders Filter
**Before:**
```typescript
const markedSuspiciousOrders = useMemo(() => {
    return orders.filter(order => order.is_suspicious);
}, [orders]);
```

**After:**
```typescript
// Only include pending/delayed orders - approved/rejected cannot be suspicious
const markedSuspiciousOrders = useMemo(() => {
    return orders.filter(order => 
        order.is_suspicious && 
        (order.status === 'pending' || order.status === 'delayed')
    );
}, [orders]);
```

### 4. Main Orders Index Updates (`resources/js/pages/Admin/Orders/index.tsx`)

#### A. Suspicious Order Detection
**Before:**
```typescript
suspiciousGroups.forEach(group => {
    group.orders.forEach(order => ids.add(order.id));
});
```

**After:**
```typescript
suspiciousGroups.forEach(group => {
    group.orders.forEach(order => {
        // Double-check order status before adding to suspicious list
        if (order.status === 'pending' || order.status === 'delayed') {
            ids.add(order.id);
        }
    });
});
```

#### B. Main Index Filter
**Before:**
```typescript
filtered = filtered.filter(order => 
    !order.is_suspicious && !suspiciousOrderIds.has(order.id)
);
```

**After:**
```typescript
// Only pending/delayed orders can be suspicious - approved/rejected stay in main index
filtered = filtered.filter(order => {
    const isSuspicious = order.is_suspicious || suspiciousOrderIds.has(order.id);
    const canBeSuspicious = order.status === 'pending' || order.status === 'delayed';
    return !(isSuspicious && canBeSuspicious);
});
```

## Business Logic

### Eligible for Suspicious List
✅ **Pending** orders
✅ **Delayed** orders

### NOT Eligible for Suspicious List
❌ **Approved** orders
❌ **Rejected** orders
❌ **Merged** orders
❌ **Cancelled** orders

## Automatic Cleanup

### When Order is Approved
1. Status changes to `approved`
2. `is_suspicious` flag set to `false`
3. `suspicious_reason` cleared to `null`
4. Order removed from Suspicious Orders page
5. Order appears in main orders index

### When Order is Rejected
1. Status changes to `rejected`
2. `is_suspicious` flag set to `false`
3. `suspicious_reason` cleared to `null`
4. Order removed from Suspicious Orders page
5. Order appears in main orders index

## Validation Flow

```
┌─────────────────────────────────────┐
│  Order Created (Status: Pending)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Pattern Detection Runs             │
│  (Only on pending/delayed orders)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Suspicious Pattern Found?          │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Show in      │  │ Show in      │
│ Suspicious   │  │ Main Orders  │
│ Orders Page  │  │ Index        │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Admin Action: Approve/Reject        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Auto-clear is_suspicious flag       │
│  Status: approved/rejected           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Order moves to Main Orders Index    │
│  (No longer in Suspicious page)      │
└──────────────────────────────────────┘
```

## Testing Scenarios

### Scenario 1: Pending Order Marked as Suspicious
```
Initial State:
- Order #101: status=pending, is_suspicious=true

Action: Admin approves order

Result:
- Order #101: status=approved, is_suspicious=false ✓
- Order removed from Suspicious Orders page ✓
- Order appears in main orders index ✓
```

### Scenario 2: Suspicious Group Rejected
```
Initial State:
- Order #201: status=pending, is_suspicious=true
- Order #202: status=pending, is_suspicious=true

Action: Admin rejects group

Result:
- Order #201: status=rejected, is_suspicious=false ✓
- Order #202: status=rejected, is_suspicious=false ✓
- Orders removed from Suspicious Orders page ✓
- Orders appear in main orders index ✓
```

### Scenario 3: Approved Order Cannot Be Suspicious
```
Initial State:
- Order #301: status=approved, is_suspicious=false

Action: Pattern detection runs

Result:
- Order #301 is excluded from pattern detection ✓
- Order #301 cannot appear in Suspicious Orders page ✓
- Order #301 remains in main orders index ✓
```

### Scenario 4: Rejected Order Cannot Be Suspicious
```
Initial State:
- Order #401: status=rejected, is_suspicious=false

Action: Pattern detection runs

Result:
- Order #401 is excluded from pattern detection ✓
- Order #401 cannot appear in Suspicious Orders page ✓
- Order #401 remains in main orders index ✓
```

## Benefits

1. **Clear Status Boundaries**: Only unprocessed orders (pending/delayed) can be suspicious
2. **Automatic Cleanup**: Suspicious flags are cleared when orders are processed
3. **Consistent Behavior**: Backend and frontend enforce the same rules
4. **Better User Experience**: Admins don't see already-processed orders in suspicious list
5. **Data Integrity**: Prevents confusion about order status and suspicious flags

## Files Modified

1. `app/Http/Controllers/Admin/OrderController.php`
   - `suspicious()` method
   - `rejectGroup()` method
   - `mergeGroup()` method
   - `approve()` method
   - `reject()` method

2. `resources/js/utils/order-grouping.ts`
   - `groupSuspiciousOrders()` function

3. `resources/js/pages/Admin/Orders/suspicious.tsx`
   - `markedSuspiciousOrders` filter

4. `resources/js/pages/Admin/Orders/index.tsx`
   - `suspiciousOrderIds` detection
   - Main index filter logic

## Summary

✅ **Backend validation**: Only pending/delayed orders loaded for suspicious page
✅ **Frontend filtering**: Pattern detection excludes approved/rejected orders
✅ **Auto-cleanup**: Suspicious flags cleared on approval/rejection
✅ **Consistent rules**: Same logic applied across all components
✅ **Error messages**: Clear feedback about status restrictions
✅ **Data integrity**: No approved/rejected orders in suspicious list
