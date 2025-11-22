# Suspicious Order Detection System - Implementation Guide

## Overview
The Suspicious Order Detection System automatically identifies and flags orders from the same customer placed within a 10-minute window. When detected, the system marks these orders as "Suspicious" and sends notifications to all users with permission to view orders.

## Features Implemented

### 1. **Automatic Detection**
- Monitors order creation in real-time
- Detects 2 or more orders from the same customer within 10 minutes
- Automatically flags all related orders as suspicious

### 2. **Visual Indicators**
- **Red "Suspicious" badge** on order cards with pulse animation
- **Warning message** displaying the reason (e.g., "3 orders placed within 10 minutes")
- **Highlighted border** on suspicious order cards

### 3. **Notification System**
- Sends notifications to all admins and staff with "view orders" permission
- Includes order details, customer information, and reason for flagging
- Notifications appear in the notification bell dropdown

### 4. **Database Tracking**
- New fields in `sales_audit` table:
  - `is_suspicious` (boolean): Marks if order is suspicious
  - `suspicious_reason` (text): Stores the detection reason

## Technical Implementation

### Backend Components

#### 1. **Migration**
```
database/migrations/2025_11_22_000000_add_is_suspicious_to_sales_audit_table.php
```
- Adds `is_suspicious` and `suspicious_reason` columns to `sales_audit` table

#### 2. **Service Class**
```
app/Services/SuspiciousOrderDetectionService.php
```

**Key Methods:**
- `checkForSuspiciousPattern(SalesAudit $newOrder)`: Checks if an order is part of a suspicious pattern
- `markAsSuspicious(SalesAudit $triggerOrder, array $suspiciousInfo)`: Marks orders as suspicious
- `notifyAuthorizedUsers()`: Sends notifications to authorized users
- `getSuspiciousOrders()`: Retrieves all suspicious orders
- `clearSuspiciousFlag(SalesAudit $order)`: Removes suspicious flag

**Configuration:**
- `TIME_WINDOW_MINUTES = 10`: Time window for detection
- `MIN_ORDERS_FOR_SUSPICIOUS = 2`: Minimum orders to trigger alert

#### 3. **Notification Class**
```
app/Notifications/SuspiciousOrderNotification.php
```
- Sends database notifications to authorized users
- Includes order details, customer info, and related orders

#### 4. **Model Updates**
```
app/Models/SalesAudit.php
```
- Added `is_suspicious` and `suspicious_reason` to fillable fields
- Added boolean cast for `is_suspicious`

#### 5. **Controller Integration**
```
app/Http/Controllers/Customer/CartController.php
```
- Integrated detection in `checkout()` method
- Automatically checks and flags suspicious orders after successful checkout

```
app/Http/Controllers/Admin/OrderController.php
```
- Updated `index()` and `show()` methods to include suspicious order data
- Added fields to order transformations

### Frontend Components

#### 1. **Type Definitions**
```
resources/js/types/orders.ts
```
- Added `is_suspicious?: boolean`
- Added `suspicious_reason?: string`

#### 2. **Order Card Component**
```
resources/js/components/orders/order-card.tsx
```
- Displays red "Suspicious" badge with pulse animation
- Shows warning message with reason in order summary
- Highlights suspicious orders with red border

#### 3. **Translation Files**
```
resources/lang/en/notifications.php
resources/lang/tl/notifications.php
```
- Added `suspicious_order_detected` translation key
- Supports English and Tagalog

## How It Works

### Detection Flow

1. **Customer Places Order**
   - Customer completes checkout in cart
   - Order is created with status "pending"

2. **Automatic Detection**
   - System checks for orders from same customer within 10-minute window
   - If 2+ orders found, triggers suspicious pattern detection

3. **Flagging Process**
   - All related orders marked as suspicious
   - Reason stored (e.g., "3 orders placed within 10 minutes (Total: ₱450.00)")
   - Logged in system logs

4. **Notification Dispatch**
   - Retrieves all users with "view orders" permission
   - Sends notification to each authorized user
   - Notification includes:
     - Order ID
     - Customer name
     - Number of orders
     - Total amount
     - Related order IDs

5. **Visual Display**
   - Admin sees red "Suspicious" badge on order cards
   - Warning message displayed in order details
   - Orders highlighted for easy identification

### Example Scenario

**Timeline:**
- 10:00 AM - Customer places Order #101 (₱150)
- 10:05 AM - Customer places Order #102 (₱200)
- 10:08 AM - Customer places Order #103 (₱100)

**Result:**
- All 3 orders flagged as suspicious
- Reason: "3 orders placed within 10 minutes (Total: ₱450.00)"
- Notifications sent to all admins/staff with order viewing permissions

## Configuration

### Adjusting Detection Parameters

Edit `app/Services/SuspiciousOrderDetectionService.php`:

```php
// Change time window (default: 10 minutes)
const TIME_WINDOW_MINUTES = 10;

// Change minimum orders threshold (default: 2)
const MIN_ORDERS_FOR_SUSPICIOUS = 2;
```

### Who Receives Notifications

Users with any of these permissions:
- Role: `admin`
- Permission: `view orders`

## Database Schema

### sales_audit Table (New Columns)

| Column | Type | Description |
|--------|------|-------------|
| `is_suspicious` | boolean | Whether order is flagged as suspicious |
| `suspicious_reason` | text | Reason for flagging (nullable) |

## API Response Structure

### Order Object (with suspicious fields)

```json
{
  "id": 123,
  "customer": {...},
  "total_amount": 150.00,
  "status": "pending",
  "is_suspicious": true,
  "suspicious_reason": "3 orders placed within 10 minutes (Total: ₱450.00)",
  ...
}
```

### Notification Data

```json
{
  "message_key": "suspicious_order_detected",
  "order_id": 123,
  "customer_id": 45,
  "customer_name": "John Doe",
  "total_amount": 150.00,
  "reason": "3 orders placed within 10 minutes (Total: ₱450.00)",
  "related_orders": [
    {"id": 121, "total_amount": 200.00, "created_at": "2025-11-22T10:00:00Z"},
    {"id": 122, "total_amount": 100.00, "created_at": "2025-11-22T10:05:00Z"}
  ],
  "order_count": 3,
  "created_at": "2025-11-22T10:08:00Z"
}
```

## Testing

### Manual Testing Steps

1. **Create Test Orders:**
   - Login as a customer
   - Place first order
   - Immediately place second order (within 10 minutes)
   - Place third order (within 10 minutes)

2. **Verify Detection:**
   - Check system logs for detection message
   - Verify all orders marked as suspicious in database

3. **Check Notifications:**
   - Login as admin
   - Check notification bell
   - Verify suspicious order notification appears

4. **Visual Verification:**
   - Navigate to Orders page
   - Verify red "Suspicious" badge on order cards
   - Check warning message in order details

### Database Verification

```sql
-- Check suspicious orders
SELECT id, customer_id, is_suspicious, suspicious_reason, created_at 
FROM sales_audit 
WHERE is_suspicious = 1 
ORDER BY created_at DESC;

-- Check notifications sent
SELECT * FROM notifications 
WHERE type = 'App\\Notifications\\SuspiciousOrderNotification' 
ORDER BY created_at DESC;
```

## Troubleshooting

### Issue: Orders Not Being Flagged

**Possible Causes:**
1. Orders placed more than 10 minutes apart
2. Orders from different customers
3. Service not properly integrated in checkout

**Solution:**
- Check system logs for detection attempts
- Verify `SuspiciousOrderDetectionService` is called in `CartController::checkout()`
- Ensure migration ran successfully

### Issue: Notifications Not Sent

**Possible Causes:**
1. No users with "view orders" permission
2. Notification queue not running
3. Database notification table issues

**Solution:**
- Verify users have correct permissions
- Check `notifications` table for entries
- Review system logs for errors

### Issue: Visual Indicators Not Showing

**Possible Causes:**
1. Frontend not receiving suspicious fields
2. TypeScript types not updated
3. Component not rendering badges

**Solution:**
- Check browser console for errors
- Verify API response includes `is_suspicious` field
- Ensure `OrderCard` component updated

## Future Enhancements

### Potential Improvements

1. **Configurable Settings:**
   - Admin panel to adjust time window
   - Customize minimum order threshold
   - Enable/disable detection

2. **Advanced Detection:**
   - IP address tracking
   - Device fingerprinting
   - Unusual order patterns (e.g., same items, large quantities)

3. **Action Options:**
   - Auto-hold suspicious orders
   - Require additional verification
   - Email alerts to admins

4. **Analytics Dashboard:**
   - Suspicious order trends
   - Customer behavior analysis
   - False positive tracking

5. **Whitelist Feature:**
   - Mark trusted customers
   - Exclude from detection
   - Custom rules per customer

## Security Considerations

1. **Privacy:**
   - Suspicious flag is internal only
   - Not visible to customers
   - Stored securely in database

2. **False Positives:**
   - Legitimate bulk orders may be flagged
   - Manual review recommended
   - Clear flag option available

3. **Logging:**
   - All detections logged
   - Audit trail maintained
   - Notification history preserved

## Maintenance

### Regular Tasks

1. **Review Flagged Orders:**
   - Check suspicious orders weekly
   - Clear false positives
   - Adjust thresholds if needed

2. **Monitor Performance:**
   - Check detection accuracy
   - Review notification delivery
   - Optimize query performance

3. **Update Documentation:**
   - Document pattern changes
   - Update troubleshooting guides
   - Record configuration changes

## Support

For issues or questions:
1. Check system logs: `storage/logs/laravel.log`
2. Review database entries
3. Verify permissions and roles
4. Contact development team

---

**Implementation Date:** November 22, 2025  
**Version:** 1.0  
**Status:** ✅ Complete and Deployed
