# Troubleshooting Guide

## Permissions Not Showing After Seeding

### Problem
After running the seeders and adding new permissions, the assign button or other permission-gated features don't appear for logged-in users.

### Cause
Permissions are loaded when a user logs in and cached in their session. New permissions added after login won't be available until the session is refreshed.

### Solution

#### Option 1: Log Out and Log Back In (Recommended)
1. Log out from the application
2. Log back in with your credentials
3. New permissions will be loaded

#### Option 2: Clear Sessions
```bash
php artisan session:clear
```
Then refresh your browser.

#### Option 3: Clear All Caches
```bash
php artisan cache:clear
php artisan permission:cache-reset
php artisan config:clear
```
Then log out and log back in.

## Button Not Showing Despite Having Permission

### Check 1: Verify Permission Exists
```bash
php artisan tinker
```
```php
\Spatie\Permission\Models\Permission::where('name', 'assign logistics area')->first();
```

### Check 2: Verify User Has Permission
```php
$user = \App\Models\User::find(YOUR_USER_ID);
$user->can('assign logistics area');
```

### Check 3: Check Frontend Permission Name
Permissions are converted to camelCase on the frontend:
- Backend: `assign logistics area`
- Frontend: `assignLogisticsArea`

The `usePermissions` hook handles this conversion automatically, so you should use the original permission name in PermissionGate components.

## Area Assignment Modal Not Opening

### Check 1: Verify Route Exists
```bash
php artisan route:list | grep assign-area
```

Should show:
```
POST  admin/logistics/{logistic}/assign-area
```

### Check 2: Check Browser Console
Open browser DevTools (F12) and check for JavaScript errors.

### Check 3: Verify Modal Component Import
Check that `AreaAssignmentModal` is imported in `resources/js/Pages/Admin/Logistics/index.tsx`

## Assigned Area Not Displaying

### Check 1: Verify Database Column
```bash
php artisan tinker
```
```php
\Illuminate\Support\Facades\Schema::hasColumn('users', 'assigned_area');
```

Should return `true`.

### Check 2: Check Migration Ran
```bash
php artisan migrate:status
```

Look for `2025_11_23_235447_add_assigned_area_to_users_table` with status "Ran".

### Check 3: Verify Data
```php
\App\Models\User::where('type', 'logistic')->whereNotNull('assigned_area')->count();
```

Should return 25 (after seeding).

## Seeder Issues

### Problem: Seeder Fails with Duplicate Entry
**Cause**: Users already exist in database

**Solution**:
```bash
php artisan migrate:fresh --seed
```
⚠️ Warning: This will delete all data!

### Problem: Foreign Key Constraint Error
**Cause**: Related data doesn't exist

**Solution**: Run seeders in order:
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=ProductSeeder
# ... etc
```

## TypeScript Errors

### Problem: Property 'assigned_area' does not exist
**Cause**: TypeScript types not updated

**Solution**: Check `resources/js/types/logistics.ts` includes:
```typescript
assigned_area?: string;
```

### Problem: Cannot find module 'area-assignment-modal'
**Cause**: Component not created or wrong import path

**Solution**: Verify file exists at:
```
resources/js/components/logistics/area-assignment-modal.tsx
```

## Performance Issues

### Problem: Logistics Page Loads Slowly
**Cause**: Too many logistics or inefficient queries

**Solutions**:
1. Add pagination to logistics list
2. Optimize database queries with indexes
3. Implement lazy loading for logistics data

### Problem: Area Assignment Modal Slow to Open
**Cause**: Large dropdown list or slow API

**Solutions**:
1. Cache Cabuyao areas list
2. Preload modal component
3. Use virtualized list for large dropdowns

## Common Mistakes

### Using Wrong Permission Name
❌ Wrong:
```tsx
<PermissionGate permission="assignLogisticsArea">
```

✅ Correct:
```tsx
<PermissionGate permission="assign logistics area">
```

The hook handles camelCase conversion automatically.

### Forgetting to Add Permission to Seeder
If you add a new permission, make sure to:
1. Add it to `RoleSeeder.php` permissions array
2. Run `php artisan db:seed --class=RoleSeeder`
3. Clear permission cache: `php artisan permission:cache-reset`
4. Log out and log back in

### Not Including Permission in Route Middleware
Make sure routes are protected:
```php
Route::middleware(['can:assign logistics area'])->group(function () {
    // Protected routes here
});
```

## Getting Help

### Check Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Check for errors
php artisan log:clear
```

### Enable Debug Mode
In `.env`:
```
APP_DEBUG=true
```
⚠️ Never enable in production!

### Verify Environment
```bash
php artisan about
```

Shows PHP version, Laravel version, database connection, etc.

## Quick Fixes Checklist

When something doesn't work, try these in order:

- [ ] Clear all caches: `php artisan optimize:clear`
- [ ] Clear permission cache: `php artisan permission:cache-reset`
- [ ] Log out and log back in
- [ ] Check browser console for errors (F12)
- [ ] Verify database migration ran
- [ ] Check user has required permission
- [ ] Verify route exists and is accessible
- [ ] Check component is imported correctly
- [ ] Review Laravel logs for errors

## Still Having Issues?

1. Check all related documentation:
   - `LOGISTICS_AREA_ASSIGNMENT_IMPLEMENTATION.md`
   - `SEEDER_UPDATES_SUMMARY.md`
   - `CABUYAO_AREAS_REFERENCE.md`

2. Verify all files were modified correctly (see file list in documentation)

3. Run diagnostics:
```bash
php artisan route:list
php artisan migrate:status
php artisan permission:show
```

4. Check database directly:
```sql
SELECT * FROM permissions WHERE name LIKE '%logistic%';
SELECT * FROM users WHERE type = 'logistic' LIMIT 5;
```
