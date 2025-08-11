# Role-Based Permission System

This document explains the role-based permission system implemented in the Agricart Admin application.

## Overview

The application uses the Spatie Laravel Permission package to manage roles and permissions. Each user type (customer, logistic, member) has been assigned a specific role with corresponding permissions.

## Roles and Permissions

### Available Roles
- **admin**: Full access to all features
- **staff**: Limited admin access (inherits from admin permissions)
- **customer**: Access to customer-specific features
- **logistic**: Access to logistic-specific features
- **member**: Access to member-specific features

### Role-Specific Permissions

#### Customer Role
- **Permission**: `access customer features`
- **Routes Protected**: All routes under `/customer/*`
- **Features**: Cart management, order history, notifications

#### Logistic Role
- **Permission**: `access logistic features`
- **Routes Protected**: All routes under `/logistic/*`
- **Features**: Dashboard, assigned orders, delivery status updates

#### Member Role
- **Permission**: `access member features`
- **Routes Protected**: All routes under `/member/*`
- **Features**: Dashboard, stock management, sales tracking

## Implementation Details

### 1. Role Assignment
Roles are automatically assigned to users based on their `type` field in the User model. This happens in two places:

- **User Model Boot Method**: Automatically assigns roles when users are created
- **RoleSeeder**: Assigns roles to existing users when the seeder is run

### 2. Route Protection
Routes are protected using middleware that checks for specific permissions:

```php
// Customer routes
Route::prefix('/customer')->middleware(['can:access customer features'])->group(function () {
    // Customer-specific routes
});

// Logistic routes
Route::prefix('/logistic')->middleware(['can:access logistic features'])->group(function () {
    // Logistic-specific routes
});

// Member routes
Route::prefix('/member')->middleware(['can:access member features'])->group(function () {
    // Member-specific routes
});
```

### 3. Permission Checking
The middleware `can:permission_name` checks if the authenticated user has the specified permission through their assigned role.

## Usage Examples

### Checking Permissions in Controllers
```php
if (auth()->user()->can('access customer features')) {
    // User has customer permissions
}
```

### Checking Roles in Controllers
```php
if (auth()->user()->hasRole('customer')) {
    // User has customer role
}
```

### Blade Templates
```php
@can('access customer features')
    <!-- Customer-specific content -->
@endcan

@role('customer')
    <!-- Customer-specific content -->
@endrole
```

## Testing

The role-based permission system is thoroughly tested in `tests/Feature/RoleBasedPermissionsTest.php`. The tests verify:

- Users can access features appropriate to their role
- Users cannot access features outside their role
- Permission middleware correctly blocks unauthorized access

## Maintenance

### Adding New Roles
1. Add the role to the `RoleSeeder`
2. Create appropriate permissions
3. Assign permissions to the role
4. Update route middleware if needed

### Adding New Permissions
1. Add the permission to the `$permissions` array in `RoleSeeder`
2. Assign the permission to appropriate roles
3. Use the permission in route middleware or controller checks

### Running the Seeder
```bash
php artisan db:seed --class=RoleSeeder
```

This will create/update roles and permissions, and assign roles to existing users based on their type.

## Security Notes

- All role-specific routes are protected by middleware
- Users cannot access features outside their assigned role
- The system uses Laravel's built-in authentication and authorization
- Permissions are cached for performance, cleared when roles/permissions are updated 