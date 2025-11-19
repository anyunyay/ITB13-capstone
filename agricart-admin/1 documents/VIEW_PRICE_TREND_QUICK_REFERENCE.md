# View Price Trend Permission - Quick Reference

## Quick Start

### 1. Grant Permission to Staff
```
Admin Dashboard → Staff Management → Add/Edit Staff → Trend Analysis Section → ✓ view price trend
```

### 2. Verify Permission
- Staff member should see "Trends" in sidebar
- Can access `/admin/trends` page
- Can view all price trend charts

### 3. Revoke Permission
- Uncheck "view price trend" in staff edit form
- "Trends" menu disappears immediately
- Access to `/admin/trends` is blocked

## Permission Details

| Attribute | Value |
|-----------|-------|
| **Permission Name** | `view price trend` |
| **Display Name** | view price trend |
| **Category** | Trend Analysis |
| **Required For** | Accessing Price Trend page |
| **Default** | Admin: ✓ Yes, Staff: ✗ No |

## Related Permissions

| Permission | Purpose |
|------------|---------|
| `view price trend` | Access to Price Trend page (REQUIRED) |
| `view trend analysis` | Additional analysis features |
| `generate trend report` | Export trend reports |

## Access Control

### ✅ With Permission
- ✓ "Trends" menu visible in sidebar
- ✓ Can access `/admin/trends`
- ✓ Can view all price charts
- ✓ Can filter and analyze trends

### ❌ Without Permission
- ✗ "Trends" menu hidden
- ✗ Direct URL access blocked (403)
- ✗ Cannot view any trend data

## Commands

### Reseed Permissions
```bash
php artisan db:seed --class=RoleSeeder
```

### Clear Permission Cache
```bash
php artisan permission:cache-reset
```

### Check Permission in Database
```bash
php artisan tinker --execute="echo \Spatie\Permission\Models\Permission::where('name', 'view price trend')->exists() ? 'EXISTS' : 'NOT FOUND';"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission not showing | Run `php artisan db:seed --class=RoleSeeder` |
| Staff can't access after granting | Clear cache: `php artisan cache:clear` |
| Menu still showing after revoking | Refresh page or clear browser cache |
| 403 error when accessing | Verify permission is granted in database |

## Files Modified

- ✓ `database/seeders/RoleSeeder.php` - Added permission
- ✓ `routes/web.php` - Updated middleware
- ✓ `app/Http/Controllers/Admin/StaffController.php` - Sorted permissions
- ✓ `resources/js/components/shared/layout/app-sidebar.tsx` - Updated check
- ✓ `resources/js/pages/Admin/Staff/create.tsx` - Added checkbox
- ✓ `resources/js/pages/Admin/Staff/edit.tsx` - Added checkbox
- ✓ `resources/js/pages/Admin/Trends/index.tsx` - Updated PermissionGuard

## Testing Checklist

- [ ] Permission exists in database
- [ ] Admin has permission automatically
- [ ] Checkbox appears in staff create/edit forms
- [ ] Permission saves correctly
- [ ] Menu shows/hides based on permission
- [ ] Route access enforced correctly
- [ ] Page loads for authorized users
- [ ] Access denied for unauthorized users

## Best Practices

1. **Grant Selectively:** Only give to staff who need trend analysis
2. **Review Regularly:** Audit staff permissions quarterly
3. **Document Decisions:** Note why specific staff have this permission
4. **Test After Changes:** Verify permission works after granting/revoking
5. **Combine Wisely:** Consider granting with related permissions

## Common Use Cases

### Scenario 1: Inventory Manager
- ✓ view price trend
- ✓ view inventory
- ✓ generate inventory report
- ✓ generate trend report

### Scenario 2: Sales Analyst
- ✓ view price trend
- ✓ view sales
- ✓ generate sales report
- ✓ generate trend report

### Scenario 3: Order Processor
- ✗ view price trend (not needed)
- ✓ view orders
- ✓ manage orders
- ✓ process orders

## Summary

The "View Price Trend" permission provides granular control over who can access price trend analysis. It's separate from inventory permissions, allowing administrators to control trend analysis access independently. All trend routes are protected, and the UI automatically adapts based on the user's permissions.
