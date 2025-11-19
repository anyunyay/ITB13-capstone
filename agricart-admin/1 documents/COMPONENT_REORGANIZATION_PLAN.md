# Component Reorganization Plan

## New Structure

```
resources/js/components/
├── admin/              # Admin-specific components
│   ├── dashboard/
│   ├── inventory/      # (existing, keep)
│   ├── logistics/      # (existing, keep)
│   ├── membership/     # (existing, keep)
│   ├── orders/         # (existing, keep)
│   └── staff/          # (existing, keep)
├── customer/           # Customer-specific components
│   ├── cart/
│   ├── products/
│   └── orders/
├── logistic/           # Logistic user components
│   └── delivery/
├── member/             # Member/vendor components
│   └── inventory/
├── shared/             # Components used by multiple user types
│   ├── auth/
│   ├── profile/
│   ├── notifications/
│   └── layout/
├── common/             # Generic reusable components
│   ├── modals/
│   ├── forms/
│   └── feedback/
└── ui/                 # (existing, keep) - Base UI components
```

## Components to Move

### To `shared/auth/`:
- LoginModal.tsx
- otp-verification-modal.tsx
- LoginRestrictionPopup.tsx

### To `shared/profile/`:
- ProfileEditModal.tsx
- change-email-modal.tsx
- change-phone-modal.tsx
- delete-user.tsx
- user-info.tsx
- user-menu-content.tsx

### To `shared/notifications/`:
- notification-bell.tsx
- NotificationBell.tsx (duplicate?)
- NotificationPage.tsx
- notifications/ (folder - already exists)

### To `shared/layout/`:
- app-header.tsx
- app-sidebar.tsx
- app-sidebar-header.tsx
- app-shell.tsx
- app-content.tsx
- app-logo.tsx
- app-logo-icon.tsx
- avatar-dropdown.tsx
- nav-main.tsx
- nav-user.tsx
- nav-footer.tsx
- breadcrumbs.tsx
- Footer.tsx
- Footer.module.css
- SimpleFooter.tsx

### To `admin/dashboard/`:
- logistic-header.tsx (rename to admin-logistic-header.tsx)
- member-header.tsx (rename to admin-member-header.tsx)

### To `customer/cart/`:
- AddToCartModal.tsx

### To `customer/products/`:
- ProductCard.tsx
- ProduceSearchBar.tsx
- StarRating.tsx
- ImageLightbox.tsx

### To `customer/orders/`:
- OrderReceiptPreview.tsx
- OrderReceivedConfirmationModal.tsx

### To `common/modals/`:
- urgent-order-popup.tsx
- UrgentApprovalPopup.tsx

### To `common/forms/`:
- address-form.tsx
- search-bar.tsx
- input-error.tsx

### To `common/feedback/`:
- flash-message.tsx
- urgent-flash.tsx
- UrgentFlashNotification.tsx
- CountdownTimer.tsx

### To `common/`:
- pagination.tsx
- heading.tsx
- heading-small.tsx
- text-link.tsx
- theme-toggle.tsx
- icon.tsx
- SecureImage.tsx
- permission-gate.tsx
- permission-guard.tsx

### Marketing/Landing (keep in root or move to `customer/marketing/`):
- FeatureCards.tsx
- FeatureCards.module.css
- TestimonialSlider.tsx

## Implementation Steps

1. Create new folder structure
2. Move files to new locations
3. Update all import statements across the codebase
4. Test each user type's pages
5. Remove empty folders
6. Update documentation
