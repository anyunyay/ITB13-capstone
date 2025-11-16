# Member Notification Routing Update

## Overview
Updated the Member notification handling system to ensure each notification type redirects users to the correct corresponding page with proper highlighting and context.

## Changes Made

### 1. Enhanced Member Notification Routing
Updated `resources/js/pages/Profile/all-notifications.tsx` to handle all member notification types:

#### Notification Types & Routing

| Notification Type | Destination | Highlighting |
|------------------|-------------|--------------|
| `product_sale` | `/member/all-stocks?view=transactions` | Highlights specific transaction using `audit_trail_id` |
| `earnings_update` | `/member/dashboard` | Shows earnings summary on dashboard |
| `low_stock_alert` | `/member/all-stocks?view=stocks` | Highlights low stock item by `stock_id` or `product_id` + `category` |
| `stock_added` | `/member/all-stocks?view=stocks` | Highlights newly added stock by `stock_id` or `product_id` + `category` |

### 2. Improved Data Handling

#### Product Sale Notifications
- Now checks for `audit_trail_id` first (most accurate)
- Falls back to `transaction_id` or `id` if audit trail not available
- Properly highlights the transaction in the transaction history view

#### Low Stock Alert Notifications
- Supports both `stock_type` and `category` fields
- Can highlight by specific `stock_id` or by `product_id` + `category` combination
- Ensures users see exactly which stock needs attention

#### Stock Added Notifications (NEW)
- Added full support for stock_added notification type
- Highlights the newly added stock in the stocks overview
- Uses `stock_id` or `product_id` + `category` for precise highlighting

### 3. UI Enhancements

#### Added Stock Added Notification Support
- **Icon**: Green package icon (Package component)
- **Title**: "Stock Added"
- **Color**: Green border (border-l-green-500)
- **Clickable**: Yes - navigates to stocks view with highlighting

#### Updated Clickable Logic
Member notifications are now clickable for:
- `product_sale` - View transaction details
- `earnings_update` - View dashboard
- `low_stock_alert` - View and manage low stock
- `stock_added` - View newly added stock

## Technical Details

### URL Parameters Used

#### For Transactions View
```
/member/all-stocks?view=transactions&highlight_transaction={id}
```

#### For Stocks View
```
/member/all-stocks?view=stocks&highlight_stock={stock_id}
```
or
```
/member/all-stocks?view=stocks&highlight_product={product_id}&highlight_category={category}
```

#### For Dashboard
```
/member/dashboard?highlight_notification={notification_id}
```

### Data Structure Expected

#### Product Sale Notification
```javascript
{
  type: 'product_sale',
  data: {
    audit_trail_id: number,  // Primary identifier
    transaction_id: number,  // Fallback
    stock_id: number,
    sale_id: number,
    product_name: string,
    customer_name: string,
    quantity_sold: number
  }
}
```

#### Earnings Update Notification
```javascript
{
  type: 'earnings_update',
  data: {
    amount: number,
    period: string,
    details: {
      total_sales: number,
      commission_rate: number,
      sales_count: number
    }
  }
}
```

#### Low Stock Alert Notification
```javascript
{
  type: 'low_stock_alert',
  data: {
    stock_id: number,
    product_id: number,
    stock_type: string,  // or 'category'
    product_name: string,
    current_quantity: number,
    threshold: number
  }
}
```

#### Stock Added Notification
```javascript
{
  type: 'stock_added',
  data: {
    stock_id: number,
    product_id: number,
    category: string,
    product_name: string,
    quantity: number,
    added_by: string,
    added_by_type: string
  }
}
```

## Integration with Existing System

### Compatible with allStocks.tsx
The allStocks page already has highlighting logic that supports:
- `highlight_stock` - Highlights by stock ID
- `highlight_product` + `highlight_category` - Highlights by product and category
- `highlight_transaction` - Highlights specific transaction
- `view` parameter - Switches between stocks and transactions view

### Compatible with Notification Classes
All notification classes in `app/Notifications/` already provide the correct data structure:
- `ProductSaleNotification.php` - Includes `audit_trail_id`
- `EarningsUpdateNotification.php` - Includes amount and period
- `LowStockAlertNotification.php` - Includes stock details
- `StockAddedNotification.php` - Includes stock and product details

## Testing Checklist

### Product Sale Notifications
- [ ] Click notification navigates to transactions view
- [ ] Correct transaction is highlighted
- [ ] Notification is marked as read
- [ ] Highlighting animation works properly

### Earnings Update Notifications
- [ ] Click notification navigates to dashboard
- [ ] Dashboard shows current earnings
- [ ] Notification is marked as read

### Low Stock Alert Notifications
- [ ] Click notification navigates to stocks view
- [ ] Correct low stock item is highlighted
- [ ] Stock details are visible
- [ ] Notification is marked as read

### Stock Added Notifications
- [ ] Click notification navigates to stocks view
- [ ] Newly added stock is highlighted
- [ ] Stock details are visible
- [ ] Notification is marked as read

## Benefits

1. **Better User Experience**: Members can quickly navigate to relevant pages from notifications
2. **Context Preservation**: Highlighting ensures users see exactly what the notification refers to
3. **Reduced Confusion**: Clear visual feedback shows which item triggered the notification
4. **Improved Workflow**: Members can act on notifications immediately without searching

## Future Enhancements

Potential improvements for future iterations:
1. Add notification preferences for members
2. Implement notification grouping for similar events
3. Add quick actions directly from notifications
4. Support for bulk notification actions
5. Add notification sound/desktop notifications

## Related Files

- `resources/js/pages/Profile/all-notifications.tsx` - Main notification page
- `resources/js/pages/Member/allStocks.tsx` - Stocks and transactions page
- `resources/js/pages/Member/dashboard.tsx` - Member dashboard
- `app/Notifications/ProductSaleNotification.php` - Product sale notification class
- `app/Notifications/EarningsUpdateNotification.php` - Earnings notification class
- `app/Notifications/LowStockAlertNotification.php` - Low stock notification class
- `app/Notifications/StockAddedNotification.php` - Stock added notification class
