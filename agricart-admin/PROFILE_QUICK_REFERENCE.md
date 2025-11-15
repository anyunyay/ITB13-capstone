# Profile System Quick Reference

## 🚀 Quick Start

### Using the Refactored Profile Page

```tsx
import ProfilePage from '@/pages/Profile/profile-refactored';

// That's it! The page handles everything automatically based on user type
```

## 📦 Component Imports

```tsx
// Individual components
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContactInformation } from '@/components/profile/ContactInformation';
import { AccountInformation } from '@/components/profile/AccountInformation';
import { ProfileDetailsCard } from '@/components/profile/ProfileDetailsCard';
import { ProfileToolsCard } from '@/components/profile/ProfileToolsCard';

// Configuration
import { getProfileTools } from '@/components/profile/config/profile-tools.config';

// Utilities
import { getProfileRoutes, hasFeatureAccess } from '@/lib/utils';
```

## 🎯 Common Tasks

### Add a New Tool

**File**: `resources/js/components/profile/config/profile-tools.config.ts`

```typescript
// 1. Import icon
import { NewIcon } from 'lucide-react';

// 2. Add to getProfileTools function
if (hasFeatureAccess(userType, 'new_feature')) {
    tools.push({
        id: 'new_feature',
        icon: NewIcon,
        label: t('ui.new_feature'),
        description: t('ui.new_feature_desc'),
        route: routes.newFeature,
        iconColor: 'text-primary',
    });
}
```

### Add Feature Access Control

**File**: `resources/js/lib/utils.ts`

```typescript
export const hasFeatureAccess = (userType: string, feature: string): boolean => {
    const accessMap: Record<string, string[]> = {
        'new_feature': ['admin', 'staff', 'customer'], // Add here
        // ... existing features
    };
    
    return accessMap[feature]?.includes(userType) ?? false;
};
```

### Add New Route

**File**: `resources/js/lib/utils.ts`

```typescript
export const getProfileRoutes = (userType: string) => {
    const baseRoute = /* ... */;
    
    return {
        // ... existing routes
        newFeature: `${baseRoute}/new-feature`, // Add here
    };
};
```

### Create Role-Specific Component

```tsx
// CustomerDashboard.tsx
interface CustomerDashboardProps {
    user: User;
    orders: Order[];
}

export function CustomerDashboard({ user, orders }: CustomerDashboardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Customer-specific content */}
            </CardContent>
        </Card>
    );
}

// Use in profile page
{user.type === 'customer' && (
    <CustomerDashboard user={user} orders={orders} />
)}
```

## 🎨 Styling Patterns

### Card Styling
```tsx
className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
```

### Info Box Styling
```tsx
className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200"
```

### Icon Container
```tsx
<div className="p-2 rounded-lg bg-primary/10">
    <Icon className="h-5 w-5 text-primary" />
</div>
```

### Responsive Grid
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

## 🔧 User Type Checks

```tsx
// Check if admin or staff
const isAdminOrStaff = user.type === 'admin' || user.type === 'staff';

// Check specific type
if (user.type === 'customer') { /* ... */ }

// Multiple types
if (['admin', 'staff'].includes(user.type)) { /* ... */ }

// Using utility
if (hasFeatureAccess(user.type, 'system_logs')) { /* ... */ }
```

## 📱 Responsive Design

```tsx
// Mobile-first approach
<div className="
    text-sm          // Mobile
    sm:text-base     // Tablet (640px+)
    lg:text-lg       // Desktop (1024px+)
">

// Grid columns
<div className="
    grid-cols-1      // Mobile: 1 column
    sm:grid-cols-2   // Tablet: 2 columns
    lg:grid-cols-3   // Desktop: 3 columns
">

// Spacing
<div className="
    gap-3            // Mobile: 12px
    sm:gap-4         // Tablet: 16px
    lg:gap-6         // Desktop: 24px
">
```

## 🌐 Translation Keys

### Common UI Keys
```typescript
t('ui.profile_information')
t('ui.contact_information')
t('ui.account_information')
t('ui.edit_profile')
t('ui.change_password')
t('ui.appearance')
t('ui.help_and_support')
t('ui.logout')
```

### User Type Labels
```typescript
t('admin.administrator')
t('staff.staff_member')
t('customer.customer')
t('logistic.logistics')
t('member.member')
```

### Tool Descriptions
```typescript
t('ui.view_analyze_system_logs')
t('ui.manage_delivery_addresses')
t('ui.update_password_security')
t('ui.customize_interface_theme')
t('ui.get_help_documentation')
t('ui.sign_out_securely')
```

## 🔐 Security Patterns

### Mask Email
```tsx
import { getDisplayEmail } from '@/lib/utils';

const displayEmail = getDisplayEmail(user.email, user.type);
// Admin/Staff: full email
// Others: ma***@example.com
```

### Mask Phone
```tsx
const maskPhone = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return '*'.repeat(digitsOnly.length);
    return '*'.repeat(digitsOnly.length - 3) + digitsOnly.slice(-3);
};

const displayPhone = isAdminOrStaff ? phone : maskPhone(phone);
```

## 📊 User Type Matrix

| Feature | Customer | Admin | Staff | Member | Logistic |
|---------|----------|-------|-------|--------|----------|
| System Logs | ❌ | ✅ | ✅ | ❌ | ❌ |
| Address Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Password Change | ✅ | ✅ | ✅ | ✅ | ✅ |
| Appearance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Help & Support | ✅ | ✅ | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🐛 Debugging Tips

### Check User Type
```tsx
console.log('User type:', user.type);
console.log('Available tools:', getProfileTools(user.type, t));
```

### Verify Routes
```tsx
const routes = getProfileRoutes(user.type);
console.log('Profile routes:', routes);
```

### Check Feature Access
```tsx
console.log('Has system logs:', hasFeatureAccess(user.type, 'system_logs'));
console.log('Has addresses:', hasFeatureAccess(user.type, 'address_management'));
```

### Inspect Props
```tsx
const { user, ...otherProps } = usePage<PageProps>().props;
console.log('User:', user);
console.log('Other props:', otherProps);
```

## 🎯 Best Practices

### ✅ Do
- Use shared components for common UI
- Check feature access before rendering
- Use translation keys for all text
- Follow responsive design patterns
- Keep components small and focused

### ❌ Don't
- Duplicate code across user types
- Hardcode user type checks everywhere
- Skip translation for any text
- Ignore responsive breakpoints
- Create monolithic components

## 📝 Type Definitions

### User Interface
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    type: 'admin' | 'staff' | 'customer' | 'member' | 'logistic';
    contact_number?: string;
    avatar_url?: string;
    created_at?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        is_active: boolean;
    };
}
```

### ProfileTool Interface
```typescript
interface ProfileTool {
    id: string;
    icon: LucideIcon;
    label: string;
    description: string;
    route: string;
    variant?: 'default' | 'destructive';
    iconColor?: string;
    hoverColor?: string;
}
```

## 🔗 File Locations

```
Profile Components:
├── resources/js/components/profile/
│   ├── ProfileHeader.tsx
│   ├── ContactInformation.tsx
│   ├── AccountInformation.tsx
│   ├── ProfileDetailsCard.tsx
│   ├── ProfileToolsCard.tsx
│   └── config/
│       └── profile-tools.config.ts

Profile Pages:
├── resources/js/pages/Profile/
│   ├── profile-refactored.tsx (new)
│   ├── profile.tsx (old)
│   ├── profile-wrapper.tsx
│   ├── address.tsx
│   ├── password.tsx
│   ├── appearance.tsx
│   ├── help.tsx
│   └── logout.tsx

Utilities:
└── resources/js/lib/
    └── utils.ts
```

## 🚨 Common Issues

### Tools not appearing
**Problem**: Tools don't show for a user type
**Solution**: Check `hasFeatureAccess()` includes the user type

### Wrong routes
**Problem**: Navigation goes to wrong page
**Solution**: Verify `getProfileRoutes()` returns correct paths

### Styling broken
**Problem**: Components look wrong
**Solution**: Check Tailwind classes and responsive breakpoints

### Type errors
**Problem**: TypeScript errors in components
**Solution**: Ensure User interface matches backend data

## 📚 Related Documentation

- [Profile Refactoring Guide](./PROFILE_REFACTORING_GUIDE.md)
- [Component Architecture](./PROFILE_COMPONENT_ARCHITECTURE.md)
- [Translation System Guide](./TRANSLATION_SYSTEM_GUIDE.md)
- [Permission System Guide](./PERMISSION_SYSTEM_GUIDE.md)
