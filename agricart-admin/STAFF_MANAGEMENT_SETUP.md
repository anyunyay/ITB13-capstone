# Staff Management System

## Overview

The staff management system allows administrators to create, edit, and manage staff members with granular permissions. Staff members have limited access compared to administrators, specifically excluding:

- Staff management (view, create, edit, delete staff)
- Member management (view, create, edit, delete members)
- Delete operations (delete products, stocks, orders, logistics, archived products)

## Features

### 1. Staff List View
- **Route**: `/admin/staff`
- **Permission**: `view staffs`
- Displays all staff members with their assigned permissions
- Shows staff name, email, permissions, and creation date
- Provides actions to view, edit, and delete staff members

### 2. Create Staff Member
- **Route**: `/admin/staff/add`
- **Permission**: `create staffs`
- Form to create new staff members with:
  - Name and email
  - Password and confirmation
  - Permission selection (excluding restricted permissions)

### 3. Edit Staff Member
- **Route**: `/admin/staff/{id}/edit`
- **Permission**: `edit staffs`
- Form to update existing staff members
- Can change name, email, password (optional), and permissions

### 4. Delete Staff Member
- **Route**: `DELETE /admin/staff/{id}`
- **Permission**: `delete staffs`
- Removes staff member with confirmation dialog

## Available Permissions for Staff

Staff members can be assigned the following permissions:

### Inventory Management
- `view inventory` - View product inventory
- `create products` - Create new products
- `edit products` - Edit existing products
- `view archive` - View archived products
- `archive products` - Archive products
- `unarchive products` - Restore archived products
- `view stocks` - View product stocks
- `create stocks` - Add new stock
- `edit stocks` - Edit existing stock

### Order Management
- `view orders` - View all orders
- `create orders` - Create new orders
- `edit orders` - Edit existing orders
- `view sold stock` - View sold stock reports
- `view stock trail` - View stock trail history

### Logistics Management
- `view logistics` - View logistics information
- `create logistics` - Create new logistics entries
- `edit logistics` - Edit existing logistics

## Restricted Permissions

The following permissions are **NOT** available to staff members:

### Staff Management
- `view staffs`
- `create staffs`
- `edit staffs`
- `delete staffs`

### Member Management
- `view membership`
- `create members`
- `edit members`
- `delete members`

### Delete Operations
- `delete products`
- `delete archived products`
- `delete stocks`
- `delete orders`
- `delete logistics`

## Navigation

The Staff management section appears in the admin sidebar when the user has the `view staffs` permission. The navigation item is labeled "Staff" and uses the UsersRound icon. All staff management pages use the consistent sidebar layout with proper breadcrumbs and navigation.

## Security

- Only administrators can access staff management features
- Staff members cannot manage other staff or members
- Staff members cannot perform delete operations
- All actions are protected by middleware permissions
- Password changes require confirmation
- Email addresses must be unique

## Testing

The system includes comprehensive tests covering:
- Admin access to all staff management features
- Staff member creation with permissions
- Staff member editing and updating
- Staff member deletion
- Permission restrictions for staff members
- Security validation

Run tests with:
```bash
php artisan test tests/Feature/StaffManagementTest.php
```

## Database

The system uses the existing `users` table with the `type` field set to `'staff'` for staff members. Permissions are managed through the Spatie Laravel Permission package.

## Seeding

To set up the initial roles and permissions, run:
```bash
php artisan db:seed --class=RoleSeeder
```

This will create the staff role with appropriate permissions and assign all permissions to the admin role. 