# Notification System - Quick Fix Guide

## 🚨 If Notifications Show Empty Messages

### Step 1: Clear Cache (REQUIRED!)
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

### Step 2: Hard Refresh Browser
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Step 3: Verify Fix
1. Click notification bell icon
2. Should see messages like:
   - "Order Confirmed"
   - "Your order #123 is ready for pickup"
   - etc.

---

## 🔍 Quick Verification

### Test in Tinker:
```bash
php artisan tinker
```

```php
// Test message resolution
\App\Services\NotificationService::resolveMessage('order_confirmation', [], 'en');
// Should return: "Order Confirmed"

\App\Services\NotificationService::resolveMessage('order_confirmation', [], 'tl');
// Should return: "Nakumpirma ang Order"

// Test with real notification
$user = \App\Models\User::first();
$notification = $user->notifications()->first();
$formatted = \App\Services\NotificationService::formatNotification($notification, 'en');
print_r($formatted);
// Should show 'message' field with actual text
```

---

## ✅ What Was Fixed

1. **HandleInertiaRequests Middleware** - Now uses NotificationService
2. **NotificationService** - Now handles sub-messages
3. **All Notification Classes** - All use message_key
4. **Language Files** - All keys translated (EN & TL)

---

## 📍 Where Notifications Appear

All locations now work correctly:
- ✅ Header notification bell dropdown
- ✅ Order History page (top 3 highlighted)
- ✅ Notification page (`/customer/profile/notifications`)
- ✅ All user types (Admin, Customer, Member, Logistic)

---

## 🌐 Language Switching

1. Go to profile settings
2. Change language
3. Refresh page
4. All notifications update to new language

---

## 🐛 Still Having Issues?

### Check 1: Verify notification has message_key
```php
$notification = \App\Models\User::first()->notifications()->first();
dd($notification->data);
// Should see 'message_key' field
```

### Check 2: Verify translation exists
```php
__('notifications.order_confirmation', [], 'en');
// Should NOT return "notifications.order_confirmation"
```

### Check 3: Check user's language
```php
$user = \App\Models\User::first();
echo $user->language; // Should be 'en' or 'tl'
```

---

## 📝 Quick Reference

### All Message Keys (32 total):

**Admin/Staff:**
- new_order
- inventory_update_added/updated/removed
- membership_update_added/updated/deactivated/reactivated
- password_change_request
- password_change_request_cancelled

**Customer:**
- order_confirmation, order_confirmation_sub
- order_status_approved/processing/ready_for_pickup
- order_ready_for_pickup, order_picked_up
- delivery_status_out_for_delivery/delivered
- order_rejection, order_rejection_reason
- order_delayed, order_delayed_sub
- order_receipt

**Member:**
- product_sale
- earnings_update
- low_stock_alert
- stock_added

**Logistic:**
- delivery_task
- order_status_logistic
- logistic_order_ready
- logistic_order_picked_up

---

## 🎯 Success Indicators

✅ Header bell shows notification count
✅ Clicking bell shows dropdown with messages
✅ Messages are clear and readable (not empty)
✅ Sub-messages appear where applicable
✅ Icons and timestamps display
✅ Clicking notification navigates correctly
✅ Language switching updates messages

---

## 💡 Remember

**Always clear cache after changes:**
```bash
php artisan cache:clear && php artisan config:clear
```

**The frontend doesn't need changes** - it already uses the resolved `message` field from the backend.

**All translation happens server-side** - NotificationService resolves message_key before sending to frontend.
