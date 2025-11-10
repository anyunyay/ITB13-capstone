# Order History Optimization

## Overview
Optimized the Order History page to prevent unnecessary API calls and improve performance while maintaining all existing functionality.

## Key Optimizations

### 1. Smart Notification Marking & Filtering
- **Before**: Notifications were marked as read after a 2-second delay, which could cause them to appear as unread multiple times if the user navigated away or the page refreshed
- **After**: 
  - **Client-side filtering**: Only unread notifications (`!n.read_at`) are displayed on the Order History page
  - Notifications are marked as read **immediately** when they first appear on the page
  - Notifications are tracked using a `Set` to ensure each notification is only marked once
  - No delay means notifications are instantly marked, preventing duplicate unread states
  - Once marked as read, they disappear from the page immediately on next render
- **Benefit**: 
  - Eliminates duplicate API calls and prevents notifications from appearing as unread multiple times
  - Notifications disappear correctly after being marked as read
  - Read/unread status is accurately reflected even after page switches

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

### Notification Filtering
```typescript
const allNotifications = page.props.notifications || [];

// Filter to show only unread notifications on this page
const notifications = allNotifications.filter(n => !n.read_at);
```
- Filters out read notifications before displaying them
- Ensures only unread notifications appear on the Order History page
- Once marked as read on the backend, they won't appear on subsequent renders

### State Management
```typescript
const [markedNotifications, setMarkedNotifications] = useState<Set<number>>(new Set());
const isMarkingNotifications = useRef(false);
```
- `markedNotifications`: Tracks which notifications have already been marked as read
- `isMarkingNotifications`: Ref to prevent concurrent API calls for marking notifications

### Notification Effect
```typescript
useEffect(() => {
  if (notifications.length > 0 && !isMarkingNotifications.current) {
    const unreadNotifications = notifications.filter(n => !markedNotifications.has(n.id));
    
    if (unreadNotifications.length > 0) {
      isMarkingNotifications.current = true;
      
      // Track marked IDs first to prevent duplicates
      setMarkedNotifications(prev => {
        const newSet = new Set(prev);
        unreadNotifications.forEach(n => newSet.add(n.id));
        return newSet;
      });
      
      // Mark notifications immediately (no delay)
      router.post('/customer/notifications/mark-read', {
        ids: unreadNotifications.map(n => n.id),
      }, { 
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          isMarkingNotifications.current = false;
        },
      });
    }
  }
}, [notifications]);
```

**Key Changes:**
- Added `useRef` to prevent concurrent API calls
- Removed `only: ['notifications']` to prevent Inertia routing errors
- Track notifications in state **before** making the API call to prevent race conditions
- Use `onFinish` callback to reset the ref after the request completes
- Maintains scroll position and component state during the update

### Router Calls with Partial Updates
```typescript
router.get('/customer/orders/history', params, {
  preserveScroll: true,
  preserveState: true,
  only: ['orders', 'counts', 'pagination'], // Fetch only what's needed
});
```

## Performance Impact

- **Immediate Marking**: Notifications are marked as read instantly when shown, preventing duplicate unread states
- **Reduced API Calls**: Notifications are marked only once instead of on every render
- **No Delays**: Removed the 2-second timeout, making the marking process instant and reliable
- **Faster Navigation**: Tab switching and pagination fetch minimal data
- **Better UX**: State preservation prevents jarring UI resets, and notifications don't reappear as unread
- **Lower Server Load**: Fewer full-page requests reduce backend processing

## No Breaking Changes

All existing functionality remains intact:
- Order display and filtering
- Pagination
- Notifications
- Order cancellation
- Delivery status tracking
- Export functionality
