# Default Password Implementation for Staff, Member, and Logistic Accounts

## Overview
All newly created Staff, Member, and Logistic accounts now automatically have `is_default = true` set, which requires them to change their password on first login before accessing the system.

## Changes Made

### 1. StaffController (`app/Http/Controllers/Admin/StaffController.php`)

**Updated `store()` method:**
```php
$user = User::create([
    'name' => $request->name,
    'email' => $request->email,
    'password' => Hash::make($request->password),
    'contact_number' => $request->contact_number,
    'type' => 'staff',
    'email_verified_at' => now(),
    'is_default' => true, // Require password change on first login
]);
```

### 2. MembershipController (`app/Http/Controllers/Admin/MembershipController.php`)

**Updated `store()` method:**
```php
$member = User::create([
    'name' => $request->input('name'),
    'email' => null,
    'password' => bcrypt($request->input('password')),
    'contact_number' => $request->input('contact_number'),
    'registration_date' => $request->input('registration_date', now()),
    'document' => $documentPath,
    'type' => 'member',
    'email_verified_at' => now(),
    'is_default' => true, // Require password change on first login
]);
```

### 3. LogisticController (`app/Http/Controllers/Admin/LogisticController.php`)

**Updated `store()` method:**
```php
$user = User::create([
    'name' => $request->input('name'),
    'email' => $request->input('email'),
    'password' => bcrypt($request->input('password')),
    'contact_number' => $request->input('contact_number'),
    'registration_date' => $request->input('registration_date', now()),
    'type' => 'logistic',
    'email_verified_at' => now(),
    'is_default' => true, // Require password change on first login
]);
```

## How It Works

### Middleware Protection
The `CheckPasswordChangeRequired` middleware (`app/Http/Middleware/CheckPasswordChangeRequired.php`) enforces password changes:

1. **Checks on every request** if the authenticated user has `is_default = true`
2. **Redirects to credentials update page** if password hasn't been changed
3. **Allows only specific routes:**
   - `credentials.update.show` - View password change form
   - `credentials.update` - Submit password change
   - `logout` - Allow user to log out
   - `single-session.logout` - Handle session conflicts

### User Flow

1. **Admin creates new account** (Staff/Member/Logistic)
   - System generates default password
   - `is_default = true` is automatically set

2. **User logs in for the first time**
   - Authentication succeeds
   - Middleware detects `is_default = true`
   - User is redirected to credentials update page

3. **User must change password**
   - Cannot access any other system features
   - Must provide new password meeting requirements
   - After successful change, `is_default` is set to `false`

4. **User gains full access**
   - Can now access all authorized features
   - No longer redirected to password change page

## Security Benefits

1. **Forced Password Change:** Users cannot use default passwords indefinitely
2. **Immediate Security:** Applies from the moment account is created
3. **Consistent Enforcement:** Works across all user types (Staff, Member, Logistic)
4. **No Bypass:** Middleware prevents access to any protected routes
5. **User Awareness:** Users know their password is temporary and must be changed

## Middleware Configuration

The middleware is registered in `bootstrap/app.php`:
```php
'password.change.required' => CheckPasswordChangeRequired::class,
```

And applied to authenticated routes in `routes/web.php`:
```php
Route::middleware(['auth', 'verified', 'password.change.required'])->group(function () {
    // All protected routes
});
```

## Testing Checklist

- [ ] Create new Staff account - verify `is_default = true`
- [ ] Create new Member account - verify `is_default = true`
- [ ] Create new Logistic account - verify `is_default = true`
- [ ] Login with new Staff account - redirected to password change
- [ ] Login with new Member account - redirected to password change
- [ ] Login with new Logistic account - redirected to password change
- [ ] Try to access other pages before changing password - blocked
- [ ] Change password successfully - `is_default` becomes `false`
- [ ] After password change - full system access granted
- [ ] Logout works even with default password

## Database Field

The `is_default` field in the `users` table:
- **Type:** Boolean
- **Default:** `false`
- **Purpose:** Indicates if user is using a default/temporary password
- **Set to `true`:** When admin creates Staff/Member/Logistic accounts
- **Set to `false`:** When user successfully changes their password

## Notes

- Customer accounts (self-registration) do NOT have `is_default = true` since they create their own passwords
- Admin accounts created through seeders should have `is_default = false` for initial setup
- The password change requirement is enforced at the middleware level, making it impossible to bypass
- Users can still log out even if they haven't changed their password
