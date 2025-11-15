# Profile Pages Refactoring Guide

## Overview

The profile pages have been refactored to use reusable components with dynamic role-based rendering. This eliminates code duplication and makes it easy to add new user types or features.

## Architecture

### Component Structure

```
resources/js/
├── components/
│   └── profile/
│       ├── ProfileHeader.tsx              # Avatar, name, user type badge
│       ├── ContactInformation.tsx         # Email and phone display
│       ├── AccountInformation.tsx         # Address and account creation date
│       ├── ProfileDetailsCard.tsx         # Combines contact & account info
│       ├── ProfileToolsCard.tsx           # Dynamic tools grid
│       └── config/
│           └── profile-tools.config.ts    # Configuration for role-based tools
└── pages/
    └── Profile/
        ├── profile-refactored.tsx         # New refactored profile page
        └── profile.tsx                    # Original (can be replaced)
```

## Key Features

### 1. **Reusable Components**

All profile UI elements are now separate, reusable components:

- **ProfileHeader**: Displays user avatar, name, role badge, and edit button
- **ContactInformation**: Shows email and phone (with masking for non-admin users)
- **AccountInformation**: Displays address and account creation date
- **ProfileDetailsCard**: Combines contact and account information
- **ProfileToolsCard**: Renders role-specific action buttons

### 2. **Role-Based Rendering**

The system automatically shows/hides features based on user type:

```typescript
// Customer sees:
- Address Management
- Password Change
- Appearance Settings
- Help & Support
- Logout

// Admin/Staff sees:
- System Logs
- Password Change
- Appearance Settings
- Help & Support
- Logout

// Member/Logistic sees:
- Password Change
- Appearance Settings
- Help & Support
- Logout
```

### 3. **Configuration-Based Approach**

Tools are defined in `profile-tools.config.ts`, making it easy to:
- Add new tools
- Modify existing tools
- Change permissions
- Customize icons and colors

## Usage

### Basic Implementation

```tsx
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileDetailsCard } from '@/components/profile/ProfileDetailsCard';
import { ProfileToolsCard } from '@/components/profile/ProfileToolsCard';
import { getProfileTools } from '@/components/profile/config/profile-tools.config';

export default function ProfilePage() {
    const { user } = usePage<PageProps>().props;
    const t = useTranslation();
    const profileTools = getProfileTools(user.type, t);

    return (
        <ProfileWrapper title={t('ui.profile_information')}>
            <div className="space-y-6">
                <ProfileHeader 
                    user={user} 
                    onEditClick={() => setIsEditModalOpen(true)} 
                />
                
                <ProfileDetailsCard 
                    user={user} 
                    maskPhone={maskPhone} 
                />
                
                <ProfileToolsCard 
                    userType={user.type}
                    tools={profileTools}
                />
            </div>
        </ProfileWrapper>
    );
}
```

### Adding a New Tool

Edit `resources/js/components/profile/config/profile-tools.config.ts`:

```typescript
// 1. Import the icon
import { NewIcon } from 'lucide-react';

// 2. Add to the configuration
if (userType === 'admin') {
    tools.push({
        id: 'new_feature',
        icon: NewIcon,
        label: t('ui.new_feature'),
        description: t('ui.new_feature_description'),
        route: '/admin/new-feature',
        iconColor: 'text-primary',
    });
}
```

### Adding a New User Type

1. Update `getProfileRoutes()` in `resources/js/lib/utils.ts`:

```typescript
export const getProfileRoutes = (userType: string) => {
    const baseRoute = userType === 'new_type' ? '/new-type' : 
                     // ... existing logic
    
    return {
        profile: `${baseRoute}/profile`,
        // ... other routes
    };
};
```

2. Update `hasFeatureAccess()` in `resources/js/lib/utils.ts`:

```typescript
export const hasFeatureAccess = (userType: string, feature: string): boolean => {
    const accessMap: Record<string, string[]> = {
        'feature_name': ['admin', 'staff', 'new_type'],
        // ... other features
    };
    
    return accessMap[feature]?.includes(userType) ?? false;
};
```

3. Add tools in `profile-tools.config.ts` for the new user type.

### Customizing for Specific User Types

You can create role-specific components:

```tsx
// CustomerActivityFeed.tsx
export function CustomerActivityFeed({ user }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Customer-specific content */}
            </CardContent>
        </Card>
    );
}

// Then in profile page:
{user.type === 'customer' && <CustomerActivityFeed user={user} />}
```

## Design Patterns

### 1. **Customer Design**
- Focus on shopping and orders
- Address management prominent
- Simple, clean interface

### 2. **Admin/Staff/Member/Logistic Shared Design**
- Professional dashboard feel
- System tools and management features
- Advanced functionality access

## Benefits

1. **No Code Duplication**: Shared components used across all user types
2. **Easy Maintenance**: Update one component, affects all pages
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Scalability**: Easy to add new user types or features
5. **Consistency**: Same UI patterns across all profile pages
6. **Testability**: Small, focused components are easier to test

## Migration Path

To migrate from the old profile page to the refactored version:

1. **Test the new implementation**:
   ```bash
   # Rename the old file
   mv profile.tsx profile-old.tsx
   
   # Rename the new file
   mv profile-refactored.tsx profile.tsx
   ```

2. **Verify all user types**:
   - Test as customer
   - Test as admin
   - Test as staff
   - Test as member
   - Test as logistic

3. **Check all features**:
   - Profile editing
   - Navigation to tools
   - Responsive design
   - Translations

4. **Remove old file** once confirmed working:
   ```bash
   rm profile-old.tsx
   ```

## Future Enhancements

Potential additions to the system:

1. **Activity Feed Component**: Show recent user activities
2. **Statistics Cards**: Display user-specific metrics
3. **Quick Actions**: Frequently used actions at the top
4. **Notification Preferences**: Manage notification settings
5. **Privacy Settings**: Control data visibility
6. **Two-Factor Authentication**: Security settings

## Example: Adding Activity Feed

```tsx
// 1. Create the component
// resources/js/components/profile/ActivityFeed.tsx
export function ActivityFeed({ userType, activities }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.map(activity => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </CardContent>
        </Card>
    );
}

// 2. Add to profile page
{user.type !== 'customer' && (
    <ActivityFeed 
        userType={user.type} 
        activities={activities} 
    />
)}
```

## Troubleshooting

### Tools not showing
- Check `hasFeatureAccess()` includes the user type
- Verify routes are defined in `getProfileRoutes()`
- Ensure translations exist for labels

### Styling issues
- Check Tailwind classes are correct
- Verify responsive breakpoints (sm:, lg:)
- Test in both light and dark modes

### Type errors
- Ensure User interface includes all required fields
- Check component prop types match usage
- Verify imports are correct

## Support

For questions or issues with the refactored profile system:
1. Check this documentation
2. Review component source code
3. Test with different user types
4. Verify configuration in `profile-tools.config.ts`
