# Admin Pages Translation Application Guide

This guide provides patterns and examples for applying translations to all admin pages.

## Quick Pattern

For any admin page component:

```tsx
// 1. Import the hook
import { useTranslation } from '@/hooks/use-translation';

// 2. Initialize in component
const t = useTranslation();

// 3. Replace hardcoded strings
// Before: <h1>Orders</h1>
// After:  <h1>{t('admin.orders')}</h1>

// 4. For strings with parameters
// Before: <p>Order #{order.id}</p>
// After:  <p>{t('admin.order_id', { id: order.id })}</p>
```

## Translation Keys Available

All keys are under the `admin.*` namespace. Common keys include:

### Navigation & Pages
- `admin.dashboard`
- `admin.orders`
- `admin.inventory`
- `admin.sales`
- `admin.members`
- `admin.logistics`
- `admin.staff`
- `admin.notifications`

### Status Labels
- `admin.pending`
- `admin.approved`
- `admin.rejected`
- `admin.delayed`
- `admin.delivered`
- `admin.out_for_delivery`

### Common Actions
- `admin.view`
- `admin.edit`
- `admin.delete`
- `admin.create`
- `admin.save`
- `admin.cancel`
- `admin.search`

### Dashboard Specific
- `admin.dashboard_title`
- `admin.orders_today`
- `admin.total_products`
- `admin.urgent_orders`
- `admin.low_stock`

## Steps to Apply Translations

### Step 1: Add Import
```tsx
import { useTranslation } from '@/hooks/use-translation';
```

### Step 2: Initialize Hook
```tsx
export default function MyPage() {
    const t = useTranslation();
    // ... rest of component
}
```

### Step 3: Replace Hardcoded Strings
Find all hardcoded English text and replace with translation keys:

**Title/Headers:**
```tsx
// Before
<Head title="Order Management" />
<h1>它的 Orders</h1>

// After
<Head title={t('admin.order_management')} />
<h1>{t('admin.orders')}</h1>
```

**Status Badges:**
```tsx
// Before
<Badge>Pending</Badge>

// After
<Badge>{t('admin.pending')}</Badge>
```

**Buttons:**
```tsx
// Before
<Button>View Orders</Button>

// After
<Button>{t('admin.view_orders')}</Button>
```

**Dynamic Text:**
```tsx
// Before
<p>Order #{order.id}</p>
<p>Placed on {format(date)}</p>

// After
<p>{t('admin.order_id', { id: order.id })}</p>
<p>{t('admin.placed_on', { date: format(date) })}</p>
```

## Files That Need Translation

### ✅ Completed
- `dashboard.tsx` - Fully translated
- `notifications.tsx` - Title translated
- `Orders/index.tsx` - Partially translated

### 🔄 In Progress / To Do

#### Orders
- `Orders/show.tsx` - Needs full translation
- `Orders/report.tsx` - Needs full translation

#### Inventory
- `Inventory/index.tsx` - Needs translation
- `Inventory/Product/create.tsx` - Needs translation
- `Inventory/Product/edit.tsx` - Needs translation
- `Inventory/Product/archive.tsx` - Needs translation
- `Inventory/Stock/*.tsx` - All stock files need translation

#### Other Sections
- `Staff/*.tsx` - All staff management pages
- `Membership/*.tsx` - All member pages
- `Logistics/*.tsx` - All logistics pages
- `Sales/*.tsx` - All sales pages
- `Trends/index.tsx` - Trends page
- `settings/*.tsx` - Settings pages

## Adding Missing Translation Keys

If you encounter a hardcoded string that doesn't have a translation key:

1. **Add to `resources/lang/en/admin.php`:**
```php
'report_generated' => 'Report Generated',
```

2. **Add to `resources/lang/tl/admin.php`:**
```php
'report_generated' => 'Na-generate ang Report',
```

3. **Use in component:**
```tsx
{t('admin.report_generated')}
```

## Component Translation Checklist

For each component:
- [ ] Import `useTranslation` hook
- [ ] Initialize `const t = useTranslation()`
- [ ] Replace page title (`<Head title={...} />`)
- [ ] Replace headers (`<h1>`, `<h2>`, etc.)
- [ ] Replace button labels
- [ ] Replace status labels/badges
- [ ] Replace form labels
- [ ] Replace error/success messages
- [ ] Replace tooltips and help text
- [ ] Test with both English and Tagalog

## Batch Replacement Examples

### Finding Common Patterns
```bash
# Find common hardcoded strings
grep -r "Orders" resources/js/pages/Admin --include="*.tsx"
grep -r '"Pending"' resources/js/pages/Admin --include="*.tsx"
grep -r "View" resources/js/pages/Admin --include="*.tsx"
```

### Pattern Replacements

1. **Page Titles:**
   - `title="Orders"` → `title={t('admin.orders')}`

2. **Status Labels:**
   - `'Pending'` → `t('admin.pending')`
   - `'Approved'` → `t('admin.approved')`

3. **Button Text:**
   - `"View Orders"` → `{t('admin.view_orders')}`
   - `"Manage Inventory"` → `{t('admin.manage_inventory')}`

## Testing Translations

1. Change language in Profile > Appearance
2. Navigate to translated pages
3. Verify all text updates to Tagalog
4. Check that dynamic values (numbers, dates) still display correctly

