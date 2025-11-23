# Merged Orders Removal from Suspicious Orders Page

## Overview
Implemented functionality to automatically remove merged order groups from the Suspicious Orders page and display only the resulting merged order in the main Orders Index.

## Changes Made

### 1. Backend Changes

#### OrderController.php (`app/Http/Controllers/Admin/OrderController.php`)

**index() method:**
- Added filter to exclude orders with status 'merged' from the main orders query
- Changed: `->where('status', '!=', 'merged')`
- This ensures only the primary merged order appears in the main orders list

**suspicious() method:**
- Added filter to exclude orders with status 'merged' from the suspicious orders query
- Changed: `->where('status', '!=', 'merged')`
- This ensures merged orders never appear in the suspicious orders list

**mergeGroup() method:**
- Updated redirect after successful merge to go to main orders index instead of individual order page
- Changed: `redirect()->route('admin.orders.index', ['highlight_order' => $primaryOrder->id])`
- The merged order is highlighted in the main orders list for easy identification

### 2. Frontend Changes

#### Order Type Definition (`resources/js/types/orders.ts`)
- Added 'merged' status to the Order status type union
- Updated: `status: 'pending' | 'approved' | 'rejected' | 'expired' | 'delayed' | 'cancelled' | 'merged'`

#### Order Grouping Utility (`resources/js/utils/order-grouping.ts`)
- Updated `groupSuspiciousOrders()` function to filter out merged orders before grouping
- Added: `const activeOrders = orders.filter(order => order.status !== 'merged')`
- This prevents merged orders from being included in suspicious pattern detection

#### Order Card Component (`resources/js/components/orders/order-card.tsx`)
- Added 'merged' status badge rendering
- Badge style: Purple background with "Merged" label
- Consistent with other status badges

#### Grouped Order Card Component (`resources/js/components/orders/grouped-order-card.tsx`)
- Added 'merged' status badge rendering
- Same purple badge style for consistency

## Behavior Flow

### Before Merge:
1. Multiple orders from same customer within time window appear in Suspicious Orders page
2. Orders are grouped together and displayed as a suspicious group
3. Admin can view group details and choose to merge

### During Merge:
1. Admin clicks "Merge Orders" button in group detail view
2. Primary order (first order) is updated with combined totals
3. Secondary orders are marked with status 'merged'
4. All audit trails are moved to primary order
5. System logs the merge operation

### After Merge:
1. Merged order group is automatically removed from Suspicious Orders page
2. Secondary orders with 'merged' status are filtered out from suspicious detection
3. Admin is redirected to main Orders Index
4. Primary merged order is highlighted in the main list
5. Merged order shows combined total and all items from all orders

## Key Features

### Automatic Removal
- Orders marked as 'merged' are automatically excluded from:
  - Main orders index query in backend
  - Suspicious orders query in backend
  - Order grouping logic in frontend
  - Suspicious pattern detection

### Clear Visual Indication
- Merged orders display purple "Merged" badge
- Admin notes show which orders were merged
- Primary order retains all audit trail information

### Seamless Workflow
- After merge, admin is taken to main orders page
- Merged order is highlighted for 3 seconds
- Success message shows merge details and new total

## Database Impact

### Status Values
- Secondary orders: status changed to 'merged'
- Primary order: status remains 'pending' or 'delayed'
- Admin notes updated with merge information

### Data Integrity
- All audit trails preserved and moved to primary order
- Original order IDs tracked in admin notes
- System logs maintain complete merge history

## Testing Checklist

- [ ] Verify merged orders don't appear in Suspicious Orders page
- [ ] Confirm merged order appears in main Orders Index
- [ ] Check that merged order is highlighted after merge
- [ ] Verify purple "Merged" badge displays correctly
- [ ] Test that secondary orders show "Merged into order #X" in notes
- [ ] Confirm all items from all orders appear in merged order
- [ ] Verify total amount is correctly calculated
- [ ] Check that suspicious grouping excludes merged orders

## Benefits

1. **Cleaner Interface**: Suspicious Orders page only shows active suspicious patterns
2. **Better Workflow**: Admin immediately sees the result of merge operation
3. **Clear Status**: Merged orders are clearly marked and tracked
4. **Data Integrity**: All order information is preserved and traceable
5. **Automatic Cleanup**: No manual intervention needed to remove merged groups

## Notes

- Merged orders can still be viewed individually if needed
- Admin notes contain full merge history
- System logs track all merge operations
- Original order IDs are preserved in notes for reference
