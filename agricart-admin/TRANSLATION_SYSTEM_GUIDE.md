# Translation System Guide

This guide explains how to use the translation system across the application.

## Overview

The translation system automatically loads all Laravel translation files and makes them available to React components via Inertia.js. Translations are organized by domain (admin, customer, logistic, member, staff) with shared translations in `ui.php` and `validation.php`.

## Backend (Laravel)

### Translation File Structure

All translation files are located in `resources/lang/{locale}/`:

```
resources/lang/
├── en/
│   ├── ui.php          # Shared UI translations (Save, Edit, Cancel, etc.)
│   ├── validation.php  # Validation messages
│   ├── appearance.php  # Appearance settings translations
│   ├── admin.php       # Admin-specific translations
│   ├── staff.php       # Staff-specific translations
│   ├── customer.php    # Customer-specific translations
│   ├── logistic.php    # Logistic-specific translations
│   └── member.php      # Member-specific translations
└── tl/
    ├── ui.php
    ├── validation.php
    ├── appearance.php
    ├── admin.php
    ├── staff.php
    ├── customer.php
    ├── logistic.php
    └── member.php
```

### Adding New Translations

1. **For shared UI elements**, add to `resources/lang/{locale}/ui.php`:
```php
return [
    'save' => 'Save',
    'edit' => 'Edit',
    // ... etc
];
```

2. **For user-type specific translations**, add to the appropriate file:
```php
// resources/lang/en/customer.php
return [
    'orders' => 'Orders',
    'cart' => 'Cart',
    // ... etc
];
```

3. **For feature-specific translations**, create a new file:
```php
// resources/lang/en/products.php
return [
    'title' => 'Products',
    'price' => 'Price',
    // ... etc
];
```

## Frontend (React)

### Using Translations in React Components

#### Basic Usage

```tsx
import { useTranslation } from '@/hooks/use-translation';

export default function MyComponent() {
    const t = useTranslation();
    
    return (
        <div>
            <h1>{t('customer.orders')}</h1>
            <button>{t('ui.save')}</button>
        </div>
    );
}
```

#### Translation Key Format

Translation keys use dot notation to access nested values:

- `'ui.save'` → Accesses `resources/lang/{locale}/ui.php['save']`
- `'customer.orders'` → Accesses `resources/lang/{locale}/customer.php['orders']`
- `'appearance.theme.title'` → Accesses `resources/lang/{locale}/appearance.php['theme']['title']`

#### Parameters in Translations

For translations with dynamic values:

**Laravel file:**
```php
'welcome' => 'Welcome, :name!',
```

**React component:**
```tsx
const t = useTranslation();
return <div>{t('welcome', { name: user.name })}</div>;
```

#### Namespace-Specific Hook

For components that primarily use one namespace:

```tsx
import { useTranslationByNamespace } from '@/hooks/use-translation';

export default function CustomerOrders() {
    const t = useTranslationByNamespace('customer');
    
    return (
        <div>
            <h1>{t('orders')}</h1>
            <p>{t('view_all')}</p>
        </div>
    );
}
```

## Translation Key Reference

### Shared Keys (`ui.php`)

| Key | English | Tagalog |
|-----|---------|---------|
| `ui.save` | Save | I-save |
| `ui.edit` | Edit | I-edit |
| `ui.cancel` | Cancel | I-cancel |
| `ui.delete` | Delete | Tanggalin |
| `ui.create` | Create | Gumawa |
| `ui.update` | Update | I-update |
| `ui.submit` | Submit | Ipasa |
| `ui.back` | Back | Bumalik |
| `ui.search` | Search | Maghanap |
| `ui.loading` | Loading... | Naglo-load... |

### Customer IK

| Key | English | Tagalog |
|-----|---------|---------|
| `customer.dashboard` | Dashboard | Dashboard |
| `customer.products` | Products | Mga Produkto |
| `customer.cart` | Cart | Cart |
| `customer.orders` | Orders | Mga Order |

### Appearance Settings

| Key | English | Tagalog |
|-----|---------|---------|
| `appearance.title` | Appearance Settings | Mga Setting sa Hitsura |
| `appearance.theme.title` | Theme Preferences | Mga Kagustuhan sa Tema |
| `appearance.theme.light` | Light | Maliwanag |
| `appearance.theme.dark` | Dark | Madilim |
| `appearance.language.title` | Language Preferences | Mga Kagustuhan sa Wika |
| `appearance.language.english` | English | English |
| `appearance.language.tagalog` | Tagalog | Tagalog |

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Use domain-based keys** (`customer.orders`) rather than page-based keys
3. **Keep translations organized** by feature or user type
4. **Test with both languages** to ensure all keys are translated
5. **Use descriptive keys** that indicate context (e.g., `customer.orders.view_all` not just `view_all`)

## Example: Converting Hardcoded Text

**Before:**
```tsx
<h1>Orders</h1>
<button>Save</button>
```

**After:**
```tsx
import { useTranslation } from '@/hooks/use-translation';

const t = useTranslation();

<h1>{t('customer.orders')}</h1>
<button>{t('ui.save')}</button>
```

## Troubleshooting

### Translation not found

If a translation key returns the key itself (e.g., `"customer.orders"` instead of `"Orders"`):

1. Check that the translation file exists in both `en/` and `tl/` directories
2. Verify the key path matches the array structure
3. Clear Laravel cache: `php artisan cache:clear`
4. Check browser console for errors

### Translations not updating

After adding new translations:

1. Clear Laravel cache: `php artisan cache:clear`
2. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify the locale is being set correctly in `HandleLocale` middleware

## System Architecture

1. **HandleLocale Middleware**: Sets `app()->setLocale()` based on user preference
2. **TranslationService**: Loads all translation files and prepares them for Inertia
3. **HandleInertiaRequests**: Shares translations via `translations` prop
4. **useTranslation Hook**: React hook to access translations in components

## Migration from Hardcoded Text

To migrate existing components:

1. Identify all hardcoded strings
2. Create or add to appropriate translation files
3. Import `useTranslation` hook
4. Replace strings with `t('key.path')` calls
5. Test with both languages

