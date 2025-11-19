# Stock Trail Username Display Fix

## Problem
The Stock Trail was not properly displaying the username of who processed each stock action, even though the user ID was stored in the database.

## Root Cause
The issue was with how the relationship data was being serialized from the backend to the frontend:
1. Backend was loading the `performedByUser` relationship correctly
2. However, Laravel's default JSON serialization wasn't consistently including the relationship data
3. Frontend was looking for `performedByUser` (camelCase) but backend was sending `performed_by_user` (snake_case)

## Solution

### 1. Backend Fix (`app/Http/Controllers/Admin/InventoryController.php`)

**Before:**
```php
$stockTrails = StockTrail::with(['performedByUser' => ...])
    ->select(...)
    ->get();
```

**After:**
```php
$stockTrails = StockTrail::with(['performedByUser' => ...])
    ->select(...)
    ->get()
    ->map(function ($trail) {
        // Explicitly serialize the data
        return [
            'id' => $trail->id,
            'product_id' => $trail->product_id,
            'member_id' => $trail->member_id,
            'action_type' => $trail->action_type,
            'old_quantity' => $trail->old_quantity,
            'new_quantity' => $trail->new_quantity,
            'category' => $trail->category,
            'notes' => $trail->notes,
            'performed_by' => $trail->performed_by,
            'performed_by_type' => $trail->performed_by_type,
            'created_at' => $trail->created_at,
            'product' => $trail->product,
            'member' => $trail->member,
            'performed_by_user' => $trail->performedByUser ? [
                'id' => $trail->performedByUser->id,
                'name' => $trail->performedByUser->name,
                'type' => $trail->performedByUser->type,
            ] : null,
        ];
    });
```

**Why:** Explicit mapping ensures the relationship data is always included in the JSON response with a consistent structure.

### 2. Frontend Fix (`resources/js/components/inventory/stock-management.tsx`)

**Before:**
```typescript
performedBy: trail.performedByUser?.name || null,
performedByType: trail.performed_by_type || trail.performedByUser?.type || null
```

**After:**
```typescript
performedBy: trail.performed_by_user?.name || null,
performedByType: trail.performed_by_type || trail.performed_by_user?.type || null
```

**Why:** Changed from camelCase (`performedByUser`) to snake_case (`performed_by_user`) to match the backend JSON structure.

## Data Flow (Fixed)

```
Database
    ↓
stock_trails.performed_by (user_id: 5)
    ↓
Backend: StockTrail::with('performedByUser')
    ↓
Explicit Mapping: performed_by_user: { id: 5, name: "John Admin", type: "admin" }
    ↓
JSON Response: { ..., performed_by_user: { name: "John Admin", type: "admin" } }
    ↓
Frontend: trail.performed_by_user?.name
    ↓
Display: "John Admin (admin)"
```

## What You'll See Now

### Desktop Table:
```
Performed By Column:
┌─────────────────┐
│ John Admin      │
│ (admin)         │
└─────────────────┘
```

### Mobile Card:
```
Performed By: Maria Staff
             (staff)
```

### Examples:
- ✅ **"John Admin (admin)"** - Admin who approved the order
- ✅ **"Maria Staff (staff)"** - Staff who added stock
- ✅ **"Pedro Member (member)"** - Member whose stock was created
- ✅ **"System"** - Automated actions (when performed_by is NULL)

## Testing

### 1. Check Existing Records
Navigate to: **Inventory → Stocks Tab → Stock Trail**

You should now see:
- Actual usernames for all stock actions
- User type below each name
- "System" only for records without a user

### 2. Create New Stock Action
1. Add new stock
2. Check Stock Trail
3. Your name should appear in "Performed By"

### 3. Approve an Order
1. Approve a pending order
2. Check Stock Trail for the sale entry
3. Your name should appear as who approved it

## Database Verification

To verify the data is in the database:

```sql
SELECT 
    st.id,
    st.action_type,
    st.performed_by,
    st.performed_by_type,
    u.name as user_name,
    u.type as user_type
FROM stock_trails st
LEFT JOIN users u ON st.performed_by = u.id
ORDER BY st.created_at DESC
LIMIT 10;
```

Expected results:
- `performed_by` should have user IDs
- `user_name` should show actual names
- `user_type` should show admin/staff/member

## Benefits

### 1. Proper User Tracking ✅
- Every stock action now shows who did it
- Clear accountability for all changes
- Complete audit trail

### 2. Accurate Display ✅
- Real usernames instead of "System"
- User type provides context
- Consistent across desktop and mobile

### 3. Data Integrity ✅
- Backend explicitly serializes data
- Frontend receives consistent structure
- No missing relationship data

## Troubleshooting

### If you still see "System" for some records:

**Possible Reasons:**
1. **Old Records** - Created before user tracking was implemented
   - Solution: These will always show "System" (expected)

2. **NULL performed_by** - No user was associated
   - Solution: This is correct for automated actions

3. **Deleted User** - User was deleted from database
   - Solution: Will show "System" (expected behavior)

### If you see "Unknown" instead of names:

**Check:**
1. Database has user records: `SELECT * FROM users WHERE id IN (SELECT DISTINCT performed_by FROM stock_trails WHERE performed_by IS NOT NULL);`
2. Backend is loading relationship: Check Laravel logs
3. Frontend is receiving data: Check browser console

## Summary

The fix ensures that:
1. ✅ Backend explicitly serializes the `performed_by_user` relationship data
2. ✅ Frontend correctly accesses `trail.performed_by_user?.name`
3. ✅ Usernames are properly displayed in Stock Trail
4. ✅ User types are shown for context
5. ✅ "System" only appears when no user is associated

**Status:** ✅ FIXED  
**Files Modified:** 2  
**Breaking Changes:** None  
**Database Changes:** None
