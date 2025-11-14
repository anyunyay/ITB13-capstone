# Quick Migration Guide - BaseTable

## ✅ Migration Complete

**3 pages migrated successfully:**
1. Inventory/Stock/removedStock.tsx
2. Inventory/Stock/soldStock.tsx  
3. Membership/deactivated.tsx

## Quick Reference

### Import
```tsx
import { BaseTable, BaseTableColumn } from '@/components/common/base-table';
import { Hash, User, Settings } from 'lucide-react';
```

### Define Columns
```tsx
const columns: BaseTableColumn<YourType>[] = [
    {
        key: 'id',
        label: t('admin.id'),
        icon: Hash,
        align: 'center',
        maxWidth: '120px',
        render: (item) => item.id,
    },
];
```

### Use Component
```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id.toString()}
    emptyState={<EmptyState />}
/>
```

## Key Features

- ✅ Consistent styling
- ✅ Icon support
- ✅ Alignment options (left, center, right)
- ✅ Max-width control
- ✅ Custom render functions
- ✅ Empty state handling
- ✅ TypeScript support
- ✅ Responsive design ready

## Testing

All migrated pages:
- ✅ Compile without errors
- ✅ Maintain original functionality
- ✅ Have proper TypeScript typing
- ✅ Use consistent styling

## Documentation

See `BASETABLE_MIGRATION_COMPLETE.md` for full details.
