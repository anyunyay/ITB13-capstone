# Order History Optimization

## Overview
Optimized the Order History page to prevent unnecessary API calls and improve performance while maintaining all existing functionality.

## Key Optimizations

### 1. Smart Notification Marking
- **Before**: Notifications were marked as read every time the component rendered, causing repeated API calls
- **After**: Notifications are tracked using a `Set` to ensure each notification is only marked once
- **Benefit**: Eliminates duplicate API calls for the same notifications

### 2. Partial Data Fetching
All navigation and data updates now use Inertia's `only` option to fetch only the necessary data:

- **Tab Switching**: Only fetches `orders`, `counts`, `pagination`, and `currentDeliveryStatus`
- **Pagination**: Only fetches `orders` and `pagination`
- **Order Cancellation**: Only fetches `orders`, `counts`, and `notifications`

### 3. State Preservation
- Added `preserveState: true` to all router calls to maintain component state
- Prevents unnecessary re-renders and maintains user scroll position
- Keeps dialog states and form inputs intact during updates

## Technical Changes

### State Management
```typescript
const [markedNotifications, setMarkedNotifications] = useState<Set<number>>(new Set());
```
Tracks which notifications have already been marked as read.

### Notification Effect
```typescript
useEffect(() => {
  if (notifications.length > 0) {
    const unreadNotifications = notifications.filter(n => !markedNotifications.has(n.id));
    
    if (unreadNotifications.length > 0) {
      // Mark only unread notifications
      // Track marked IDs to prevent duplicates
    }
  }
}, [notifications]);
```

### Router Calls with Partial Updates
```typescript
router.get('/customer/orders/history', params, {
  preserveScroll: true,
  preserveState: true,
  only: ['orders', 'counts', 'pagination'], // Fetch only what's needed
});
```

## Performance Impact

- **Reduced API Calls**: Notifications are marked only once instead of on every render
- **Faster Navigation**: Tab switching and pagination fetch minimal data
- **Better UX**: State preservation prevents jarring UI resets
- **Lower Server Load**: Fewer full-page requests reduce backend processing

## No Breaking Changes

All existing functionality remains intact:
- Order display and filtering
- Pagination
- Notifications
- Order cancellation
- Delivery status tracking
- Export functionality
