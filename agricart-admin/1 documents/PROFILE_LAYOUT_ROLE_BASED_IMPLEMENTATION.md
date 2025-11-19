# Profile Layout Role-Based Implementation

## Overview
Updated the Profile pages to automatically adjust their layout and content based on the user's role/type, ensuring each user sees the layout and features intended for their specific access level.

## Changes Made

### 1. Enhanced Utility Functions (`resources/js/lib/utils.ts`)
- **`getProfileRoutes(userType)`**: Generates role-based profile route paths
- **`hasFeatureAccess(userType, feature)`**: Checks if a user has access to specific features
- Centralized route generation logic for consistency across all profile pages

### 2. Updated ProfileWrapper (`resources/js/pages/Profile/profile-wrapper.tsx`)
- Already had proper role-based layout selection
- Uses different layouts based on user type:
  - `admin`/`staff` → `AppSidebarLayout`
  - `customer` → `AppHeaderLayout`
  - `logistic` → `LogisticLayout`
  - `member` → `MemberLayout`

### 3. Enhanced Main Profile Page (`resources/js/pages/Profile/profile.tsx`)
- **Role-based navigation tools**: Different tool sections for each user type
- **Feature access control**: Uses `hasFeatureAccess()` to show/hide features
- **Dynamic routing**: Uses `getProfileRoutes()` for consistent route generation
- **Conditional features**:
  - System Logs: Admin/Staff only
  - Address Management: Customer only
  - Password Change: All users
  - Appearance Settings: All users
  - Help & Support: All users
  - Logout: All users

### 4. Updated Individual Profile Pages

#### Address Management (`resources/js/pages/Profile/address.tsx`)
- Uses centralized route generation
- Maintains existing functionality while improving consistency

#### Appearance Settings (`resources/js/pages/Profile/appearance.tsx`)
- Uses centralized route generation
- Available to all user types

#### Password Change (`resources/js/pages/Profile/password.tsx`)
- Uses centralized route generation
- Available to all user types

#### Help & Support (`resources/js/pages/Profile/help.tsx`)
- **Removed customer-only restriction**
- **Role-specific content**: Different help content based on user type
- **Dynamic contact information**: Role-specific support contacts
- Available to all user types with customized content

#### Logout (`resources/js/pages/Profile/logout.tsx`)
- Uses centralized route generation
- Available to all user types

#### System Logs (`resources/js/pages/Profile/system-logs.tsx`)
- **Added access control**: Admin/Staff only
- Shows access denied message for unauthorized users

## User Experience by Role

### Admin/Staff Users
- Full sidebar layout with admin navigation
- Access to system logs
- All standard profile features
- Admin-specific help content and support contacts

### Customer Users
- Header-only layout for cleaner customer experience
- Address management functionality
- Customer-specific help center with FAQs
- Standard profile features (password, appearance, logout)

### Logistic Users
- Logistics-specific layout
- Logistics-focused help content
- Standard profile features
- Logistics-specific support contacts

### Member Users
- Member-specific layout
- Member-focused help content
- Standard profile features
- Member-specific support contacts

## Benefits

1. **Consistent Experience**: Each user type gets a layout appropriate for their role
2. **Security**: Features are properly restricted based on user permissions
3. **Maintainability**: Centralized route and access control logic
4. **Scalability**: Easy to add new features or user types
5. **User-Friendly**: Role-appropriate content and navigation

## Technical Implementation

- **Type Safety**: All route generation is type-safe
- **Centralized Logic**: Route generation and access control in utility functions
- **Conditional Rendering**: Features shown/hidden based on user permissions
- **Dynamic Content**: Help content and contact information adapt to user role
- **Consistent Patterns**: All profile pages use the same utility functions

The implementation ensures that each user sees only the features and layout appropriate for their role while maintaining a consistent and intuitive user experience across all user types.