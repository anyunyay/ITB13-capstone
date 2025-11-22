# Suspicious Order Detection - Quick Reference

## What It Does
Automatically detects and flags when a customer places 2+ orders within 10 minutes.

## Visual Indicators

### Order Card
- 🔴 **Red "Suspicious" badge** with pulse animation
- ⚠️ **Warning message** showing reason
- **Red border** highlighting the order

### Example Display
```
Order #123                    [Pending] [⚠️ Suspicious]
Customer: John Doe
Total: ₱150.00

⚠️ 3 orders placed within 10 minutes (Total: ₱450.00)
```

## How to Handle Suspicious Orders

### 1. Review the Order
- Check customer history
- Verify order details
- Look for unusual patterns

### 2. Contact Customer (if needed)
- Confirm order legitimacy
- Ask about multiple orders
- Verify delivery address

### 3. Take Action
- **Approve** if legitimate
- **Reject** if fraudulent
- **Hold** for further investigation

## Key Files

### Backend
- `app/Services/SuspiciousOrderDetectionService.php` - Detection logic
- `app/Notifications/SuspiciousOrderNotification.php` - Notifications
- `app/Models/SalesAudit.php` - Order model

### Frontend
- `resources/js/components/orders/order-card.tsx` - Visual display
- `resources/js/types/orders.ts` - TypeScript types

### Database
- `sales_audit.is_suspicious` - Flag column
- `sales_audit.suspicious_reason` - Reason text

## Configuration

### Change Detection Window
Edit `app/Services/SuspiciousOrderDetectionService.php`:
```php
const TIME_WINDOW_MINUTES = 10; // Change to desired minutes
```

### Change Minimum Orders
```php
const MIN_ORDERS_FOR_SUSPICIOUS = 2; // Change to desired count
```

## Who Gets Notified?
- All users with **admin** role
- All users with **"view orders"** permission

## Common Scenarios

### Legitimate Cases
- Bulk orders for events
- Multiple family members ordering
- Correcting previous order mistakes

### Suspicious Cases
- Testing payment systems
- Fraudulent activity
- Bot/automated ordering

## Quick Commands

### Check Suspicious Orders
```sql
SELECT * FROM sales_audit WHERE is_suspicious = 1;
```

### Clear Suspicious Flag
```php
SuspiciousOrderDetectionService::clearSuspiciousFlag($order);
```

### View Notifications
```sql
SELECT * FROM notifications 
WHERE type = 'App\\Notifications\\SuspiciousOrderNotification';
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Not detecting | Check time window and order count |
| No notifications | Verify user permissions |
| Badge not showing | Clear browser cache |
| False positives | Adjust detection threshold |

## Best Practices

1. ✅ Review suspicious orders daily
2. ✅ Document investigation results
3. ✅ Clear false positives promptly
4. ✅ Monitor detection accuracy
5. ✅ Adjust thresholds as needed

---

**Quick Help:** Check `SUSPICIOUS_ORDER_DETECTION_IMPLEMENTATION.md` for detailed documentation.
