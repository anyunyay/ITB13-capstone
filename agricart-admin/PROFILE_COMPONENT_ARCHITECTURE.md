# Profile Component Architecture

## Component Hierarchy

```
ProfilePage (profile-refactored.tsx)
│
├── ProfileWrapper (layout wrapper)
│   │
│   └── Content
│       │
│       ├── ProfileHeader
│       │   ├── Avatar
│       │   ├── User Info (name, type, join date)
│       │   └── Edit Button
│       │
│       ├── ProfileDetailsCard
│       │   ├── ContactInformation
│       │   │   ├── Email Display (masked for non-admin)
│       │   │   └── Phone Display (masked for non-admin)
│       │   │
│       │   └── AccountInformation
│       │       ├── Current Address
│       │       └── Account Created Date
│       │
│       └── ProfileToolsCard (role-based)
│           └── Dynamic Tools Grid
│               ├── System Logs (admin/staff only)
│               ├── Address Management (customer only)
│               ├── Password Change (all users)
│               ├── Appearance Settings (all users)
│               ├── Help & Support (all users)
│               └── Logout (all users)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Backend (Inertia)                    │
│                                                              │
│  Sends: { user, addresses, flash, ... }                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    ProfilePage Component                     │
│                                                              │
│  • Receives props via usePage()                             │
│  • Manages edit modal state                                 │
│  • Gets profile tools from config                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├──────────────────┬──────────────────┐
                         ▼                  ▼                  ▼
              ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
              │  ProfileHeader   │ │ProfileDetails│ │ProfileToolsCard  │
              │                  │ │    Card      │ │                  │
              │  Props:          │ │              │ │  Props:          │
              │  • user          │ │  Props:      │ │  • userType      │
              │  • onEditClick   │ │  • user      │ │  • tools[]       │
              └──────────────────┘ │  • maskPhone │ └──────────────────┘
                                   └──────┬───────┘
                                          │
                         ┌────────────────┴────────────────┐
                         ▼                                 ▼
              ┌─────────────────────┐         ┌──────────────────────┐
              │ContactInformation   │         │AccountInformation    │
              │                     │         │                      │
              │  Props:             │         │  Props:              │
              │  • user             │         │  • user              │
              │  • maskPhone        │         └──────────────────────┘
              └─────────────────────┘
```

## Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│              profile-tools.config.ts                         │
│                                                              │
│  getProfileTools(userType, t)                               │
│  ├── Checks hasFeatureAccess() for each tool               │
│  ├── Gets routes from getProfileRoutes()                    │
│  └── Returns ProfileTool[]                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ProfileToolsCard                           │
│                                                              │
│  Receives tools array and renders:                          │
│  • Grid layout (responsive)                                 │
│  • Each tool as a Button                                    │
│  • Icon, label, description                                 │
│  • Click handler → router.visit(tool.route)                 │
└─────────────────────────────────────────────────────────────┘
```

## Role-Based Rendering Logic

```
User Type: customer
├── ProfileHeader ✓ (shared)
├── ProfileDetailsCard ✓ (shared)
│   ├── ContactInformation ✓ (email + phone masked)
│   └── AccountInformation ✓ (address + created date)
└── ProfileToolsCard ✓ (customer-specific)
    ├── Address Management ✓
    ├── Password Change ✓
    ├── Appearance Settings ✓
    ├── Help & Support ✓
    └── Logout ✓

User Type: admin/staff
├── ProfileHeader ✓ (shared)
├── ProfileDetailsCard ✓ (shared)
│   ├── ContactInformation ✓ (email + phone unmasked)
│   └── AccountInformation ✓ (address + created date)
└── ProfileToolsCard ✓ (admin-specific)
    ├── System Logs ✓
    ├── Password Change ✓
    ├── Appearance Settings ✓
    ├── Help & Support ✓
    └── Logout ✓

User Type: member/logistic
├── ProfileHeader ✓ (shared)
├── ProfileDetailsCard ✓ (shared)
│   ├── ContactInformation ✓ (email + phone masked)
│   └── AccountInformation ✓ (address + created date)
└── ProfileToolsCard ✓ (basic tools)
    ├── Password Change ✓
    ├── Appearance Settings ✓
    ├── Help & Support ✓
    └── Logout ✓
```

## Component Responsibilities

### ProfileHeader
**Purpose**: Display user identity and primary action
- Avatar with fallback initials
- User name and type badge
- Member since date
- Edit profile button

**Shared**: Yes (all user types)

### ContactInformation
**Purpose**: Display contact details with security
- Email (masked for non-admin)
- Phone (masked for non-admin)
- Responsive layout

**Shared**: Yes (all user types)
**Conditional**: Email hidden for members

### AccountInformation
**Purpose**: Display account metadata
- Current address (from default_address or user fields)
- Account creation date
- Formatted dates

**Shared**: Yes (all user types)

### ProfileDetailsCard
**Purpose**: Container for contact and account info
- Two-column grid (responsive)
- Combines ContactInformation + AccountInformation

**Shared**: Yes (all user types)

### ProfileToolsCard
**Purpose**: Display role-specific actions
- Dynamic grid of tools
- Icon, label, description per tool
- Navigation on click
- Responsive layout (1-3 columns)

**Shared**: Component is shared
**Content**: Tools vary by user type

## Utility Functions

### getProfileRoutes(userType)
**Location**: `resources/js/lib/utils.ts`
**Purpose**: Generate correct routes for user type
**Returns**: Object with route paths

```typescript
{
    profile: '/customer/profile',
    password: '/customer/profile/password',
    appearance: '/customer/profile/appearance',
    // ... etc
}
```

### hasFeatureAccess(userType, feature)
**Location**: `resources/js/lib/utils.ts`
**Purpose**: Check if user type can access feature
**Returns**: boolean

```typescript
hasFeatureAccess('customer', 'address_management') // true
hasFeatureAccess('customer', 'system_logs')        // false
hasFeatureAccess('admin', 'system_logs')           // true
```

### getProfileTools(userType, t)
**Location**: `resources/js/components/profile/config/profile-tools.config.ts`
**Purpose**: Get available tools for user type
**Returns**: ProfileTool[]

```typescript
[
    {
        id: 'password_change',
        icon: Key,
        label: 'Change Password',
        description: 'Update your password',
        route: '/customer/profile/password',
        iconColor: 'text-primary'
    },
    // ... more tools
]
```

## State Management

```
ProfilePage
├── isEditModalOpen: boolean
│   └── Controls ProfileEditModal visibility
│
└── user: User (from Inertia props)
    └── Passed down to all child components
```

## Styling Approach

### Consistent Design Tokens
- Card backgrounds: `bg-card/70 backdrop-blur-xl`
- Borders: `border border-border/20`
- Hover effects: `hover:shadow-2xl hover:shadow-primary/10`
- Transitions: `transition-all duration-500`

### Responsive Breakpoints
- Mobile: Default (single column)
- Tablet: `sm:` (2 columns for tools)
- Desktop: `lg:` (3 columns for tools, 2 for details)

### Color Coding
- Primary actions: `text-primary`, `bg-primary/10`
- Secondary info: `text-secondary`, `bg-secondary/10`
- Destructive: `text-destructive`, `bg-destructive/5`
- Muted text: `text-muted-foreground`

## Extension Points

### Adding New Sections
```tsx
// In ProfilePage
<ProfileHeader ... />
<ProfileDetailsCard ... />

{/* Add new section here */}
{user.type === 'customer' && (
    <CustomerSpecificSection user={user} />
)}

<ProfileToolsCard ... />
```

### Adding New Tools
```typescript
// In profile-tools.config.ts
if (userType === 'customer') {
    tools.push({
        id: 'order_history',
        icon: ShoppingBag,
        label: t('ui.order_history'),
        description: t('ui.view_past_orders'),
        route: '/customer/orders/history',
        iconColor: 'text-primary',
    });
}
```

### Customizing Existing Components
```tsx
// Create a wrapper component
export function CustomerProfileHeader({ user, onEditClick }) {
    return (
        <div>
            <ProfileHeader user={user} onEditClick={onEditClick} />
            {/* Add customer-specific elements */}
            <CustomerBadges user={user} />
        </div>
    );
}
```

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock user data with different types
- Verify conditional rendering

### Integration Tests
- Test full ProfilePage with different user types
- Verify navigation works
- Check responsive behavior

### E2E Tests
- Login as each user type
- Navigate to profile
- Verify correct tools appear
- Test edit functionality
