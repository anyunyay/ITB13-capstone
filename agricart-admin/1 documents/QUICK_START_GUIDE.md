# Quick Start Guide - Order Notification Modal

## What It Does

When a customer clicks a notification for an order that hasn't been loaded yet, the system automatically opens a modal with full order details instead of showing an empty page.

## How to Use

### For Developers

#### 1. Test the Feature
```bash
# Start the development server
php artisan serve

# In another terminal, start Vite
npm run dev

# Navigate to customer order history
http://localhost:8000/customer/orders/history
```

#### 2. Trigger the Modal
```javascript
// Option 1: Click a notification for an unloaded order
// Option 2: Navigate directly with hash
window.location.href = '/customer/orders/history#order-150';
```

#### 3. Check Translations
```php
// English
__('customer.order_details') // "Order Details"

// Tagalog
__('customer.order_details') // "Mga Detalye ng Order"
```

### For Users

1. **Receive Notification** - Get notified about an order update
2. **Click Notification** - Click on the notification in the bell dropdown
3. **View Details** - Modal opens automatically with full order information
4. **Take Action** - Close modal or click "View in History" to see full page

## Key Files

### Backend
- `app/Http/Controllers/Customer/OrderController.php` - API endpoint
- `routes/web.php` - Route definition

### Frontend
- `resources/js/components/customer/orders/OrderDetailsModal.tsx` - Modal component
- `resources/js/pages/Customer/OrderHistory/index.tsx` - Integration

### Translations
- `resources/lang/en/customer.php` - English translations
- `resources/lang/tl/customer.php` - Tagalog translations

## API Endpoint

```
GET /customer/orders/{orderId}

Response:
{
  "order": {
    "id": 150,
    "total_amount": 1250.00,
    "status": "approved",
    "delivery_status": "out_for_delivery",
    "created_at": "2024-11-20T10:30:00Z",
    "admin_notes": "Order approved",
    "logistic": { ... },
    "audit_trail": [ ... ],
    "source": "sales_audit"
  }
}
```

## Translation Keys

```php
'order_details' => 'Order Details',
'close' => 'Close',
'view_in_history' => 'View in History',
'loading' => 'Loading',
'loading_order_details' => 'Loading order details...',
'failed_to_load_order' => 'Failed to load order details. Please try again.',
'order_not_found' => 'Order not found',
'retry' => 'Retry',
'showing_all_orders' => 'Showing all :count orders',
'show_more' => 'Show More',
```

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 639px) {
  - Modal: 95% width
  - Layout: Vertical stacking
  - Items: Card view
  - Buttons: Full width
}

/* Tablet */
@media (min-width: 640px) and (max-width: 767px) {
  - Modal: 768px max width
  - Layout: Mixed
  - Items: Card view
  - Buttons: Horizontal
}

/* Desktop */
@media (min-width: 768px) {
  - Modal: 896px max width
  - Layout: Horizontal
  - Items: Table view
  - Buttons: Right-aligned
}
```

## Common Issues

### Issue: Modal doesn't open
**Solution:** Check if order ID is valid and user is authenticated

### Issue: Translations not working
**Solution:** Clear cache with `php artisan config:clear`

### Issue: Modal not responsive
**Solution:** Check Tailwind CSS is compiled with `npm run build`

### Issue: API returns 404
**Solution:** Verify route is registered with `php artisan route:list`

## Testing Commands

```bash
# Check routes
php artisan route:list --path=customer/orders

# Clear cache
php artisan config:clear
php artisan cache:clear

# Compile assets
npm run build

# Run tests (if available)
php artisan test
```

## Quick Debugging

### Check if order exists
```php
// In tinker
php artisan tinker
$order = \App\Models\SalesAudit::find(150);
$order->customer_id; // Should match authenticated user
```

### Check translations
```php
// In tinker
php artisan tinker
__('customer.order_details'); // Should return translation
```

### Check API response
```bash
# Using curl (replace with actual token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/customer/orders/150
```

## Browser DevTools

### Check modal state
```javascript
// In browser console
// Check if modal is open
document.querySelector('[role="dialog"]');

// Check order data
// (React DevTools required)
```

### Check translations
```javascript
// In browser console
// Check if translations are loaded
window.__INERTIA_PAGE__.props.translations.customer;
```

## Performance Tips

1. **Lazy Loading** - Modal only fetches when opened
2. **Caching** - Consider implementing order caching
3. **Debouncing** - Prevent multiple API calls
4. **Optimization** - Use React DevTools Profiler

## Accessibility Tips

1. **Keyboard** - Test with Tab, Enter, Escape keys
2. **Screen Reader** - Test with NVDA or JAWS
3. **Zoom** - Test at 200% browser zoom
4. **Contrast** - Use browser DevTools to check

## Support

### Documentation
- See `ORDER_MODAL_LAZY_LOADING_IMPLEMENTATION.md` for details
- See `ORDER_MODAL_TRANSLATIONS_RESPONSIVE.md` for responsive design
- See `FINAL_IMPLEMENTATION_SUMMARY.md` for complete overview

### Need Help?
1. Check documentation files
2. Review code comments
3. Check browser console for errors
4. Check Laravel logs: `storage/logs/laravel.log`

## Quick Reference

| Action | Result |
|--------|--------|
| Click notification | Opens modal or scrolls to order |
| Order in list | Scrolls and highlights |
| Order not in list | Opens modal with details |
| Click "Close" | Closes modal |
| Click "View in History" | Navigates to full page |
| Press Escape | Closes modal |

## Status Indicators

| Status | Badge Color |
|--------|-------------|
| Pending | Gray |
| Approved | Green |
| Rejected | Red |
| Delayed | Orange |
| Cancelled | Gray |
| Delivered | Green |

## Delivery Progress

```
[1] Preparing → [2] Ready → [3] Out for Delivery → [4] Delivered
```

## That's It!

The Order Notification Modal is now fully functional, responsive, and translated. Enjoy seamless order access! 🎉
