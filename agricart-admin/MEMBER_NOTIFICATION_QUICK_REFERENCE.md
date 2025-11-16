# Member Notification Quick Reference

## Quick Navigation Guide

### For Members
When a member clicks on a notification, they will be redirected to:

| Notification | Where It Goes | What Gets Highlighted |
|-------------|---------------|----------------------|
| 🛒 **Product Sale** | All Stocks → Transactions Tab | The specific transaction |
| 💰 **Earnings Update** | Dashboard | Earnings summary cards |
| ⚠️ **Low Stock Alert** | All Stocks → Stocks Tab | The low stock item |
| 📦 **Stock Added** | All Stocks → Stocks Tab | The newly added stock |

## Implementation Summary

### Code Location
File: `resources/js/pages/Profile/all-notifications.tsx`

### Member Notification Handler
```typescript
if (userType === 'member') {
  if (notification.type === 'product_sale') {
    // → /member/all-stocks?view=transactions&highlight_transaction={id}
  } else if (notification.type === 'earnings_update') {
    // → /member/dashboard
  } else if (notification.type === 'low_stock_alert') {
    // → /member/all-stocks?view=stocks&highlight_stock={id}
  } else if (notification.type === 'stock_added') {
    // → /member/all-stocks?view=stocks&highlight_stock={id}
  }
}
```

## Notification Data Requirements

### Product Sale
```php
// In ProductSaleNotification.php
'audit_trail_id' => $this->auditTrail->id,  // ← Used for highlighting
'sale_id' => $this->sale->id,
'stock_id' => $this->stock->id,
```

### Earnings Update
```php
// In EarningsUpdateNotification.php
'amount' => $this->amount,
'period' => $this->period,
'action_url' => '/member/dashboard',
```

### Low Stock Alert
```php
// In LowStockAlertNotification.php
'stock_id' => $this->stock->id,              // ← Used for highlighting
'product_id' => $this->stock->product_id,
'stock_type' => $stockType,
```

### Stock Added
```php
// In StockAddedNotification.php
'stock_id' => $this->stock->id,              // ← Used for highlighting
'product_id' => $this->stock->product_id,
'category' => $this->stock->category,
```

## Visual Indicators

### Icons
- 🛒 Product Sale: Green dollar sign
- 💰 Earnings Update: Green dollar sign
- ⚠️ Low Stock Alert: Red warning triangle
- 📦 Stock Added: Green package

### Border Colors
- Product Sale: Green (border-l-green-500)
- Earnings Update: Green (border-l-green-500)
- Low Stock Alert: Red (border-l-red-500)
- Stock Added: Green (border-l-green-500)

## Testing Commands

### Create Test Notifications
```bash
php artisan db:seed --class=NotificationSeeder
```

### Check Member Notifications
1. Login as a member
2. Navigate to Profile → Notifications
3. Click on each notification type
4. Verify correct page and highlighting

## Common Issues & Solutions

### Issue: Notification doesn't navigate
**Solution**: Check if notification has `action_url` or required data fields

### Issue: Wrong item highlighted
**Solution**: Verify `stock_id`, `product_id`, or `audit_trail_id` in notification data

### Issue: Highlighting doesn't work
**Solution**: Check if allStocks.tsx has the highlighting logic and CSS classes

### Issue: Notification not marked as read
**Solution**: Ensure `handleMarkAsRead()` is called before navigation

## Developer Notes

### Adding New Member Notification Types
1. Create notification class in `app/Notifications/`
2. Add routing logic in `handleNotificationClick()` function
3. Add icon in `getNotificationIcon()` function
4. Add title in `getNotificationTitle()` function
5. Add color in `getNotificationColor()` function
6. Add to clickable logic check
7. Update this documentation

### URL Parameter Patterns
```
Stocks View:
- By stock ID: ?view=stocks&highlight_stock={id}
- By product: ?view=stocks&highlight_product={id}&highlight_category={category}

Transactions View:
- By transaction: ?view=transactions&highlight_transaction={id}

Dashboard:
- With notification: ?highlight_notification={id}
```

## Related Documentation
- See `MEMBER_NOTIFICATION_ROUTING_UPDATE.md` for detailed implementation
- See `NOTIFICATION_SEEDER_DOCUMENTATION.md` for seeder details
- See `NOTIFICATION_SYSTEM_GUIDE.md` for overall system architecture
