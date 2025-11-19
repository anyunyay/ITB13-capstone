# All-Notifications Authorization - Quick Reference Guide

## For Developers

### ✅ DO's

1. **Always use `auth.user` from Inertia props**
   ```typescript
   // ✅ CORRECT
   const page = usePage<PageProps>();
   const currentUser = page.props.auth?.user;
   const userType = currentUser.type;
   
   // ❌ WRONG - Don't use separate user prop
   const { user } = usePage<PageProps>().props;
   const userType = user?.type || 'customer'; // Dangerous default!
   ```

2. **Add server-side authorization checks**
   ```php
   // ✅ CORRECT
   public function profileIndex(Request $request)
   {
       $user = $request->user();
       
       // Check user type before processing
       if ($user->type !== 'customer') {
           abort(403, 'Unauthorized access.');
       }
       
       // ... rest of logic
   }
   ```

3. **Use role-based middleware in routes**
   ```php
   // ✅ CORRECT - Already in place
   Route::prefix('/customer')->middleware(['role:customer'])->group(function () {
       Route::get('/profile/notifications', [NotificationController::class, 'profileIndex']);
   });
   ```

4. **Add client-side guards**
   ```typescript
   // ✅ CORRECT
   if (!currentUser) {
       router.visit('/login');
       return null;
   }
   ```

---

### ❌ DON'Ts

1. **Don't use default fallback for user type**
   ```typescript
   // ❌ WRONG
   const userType = user?.type || 'customer'; // Dangerous!
   
   // ✅ CORRECT
   if (!currentUser) {
       router.visit('/login');
       return null;
   }
   const userType = currentUser.type; // No fallback needed
   ```

2. **Don't skip authorization checks**
   ```php
   // ❌ WRONG
   public function profileIndex(Request $request)
   {
       $user = $request->user();
       // No authorization check!
       $notifications = $user->notifications()->get();
       // ...
   }
   
   // ✅ CORRECT
   public function profileIndex(Request $request)
   {
       $user = $request->user();
       
       if ($user->type !== 'customer') {
           abort(403, 'Unauthorized access.');
       }
       
       $notifications = $user->notifications()->get();
       // ...
   }
   ```

3. **Don't trust client-side routing alone**
   ```typescript
   // ❌ WRONG - Only client-side check
   if (userType !== 'admin') {
       router.visit('/dashboard');
       return null;
   }
   // No server-side check!
   
   // ✅ CORRECT - Both client and server checks
   // Client-side (for UX)
   if (userType !== 'admin') {
       router.visit('/dashboard');
       return null;
   }
   // Server-side (for security) - in controller
   if ($user->type !== 'admin') {
       abort(403);
   }
   ```

---

## Common Pitfalls

### Pitfall 1: Using Stale User Prop
**Problem:** Using a separate `user` prop that might not reflect the current authenticated user.

**Solution:**
```typescript
// ❌ WRONG
interface PageProps {
  user: { type: string };
}
const { user } = usePage<PageProps>().props;

// ✅ CORRECT
interface PageProps {
  auth: { user: { type: string } };
}
const currentUser = usePage<PageProps>().props.auth?.user;
```

### Pitfall 2: Missing Server-Side Authorization
**Problem:** Only checking user type on the frontend.

**Solution:**
```php
// Always add this at the start of controller methods
$user = $request->user();

if ($user->type !== 'expected_type') {
    abort(403, 'Unauthorized access.');
}
```

### Pitfall 3: Inconsistent Route Naming
**Problem:** Different route patterns for different user types.

**Solution:**
```php
// ✅ CORRECT - Consistent pattern
Route::prefix('/admin')->middleware(['role:admin,staff'])->group(function () {
    Route::get('/profile/notifications', [AdminNotificationController::class, 'profileIndex'])
        ->name('admin.profile.notifications');
});

Route::prefix('/customer')->middleware(['role:customer'])->group(function () {
    Route::get('/profile/notifications', [NotificationController::class, 'profileIndex'])
        ->name('customer.profile.notifications');
});
```

---

## Testing Checklist (Quick)

Before committing changes:

- [ ] Test as admin - should see admin layout
- [ ] Test as customer - should see customer layout
- [ ] Try accessing wrong role's URL - should get 403
- [ ] Check browser console for errors
- [ ] Verify no TypeScript errors
- [ ] Run `php artisan route:list` to verify routes
- [ ] Check Laravel logs for errors

---

## Debugging Tips

### Issue: Admin sees customer layout

**Check:**
1. Verify `auth.user` is being used, not separate `user` prop
2. Check browser console: `console.log(page.props.auth.user.type)`
3. Verify route is correct: `/admin/profile/notifications` not `/customer/profile/notifications`
4. Check server logs for 403 errors

### Issue: 403 Forbidden error

**Check:**
1. Verify user type matches route: admin → `/admin/...`, customer → `/customer/...`
2. Check middleware in `routes/web.php`
3. Verify authorization check in controller
4. Check user's actual type in database

### Issue: Wrong notifications showing

**Check:**
1. Verify controller is filtering by correct notification types
2. Check `whereIn('type', [...])` clause in controller
3. Verify user is accessing correct endpoint
4. Check if notifications are being created with correct types

---

## Code Snippets

### Frontend: Get Current User
```typescript
import { usePage } from '@inertiajs/react';

interface PageProps {
  auth: {
    user: {
      id: number;
      type: 'admin' | 'staff' | 'customer' | 'member' | 'logistic';
    };
  };
}

export default function MyComponent() {
  const currentUser = usePage<PageProps>().props.auth?.user;
  
  if (!currentUser) {
    router.visit('/login');
    return null;
  }
  
  const userType = currentUser.type;
  // ... rest of component
}
```

### Backend: Authorization Check
```php
public function profileIndex(Request $request)
{
    $user = $request->user();
    
    // Single role check
    if ($user->type !== 'customer') {
        abort(403, 'Unauthorized access. This page is only accessible to customers.');
    }
    
    // Multiple roles check
    if (!in_array($user->type, ['admin', 'staff'])) {
        abort(403, 'Unauthorized access. This page is only accessible to administrators and staff.');
    }
    
    // ... rest of logic
}
```

### Route Definition
```php
// Admin/Staff routes
Route::prefix('/admin')->middleware(['role:admin,staff'])->group(function () {
    Route::get('/profile/notifications', [AdminNotificationController::class, 'profileIndex'])
        ->name('admin.profile.notifications');
});

// Customer routes
Route::prefix('/customer')->middleware(['role:customer'])->group(function () {
    Route::get('/profile/notifications', [NotificationController::class, 'profileIndex'])
        ->name('customer.profile.notifications');
});
```

---

## Related Documentation

- Full Fix Summary: `NOTIFICATION_AUTHORIZATION_FIX_SUMMARY.md`
- Test Checklist: `NOTIFICATION_AUTHORIZATION_TEST_CHECKLIST.md`
- Laravel Authorization: https://laravel.com/docs/authorization
- Inertia.js Shared Data: https://inertiajs.com/shared-data

---

## Emergency Contacts

If you encounter issues:
1. Check error logs: `storage/logs/laravel.log`
2. Check browser console for frontend errors
3. Verify routes: `php artisan route:list | grep notifications`
4. Clear cache: `php artisan cache:clear && php artisan config:clear`

---

## Version History

- **v1.0** (Current): Initial authorization fix
  - Added server-side authorization checks
  - Fixed frontend to use `auth.user`
  - Added comprehensive testing documentation
