# Staff Permissions Guide

## Overview
The staff permission system has been updated to use consolidated access permissions, making it easier to manage staff roles while maintaining security. The system now groups related permissions into logical access categories while keeping report generation and deletion as separate, granular permissions.

## Permission Categories

### Access Permissions (Consolidated)
These are the main access areas that staff members can be granted:

- **Inventory Access**: Combines all inventory-related permissions including:
  - View inventory, create products, edit products
  - View archive, archive products, unarchive products  
  - View stocks, create stocks, edit stocks
  - View sold stock, view stock trail

- **Order Access**: Combines order management permissions:
  - View orders, create orders, edit orders

- **Logistics Access**: Combines logistics management permissions:
  - View logistics, create logistics, edit logistics

### Report Permissions (Separate)
These permissions allow staff to generate specific reports:
- generate order report
- generate logistics report
- generate inventory report
- generate sales report

### Delete Permissions (Advanced - Admin Approval Required)
These permissions allow permanent deletion of records and require explicit admin approval:
- delete products
- delete archived products
- delete stocks
- delete orders
- delete logistics

### Admin-Only Permissions
These permissions are restricted to admin users only:
- **Staff Management**: view staffs, create staffs, edit staffs, delete staffs
- **Membership Management**: view membership, create members, edit members, delete members, generate membership report

## Security Features

### Consolidated Access Control
- Related permissions are grouped into logical access categories
- Reduces complexity while maintaining granular control over reports and deletions
- Makes it easier to understand what access a staff member has

### Default View Permissions
When assigning create, edit, or delete permissions to staff members, the system automatically includes the corresponding view permissions:
- **Create/Edit/Delete Products** → Automatically includes `view inventory`
- **Archive/Unarchive Products** → Automatically includes `view archive`
- **Create/Edit/Delete Stocks** → Automatically includes `view stocks`
- **Create/Edit/Delete Orders** → Automatically includes `view orders`
- **Create/Edit/Delete Logistics** → Automatically includes `view logistics`

This ensures staff members always have the necessary view access to perform their assigned actions.

### Warning System
When creating or editing staff members, delete permissions are displayed in a separate section with:
- ⚠️ Warning icon and amber-colored warning box
- Clear explanation of the consequences
- Recommendation to only grant to trusted staff

### Admin Control
- Only admins can grant delete permissions to staff
- Delete permissions are not assigned by default
- Each delete permission must be explicitly selected

## Best Practices

1. **Start with Access Permissions**: Grant the main access areas the staff member needs
2. **Add Report Permissions as Needed**: Only grant report permissions if the staff member needs to generate reports
3. **Evaluate Need for Delete Permissions**: Consider if the staff member actually needs to delete records
4. **Train Staff**: Ensure staff members understand the consequences of deleting data
5. **Regular Review**: Periodically review staff permissions to ensure they remain appropriate
6. **Document Decisions**: Keep records of why specific permissions were granted

## Implementation Notes

- The system maintains backward compatibility
- Existing staff members retain their current permissions
- New staff members start with no permissions by default
- Admins can modify permissions at any time through the staff management interface
- The PermissionHelper class manages the mapping between consolidated and detailed permissions 