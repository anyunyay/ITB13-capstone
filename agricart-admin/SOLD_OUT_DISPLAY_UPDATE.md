# Sold Out Display Update

## Overview
Updated all product and order displays to change the "Completed" badge to "Sold Out" and display "N/A" in the Total Amount field when items are sold out, ensuring consistency across tables, cards, and modals.

## Changes Made

### 1. Action Label Update (`resources/js/components/inventory/stock-management.tsx`)

**Before:**
```typescript
const getActionLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
        'created': t('admin.action_added'),
        'updated': t('admin.action_updated'),
        'removed': t('admin.action_removed'),
        'restored': t('admin.action_restored'),
        'sale': t('admin.action_sale'),
        'reversal': t('admin.action_reversal')
    };
    return labels[actionType] || actionType.charAt(0).toUpperCase() + actionType.slice(1);
};
```

**After:**
```typescript
const getActionLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
        'created': t('admin.action_added'),
        'updated': t('admin.action_updated'),
        'removed': t('admin.action_removed'),
        'restored': t('admin.action_restored'),
        'sale': t('admin.action_sale'),
        'reversal': t('admin.action_reversal'),
        'completed': t('admin.sold_out') // NEW: Changed from 'Completed' to 'Sold Out'
    };
    return labels[actionType] || actionType.charAt(0).toUpperCase() + actionType.slice(1);
};
```

### 2. Total Amount Logic Update

**Before:**
```typescript
let totalAmount = 0;
if (trail.action_type === 'sale') {
    totalAmount = quantityChange * price;
} else if (trail.action_type === 'created' || trail.action_type === 'updated') {
    totalAmount = newQuantity * price;
} else if (trail.action_type === 'removed') {
    totalAmount = quantityChange * price;
}
```

**After:**
```typescript
let totalAmount: number | null = 0;
if (trail.action_type === 'sale') {
    totalAmount = quantityChange * price;
} else if (trail.action_type === 'created' || trail.action_type === 'updated') {
    totalAmount = newQuantity * price;
} else if (trail.action_type === 'removed') {
    totalAmount = quantityChange * price;
} else if (trail.action_type === 'completed') {
    // For completed/sold out items, show N/A instead of amount
    totalAmount = null;
}
```

### 3. Desktop Table Display Update

**Before:**
```tsx
<div className="font-semibold">
    ₱{(item.totalAmount || 0).toFixed(2)}
</div>
```

**After:**
```tsx
<div className="font-semibold">
    {item.totalAmount === null ? 'N/A' : `₱${item.totalAmount.toFixed(2)}`}
</div>
```

### 4. Mobile Card Display Update

**Before:**
```tsx
<span className="font-semibold">₱{(item.totalAmount || 0).toFixed(2)}</span>
```

**After:**
```tsx
<span className="font-semibold">
    {item.totalAmount === null ? 'N/A' : `₱${item.totalAmount.toFixed(2)}`}
</span>
```

### 5. Translation Keys Added

**English (`resources/lang/en/admin.php`):**
```php
'sold_out' => 'Sold Out',
```

**Tagalog (`resources/lang/tl/admin.php`):**
```php
'sold_out' => 'Naubos na',
```

## Visual Changes

### Before

**Desktop Table:**
```
┌──────────────────────────────────────────────────────────┐
│ Action      │ Performed By │ Total Amount │ Notes        │
├──────────────────────────────────────────────────────────┤
│ [Completed] │ Admin User   │ ₱250.00      │ Stock fully  │
│             │ (admin)      │              │ sold...      │
└──────────────────────────────────────────────────────────┘
```

**Mobile Card:**
```
┌─────────────────────────────┐
│ Tomatoes                    │
│ [Completed]                 │
├─────────────────────────────┤
│ Date: Nov 19, 2025          │
│ Quantity: 50 kg             │
│ Member: John                │
│ Performed By: Admin User    │
│ Amount: ₱250.00             │
└─────────────────────────────┘
```

### After

**Desktop Table:**
```
┌──────────────────────────────────────────────────────────┐
│ Action      │ Performed By │ Total Amount │ Notes        │
├──────────────────────────────────────────────────────────┤
│ [Sold Out]  │ Admin User   │ N/A          │ Stock fully  │
│             │ (admin)      │              │ sold...      │
└──────────────────────────────────────────────────────────┘
```

**Mobile Card:**
```
┌─────────────────────────────┐
│ Tomatoes                    │
│ [Sold Out]                  │
├─────────────────────────────┤
│ Date: Nov 19, 2025          │
│ Quantity: 50 kg             │
│ Member: John                │
│ Performed By: Admin User    │
│ Amount: N/A                 │
└─────────────────────────────┘
```

## Badge Styling

The "Sold Out" badge maintains the same styling as other action badges:
- Uses the default badge variant
- Primary color scheme (`bg-primary/10 text-primary`)
- Consistent with other action types

## Logic Flow

```
Stock reaches zero quantity
    ↓
Stock Trail entry created with action_type: 'completed'
    ↓
Frontend processes trail data
    ↓
getActionLabel('completed') → Returns 'Sold Out'
    ↓
totalAmount set to null for 'completed' action
    ↓
Display: Badge shows "Sold Out", Amount shows "N/A"
```

## Affected Views

### 1. Stock Trail Table (Desktop)
- ✅ Action column shows "Sold Out" badge
- ✅ Total Amount column shows "N/A"

### 2. Stock Trail Cards (Mobile)
- ✅ Action badge shows "Sold Out"
- ✅ Total Amount field shows "N/A"

### 3. All Stock Trail Displays
- ✅ Consistent across all views
- ✅ Bilingual support (English/Tagalog)

## Why "N/A" for Total Amount?

When a stock is sold out (completed):
1. **No Active Value** - The stock has no remaining quantity to value
2. **Historical Record** - It's a completion marker, not a transaction
3. **Clarity** - "N/A" clearly indicates this is not a monetary transaction
4. **Consistency** - Aligns with the "Sold Out" status

## Comparison with Other Actions

| Action Type | Badge Display | Total Amount |
|-------------|---------------|--------------|
| Created | "Added" | ₱X.XX (initial value) |
| Updated | "Updated" | ₱X.XX (new value) |
| Sale | "Sale" | ₱X.XX (sale amount) |
| Removed | "Removed" | ₱X.XX (removed value) |
| Restored | "Restored" | ₱X.XX (restored value) |
| Reversal | "Reversal" | ₱X.XX (reversed amount) |
| **Completed** | **"Sold Out"** | **N/A** |

## Benefits

### 1. Clearer Communication ✅
- "Sold Out" is more intuitive than "Completed"
- Users immediately understand the stock is depleted
- Better aligns with e-commerce terminology

### 2. Accurate Representation ✅
- "N/A" correctly indicates no monetary value
- Prevents confusion about pricing
- Clear distinction from actual transactions

### 3. Consistency ✅
- Same display across desktop and mobile
- Consistent with stock locking mechanism
- Aligns with business logic

### 4. User Experience ✅
- More descriptive status
- Reduces ambiguity
- Professional presentation

## Testing Checklist

- [ ] Desktop table shows "Sold Out" badge for completed stocks
- [ ] Desktop table shows "N/A" for total amount on completed stocks
- [ ] Mobile cards show "Sold Out" badge for completed stocks
- [ ] Mobile cards show "N/A" for total amount on completed stocks
- [ ] English translation displays "Sold Out"
- [ ] Tagalog translation displays "Naubos na"
- [ ] Badge styling is consistent with other actions
- [ ] No layout breaks on mobile or desktop
- [ ] Other action types still show correct amounts

## Database Records

No database changes required. The system uses existing data:
- `stock_trails.action_type = 'completed'` → Displays as "Sold Out"
- Total amount calculated as `null` for completed actions
- All other fields remain unchanged

## Related Files

- `resources/js/components/inventory/stock-management.tsx` - Main display logic
- `resources/lang/en/admin.php` - English translations
- `resources/lang/tl/admin.php` - Tagalog translations

## Summary

The Stock Trail now displays:
- ✅ **"Sold Out"** badge instead of "Completed"
- ✅ **"N/A"** in Total Amount field for sold out items
- ✅ **Consistent** across all views (desktop table, mobile cards)
- ✅ **Bilingual** support (English: "Sold Out", Tagalog: "Naubos na")

This provides clearer communication about stock status and more accurate representation of the data.

**Status:** ✅ COMPLETE  
**Files Modified:** 3  
**Breaking Changes:** None  
**Database Changes:** None  
**New Translations:** 2 (English + Tagalog)
