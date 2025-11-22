# Order History Modal for Lazy-Loaded Orders

## Overview
This implementation ensures that when a notification refers to an order that hasn't been loaded via lazy loading, the system opens that order in a modal with full details instead of just redirecting to an empty page.

## How It Works

### 1. Backend API Endpoint
**File:** `app/Http/Controllers/Customer/OrderController.php`

Added a new `show()` method that fetches a single order by ID:
- Searches in both `sales` and `sales_audit` tables
- Returns complete order details including items, delivery status, and logistics info
- Verifies the order belongs to the authenticated customer

**Route:** `GET /customer/orders/{orderId}`

### 2. Order Details Modal Component
**File:** `resources/js/components/customer/orders/OrderDetailsModal.tsx`

A new modal component that:
- Fetches order details from the API when opened
- Displays complete order information (status, items, delivery progress, notes)
- Shows loading state while fetching data
- Handles errors gracefully
- Provides action buttons to close or view in full history

### 3. Order History Page Integration
**File:** `resources/js/pages/Customer/OrderHistory/index.tsx`

Enhanced the hash-based navigation logic:
- When a notification navigates to `#order-{id}`, the page checks if the order is in the currently loaded list
- **If order exists in list:** Scrolls to it and highlights it (existing behavior)
- **If order NOT in list:** Opens the OrderDetailsModal with full order details
- Clears the hash after opening the modal to prevent re-triggering

### 4. Notification Flow
**File:** `resources/js/components/shared/notifications/NotificationBell.tsx`

No changes needed! The existing notification click handler already navigates to:
```
/customer/orders/history#order-{orderId}
```

This URL pattern now automatically triggers the modal for unloaded orders.

## User Experience

### Before
1. User receives notification about Order #150
2. User clicks notification
3. Redirects to Order History page
4. Order #150 is not visible (still on page 5 of lazy loading)
5. User sees highlighted area but no order content
6. User must manually load more orders or search

### After
1. User receives notification about Order #150
2. User clicks notification
3. Redirects to Order History page
4. System detects Order #150 is not in current list
5. **Modal opens automatically with full Order #150 details**
6. User can view all order information immediately
7. User can click "View in History" to navigate to the full page with the order loaded

## Benefits

✅ **Seamless Access:** Users can view order details immediately without waiting for lazy loading
✅ **No Breaking Changes:** Existing functionality remains intact
✅ **Smart Detection:** Automatically determines whether to scroll or show modal
✅ **Complete Information:** Modal shows all order details, not just a summary
✅ **Better UX:** Reduces frustration when orders are deep in the pagination

## Technical Details

### API Response Format
```json
{
  "order": {
    "id": 150,
    "total_amount": 1250.00,
    "status": "approved",
    "delivery_status": "out_for_delivery",
    "created_at": "2024-11-20T10:30:00.000000Z",
    "admin_notes": "Order approved",
    "logistic": {
      "id": 5,
      "name": "John Delivery",
      "contact_number": "09123456789"
    },
    "audit_trail": [
      {
        "id": 1,
        "product": {
          "id": 10,
          "name": "Product Name"
        },
        "category": "Kilo",
        "quantity": 5,
        "unit_price": 200.00,
        "subtotal": 1000.00,
        "coop_share": 100.00,
        "total_amount": 1100.00
      }
    ],
    "source": "sales_audit"
  }
}
```

### Modal Features
- Responsive design (mobile & desktop)
- Loading spinner during fetch
- Error handling with retry option
- Delivery progress visualization
- Complete order item breakdown
- Admin notes and logistics information
- Action buttons for navigation

## Testing Checklist

- [ ] Click notification for order in current list → Should scroll to order
- [ ] Click notification for order NOT in current list → Should open modal
- [ ] Modal displays all order information correctly
- [ ] Modal loading state works properly
- [ ] Modal error handling works if order not found
- [ ] "View in History" button navigates correctly
- [ ] Modal closes properly
- [ ] Hash is cleared after modal opens
- [ ] Works on mobile and desktop
- [ ] Works for both sales and sales_audit orders

## Files Modified

1. `app/Http/Controllers/Customer/OrderController.php` - Added `show()` method
2. `routes/web.php` - Added route for single order fetch
3. `resources/js/components/customer/orders/OrderDetailsModal.tsx` - New modal component
4. `resources/js/pages/Customer/OrderHistory/index.tsx` - Enhanced hash navigation logic

## Future Enhancements

- Add caching to avoid re-fetching the same order
- Add "Load More" button in modal to load surrounding orders
- Add keyboard shortcuts (ESC to close, arrow keys to navigate)
- Add animation transitions when opening modal
- Add print functionality directly from modal
