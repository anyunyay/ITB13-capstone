# All-Notifications Authorization Test Checklist

## Overview
This document provides a comprehensive test checklist to verify that the All-Notifications page correctly enforces role-based access control and displays the appropriate UI for each user type.

## Test Environment Setup
- [ ] Ensure you have test accounts for all user types: Admin, Staff, Customer, Member, Logistic
- [ ] Clear browser cache and cookies before testing
- [ ] Test in both development and staging environments

---

## 1. Admin User Tests

### 1.1 Navigation Tests
- [ ] **Test**: Log in as Admin
- [ ] **Test**: Click on the user avatar/profile dropdown
- [ ] **Test**: Click "All Notifications" link
- [ ] **Expected**: Should navigate to `/admin/profile/notifications`
- [ ] **Expected**: Should see AppSidebarLayout (admin sidebar on left)
- [ ] **Expected**: Should see "All Notifications" page title
- [ ] **Expected**: Should see admin-style compact notification cards (NOT customer's large rounded cards)

### 1.2 Direct URL Access Tests
- [ ] **Test**: While logged in as Admin, directly visit `/admin/profile/notifications`
- [ ] **Expected**: Should load successfully with admin layout
- [ ] **Test**: While logged in as Admin, try to visit `/customer/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Admin, try to visit `/member/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Admin, try to visit `/logistic/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected

### 1.3 Content Verification Tests
- [ ] **Test**: Verify notification types shown are admin-specific
- [ ] **Expected**: Should see notifications like "New Order", "Inventory Update", "Membership Update"
- [ ] **Expected**: Should NOT see customer-specific notifications like "Order Confirmation", "Delivery Status"
- [ ] **Test**: Verify UI styling matches admin theme
- [ ] **Expected**: Compact cards with professional styling
- [ ] **Expected**: Smaller buttons and text (sm size)
- [ ] **Expected**: No large rounded-3xl cards

### 1.4 Functionality Tests
- [ ] **Test**: Click "Select All" button
- [ ] **Expected**: All unread notifications should be selected
- [ ] **Test**: Click "Mark Selected" button
- [ ] **Expected**: Selected notifications should be marked as read
- [ ] **Test**: Click "All Read" button
- [ ] **Expected**: All notifications should be marked as read
- [ ] **Test**: Click on a notification
- [ ] **Expected**: Should navigate to admin-specific page (e.g., `/admin/orders`)

---

## 2. Staff User Tests

### 2.1 Navigation Tests
- [ ] **Test**: Log in as Staff
- [ ] **Test**: Click on the user avatar/profile dropdown
- [ ] **Test**: Click "All Notifications" link
- [ ] **Expected**: Should navigate to `/admin/profile/notifications`
- [ ] **Expected**: Should see AppSidebarLayout (admin sidebar on left)
- [ ] **Expected**: Should see admin-style compact notification cards

### 2.2 Direct URL Access Tests
- [ ] **Test**: While logged in as Staff, directly visit `/admin/profile/notifications`
- [ ] **Expected**: Should load successfully with admin layout
- [ ] **Test**: While logged in as Staff, try to visit `/customer/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Staff, try to visit `/member/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected

### 2.3 Content Verification Tests
- [ ] **Test**: Verify notification types shown are admin/staff-specific
- [ ] **Expected**: Should see same notification types as admin
- [ ] **Expected**: Should NOT see customer-specific notifications

---

## 3. Customer User Tests

### 3.1 Navigation Tests
- [ ] **Test**: Log in as Customer
- [ ] **Test**: Click on the user avatar/profile dropdown
- [ ] **Test**: Click "All Notifications" link
- [ ] **Expected**: Should navigate to `/customer/profile/notifications`
- [ ] **Expected**: Should see AppHeaderLayout (customer header at top)
- [ ] **Expected**: Should see customer-style large rounded notification cards
- [ ] **Expected**: Should see "All Notifications" page title

### 3.2 Direct URL Access Tests
- [ ] **Test**: While logged in as Customer, directly visit `/customer/profile/notifications`
- [ ] **Expected**: Should load successfully with customer layout
- [ ] **Test**: While logged in as Customer, try to visit `/admin/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Customer, try to visit `/member/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Customer, try to visit `/logistic/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected

### 3.3 Content Verification Tests
- [ ] **Test**: Verify notification types shown are customer-specific
- [ ] **Expected**: Should see notifications like "Order Confirmed", "Order Status Update", "Delivery Status Update"
- [ ] **Expected**: Should NOT see admin-specific notifications like "New Order", "Inventory Update"
- [ ] **Test**: Verify UI styling matches customer theme
- [ ] **Expected**: Large rounded-3xl cards with shadow-xl
- [ ] **Expected**: Larger buttons (h-12, h-14) with rounded-xl
- [ ] **Expected**: More spacious padding (p-6, p-8)

### 3.4 Functionality Tests
- [ ] **Test**: Click "Select All" button
- [ ] **Expected**: All unread notifications should be selected
- [ ] **Test**: Click "Mark Selected" button
- [ ] **Expected**: Selected notifications should be marked as read
- [ ] **Test**: Click "Mark All Read" button
- [ ] **Expected**: All notifications should be marked as read
- [ ] **Test**: Click on a notification
- [ ] **Expected**: Should navigate to customer-specific page (e.g., `/customer/orders/history`)

---

## 4. Member User Tests

### 4.1 Navigation Tests
- [ ] **Test**: Log in as Member
- [ ] **Test**: Click on the user avatar/profile dropdown
- [ ] **Test**: Click "All Notifications" link
- [ ] **Expected**: Should navigate to `/member/profile/notifications`
- [ ] **Expected**: Should see MemberLayout
- [ ] **Expected**: Should see admin-style compact notification cards

### 4.2 Direct URL Access Tests
- [ ] **Test**: While logged in as Member, directly visit `/member/profile/notifications`
- [ ] **Expected**: Should load successfully with member layout
- [ ] **Test**: While logged in as Member, try to visit `/admin/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Member, try to visit `/customer/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected

### 4.3 Content Verification Tests
- [ ] **Test**: Verify notification types shown are member-specific
- [ ] **Expected**: Should see notifications like "Product Sale", "Earnings Update", "Low Stock Alert"
- [ ] **Expected**: Should NOT see customer or admin-specific notifications

---

## 5. Logistic User Tests

### 5.1 Navigation Tests
- [ ] **Test**: Log in as Logistic
- [ ] **Test**: Click on the user avatar/profile dropdown
- [ ] **Test**: Click "All Notifications" link
- [ ] **Expected**: Should navigate to `/logistic/profile/notifications`
- [ ] **Expected**: Should see LogisticLayout
- [ ] **Expected**: Should see admin-style compact notification cards

### 5.2 Direct URL Access Tests
- [ ] **Test**: While logged in as Logistic, directly visit `/logistic/profile/notifications`
- [ ] **Expected**: Should load successfully with logistic layout
- [ ] **Test**: While logged in as Logistic, try to visit `/admin/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected
- [ ] **Test**: While logged in as Logistic, try to visit `/customer/profile/notifications`
- [ ] **Expected**: Should be blocked with 403 Forbidden or redirected

### 5.3 Content Verification Tests
- [ ] **Test**: Verify notification types shown are logistic-specific
- [ ] **Expected**: Should see notifications like "Delivery Task", "Order Status Update"
- [ ] **Expected**: Should NOT see customer or admin-specific notifications

---

## 6. Cross-Role Security Tests

### 6.1 Session Hijacking Prevention
- [ ] **Test**: Log in as Admin, copy session cookie
- [ ] **Test**: Try to access `/customer/profile/notifications` with admin session
- [ ] **Expected**: Should be blocked with 403 Forbidden
- [ ] **Test**: Log in as Customer, copy session cookie
- [ ] **Test**: Try to access `/admin/profile/notifications` with customer session
- [ ] **Expected**: Should be blocked with 403 Forbidden

### 6.2 URL Manipulation Tests
- [ ] **Test**: Log in as any user type
- [ ] **Test**: Manually change URL to different role's notification page
- [ ] **Expected**: Should be blocked or redirected to appropriate page
- [ ] **Test**: Try to access notification page without authentication
- [ ] **Expected**: Should redirect to login page

### 6.3 API Endpoint Tests
- [ ] **Test**: Log in as Admin
- [ ] **Test**: Try to POST to `/customer/notifications/mark-read` with admin session
- [ ] **Expected**: Should be blocked or fail gracefully
- [ ] **Test**: Log in as Customer
- [ ] **Test**: Try to POST to `/admin/notifications/mark-read` with customer session
- [ ] **Expected**: Should be blocked or fail gracefully

---

## 7. UI/UX Consistency Tests

### 7.1 Layout Consistency
- [ ] **Test**: Verify admin/staff/logistic/member all use compact design
- [ ] **Expected**: Smaller cards, buttons, and spacing
- [ ] **Test**: Verify customer uses large, modern design
- [ ] **Expected**: Large rounded cards, bigger buttons, more spacing

### 7.2 Responsive Design Tests
- [ ] **Test**: Test all user types on mobile (< 640px)
- [ ] **Expected**: Layout should be responsive and usable
- [ ] **Test**: Test all user types on tablet (640px - 1024px)
- [ ] **Expected**: Layout should adapt appropriately
- [ ] **Test**: Test all user types on desktop (> 1024px)
- [ ] **Expected**: Layout should use full width appropriately

---

## 8. Edge Cases

### 8.1 No Notifications
- [ ] **Test**: Access notification page with no notifications for each user type
- [ ] **Expected**: Should show appropriate empty state message
- [ ] **Expected**: Should not show action buttons when no notifications exist

### 8.2 Pagination
- [ ] **Test**: Create more than 5 notifications for a user
- [ ] **Test**: Verify pagination controls appear
- [ ] **Test**: Click next/previous page
- [ ] **Expected**: Should load next/previous page of notifications
- [ ] **Expected**: URL should update with page parameter

### 8.3 Concurrent Sessions
- [ ] **Test**: Log in as Admin in one browser
- [ ] **Test**: Log in as Customer in another browser
- [ ] **Test**: Access notification pages in both browsers
- [ ] **Expected**: Each should see their respective role's page
- [ ] **Expected**: No cross-contamination of data

---

## 9. Performance Tests

### 9.1 Load Time
- [ ] **Test**: Measure page load time for each user type
- [ ] **Expected**: Page should load in < 2 seconds
- [ ] **Test**: Verify no unnecessary API calls
- [ ] **Expected**: Should only fetch notifications for current user

### 9.2 Real-time Updates
- [ ] **Test**: Mark notification as read
- [ ] **Expected**: UI should update immediately
- [ ] **Test**: Refresh page
- [ ] **Expected**: Changes should persist

---

## 10. Browser Compatibility

### 10.1 Chrome
- [ ] **Test**: All tests above in Chrome
- [ ] **Expected**: All features work correctly

### 10.2 Firefox
- [ ] **Test**: All tests above in Firefox
- [ ] **Expected**: All features work correctly

### 10.3 Safari
- [ ] **Test**: All tests above in Safari
- [ ] **Expected**: All features work correctly

### 10.4 Edge
- [ ] **Test**: All tests above in Edge
- [ ] **Expected**: All features work correctly

---

## Test Results Summary

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| Admin Navigation | ☐ | ☐ | |
| Admin Direct URL | ☐ | ☐ | |
| Admin Content | ☐ | ☐ | |
| Staff Navigation | ☐ | ☐ | |
| Staff Direct URL | ☐ | ☐ | |
| Customer Navigation | ☐ | ☐ | |
| Customer Direct URL | ☐ | ☐ | |
| Customer Content | ☐ | ☐ | |
| Member Navigation | ☐ | ☐ | |
| Member Direct URL | ☐ | ☐ | |
| Logistic Navigation | ☐ | ☐ | |
| Logistic Direct URL | ☐ | ☐ | |
| Cross-Role Security | ☐ | ☐ | |
| UI/UX Consistency | ☐ | ☐ | |
| Edge Cases | ☐ | ☐ | |
| Performance | ☐ | ☐ | |
| Browser Compatibility | ☐ | ☐ | |

---

## Critical Issues Found

Document any critical issues found during testing:

1. **Issue**: 
   - **Severity**: High/Medium/Low
   - **Description**: 
   - **Steps to Reproduce**: 
   - **Expected Behavior**: 
   - **Actual Behavior**: 
   - **Fix Required**: 

---

## Sign-off

- **Tester Name**: ___________________
- **Date**: ___________________
- **Overall Result**: Pass / Fail / Conditional Pass
- **Comments**: 

---

## Automated Test Script (Optional)

For automated testing, consider implementing the following test cases using Laravel's testing framework:

```php
// tests/Feature/NotificationAuthorizationTest.php

public function test_admin_can_access_admin_notifications()
{
    $admin = User::factory()->create(['type' => 'admin']);
    
    $response = $this->actingAs($admin)
        ->get('/admin/profile/notifications');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Profile/all-notifications'));
}

public function test_admin_cannot_access_customer_notifications()
{
    $admin = User::factory()->create(['type' => 'admin']);
    
    $response = $this->actingAs($admin)
        ->get('/customer/profile/notifications');
    
    $response->assertStatus(403);
}

public function test_customer_can_access_customer_notifications()
{
    $customer = User::factory()->create(['type' => 'customer']);
    
    $response = $this->actingAs($customer)
        ->get('/customer/profile/notifications');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Profile/all-notifications'));
}

public function test_customer_cannot_access_admin_notifications()
{
    $customer = User::factory()->create(['type' => 'customer']);
    
    $response = $this->actingAs($customer)
        ->get('/admin/profile/notifications');
    
    $response->assertStatus(403);
}
```
