# Logistics Notification System - Quick Reference

## Notification Types for Logistics Users

| Type | When Sent | Icon | Action |
|------|-----------|------|--------|
| `delivery_task` | Order assigned to logistics user | 🚚 | Navigate to order details |
| `logistic_order_ready` | Admin marks order ready for pickup | 📦 | Navigate to order details |
| `logistic_order_picked_up` | Admin confirms pickup | 🚛 | Navigate to order details |
| `order_status_update` | Order status changes | 📋 | Navigate to order details |
| `delivery_status_update` | Delivery status changes | 🚛 | Navigate to order details |

## Admin Actions That Trigger Notifications

### 1. Assign Order to Logistics User
**Action:** Admin assigns order to logistics user  
**Notification:** `delivery_task`  
**Recipient:** Assigned logistics user  
**Message:** "You have been assigned a new delivery task for Order #{order_id}"

### 2. Mark Order Ready for Pickup
**Action:** Admin clicks "Mark as Ready" button  
**Notification:** `logistic_order_ready`  
**Recipient:** Assigned logistics user  
**Message:** "Order #{order_id} is ready for pickup. Please collect it before proceeding to delivery."  
**Email:** Yes, includes order details and ready time

### 3. Confirm Order Pickup
**Action:** Admin clicks "Confirm Pick Up" button  
**Notification:** `logistic_order_picked_up`  
**Recipient:** Assigned logistics user  
**Message:** "Order #{order_id} pickup confirmed. Please proceed with delivery to {customer_name}."  
**Email:** Yes, includes delivery address and pickup time

## Notification Data Structure

### logistic_order_ready
```json
{
  "order_id": 123,
  "type": "logistic_order_ready",
  "message": "Order #123 is ready for pickup...",
  "action_url": "/logistic/orders/123",
  "ready_for_pickup_at": "2024-01-15T10:30:00Z",
  "customer_name": "John Doe",
  "total_amount": 1500.00
}
```

### logistic_order_picked_up
```json
{
  "order_id": 123,
  "type": "logistic_order_picked_up",
  "message": "Order #123 pickup confirmed...",
  "action_url": "/logistic/orders/123",
  "picked_up_at": "2024-01-15T11:00:00Z",
  "customer_name": "John Doe",
  "delivery_address": "123 Main St, Barangay ABC, City, Province",
  "total_amount": 1500.00
}
```

## Navigation Behavior

All logistics notifications with an `order_id` will:
1. Navigate to `/logistic/orders/{order_id}` when clicked
2. Show full order details including:
   - Order information
   - Customer details
   - Delivery address
   - Order items
   - Delivery status
   - Action buttons

## UI Components

### Notification Bell (Header)
- Shows unread count badge
- Displays last 4 notifications
- Click notification → Navigate to order
- Dismiss button (X) → Hide from header
- "Clear All" button → Hide all notifications

### Notifications Page
- Shows all notifications (paginated)
- Click card → Navigate to order
- "View" button → Navigate to order
- "Mark as Read" button → Mark individual notification
- "Mark All as Read" button → Mark all notifications

## API Endpoints

### Mark Notifications as Read
```
POST /logistic/notifications/mark-read
Body: { ids: [notification_id1, notification_id2] }
```

### Mark All as Read
```
POST /logistic/notifications/mark-all-read
```

### Hide from Header
```
POST /logistic/notifications/{id}/hide-from-header
```

### Hide All from Header
```
POST /logistic/notifications/hide-all-from-header
```

## Code Locations

### Backend
- **Notifications:** `app/Notifications/`
  - `LogisticOrderReadyNotification.php`
  - `LogisticOrderPickedUpNotification.php`
- **Controller:** `app/Http/Controllers/Logistic/NotificationController.php`
- **Order Controller:** `app/Http/Controllers/Admin/OrderController.php`
- **Routes:** `routes/web.php` (lines 353-359)

### Frontend
- **Notification Page:** `resources/js/components/shared/notifications/NotificationPage.tsx`
- **Notification Bell:** `resources/js/components/shared/notifications/NotificationBell.tsx`
- **Logistics Header:** `resources/js/components/logistics/logistics-header.tsx`

## Troubleshooting

### Notification Not Appearing in UI ⚠️ MOST COMMON ISSUE
**Symptom:** Notification is created in database but not visible to user

**Solution:** Check `HandleInertiaRequests` middleware
1. Open `app/Http/Middleware/HandleInertiaRequests.php`
2. Find the logistics case in the notification types switch
3. Verify notification class is in the `$notificationTypes` array:
   ```php
   case 'logistic':
       $notificationTypes = [
           'App\\Notifications\\DeliveryTaskNotification',
           'App\\Notifications\\OrderStatusUpdate',
           'App\\Notifications\\LogisticOrderReadyNotification',      // Must be here
           'App\\Notifications\\LogisticOrderPickedUpNotification'    // Must be here
       ];
   ```
4. If missing, add the notification class name
5. No cache clearing needed - takes effect immediately

### Notification Not Received
1. Check if order has assigned logistics user
2. Verify notification type is in controller filter
3. Check notification queue status
4. Verify email configuration
5. Check database `notifications` table for the record

### Navigation Not Working
1. Check if notification has `order_id` in data
2. Verify notification type is in navigation logic
3. Check route exists: `logistic.orders.show`
4. Verify user has access to order

### Email Not Sent
1. Check queue worker is running
2. Verify email configuration
3. Check notification implements `ShouldQueue`
4. Review mail logs

## Best Practices

1. **Always include order_id** in notification data
2. **Use descriptive messages** that explain the action needed
3. **Include relevant details** (customer name, address, amount)
4. **Provide action links** to relevant pages
5. **Send both email and database** notifications for important events
6. **Test notification flow** end-to-end before deployment
