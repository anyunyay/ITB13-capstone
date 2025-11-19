# Permission-Based Visibility System

## Overview
The application now implements a comprehensive permission-based visibility system that hides UI elements (buttons, tabs, navigation items) based on user permissions. This ensures that staff members only see and can access features they have permission to use.

## How It Works

### 1. Permission Hook (`use-permissions.tsx`)
A custom React hook that provides easy permission checking:

```typescript
import { usePermissions } from '@/hooks/use-permissions';

const { can, canAny, canAll } = usePermissions();

// Check single permission
if (can('delete products')) {
  // User can delete products
}

// Check multiple permissions (any)
if (canAny(['edit products', 'create products'])) {
  // User can edit OR create products
}

// Check multiple permissions (all)
if (canAll(['view inventory', 'edit products'])) {
  // User can view inventory AND edit products
}
```

### 2. Permission Gate Component (`permission-gate.tsx`)
A wrapper component that conditionally renders content based on permissions:

```typescript
import { PermissionGate } from '@/components/permission-gate';

// Single permission
<PermissionGate permission="delete products">
  <Button onClick={handleDelete}>Delete Product</Button>
</PermissionGate>

// Multiple permissions (any)
<PermissionGate permissions={['edit products', 'create products']}>
  <Button>Edit/Create</Button>
</PermissionGate>

// Multiple permissions (all required)
<PermissionGate permissions={['view inventory', 'edit products']} requireAll={true}>
  <Button>Advanced Edit</Button>
</PermissionGate>

// With fallback content
<PermissionGate permission="delete products" fallback={<p>No delete permission</p>}>
  <Button>Delete</Button>
</PermissionGate>
```

## Implementation Examples

### Sidebar Navigation
The sidebar now only shows navigation items that the user has permission to access:

```typescript
// Inventory tab only shows if user has any inventory-related permission
if (can('view inventory') || can('create products') || can('edit products') || 
    can('view archive') || can('view stocks') || can('create stocks') || 
    can('edit stocks') || can('view sold stock') || can('view stock trail')) {
  mainNavItems.push({
    title: 'Inventory',
    href: '/admin/inventory',
    icon: Package,
  });
}
```

### Button Visibility
Buttons are wrapped with PermissionGate to show/hide based on permissions:

```typescript
// Only show delete button if user has delete permission
<PermissionGate permission="delete products">
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGate>

// Only show create button if user has create permission
<PermissionGate permission="create products">
  <Button>Create Product</Button>
</PermissionGate>
```

### Tab Visibility
Tabs and sections are conditionally rendered:

```typescript
// Only show stock trail tab if user has permission
<PermissionGate permission="view stock trail">
  <Button>Removed Stocks</Button>
</PermissionGate>

// Only show sold stock tab if user has permission
<PermissionGate permission="view sold stock">
  <Button>Sold Stocks</Button>
</PermissionGate>
```

## Permission Categories

### Inventory Permissions
- `view inventory` - Can view inventory page
- `create products` - Can create new products
- `edit products` - Can edit existing products
- `delete products` - Can delete products
- `view archive` - Can view archived products
- `archive products` - Can archive products
- `unarchive products` - Can restore archived products
- `delete archived products` - Can permanently delete archived products
- `view stocks` - Can view stock information
- `create stocks` - Can add new stock
- `edit stocks` - Can edit stock quantities
- `delete stocks` - Can delete stock entries
- `view sold stock` - Can view sold stock reports
- `view stock trail` - Can view stock removal trail

### Order Permissions
- `view orders` - Can view order management
- `create orders` - Can create orders
- `edit orders` - Can edit order details
- `delete orders` - Can delete orders
- `generate order report` - Can generate order reports

### Logistics Permissions
- `view logistics` - Can view logistics management
- `create logistics` - Can create logistics entries
- `edit logistics` - Can edit logistics information
- `delete logistics` - Can delete logistics entries
- `generate logistics report` - Can generate logistics reports

### Staff Management Permissions
- `view staffs` - Can view staff management
- `create staffs` - Can create new staff members
- `edit staffs` - Can edit staff information
- `delete staffs` - Can delete staff members

### Membership Permissions
- `view membership` - Can view membership management
- `create members` - Can create new members
- `edit members` - Can edit member information
- `delete members` - Can delete members
- `generate membership report` - Can generate membership reports

## Benefits

1. **Security**: Users cannot see or access features they don't have permission for
2. **Clean UI**: Interface is cleaner and less cluttered for users with limited permissions
3. **User Experience**: Users only see relevant options based on their role
4. **Maintainability**: Easy to add new permissions and update visibility rules
5. **Consistency**: Uniform permission checking across the entire application

## Best Practices

1. **Always check permissions**: Wrap any action buttons or sensitive UI elements with PermissionGate
2. **Use descriptive permission names**: Make permission names clear and specific
3. **Group related permissions**: Use `canAny()` for related permissions that provide similar access
4. **Provide fallbacks**: Use fallback content to explain why something is not visible
5. **Test thoroughly**: Ensure all permission combinations work correctly

## Adding New Permissions

1. Add the permission to the database seeder
2. Update the permission checking logic in components
3. Wrap relevant UI elements with PermissionGate
4. Test with different user permission sets

This system ensures that staff members have a clean, secure, and role-appropriate interface while maintaining full functionality for administrators. 