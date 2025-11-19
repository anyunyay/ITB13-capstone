# Component Structure - Visual Guide

## Header Components by User Type

```
┌─────────────────────────────────────────────────────────────────┐
│                     HEADER COMPONENTS                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    ADMIN     │     │   CUSTOMER   │     │  LOGISTICS   │     │    MEMBER    │
│              │     │              │     │              │     │              │
│ AdminHeader  │     │CustomerHeader│     │LogisticsHeader│    │ MemberHeader │
│              │     │              │     │              │     │              │
│ Location:    │     │ Location:    │     │ Location:    │     │ Location:    │
│ shared/      │     │ shared/      │     │ logistics/   │     │ member/      │
│ layout/      │     │ layout/      │     │              │     │              │
│              │     │              │     │              │     │              │
│ Used in:     │     │ Used in:     │     │ Used in:     │     │ Used in:     │
│ AppSidebar   │     │ AppHeader    │     │ Logistics    │     │ Member       │
│ Layout       │     │ Layout       │     │ Layout       │     │ Layout       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │                     │
       ▼                     ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Admin Pages  │     │Customer Pages│     │Logistics Pages│    │ Member Pages │
│              │     │              │     │              │     │              │
│ • Dashboard  │     │ • Home       │     │ • Dashboard  │     │ • Dashboard  │
│ • Inventory  │     │ • Products   │     │ • Orders     │     │ • Stocks     │
│ • Orders     │     │ • Cart       │     │ • Report     │     │ • Sales      │
│ • Logistics  │     │ • History    │     │ • Delivery   │     │ • Revenue    │
│ • Members    │     │ • About Us   │     │              │     │              │
│ • Staff      │     │              │     │              │     │              │
│ • Sales      │     │              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Complete Component Structure

```
resources/js/components/
│
├── 👨‍💼 ADMIN COMPONENTS
│   ├── inventory/          ← Admin inventory management
│   ├── logistics/          ← Admin logistics management  
│   ├── membership/         ← Admin membership management
│   ├── orders/             ← Admin order management
│   └── staff/              ← Admin staff management
│
├── 🛒 CUSTOMER COMPONENTS
│   └── customer/
│       ├── cart/           ← Shopping cart
│       ├── products/       ← Product display & search
│       ├── orders/         ← Order tracking
│       └── marketing/      ← Landing page elements
│
├── 🚚 LOGISTICS COMPONENTS
│   └── logistics/
│       ├── logistics-header.tsx     ← Logistics user header
│       └── [admin management]       ← Admin logistics management
│
├── 📦 MEMBER COMPONENTS
│   ├── member/
│   │   └── member-header.tsx    ← Member user header
│   └── membership/         ← Admin membership management
│
├── 🔄 SHARED COMPONENTS (Multi-user)
│   └── shared/
│       ├── auth/           ← Login, OTP, restrictions
│       ├── profile/        ← Profile editing, settings
│       ├── notifications/  ← Notification system
│       └── layout/         ← Headers, footers, navigation
│           ├── customer-header.tsx  ← Customer header
│           ├── admin-header.tsx     ← Admin header
│           ├── Footer.tsx
│           └── [other layout components]
│
├── 🔧 COMMON COMPONENTS (Generic utilities)
│   └── common/
│       ├── modals/         ← Reusable modals
│       ├── forms/          ← Form components
│       ├── feedback/       ← Alerts, flashes, toasts
│       └── [utilities]     ← Pagination, headings, etc.
│
└── 🎨 UI COMPONENTS (Base design system)
    └── ui/                 ← shadcn/ui components
        ├── button.tsx
        ├── card.tsx
        ├── dialog.tsx
        └── [50+ components]
```

## Component Flow by User Journey

### Admin User Journey
```
Login (shared/auth)
    ↓
AdminHeader (shared/layout)
    ↓
AppSidebar (shared/layout)
    ↓
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
│  ├── inventory/ components          │
│  ├── orders/ components              │
│  ├── logistics/ components           │
│  ├── membership/ components          │
│  └── staff/ components               │
└─────────────────────────────────────┘
    ↓
Profile (shared/profile)
    ↓
Logout (shared/auth)
```

### Customer User Journey
```
Landing Page
    ↓
CustomerHeader (shared/layout)
    ↓
┌─────────────────────────────────────┐
│  Customer Experience                │
│  ├── customer/products              │
│  ├── customer/cart                  │
│  ├── customer/orders                │
│  └── customer/marketing             │
└─────────────────────────────────────┘
    ↓
Footer (shared/layout)
    ↓
Login/Register (shared/auth)
```

### Logistic User Journey
```
Login (shared/auth)
    ↓
LogisticsHeader (logistics/)
    ↓
┌─────────────────────────────────────┐
│  Logistics Dashboard                │
│  ├── Assigned Orders                │
│  ├── Delivery Tracking              │
│  └── Reports                        │
└─────────────────────────────────────┘
    ↓
Profile (shared/profile)
    ↓
Logout (shared/auth)
```

### Member User Journey
```
Login (shared/auth)
    ↓
MemberHeader (member/)
    ↓
┌─────────────────────────────────────┐
│  Member Dashboard                   │
│  ├── Stock Management               │
│  ├── Sales Tracking                 │
│  └── Revenue Reports                │
└─────────────────────────────────────┘
    ↓
Profile (shared/profile)
    ↓
Logout (shared/auth)
```

## Component Dependency Map

```
┌─────────────────────────────────────────────────────────────┐
│                      UI COMPONENTS (Base)                    │
│  button, card, dialog, input, select, table, etc.           │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ depends on
                            │
┌─────────────────────────────────────────────────────────────┐
│                   COMMON COMPONENTS                          │
│  pagination, heading, forms, modals, feedback               │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ depends on
                            │
┌─────────────────────────────────────────────────────────────┐
│                   SHARED COMPONENTS                          │
│  auth, profile, notifications, layout                       │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ depends on
                            │
┌─────────────────────────────────────────────────────────────┐
│              USER-SPECIFIC COMPONENTS                        │
│  admin/, customer/, logistics/, member/                     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ used by
                            │
┌─────────────────────────────────────────────────────────────┐
│                        PAGES                                 │
│  Admin/, Customer/, Logistic/, Member/, Profile/            │
└─────────────────────────────────────────────────────────────┘
```

## Import Path Hierarchy

```
Most Specific (User Type)
    ↓
@/components/customer/cart/AddToCartModal
@/components/logistics/logistics-header
@/components/member/member-header
    ↓
Shared (Multi-user)
    ↓
@/components/shared/auth/LoginModal
@/components/shared/layout/customer-header
@/components/shared/layout/admin-header
    ↓
Common (Generic)
    ↓
@/components/common/pagination
@/components/common/forms/input-error
@/components/common/modals/urgent-order-popup
    ↓
Base (Design System)
    ↓
@/components/ui/button
@/components/ui/card
@/components/ui/dialog
```

## Decision Tree: Where Does My Component Go?

```
                    ┌─────────────────────┐
                    │  New Component?     │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         ┌──────▼──────┐              ┌──────▼──────┐
         │ Base UI?    │              │ Specific    │
         │ (button,    │              │ Feature?    │
         │  input)     │              │             │
         └──────┬──────┘              └──────┬──────┘
                │                             │
                │ YES                         │ YES
                ▼                             ▼
         ┌─────────────┐           ┌─────────────────┐
         │ ui/         │           │ Used by         │
         │             │           │ multiple users? │
         └─────────────┘           └────────┬────────┘
                                            │
                              ┌─────────────┴─────────────┐
                              │ YES                       │ NO
                              ▼                           ▼
                    ┌──────────────────┐      ┌──────────────────┐
                    │ Auth/Profile/    │      │ Specific to      │
                    │ Notification/    │      │ one user type?   │
                    │ Layout?          │      │                  │
                    └────────┬─────────┘      └────────┬─────────┘
                             │                         │
                             │ YES                     │ YES
                             ▼                         ▼
                    ┌──────────────────┐      ┌──────────────────┐
                    │ shared/          │      │ customer/        │
                    │ [category]/      │      │ logistics/       │
                    │                  │      │ member/          │
                    └──────────────────┘      │ admin/           │
                                              └──────────────────┘
```

## Color-Coded Structure

```
🔴 Admin Components      → inventory/, logistics/ (admin mgmt), membership/, orders/, staff/
🔵 Customer Components   → customer/ (cart, products, orders, marketing)
🟢 Logistics Components  → logistics/ (includes logistics-header)
🟡 Member Components     → member/, membership/
🟣 Shared Components     → shared/ (auth, profile, notifications, layout)
⚪ Common Components     → common/ (modals, forms, feedback, utilities)
⚫ UI Components         → ui/ (base design system)
```

## Summary

This visual guide provides:
- 📊 Clear hierarchy of components
- 🗺️ User journey flows
- 🔗 Dependency relationships
- 🎯 Decision-making tools
- 🎨 Visual organization

Use this guide to quickly understand where components live and how they relate to each other.
