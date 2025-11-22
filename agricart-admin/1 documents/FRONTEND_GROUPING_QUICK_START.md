# Frontend Suspicious Order Grouping - Quick Start

## What Is This?

A **frontend-only** feature that visually groups suspicious orders without changing any database data.

## What It Does

✅ Groups 2+ orders from same customer within 10 minutes  
✅ Shows them in a single combined card  
✅ Sends notifications to authorized users  
❌ **Does NOT modify database**

## Quick Example

### Before (Normal Display)
```
Order #101 - John Doe - ₱150
Order #102 - John Doe - ₱200
Order #103 - John Doe - ₱100
```

### After (Grouped Display)
```
┌═══════════════════════════════════┐
║ ⚠️ SUSPICIOUS ORDER GROUP        ║
║ 3 Orders - John Doe               ║
║ Total: ₱450.00 (8 minutes)       ║
║ [Expand to see all orders]        ║
└═══════════════════════════════════┘
```

## How to Use

### As Admin

1. **Open Orders Page**
   - Navigate to Admin → Orders

2. **Look for Alert Banner**
   ```
   ⚠️ Suspicious Order Patterns Detected
   Found 2 suspicious order group(s)
   ```

3. **Find Grouped Cards**
   - Red border
   - "SUSPICIOUS ORDER GROUP" badge
   - Combined statistics

4. **Expand to See Details**
   - Click "Expand" button
   - View all individual orders
   - Click "View Details" on any order

5. **Take Action**
   - Review each order
   - Approve if legitimate
   - Reject if suspicious

## Configuration

### Change Time Window

Edit `resources/js/components/orders/order-management.tsx`:

```typescript
// Line ~70
const orderGroups = useMemo(() => {
    return groupSuspiciousOrders(paginatedOrders, 10); // Change 10 to desired minutes
}, [paginatedOrders]);
```

### Change Minimum Orders

Edit `resources/js/utils/order-grouping.ts`:

```typescript
// Line ~45
if (relatedOrders.length >= 2) { // Change 2 to desired minimum
    // Create suspicious group
}
```

## Testing

### Quick Test Steps

1. **Create Test Orders**
   ```
   - Login as customer
   - Place order #1 (10:00 AM)
   - Place order #2 (10:05 AM)
   - Place order #3 (10:08 AM)
   ```

2. **View as Admin**
   ```
   - Login as admin
   - Go to Orders page
   - See grouped card
   - Check notification
   ```

3. **Verify Features**
   ```
   ✓ Grouped card appears
   ✓ Red border visible
   ✓ Alert banner shows
   ✓ Can expand/collapse
   ✓ Notification received
   ```

## Troubleshooting

### Orders Not Grouping?

**Check:**
- Orders within 10 minutes?
- Same customer email?
- At least 2 orders?

**Fix:**
- Adjust time window
- Verify customer data
- Check browser console

### Notifications Not Sent?

**Check:**
- User has "view orders" permission?
- Route registered?
- CSRF token present?

**Fix:**
- Verify permissions
- Run `php artisan route:list`
- Check browser console

### Card Not Expanding?

**Check:**
- JavaScript errors?
- React state updating?
- Button click working?

**Fix:**
- Check browser console
- Clear cache
- Refresh page

## Key Files

### Frontend
- `resources/js/components/orders/grouped-order-card.tsx` - Card component
- `resources/js/utils/order-grouping.ts` - Grouping logic
- `resources/js/hooks/use-suspicious-order-notification.ts` - Notifications

### Backend
- `app/Http/Controllers/Admin/SuspiciousOrderNotificationController.php` - Notification endpoint
- `routes/web.php` - Route registration

## Important Notes

### ✅ What It Does
- Groups orders visually
- Sends notifications
- Shows combined statistics
- Provides expandable list

### ❌ What It Doesn't Do
- Modify database
- Change order data
- Persist across reloads
- Affect backend logic

## Disabling the Feature

### Temporary Disable

Comment out in `order-management.tsx`:

```typescript
// const orderGroups = useMemo(() => {
//     return groupSuspiciousOrders(paginatedOrders, 10);
// }, [paginatedOrders]);

// useSuspiciousOrderNotification(orderGroups);
```

### Permanent Disable

Delete these files:
- `resources/js/components/orders/grouped-order-card.tsx`
- `resources/js/utils/order-grouping.ts`
- `resources/js/hooks/use-suspicious-order-notification.ts`

Remove route from `routes/web.php`

## Common Scenarios

### Scenario 1: Legitimate Bulk Order
```
Customer places 3 orders for event
→ Shows as suspicious group
→ Admin reviews and approves all
→ Normal processing continues
```

### Scenario 2: Fraudulent Activity
```
Customer places multiple test orders
→ Shows as suspicious group
→ Admin investigates
→ Rejects suspicious orders
→ Contacts customer
```

### Scenario 3: Family Orders
```
Multiple family members order separately
→ May show as suspicious (same address)
→ Admin verifies with customer
→ Approves if legitimate
```

## Best Practices

1. **Review Daily**
   - Check for suspicious groups
   - Investigate patterns
   - Document findings

2. **Verify Before Action**
   - Check customer history
   - Review order details
   - Contact if unsure

3. **Adjust Thresholds**
   - Monitor false positives
   - Adjust time window
   - Update minimum orders

4. **Train Staff**
   - Explain feature purpose
   - Show how to use
   - Define action procedures

## Support

**Need Help?**
1. Check `FRONTEND_SUSPICIOUS_ORDER_GROUPING.md`
2. Review browser console
3. Test with sample orders
4. Contact development team

**Quick Links:**
- Full Documentation: `FRONTEND_SUSPICIOUS_ORDER_GROUPING.md`
- Comparison Guide: `SUSPICIOUS_ORDER_IMPLEMENTATIONS_COMPARISON.md`
- Feature Summary: `FRONTEND_GROUPING_SUMMARY.md`

---

**Version:** 1.0  
**Type:** Frontend-Only (No Database Changes)  
**Status:** Ready to Use
