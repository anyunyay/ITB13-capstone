# View Price Trend Permission Implementation

## Overview
This document describes the implementation of the "View Price Trend" permission for staff accounts. This permission controls access to the Price Trend Analysis page and ensures that only authorized staff members can view price trend data.

## Changes Made

### 1. Database - Permission Seeder
**File:** `database/seeders/RoleSeeder.php`

Added the new permission `'view price trend'` to the permissions array in the Trend Analysis section:

```php
// Trend Analysis
'view price trend',
'view trend analysis',
'generate trend report',
```

This permission is automatically assigned to admin users and can be selectively granted to staff members.

### 2. Backend - Route Protection
**File:** `routes/web.php`

Updated the Trend Analysis routes middleware from `can:view inventory` to `can:view price trend`:

```php
// Trend Analysis routes
Route::middleware(['can:view price trend'])->group(function () {
    Route::get('/trends', [TrendAnalysisController::class, 'index'])->name('admin.trends.index');
    Route::get('/trends/data', [TrendAnalysisController::class, 'data'])->name('admin.trends.data');
    Route::get('/trends/latest-data', [TrendAnalysisController::class, 'getLatestData'])->name('admin.trends.latestData');
    Route::get('/trends/price-categories', [TrendAnalysisController::class, 'getPriceCategories'])->name('admin.trends.priceCategories');
});
```

**Impact:** Staff without the "view price trend" permission will receive a 403 Forbidden error when attempting to access these routes.

### 3. Backend - Staff Controller
**File:** `app/Http/Controllers/Admin/StaffController.php`

Added `->orderBy('name')` to the permission queries in both `create()` and `edit()` methods to ensure permissions are displayed alphabetically in the staff management forms.

### 4. Frontend - Navigation Sidebar
**File:** `resources/js/components/shared/layout/app-sidebar.tsx`

Updated the Trend Analysis navigation item to check for the new permission:

```typescript
// Trend Analysis - requires view price trend permission
if (can('view price trend')) {
  mainNavItems.push({
    title: t('admin.trends'),
    href: '/admin/trends',
    icon: LineChart,
  });
}
```

**Impact:** The "Trends" menu item will only appear in the sidebar for users with the "view price trend" permission.

### 5. Frontend - Price Trend Page
**File:** `resources/js/pages/Admin/Trends/index.tsx`

Updated the PermissionGuard to check for the new permission:

```typescript
<PermissionGuard permissions={['view price trend']} pageTitle={t('admin.access_denied')}>
```

**Impact:** The page itself now validates the permission, providing an additional layer of security beyond route middleware.

### 6. Frontend - Staff Create Page
**File:** `resources/js/pages/Admin/Staff/create.tsx`

Added `'view price trend'` to the Trend Analysis permission group:

```typescript
{
  name: t('admin.trend_analysis_permissions'),
  description: t('admin.trend_permissions_description'),
  permissions: [
    'view price trend',
    'view trend analysis',
    'generate trend report'
  ]
}
```

### 7. Frontend - Staff Edit Page
**File:** `resources/js/pages/Admin/Staff/edit.tsx`

Added `'view price trend'` to the Trend Analysis permission group (same as create page).

## Permission Hierarchy

The Trend Analysis section now has three distinct permissions:

1. **view price trend** - Required to access the Price Trend page and view trend charts
2. **view trend analysis** - Additional analysis capabilities (if implemented)
3. **generate trend report** - Ability to generate and export trend reports

## Testing Checklist

### ✅ Database Setup
- [x] Run `php artisan db:seed --class=RoleSeeder` to add the new permission
- [x] Verify permission exists in the `permissions` table
- [x] Confirm admin role has the permission automatically

### ✅ Staff Management
- [ ] Create a new staff member
- [ ] Verify "View Price Trend" checkbox appears in the Trend Analysis section
- [ ] Select the permission and save
- [ ] Verify the permission is saved correctly

### ✅ Permission Enforcement
- [ ] Log in as a staff member WITHOUT "view price trend" permission
- [ ] Verify the "Trends" menu item does NOT appear in the sidebar
- [ ] Attempt to access `/admin/trends` directly
- [ ] Verify access is denied (403 error or redirect)

### ✅ Permission Access
- [ ] Log in as a staff member WITH "view price trend" permission
- [ ] Verify the "Trends" menu item DOES appear in the sidebar
- [ ] Click on the Trends menu item
- [ ] Verify the Price Trend page loads successfully
- [ ] Verify all trend data and charts display correctly

### ✅ Edit Staff Permissions
- [ ] Edit an existing staff member
- [ ] Toggle the "View Price Trend" permission on/off
- [ ] Save changes
- [ ] Verify the permission change takes effect immediately

## Usage Instructions

### For Administrators

#### Granting Permission to Staff:
1. Navigate to **Admin > Staff Management**
2. Click **Add Staff** or **Edit** an existing staff member
3. Scroll to the **Trend Analysis** permission group
4. Check the **"view price trend"** checkbox
5. Optionally select other trend-related permissions:
   - "view trend analysis" - For additional analysis features
   - "generate trend report" - To allow report generation
6. Click **Save** to apply changes

#### Revoking Permission:
1. Navigate to **Admin > Staff Management**
2. Click **Edit** on the staff member
3. Scroll to the **Trend Analysis** permission group
4. Uncheck the **"view price trend"** checkbox
5. Click **Save** to apply changes

### For Staff Members

- If you have the "view price trend" permission:
  - The **Trends** menu item will appear in your sidebar
  - You can access the Price Trend Analysis page
  - You can view all price trend charts and data

- If you don't have the permission:
  - The **Trends** menu item will not appear
  - Attempting to access the page directly will be blocked

## Technical Details

### Permission Name
- **Database:** `view price trend`
- **Display:** "view price trend" (shown in staff management forms)

### Middleware
- Uses Laravel's built-in `can:` middleware
- Applied to all trend analysis routes
- Returns 403 Forbidden for unauthorized access

### Frontend Permission Check
- Uses the `usePermissions()` hook
- Checks permission with `can('view price trend')`
- Conditionally renders navigation items

## Migration Notes

### Existing Staff Members
- Existing staff members will NOT have this permission by default
- Administrators must manually grant the permission to staff who need it
- Admin users automatically have all permissions

### Backward Compatibility
- The change from `view inventory` to `view price trend` means staff who previously had access via `view inventory` will need the new permission granted
- This is intentional to provide more granular control over trend analysis access

## Related Files

### Backend
- `database/seeders/RoleSeeder.php` - Permission definition
- `routes/web.php` - Route protection
- `app/Http/Controllers/Admin/StaffController.php` - Staff management
- `app/Http/Controllers/Admin/TrendAnalysisController.php` - Trend analysis logic

### Frontend
- `resources/js/components/shared/layout/app-sidebar.tsx` - Navigation
- `resources/js/pages/Admin/Staff/create.tsx` - Staff creation form
- `resources/js/pages/Admin/Staff/edit.tsx` - Staff edit form
- `resources/js/pages/Admin/Trends/index.tsx` - Price trend page (PermissionGuard)

### Translations
- `resources/lang/en/admin.php` - English translations
- `resources/lang/en/staff.php` - English staff translations
- `resources/lang/tl/admin.php` - Tagalog translations
- `resources/lang/tl/staff.php` - Tagalog staff translations

## Security Considerations

1. **Route Protection:** All trend analysis routes are protected by middleware
2. **UI Hiding:** Navigation items are hidden for unauthorized users
3. **Permission Checking:** Both backend and frontend validate permissions
4. **Granular Control:** Separate permission allows fine-grained access control
5. **Admin Override:** Admins always have access regardless of individual permissions

## Future Enhancements

Potential improvements for the permission system:

1. **Bulk Permission Assignment:** Allow assigning permission to multiple staff at once
2. **Permission Templates:** Create preset permission groups for common roles
3. **Audit Logging:** Track when permissions are granted/revoked
4. **Time-based Permissions:** Allow temporary access to trend analysis
5. **Data Filtering:** Restrict which products/categories staff can view in trends

## Support

For issues or questions regarding this implementation:
1. Check the testing checklist above
2. Verify the permission exists in the database
3. Clear application cache: `php artisan cache:clear`
4. Clear permission cache: `php artisan permission:cache-reset`
5. Review Laravel logs for permission-related errors

## Conclusion

The "View Price Trend" permission has been successfully implemented and provides granular control over access to the Price Trend Analysis feature. Staff members must be explicitly granted this permission to view price trends, ensuring better security and access control.
