# Suspicious Orders Separation - Quick Reference

## What Was Done

✅ **Created dedicated Suspicious Orders page** at `/admin/orders/suspicious`
✅ **Hidden suspicious groups from main Orders page** - only shows individual orders
✅ **Added navigation** between main orders and suspicious orders
✅ **Added translations** for English and Tagalog
✅ **Maintained all existing functionality** - no breaking changes

## Key Changes

### Main Orders Page (`/admin/orders`)
- **Before**: Mixed regular orders + suspicious groups
- **After**: Only regular individual orders
- **Alert**: Shows banner with link to suspicious orders page when patterns detected

### Suspicious Orders Page (`/admin/orders/suspicious`) - NEW
- **Shows**: Only suspicious order groups (2+ orders within 10 minutes)
- **Features**: Statistics, pagination, back button
- **Access**: Requires "view orders" permission

## Quick Access

### Routes
```php
// Main orders
route('admin.orders.index')

// Suspicious orders
route('admin.orders.suspicious')
```

### Files Changed
```
Backend:
- routes/web.php (added route)
- app/Http/Controllers/Admin/OrderController.php (added suspicious() method)

Frontend:
- resources/js/Pages/Admin/Orders/suspicious.tsx (NEW)
- resources/js/components/orders/order-management.tsx (filter logic)

Translations:
- resources/lang/en/admin.php (4 new keys)
- resources/lang/tl/admin.php (4 new keys)
```

## User Flow

1. Admin views main Orders page
2. If suspicious patterns exist → Alert banner appears
3. Click "View Suspicious Orders" button
4. Navigate to dedicated Suspicious Orders page
5. Review all suspicious groups in one place
6. Click "Back to Orders" to return

## Translation Keys

```php
'suspicious_orders'
'suspicious_orders_description'
'no_suspicious_orders'
'no_suspicious_orders_description'
```

## Testing

```bash
# Visit main orders
/admin/orders

# Visit suspicious orders
/admin/orders/suspicious
```

---

**Status**: ✅ Complete and Ready
**Date**: November 22, 2025
