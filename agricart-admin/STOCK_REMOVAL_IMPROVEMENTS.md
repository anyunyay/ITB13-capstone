# Stock Removal Functionality Improvements

## Summary
Fixed the stock removal functionality to support partial removals, proper tracking, and accurate loss calculation based on removal reasons.

## Changes Made

### 1. Database Changes

#### New Migration: `add_removed_quantity_to_stocks_table`
- **File**: `database/migrations/2025_11_24_182829_add_removed_quantity_to_stocks_table.php`
- **Purpose**: Added `removed_quantity` field to track cumulative removed stock
- **Field Details**:
  - Type: `decimal(10, 2)`
  - Default: `0`
  - Position: After `sold_quantity`

### 2. Backend Updates (PHP)

#### `app/Models/Stock.php`

**Updated Fillable Fields:**
- Added `removed_quantity` to fillable array
- Added `removed_quantity` to casts as `decimal:2`

**Updated `remove()` Method:**
```php
public function remove($quantityToRemove = null, $notes = null)
```
- **New Behavior**:
  - Accepts quantity parameter for partial removals
  - Defaults to full quantity if not specified (backward compatible)
  - Increments `removed_quantity` by the amount removed
  - Decrements `quantity` by the amount removed
  - Only marks stock as fully removed (`removed_at`) when quantity reaches 0
  - Appends notes for partial removals instead of overwriting

**Key Features**:
- Prevents removing more than available quantity
- Keeps stock active if quantity remains after removal
- Tracks cumulative removed quantity

#### `app/Http/Controllers/Admin/InventoryStockController.php`

**Updated `storeRemoveStock()` Method:**

**New Validation:**
```php
'quantity' => 'required|numeric|min:0.01'
```

**Updated Logic:**
1. Validates quantity to remove doesn't exceed available quantity
2. Calculates loss only for "Damaged / Defective" reason
3. Uses removed quantity (not full stock) for loss calculation
4. Calls `$stock->remove($quantityToRemove, $notes)`
5. Records new quantity in stock trail (not 0)
6. Logs remaining quantity after removal

**Success Message:**
- Shows quantity removed and remaining quantity
- Displays loss amount for damaged/defective items

### 3. Frontend Updates (TypeScript/React)

#### `resources/js/components/inventory/remove-stock-modal.tsx`

**New Props:**
- `quantity: number` - Quantity to remove
- `onQuantityChange: (quantity: number) => void` - Handler for quantity changes

**New UI Elements:**
1. **Quantity Input Field**:
   - Type: number
   - Min: 0.01
   - Max: Available stock quantity
   - Step: 0.01
   - Placeholder: "Enter quantity (max: {available})"

2. **Validation Display**:
   - Shows error if quantity exceeds available
   - Disables submit if quantity is invalid

3. **Updated Stock Information**:
   - Changed "Quantity" label to "Available Quantity"
   - Shows current available stock

**Updated Validation:**
```typescript
const isSubmitDisabled = !selectedStock || !reason || !quantity || 
                        quantity <= 0 || quantity > (selectedStock?.quantity || 0) || 
                        processing;
```

#### `resources/js/pages/Admin/Inventory/index.tsx`

**Updated Form State:**
```typescript
const { data, setData, post, processing, reset } = useForm({
    reason: '',
    quantity: 0,  // New field
    stock_id: 0,
    other_reason: '',
});
```

**Updated Handlers:**
1. `handleRemovePerishedStock()`:
   - Sets default quantity to full stock quantity
   - Allows user to modify before submission

2. `handleRemoveStockSubmit()`:
   - Validates quantity is provided and positive
   - Validates quantity doesn't exceed available
   - Includes quantity in form submission

**Updated Modal Props:**
```typescript
<RemoveStockModal
    quantity={data.quantity}
    onQuantityChange={(quantity) => setData('quantity', quantity)}
    // ... other props
/>
```

### 4. Translation Keys

#### English (`resources/lang/en/admin.php`)
- `available_quantity` => 'Available Quantity'
- `quantity_to_remove` => 'Quantity to Remove'

#### Tagalog (`resources/lang/tl/admin.php`)
- `available_quantity` => 'Available na Dami'
- `quantity_to_remove` => 'Dami na Tatanggalin'

## Functionality Details

### Stock Deduction
- **Partial Removal**: Only the specified quantity is deducted from stock
- **Remaining Stock**: Stock remains active in the system if quantity > 0
- **Full Removal**: Stock is marked as removed only when quantity reaches 0

### Database Tracking
- **Removed Quantity**: Cumulative total tracked in `removed_quantity` field
- **Stock Trail**: Each removal creates a trail entry with:
  - Old quantity (before removal)
  - New quantity (after removal)
  - Quantity removed (calculated from difference)
  - Removal reason in notes
  - Performed by user information

### Loss Calculation

#### Counted as Loss:
- **Damaged / Defective**: 
  - Loss = removed_quantity × unit_price
  - Recorded in stock trail notes
  - Displayed in success message
  - Tracked in member's loss column

#### NOT Counted as Loss:
- **Sold Outside**: No financial impact
- **Listing Error**: No financial impact

### Stock Trail Notes Format
```
{Reason} - {Impact Description}
```

Examples:
- "Damaged / Defective - Loss recorded: ₱150.00"
- "Sold Outside - No impact on system (no revenue or loss recorded)"
- "Listing Error - No impact on system (incorrect stock quantity removed)"

## User Experience

### Before Removal:
1. Admin selects stock to remove
2. Modal shows:
   - Product information
   - Available quantity
   - Quantity input (defaults to full quantity)
   - Reason dropdown
   - Impact information based on reason

### During Removal:
1. Admin can adjust quantity to remove
2. Validation prevents:
   - Removing 0 or negative quantity
   - Removing more than available
   - Submitting without reason

### After Removal:
1. Success message shows:
   - Quantity removed
   - Remaining quantity
   - Loss amount (if applicable)
2. Stock remains visible if quantity > 0
3. Stock trail records the change
4. Member's dashboard updates with new quantities

## Testing Recommendations

### 1. Partial Removal Test
- Remove partial quantity from stock
- Verify remaining quantity is correct
- Verify stock remains active
- Check stock trail shows correct old/new quantities

### 2. Full Removal Test
- Remove all remaining quantity
- Verify stock is marked as removed
- Verify `removed_at` timestamp is set
- Check stock disappears from active inventory

### 3. Loss Calculation Test
- Remove damaged/defective stock
- Verify loss amount = quantity × unit_price
- Check loss appears in member's loss column
- Verify other reasons don't create loss

### 4. Multiple Removals Test
- Remove quantity in multiple steps
- Verify `removed_quantity` accumulates correctly
- Check each removal creates separate trail entry
- Verify notes append for partial removals

### 5. Validation Test
- Try removing more than available
- Try removing 0 or negative quantity
- Try submitting without reason
- Verify appropriate error messages

### 6. Stock Trail Test
- Verify each removal creates trail entry
- Check old_quantity and new_quantity are correct
- Verify notes contain reason and impact
- Check performed_by information is recorded

## Files Modified

1. `database/migrations/2025_11_24_182829_add_removed_quantity_to_stocks_table.php` (NEW)
2. `app/Models/Stock.php`
3. `app/Http/Controllers/Admin/InventoryStockController.php`
4. `resources/js/components/inventory/remove-stock-modal.tsx`
5. `resources/js/pages/Admin/Inventory/index.tsx`
6. `resources/lang/en/admin.php`
7. `resources/lang/tl/admin.php`

## Backward Compatibility

The changes maintain backward compatibility:
- `remove()` method still works without parameters (removes all quantity)
- Existing stock trail entries remain valid
- No data migration needed for existing stocks
- `removed_quantity` defaults to 0 for existing records

## Benefits

1. **Accurate Tracking**: Cumulative removed quantity tracked separately
2. **Flexible Removal**: Support for partial and full removals
3. **Proper Loss Calculation**: Only damaged/defective items count as loss
4. **Better UX**: Clear feedback on remaining quantity
5. **Audit Trail**: Complete history of all removals
6. **Data Integrity**: Stock remains in system until fully depleted

## Notes

- The `removed_quantity` field is cumulative across all removals
- Stock is only soft-deleted when `quantity` reaches 0
- Loss calculation uses the unit price at time of removal
- Multiple partial removals are supported and tracked
- Stock trail maintains complete history of all changes
