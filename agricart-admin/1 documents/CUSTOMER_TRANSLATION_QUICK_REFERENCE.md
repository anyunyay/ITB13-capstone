# Customer Translation Quick Reference

## Quick Start

### 1. Import the Translation Hook
```typescript
import { useTranslation } from '@/hooks/use-translation';
```

### 2. Use in Your Component
```typescript
export default function MyComponent() {
  const t = useTranslation();
  
  return <h1>{t('customer.my_key')}</h1>;
}
```

## Common Translation Keys

### Navigation & Layout
```typescript
t('customer.home')              // Home
t('customer.products')          // Products / Mga Produkto
t('customer.cart')              // Cart
t('customer.orders')            // Orders / Mga Order
t('customer.profile')           // Profile
t('customer.notifications')     // Notifications / Mga Notification
```

### Actions
```typescript
t('customer.search')            // Search / Maghanap
t('customer.view_all')          // View All / Tingnan Lahat
t('customer.view_less')         // View Less / Tingnan Kaunti
t('customer.add_to_cart')       // Add to Cart / Idagdag sa Cart
t('customer.cancel')            // Cancel / Kanselahin
t('customer.confirm')           // Confirm / Kumpirmahin
t('customer.export')            // Export / I-export
```

### Product Related
```typescript
t('customer.fruits')            // Fruits / Mga Prutas
t('customer.vegetables')        // Vegetables / Mga Gulay
t('customer.fresh_produce')     // Fresh Produce / Sariwang Ani
t('customer.featured_products') // Featured Products / Mga Pangunahing Produkto
t('customer.out_of_stock')      // Out of Stock / Walang Stock
t('customer.in_stock')          // In Stock / May Stock
```

### Cart & Orders
```typescript
t('customer.cart_items')        // Cart Items / Mga Item sa Cart
t('customer.order_summary')     // Order Summary / Buod ng Order
t('customer.order_history')     // Order History / Kasaysayan ng Order
t('customer.delivery_address')  // Delivery Address / Address ng Delivery
t('customer.proceed_to_checkout') // Proceed to Checkout / Magpatuloy sa Checkout
```

### Status Labels
```typescript
t('customer.pending')           // Pending / Naghihintay
t('customer.approved')          // Approved / Naaprubahan
t('customer.rejected')          // Rejected / Tinanggihan
t('customer.delivered')         // Delivered / Naihatid
t('customer.cancelled')         // Cancelled / Kinansela
t('customer.delayed')           // Delayed / Naantala
```

### Messages
```typescript
t('customer.no_products_found')         // No products found
t('customer.your_cart_is_empty')        // Your Cart is Empty
t('customer.no_orders_found')           // No orders found
t('customer.login_required')            // Login Required
t('customer.successfully_added_to_cart') // Successfully added to cart!
```

## Adding New Translations

### Step 1: Add to English File
Edit `resources/lang/en/customer.php`:
```php
return [
    // ... existing keys
    'my_new_key' => 'My New Text',
];
```

### Step 2: Add to Tagalog File
Edit `resources/lang/tl/customer.php`:
```php
return [
    // ... existing keys
    'my_new_key' => 'Aking Bagong Teksto',
];
```

### Step 3: Use in Component
```typescript
const t = useTranslation();
return <div>{t('customer.my_new_key')}</div>;
```

## Translation with Parameters

For dynamic values:

### In Translation File
```php
'welcome_user' => 'Welcome, :name!',
'items_in_cart' => 'You have :count items in your cart',
```

### In Component
```typescript
t('customer.welcome_user', { name: 'John' })
// Output: "Welcome, John!"

t('customer.items_in_cart', { count: 5 })
// Output: "You have 5 items in your cart"
```

## Best Practices

### ✅ DO
- Use descriptive key names: `order_successfully_placed` not `msg1`
- Group related keys together in the file
- Keep translations concise and clear
- Test both languages after adding new keys
- Use the same key structure across all language files

### ❌ DON'T
- Hardcode text directly in components
- Use abbreviations in key names
- Mix English and Tagalog in the same key
- Forget to add translations to both language files
- Use special characters in key names (use underscores)

## Testing Translations

### 1. Switch Language
Go to Profile > Appearance and toggle between English and Tagalog

### 2. Verify All Text Updates
Check that:
- All labels change
- All buttons change
- All messages change
- All placeholders change
- Layout remains intact

### 3. Check for Missing Translations
If you see a key name instead of text (e.g., "customer.my_key"), the translation is missing.

## Troubleshooting

### Translation Not Showing
1. Check if key exists in both `en/customer.php` and `tl/customer.php`
2. Verify you're using `t('customer.key_name')` not `t('key_name')`
3. Clear browser cache and reload
4. Check browser console for errors

### Wrong Language Showing
1. Check user's language setting in Profile > Appearance
2. Verify `users.language` column in database
3. Check localStorage for `language` key
4. Ensure `useTranslation()` hook is imported correctly

### Text Not Updating After Language Switch
1. Ensure component is using the `useTranslation()` hook
2. Check that the component re-renders when language changes
3. Verify Inertia is reloading with new translations

## File Locations

```
resources/
├── lang/
│   ├── en/
│   │   └── customer.php          # English translations
│   └── tl/
│       └── customer.php          # Tagalog translations
└── js/
    ├── hooks/
    │   ├── use-translation.tsx   # Translation hook
    │   └── use-language.tsx      # Language management
    └── pages/
        └── Customer/             # Customer pages
```

## Language Codes

- `en` - English
- `tl` - Tagalog (Filipino)

## Support

For help with translations:
1. Check `CUSTOMER_TRANSLATION_IMPLEMENTATION.md` for detailed documentation
2. Review existing translation keys in `resources/lang/en/customer.php`
3. Test with both languages before committing changes
4. Ensure all customer-facing text is translated
