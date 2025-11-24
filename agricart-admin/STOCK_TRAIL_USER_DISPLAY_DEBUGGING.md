# Stock Trail User Display - Debugging Guide

## Issue
The Member Stock Trail is showing "System" instead of actual user names, even though the backend is correctly loading the user data.

## Backend Verification ✅

### Database Check
- ✅ `performed_by` field exists in `stock_trails` table
- ✅ `performed_by_type` field exists in `stock_trails` table
- ✅ Records have valid `performed_by` values (tested with command)

### Model Relationship ✅
**File:** `app/Models/StockTrail.php`
```php
public function performedByUser(): BelongsTo
{
    return $this->belongsTo(User::class, 'performed_by');
}
```

### Controller Loading ✅
**File:** `app/Http/Controllers/Member/MemberController.php`
```php
$stockTrailQuery = \App\Models\StockTrail::with([
    'product' => function ($query) {
        $query->select('id', 'name', 'price_kilo', 'price_pc', 'price_tali');
    },
    'member' => function ($query) {
        $query->select('id', 'name');
    },
    'performedByUser' => function ($query) {
        $query->select('id', 'name', 'type');
    }
])
```

### Test Results ✅
Command: `php artisan test:stock-trail-data`

Output shows data is loading correctly:
```
Trail ID: 1
Action Type: completed
Performed By ID: 1
Performed By Type: admin
User Name: Samuel Salazar
User Type: admin
```

## Frontend Implementation ✅

### TypeScript Interface
```typescript
interface StockTrail {
    id: number;
    stock_id: number;
    product_id: number;
    member_id: number;
    performed_by: number;
    action_type: string;
    old_quantity: number | null;
    new_quantity: number | null;
    category: string;
    notes: string | null;
    performed_by_type: string | null;
    created_at: string;
    product: {
        id: number;
        name: string;
    };
    member: {
        id: number;
        name: string;
    };
    performedByUser: {
        id: number;
        name: string;
        type: string;
    } | null;
}
```

### Display Logic
**Table View:**
```tsx
<TableCell>
    <div className="text-sm font-medium">
        {trail.performedByUser?.name || t('member.system')}
    </div>
    {(trail.performedByUser?.type || trail.performed_by_type) && (
        <Badge variant="outline" className="text-xs capitalize mt-1">
            {trail.performedByUser?.type || trail.performed_by_type}
        </Badge>
    )}
</TableCell>
```

**Card View:**
```tsx
<div className="mb-3">
    <div className="text-xs text-muted-foreground mb-1">{t('member.performed_by')}</div>
    <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
            <div className="text-sm font-medium">
                {trail.performedByUser?.name || t('member.system')}
            </div>
            {(trail.performedByUser?.type || trail.performed_by_type) && (
                <Badge variant="outline" className="text-xs capitalize mt-1">
                    {trail.performedByUser?.type || trail.performed_by_type}
                </Badge>
            )}
        </div>
    </div>
</div>
```

## Debugging Steps Added

### Console Logging
Added debug logging to `StockTrailTable.tsx` to inspect the data being received:

```typescript
if (trails.length > 0) {
    console.log('Stock Trail Sample:', trails[0]);
    console.log('performedByUser:', trails[0].performedByUser);
    console.log('performed_by:', trails[0].performed_by);
    console.log('performed_by_type:', trails[0].performed_by_type);
}
```

## Next Steps to Diagnose

1. **Open Browser Console**
   - Navigate to the Member Stock Trail page
   - Open Developer Tools (F12)
   - Check the Console tab for the debug logs

2. **Check the Output**
   - If `performedByUser` is `null` or `undefined`, the issue is with data serialization
   - If `performedByUser` has data, the issue is with the display logic
   - If `performed_by` is `null`, the issue is with data recording

3. **Possible Issues**

   **A. Inertia Serialization Issue**
   - Laravel might not be serializing the relationship properly
   - Solution: Check Inertia middleware or add explicit serialization

   **B. Casing Issue**
   - JavaScript uses camelCase, PHP uses snake_case
   - Check if the relationship is being converted properly

   **C. Null Values**
   - Old records might have null `performed_by` values
   - Solution: Run the update command to populate old records

## Commands Created

### 1. Update Existing Records
```bash
php artisan stock-trail:update-performed-by
```
Updates old stock trail records that don't have `performed_by` set.

### 2. Test Data Loading
```bash
php artisan test:stock-trail-data
```
Verifies that the backend is loading user data correctly.

## Expected Behavior

When working correctly, the display should show:

**For Admin Actions:**
```
Samuel Salazar
[Admin]
```

**For Member Actions:**
```
John Doe
[Member]
```

**For System Actions:**
```
System
```

## Files Modified

1. `resources/js/components/member/StockTrailTable.tsx` - Added debug logging and enhanced display
2. `resources/js/components/member/StockTrailCards.tsx` - Enhanced display for mobile view
3. `app/Console/Commands/UpdateStockTrailPerformedBy.php` - Command to update old records
4. `app/Console/Commands/TestStockTrailData.php` - Command to test data loading

## Resolution

Once you check the browser console and see what data is being received, we can determine the exact issue and fix it accordingly.
