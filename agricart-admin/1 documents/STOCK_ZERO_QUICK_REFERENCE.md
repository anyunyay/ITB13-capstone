# Stock Zero Auto-Trail - Quick Reference

## What Changed?

### Automatic Behavior
When a product's stock reaches **zero quantity** through sales:
1. ✅ Automatically creates a Stock Trail entry (action: 'completed')
2. 🔒 Locks the stock from further modifications
3. 📊 Preserves all data for reporting and audit
4. 🚫 Prevents editing or removing the locked stock

### Stock States

| State | Quantity | Sold Qty | Can Edit? | Can Remove? | Status |
|-------|----------|----------|-----------|-------------|--------|
| Active | > 0 | Any | ✅ Yes | ✅ Yes | Available/Low Stock |
| Locked | 0 | > 0 | ❌ No | ❌ No | Out of Stock (Locked) |
| Removed | Any | Any | ❌ No | ❌ No | Removed |

## Key Files Modified

### Backend
1. **`app/Models/Stock.php`**
   - Added: `isLocked()`, `canBeEdited()`, `canBeRemoved()`
   - Added: Auto-appended attributes for frontend

2. **`app/Http/Controllers/Admin/OrderController.php`**
   - Modified: `approve()` method
   - Added: Automatic Stock Trail creation when quantity = 0

3. **`app/Http/Controllers/Admin/InventoryStockController.php`**
   - Modified: `editStock()`, `updateStock()`, `storeRemoveStock()`
   - Added: Locked stock validation checks

### Frontend
1. **`resources/js/types/inventory.ts`**
   - Added: `is_locked`, `can_be_edited`, `can_be_removed` to Stock interface

2. **`resources/js/components/inventory/stock-locked-badge.tsx`**
   - New component for displaying locked status

### Translations
1. **`resources/lang/en/admin.php`** & **`resources/lang/tl/admin.php`**
   - Added: `locked`, `stock_fully_sold_locked`, `total_sold`

## Error Messages

### Attempting to Edit Locked Stock
```
Cannot edit stock that has been fully sold. 
This stock has been moved to Stock Trail and is locked from modifications.
```

### Attempting to Remove Locked Stock
```
Cannot remove stock that has been fully sold. 
This stock has been moved to Stock Trail and is locked from modifications.
```

## Stock Trail Entry Format

When stock reaches zero, this entry is created:

```php
StockTrail::record(
    stockId: $stock->id,
    productId: $stock->product_id,
    actionType: 'completed',
    oldQuantity: $lastQuantity,
    newQuantity: 0,
    memberId: $stock->member_id,
    category: $stock->category,
    notes: "Stock fully sold and moved to Stock Trail (Order #123). Total sold: 50",
    performedBy: $admin->id,
    performedByType: 'admin'
);
```

## API Response Changes

Stock objects now include:
```json
{
    "id": 1,
    "quantity": 0,
    "sold_quantity": 50,
    "is_locked": true,
    "can_be_edited": false,
    "can_be_removed": false,
    ...
}
```

## Common Scenarios

### Scenario 1: Stock Fully Sold
```
Initial: quantity = 10, sold_quantity = 0
Order: Customer buys 10 units
After Approval:
  - quantity = 0
  - sold_quantity = 10
  - is_locked = true
  - Stock Trail entry created automatically
```

### Scenario 2: Partial Sale
```
Initial: quantity = 10, sold_quantity = 0
Order: Customer buys 5 units
After Approval:
  - quantity = 5
  - sold_quantity = 5
  - is_locked = false
  - No automatic Stock Trail (stock still available)
```

### Scenario 3: Multiple Sales to Zero
```
Initial: quantity = 10, sold_quantity = 0
Order 1: Customer buys 7 units
  - quantity = 3, sold_quantity = 7
Order 2: Customer buys 3 units
  - quantity = 0, sold_quantity = 10
  - Stock Trail entry created (Order #2 completed the stock)
```

## Database Schema

No schema changes required! Uses existing fields:
- `stocks.quantity` - Available quantity
- `stocks.sold_quantity` - Total sold
- `stock_trails` table - Audit history

## Rollback Plan

If needed, to rollback:
1. Revert `app/Models/Stock.php` changes
2. Revert `app/Http/Controllers/Admin/OrderController.php` changes
3. Revert `app/Http/Controllers/Admin/InventoryStockController.php` changes
4. Remove `resources/js/components/inventory/stock-locked-badge.tsx`
5. Revert translation files

Existing data remains intact - no database migrations needed.

## Support

For issues or questions:
1. Check Stock Trail for 'completed' entries
2. Verify stock has `quantity = 0` and `sold_quantity > 0`
3. Check system logs for automatic movement entries
4. Review order approval logs

## Performance Notes

- Minimal performance impact (single additional query per zero-quantity stock)
- Stock Trail entries are indexed for fast retrieval
- Frontend attributes are computed on-demand
- No additional database queries for locked status check
