# Delivery Status Notifications Implementation

## Overview
Implemented comprehensive customer notifications for all delivery status updates, covering the complete delivery lifecycle from order approval to final delivery.

## Delivery Stages & Notifications

### 1. Preparing (Pending)
**Trigger**: When admin approves an order
**Location**: `app/Http/Controllers/Admin/OrderController.php` - `approve()` method
**Notification**: DeliveryStatusUpdate
- **Status**: `pending`
- **Message**: "Your order is being prepared for delivery."
- **Sent to**: Customer
- **When**: Immediately after order approval

### 2. Ready for Pickup (Ready)
**Trigger**: When admin marks order as ready for pickup
**Location**: `app/Http/Controllers/Admin/OrderController.php` - `markReady()` method
**Notification**: DeliveryStatusUpdate
- **Status**: `ready_to_pickup`
- **Message**: "Your order is ready for pickup and will be delivered soon."
- **Sent to**: Customer & Logistic
- **When**: When order is packed and ready for logistic to collect

### 3. Out for Delivery
**Trigger**: When admin confirms logistic picked up the order
**Location**: `app/Http/Controllers/Admin/OrderController.php` - `markPickedUp()` method
**Notification**: DeliveryStatusUpdate
- **Status**: `out_for_delivery`
- **Message**: "Your order is out for delivery and on its way to you."
- **Sent to**: Customer
- **When**: After logistic picks up the order from the facility

### 4. Delivered
**Trigger**: When logistic marks order as delivered
**Location**: `app/Http/Controllers/Logistic/LogisticController.php` - `markDelivered()` method
**Notification**: DeliveryStatusUpdate
- **Status**: `delivered`
- **Message**: "Your order has been delivered successfully. Thank you for your purchase!"
- **Sent to**: Customer
- **When**: After logistic confirms delivery with proof image

## Notification Class

### DeliveryStatusUpdate
**File**: `app/Notifications/DeliveryStatusUpdate.php`

**Constructor Parameters**:
- `$orderId`: The order ID
- `$deliveryStatus`: The delivery status (pending, ready_to_pickup, out_for_delivery, delivered)
- `$message`: Custom message for the notification

**Channels**:
- Database (for in-app notifications)
- Email (for email notifications)

**Data Structure**:
```php
[
    'order_id' => $orderId,
    'type' => 'delivery_status_update',
    'delivery_status' => $deliveryStatus,
    'message' => $message,
    'action_url' => '/customer/orders/history',
]
```

## Frontend Display

### Order History Page
**File**: `resources/js/pages/Customer/Order History/index.tsx`

**Features**:
- Displays unread notifications at the top of the page
- Filters out read notifications automatically
- Shows delivery status progress indicator for approved orders
- Highlights the current delivery stage
- Marks notifications as read immediately when displayed

### Notification Bell
**File**: `resources/js/components/NotificationBell.tsx`

**Features**:
- Shows badge with unread count (displays "9+" for 10+ notifications)
- Displays delivery status icon (🚛) for delivery updates
- Links directly to order history page with order highlighted
- Color-coded notifications (green for delivery updates)

## Notification Flow

```
Order Approved
    ↓
[Preparing] Notification sent
    ↓
Admin marks as Ready
    ↓
[Ready] Notification sent
    ↓
Admin confirms Pickup
    ↓
[Out for Delivery] Notification sent
    ↓
Logistic marks Delivered
    ↓
[Delivered] Notification sent
```

## Database Storage

All notifications are stored in the `notifications` table with:
- `id`: Unique notification ID
- `type`: `App\Notifications\DeliveryStatusUpdate`
- `notifiable_type`: `App\Models\User`
- `notifiable_id`: Customer user ID
- `data`: JSON containing order_id, delivery_status, message, etc.
- `read_at`: Timestamp when notification was read (null if unread)
- `created_at`: When notification was created

## Email Notifications

Each delivery status update also sends an email to the customer with:
- Subject: "Delivery Status Update - Order #[ID]"
- Greeting with customer name
- Order ID and delivery status
- Custom message for the status
- Update timestamp
- Action button to view order history
- Professional email template

## System Logging

All delivery status changes are logged using `SystemLogger`:
- Order ID
- Old status → New status
- User who made the change
- Timestamp
- Additional context (customer_id, total_amount, etc.)

## Benefits

1. **Real-time Updates**: Customers are notified immediately when their order status changes
2. **Transparency**: Clear communication about order progress
3. **Reduced Support Queries**: Customers can track their orders without contacting support
4. **Email & In-App**: Dual notification channels ensure customers don't miss updates
5. **Accurate Status**: Notifications only sent when actual status changes occur
6. **No Duplicates**: Smart filtering prevents showing the same notification multiple times

## Testing

To test the notification system:

1. **Create an order** as a customer
2. **Approve the order** as admin → Check for "Preparing" notification
3. **Mark as ready** as admin → Check for "Ready" notification
4. **Confirm pickup** as admin → Check for "Out for Delivery" notification
5. **Mark as delivered** as logistic → Check for "Delivered" notification

Each step should trigger a notification visible in:
- Order History page (top banner)
- Notification bell (header icon)
- Email inbox (customer's email)
