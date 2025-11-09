# Component Structure - Quick Reference

## Where to Find Components

### 🔐 Authentication & Authorization
```
components/shared/auth/
├── LoginModal.tsx
├── otp-verification-modal.tsx
└── LoginRestrictionPopup.tsx

components/common/
├── permission-gate.tsx
└── permission-guard.tsx
```

### 👤 User Profile & Account
```
components/shared/profile/
├── ProfileEditModal.tsx
├── change-email-modal.tsx
├── change-phone-modal.tsx
├── delete-user.tsx
├── user-info.tsx
└── user-menu-content.tsx
```

### 🔔 Notifications
```
components/shared/notifications/
├── notification-bell.tsx
├── NotificationBell.tsx
├── NotificationPage.tsx
└── pagination-controls.tsx
```

### 🎨 Layout & Navigation
```
components/shared/layout/
├── customer-header.tsx      # Customer-facing header
├── admin-header.tsx         # Admin dashboard header
├── app-sidebar.tsx
├── app-shell.tsx
├── app-content.tsx
├── app-logo.tsx
├── app-logo-icon.tsx
├── avatar-dropdown.tsx
├── nav-main.tsx
├── nav-user.tsx
├── nav-footer.tsx
├── breadcrumbs.tsx
├── Footer.tsx
├── Footer.module.css
└── SimpleFooter.tsx

components/logistics/
└── logistics-header.tsx     # Logistics user header

components/member/
└── member-header.tsx        # Member/vendor user header
```

### 🛒 Customer Shopping
```
components/customer/
├── cart/
│   └── AddToCartModal.tsx
├── products/
│   ├── ProductCard.tsx
│   ├── ProduceSearchBar.tsx
│   ├── StarRating.tsx
│   └── ImageLightbox.tsx
├── orders/
│   ├── OrderReceiptPreview.tsx
│   └── OrderReceivedConfirmationModal.tsx
└── marketing/
    ├── FeatureCards.tsx
    ├── FeatureCards.module.css
    └── TestimonialSlider.tsx
```

### 👨‍💼 Admin Management
```
components/admin/
├── dashboard/
│   ├── admin-logistic-header.tsx
│   └── admin-member-header.tsx
├── inventory/          # Product & stock management
├── logistics/          # Delivery personnel management
├── membership/         # Vendor/supplier management
├── orders/             # Order processing & tracking
└── staff/              # Staff & permissions management
```

### 📦 Common Utilities
```
components/common/
├── modals/
│   ├── urgent-order-popup.tsx
│   └── UrgentApprovalPopup.tsx
├── forms/
│   ├── address-form.tsx
│   ├── search-bar.tsx
│   └── input-error.tsx
├── feedback/
│   ├── flash-message.tsx
│   ├── urgent-flash.tsx
│   ├── UrgentFlashNotification.tsx
│   └── CountdownTimer.tsx
├── pagination.tsx
├── heading.tsx
├── heading-small.tsx
├── text-link.tsx
├── theme-toggle.tsx
├── icon.tsx
└── SecureImage.tsx
```

### 🎨 UI Components (shadcn/ui)
```
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── select.tsx
└── [50+ base UI components]
```

## Import Examples

### Before Reorganization
```typescript
import { LoginModal } from '@/components/LoginModal';
import { ProductCard } from '@/components/ProductCard';
import { pagination } from '@/components/pagination';
import Footer from '@/components/Footer';
```

### After Reorganization
```typescript
import { LoginModal } from '@/components/shared/auth/LoginModal';
import { ProductCard } from '@/components/customer/products/ProductCard';
import { pagination } from '@/components/common/pagination';
import Footer from '@/components/shared/layout/Footer';
```

## Decision Tree: Where Should My Component Go?

### 1. Is it a base UI component (button, input, card)?
→ `components/ui/`

### 2. Is it used by multiple user types?
→ `components/shared/`
   - Auth related? → `shared/auth/`
   - Profile related? → `shared/profile/`
   - Notifications? → `shared/notifications/`
   - Layout/Navigation? → `shared/layout/`

### 3. Is it specific to one user type?
→ `components/[user-type]/`
   - Admin only? → `components/admin/`
   - Customer only? → `components/customer/`
   - Logistic only? → `components/logistics/`
   - Member only? → `components/membership/`

### 4. Is it a generic utility?
→ `components/common/`
   - Modal? → `common/modals/`
   - Form element? → `common/forms/`
   - Feedback/Alert? → `common/feedback/`
   - Other utility? → `common/`

## User Type Definitions

### Admin
- **Role**: System administrators
- **Access**: Full system management
- **Components**: Dashboard, inventory, logistics, membership, orders, staff management

### Customer
- **Role**: End users/shoppers
- **Access**: Browse products, place orders, track deliveries
- **Components**: Cart, products, orders, marketing

### Logistic
- **Role**: Delivery personnel
- **Access**: View assigned orders, update delivery status
- **Components**: Delivery management, order tracking

### Member
- **Role**: Vendors/suppliers
- **Access**: Manage inventory, view sales, track revenue
- **Components**: Stock management, sales tracking

## Best Practices

### Creating New Components

1. **Determine User Type**: Who will use this component?
2. **Check for Reusability**: Will multiple user types use it?
3. **Choose Location**: Follow the decision tree above
4. **Use Absolute Imports**: Always use `@/components/...`
5. **Co-locate Related Files**: Keep CSS modules and types with components

### Naming Conventions

- **PascalCase**: Component files (e.g., `ProductCard.tsx`)
- **kebab-case**: Utility components (e.g., `otp-verification-modal.tsx`)
- **Descriptive Names**: Clear purpose (e.g., `admin-logistic-header.tsx`)

### Import Organization

```typescript
// 1. External libraries
import React from 'react';
import { Link } from '@inertiajs/react';

// 2. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Shared components
import { LoginModal } from '@/components/shared/auth/LoginModal';

// 4. User-specific components
import { ProductCard } from '@/components/customer/products/ProductCard';

// 5. Common utilities
import { pagination } from '@/components/common/pagination';

// 6. Hooks and utils
import { useTranslation } from '@/hooks/use-translation';

// 7. Types
import type { Product } from '@/types';
```

## Migration Checklist for New Components

- [ ] Identify user type or category
- [ ] Place in appropriate folder
- [ ] Use absolute imports (`@/components/...`)
- [ ] Update any related documentation
- [ ] Add to this reference if it's a new category
- [ ] Verify no TypeScript errors
- [ ] Test component in context

## Common Patterns

### Shared Layout Component
```typescript
// components/shared/layout/my-layout.tsx
import { AppHeader } from '@/components/shared/layout/app-header';
import { Footer } from '@/components/shared/layout/Footer';
```

### User-Specific Page
```typescript
// pages/Customer/MyPage.tsx
import { ProductCard } from '@/components/customer/products/ProductCard';
import { AddToCartModal } from '@/components/customer/cart/AddToCartModal';
```

### Admin Management Page
```typescript
// pages/Admin/MyPage.tsx
import { StatsOverview } from '@/components/admin/inventory/stats-overview';
import { PermissionGuard } from '@/components/common/permission-guard';
```

## Troubleshooting

### Import Not Found
1. Check the component location in this guide
2. Verify the file exists in the new location
3. Ensure you're using the correct path with `@/components/`

### TypeScript Errors
1. Run diagnostics: Check for typos in import paths
2. Verify the component was moved correctly
3. Check for circular dependencies

### Component Not Rendering
1. Verify all imports are updated
2. Check browser console for errors
3. Ensure component exports are correct

## Summary

The new structure provides:
- ✅ Clear separation by user type
- ✅ Logical grouping of related components
- ✅ Easy navigation and discovery
- ✅ Better maintainability
- ✅ Scalable architecture

For detailed information, see `COMPONENT_REORGANIZATION_COMPLETE.md`
