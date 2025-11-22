# Grouped Order Detail View - Implementation Guide

## Overview

The Grouped Order Detail View combines all orders in a suspicious group into a single unified view, allowing admins to review all related orders together in one place.

## What Was Implemented

### 1. ✅ New Group Detail Page
- **Route**: `/admin/orders/group?orders=21,22,23`
- **Component**: `resources/js/Pages/Admin/Orders/group-show.tsx`
- **Purpose**: Display all orders in a suspicious group together

### 2. ✅ Controller Method
- **Method**: `OrderController::showGroup()`
- **Location**: `app/Http/Controllers/Admin/OrderController.php`
- **Function**: Fetches and processes multiple orders for grouped display

### 3. ✅ Updated GroupedOrderCard
- **Change**: "Review First Order" → "View Group Details"
- **Action**: Links to group view instead of single order
- **Parameters**: Passes all order IDs as comma-separated list

## How It Works

### User Flow

```
Suspicious Orders Page
    ↓
Click "View Group Details" on any group
    ↓
Group Detail Page
    ↓
Shows:
- Customer information (from first order)
- Group summary (total orders, amount, time span)
- All individual orders in the group
- Each order's items and details
```

### URL Structure

```
/admin/orders/group?orders=21,22,23

Parameters:
- orders: Comma-separated list of order IDs
```

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Suspicious Order Group - Customer Name             │
│ [Back to Suspicious Orders]                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Warning Banner                                           │
│ "3 orders placed within 8 minutes from same customer"      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┐
│ Left Column          │ Right Column                         │
│                      │                                      │
│ Customer Info        │ Individual Orders                    │
│ - Name               │                                      │
│ - Email              │ ┌──────────────────────────────────┐ │
│ - Contact            │ │ 1  Order #21                     │ │
│ - Address            │ │    Nov 22, 2025 22:11:02         │ │
│                      │ │    Status: Pending               │ │
│ Group Summary        │ │    Items: ...                    │ │
│ - Total Orders: 3    │ │    Total: ₱1,204.50              │ │
│ - Combined: ₱1,706   │ │    [View Full Order Details]     │ │
│ - Time Span: 8 min   │ └──────────────────────────────────┘ │
│ - First Order: ...   │                                      │
│ - Last Order: ...    │ ┌──────────────────────────────────┐ │
│                      │ │ 2  Order #22                     │ │
│                      │ │    Nov 22, 2025 22:16:02         │ │
│                      │ │    Status: Pending               │ │
│                      │ │    Items: ...                    │ │
│                      │ │    Total: ₱272.80                │ │
│                      │ │    [View Full Order Details]     │ │
│                      │ └──────────────────────────────────┘ │
│                      │                                      │
│                      │ ┌──────────────────────────────────┐ │
│                      │ │ 3  Order #23                     │ │
│                      │ │    Nov 22, 2025 22:19:02         │ │
│                      │ │    Status: Pending               │ │
│                      │ │    Items: ...                    │ │
│                      │ │    Total: ₱228.80                │ │
│                      │ │    [View Full Order Details]     │ │
│                      │ └──────────────────────────────────┘ │
└──────────────────────┴──────────────────────────────────────┘
```

## Features

### Left Column - Customer & Group Info

**Customer Information Card**:
- Customer name
- Email address
- Contact number
- Delivery address

**Group Summary Card**:
- Total number of orders
- Combined total amount
- Time span between orders
- First order timestamp
- Last order timestamp

### Right Column - Individual Orders

**For Each Order**:
- Order number badge (1, 2, 3, etc.)
- Order ID (original database ID)
- Timestamp
- Status badge
- Delivery status badge
- List of items with quantities and prices
- Order total
- Admin notes (if any)
- "View Full Order Details" button

## Data Flow

### 1. User Clicks "View Group Details"

```typescript
// GroupedOrderCard.tsx
<Link href={route('admin.orders.group', { 
    orders: orders.map(o => o.id).join(',') 
})}>
    View Group Details
</Link>

// Generates URL: /admin/orders/group?orders=21,22,23
```

### 2. Backend Processes Request

```php
// OrderController.php
public function showGroup(Request $request)
{
    // Get order IDs from query parameter
    $orderIds = explode(',', $request->get('orders', ''));
    
    // Load orders with relationships
    $orders = SalesAudit::whereIn('id', $orderIds)
        ->orderBy('created_at', 'asc')
        ->get();
    
    // Calculate group info
    $groupInfo = [
        'customerName' => $firstOrder->customer->name,
        'totalOrders' => $orders->count(),
        'totalAmount' => $orders->sum('total_amount'),
        'timeSpan' => $timeSpan,
        // ...
    ];
    
    // Return view
    return Inertia::render('Admin/Orders/group-show', [
        'orders' => $processedOrders,
        'groupInfo' => $groupInfo,
    ]);
}
```

### 3. Frontend Displays Grouped View

```typescript
// group-show.tsx
export default function GroupShow({ orders, groupInfo }) {
    // Displays customer info, group summary, and all orders
}
```

## Key Benefits

### ✅ Unified View
- See all related orders in one place
- No need to open multiple tabs
- Easy comparison between orders

### ✅ Context Preservation
- Customer information always visible
- Group statistics at a glance
- Time span clearly shown

### ✅ Quick Navigation
- "View Full Order Details" for each order
- "Back to Suspicious Orders" button
- Breadcrumb-style navigation

### ✅ Original IDs Preserved
- Each order shows its original database ID
- Links use original IDs
- No synthetic group IDs

## Example Scenarios

### Scenario 1: Review 3 Orders from Same Customer

**Starting Point**: Suspicious Orders page

**Action**: Click "View Group Details" on group with 3 orders

**Result**:
```
URL: /admin/orders/group?orders=21,22,23

Page Shows:
- Customer: Test Customer
- Total Orders: 3
- Combined Total: ₱1,706.10
- Time Span: 8 minutes

Individual Orders:
1. Order #21 - ₱1,204.50 - 22:11:02
2. Order #22 - ₱272.80 - 22:16:02
3. Order #23 - ₱228.80 - 22:19:02
```

### Scenario 2: Investigate 4 Orders

**Starting Point**: Suspicious Orders page

**Action**: Click "View Group Details" on group with 4 orders

**Result**:
```
URL: /admin/orders/group?orders=24,25,26,27

Page Shows:
- Customer: John Doe
- Total Orders: 4
- Combined Total: ₱1,380.50
- Time Span: 9 minutes

Individual Orders:
1. Order #24 - ₱185.90 - 19:11:02
2. Order #25 - ₱543.40 - 19:14:02
3. Order #26 - ₱79.20 - 19:17:02
4. Order #27 - ₱572.00 - 19:20:02
```

## Navigation Flow

```
Main Orders Page
    ↓
[View Suspicious Orders] button
    ↓
Suspicious Orders Page
    ↓
[View Group Details] button on any group
    ↓
Group Detail Page
    ↓
[Back to Suspicious Orders] button
    ↓
Suspicious Orders Page

OR

Group Detail Page
    ↓
[View Full Order Details] button on any order
    ↓
Individual Order Detail Page
    ↓
[Back to Orders] button
    ↓
Main Orders Page
```

## Technical Details

### Files Created/Modified

1. ✅ **NEW**: `resources/js/Pages/Admin/Orders/group-show.tsx`
   - Complete group detail view component
   - Responsive layout
   - Customer info and group summary

2. ✅ **MODIFIED**: `app/Http/Controllers/Admin/OrderController.php`
   - Added `showGroup()` method
   - Handles multiple order IDs
   - Calculates group statistics

3. ✅ **MODIFIED**: `routes/web.php`
   - Added `/orders/group` route
   - Protected by "view orders" permission

4. ✅ **MODIFIED**: `resources/js/components/orders/grouped-order-card.tsx`
   - Changed button text to "View Group Details"
   - Links to group view with all order IDs

### Route Definition

```php
Route::get('/orders/group', [OrderController::class, 'showGroup'])
    ->name('admin.orders.group');
```

### Component Props

```typescript
interface GroupShowProps {
    orders: Order[];
    groupInfo: {
        customerName: string;
        customerEmail: string;
        totalOrders: number;
        totalAmount: number;
        timeSpan: number;
        firstOrderTime: string;
        lastOrderTime: string;
    };
}
```

## Testing

### Test 1: Access Group View
1. Navigate to `/admin/orders/suspicious`
2. Click "View Group Details" on any group
3. Verify page loads with all orders

### Test 2: Verify Customer Info
1. Check customer name matches
2. Verify email is correct
3. Confirm contact number shown
4. Check delivery address

### Test 3: Verify Group Summary
1. Count matches number of orders
2. Total amount is sum of all orders
3. Time span is accurate
4. First/last order times correct

### Test 4: Verify Individual Orders
1. All orders displayed
2. Correct order in sequence
3. Items shown for each order
4. Totals are accurate

### Test 5: Navigation
1. "Back to Suspicious Orders" works
2. "View Full Order Details" works for each order
3. URLs are correct

### Test 6: Direct URL Access
1. Navigate to `/admin/orders/group?orders=21,22,23`
2. Page loads correctly
3. Shows correct orders

### Test 7: Error Handling
1. Try `/admin/orders/group` (no orders parameter)
2. Should redirect with error message
3. Try invalid order IDs
4. Should handle gracefully

## Permissions

- Requires "view orders" permission
- Protected by PermissionGuard
- Same permissions as suspicious orders page

## Responsive Design

- **Desktop**: 3-column layout (customer info | group summary | orders)
- **Tablet**: 2-column layout (info stacked | orders)
- **Mobile**: Single column (all stacked)

## Future Enhancements

Possible additions:
- Bulk actions (approve all, reject all)
- Export group as PDF
- Add notes to entire group
- Mark group as reviewed
- Compare orders side-by-side
- Timeline visualization

---

**Implementation Date**: November 22, 2025
**Status**: ✅ Complete and Operational
**Route**: `/admin/orders/group?orders=ID1,ID2,ID3`
