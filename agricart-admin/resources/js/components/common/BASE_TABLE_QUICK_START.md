# Base Table Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Define Your Columns

```tsx
import { BaseTableColumn } from '@/components/common/base-table';
import { Package, User } from 'lucide-react';

const columns: BaseTableColumn<YourDataType>[] = [
    {
        key: 'id',
        label: 'ID',
        icon: Package,
        sortable: true,
        align: 'center',
        render: (item) => <span>#{item.id}</span>,
    },
    {
        key: 'name',
        label: 'Name',
        icon: User,
        sortable: true,
        align: 'left',
        render: (item) => <div className="font-medium">{item.name}</div>,
    },
];
```

### Step 2: Use the BaseTable

```tsx
import { BaseTable } from '@/components/common/base-table';

<BaseTable
    data={yourData}
    columns={columns}
    keyExtractor={(item) => item.id}
/>
```

### Step 3: Add Mobile Support (Optional)

```tsx
<BaseTable
    data={yourData}
    columns={columns}
    keyExtractor={(item) => item.id}
    renderMobileCard={(item) => (
        <div className="bg-card border rounded-lg p-4">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">#{item.id}</div>
        </div>
    )}
/>
```

## 📋 Common Patterns

### Pattern 1: Status Badge Column

```tsx
{
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (item) => {
        const variant = item.status === 'active' ? 'default' : 'secondary';
        return <Badge variant={variant}>{item.status}</Badge>;
    },
}
```

### Pattern 2: Currency Column

```tsx
{
    key: 'amount',
    label: 'Amount',
    icon: DollarSign,
    sortable: true,
    align: 'right',
    render: (item) => (
        <div className="font-semibold">₱{item.amount.toFixed(2)}</div>
    ),
}
```

### Pattern 3: Date Column

```tsx
{
    key: 'created_at',
    label: 'Date',
    icon: Calendar,
    sortable: true,
    align: 'left',
    render: (item) => (
        <div className="text-sm">
            <div className="font-medium">
                {format(new Date(item.created_at), 'MMM dd, yyyy')}
            </div>
            <div className="text-muted-foreground">
                {format(new Date(item.created_at), 'HH:mm')}
            </div>
        </div>
    ),
}
```

### Pattern 4: Actions Column

```tsx
{
    key: 'actions',
    label: 'Actions',
    align: 'center',
    render: (item) => (
        <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View
        </Button>
    ),
}
```

### Pattern 5: Multi-line Cell

```tsx
{
    key: 'customer',
    label: 'Customer',
    align: 'left',
    render: (item) => (
        <div>
            <div className="font-medium">{item.customer.name}</div>
            <div className="text-xs text-muted-foreground">
                {item.customer.email}
            </div>
        </div>
    ),
}
```

## 🎨 Styling Patterns

### Highlight Urgent Rows

```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    getRowClassName={(item) => 
        item.is_urgent ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
    }
/>
```

### Highlight Selected Row

```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    getRowClassName={(item) => 
        item.id === selectedId ? 'bg-primary/10 border-l-4 border-l-primary' : ''
    }
/>
```

### Low Stock Warning

```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    getRowClassName={(item) => 
        item.stock <= item.min_stock ? 'bg-red-50 border-l-4 border-l-red-500' : ''
    }
/>
```

## 🔄 Sorting

### Controlled Sorting

```tsx
const [sortBy, setSortBy] = useState('id');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

const handleSort = (field: string) => {
    if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
        setSortBy(field);
        setSortOrder('desc');
    }
};

<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    sortBy={sortBy}
    sortOrder={sortOrder}
    onSort={handleSort}
/>
```

## 📱 Mobile Responsive

### Simple Mobile Card

```tsx
renderMobileCard={(item) => (
    <div className="bg-card border rounded-lg p-4">
        <div className="flex justify-between mb-2">
            <Badge variant="outline">#{item.id}</Badge>
            <Badge>{item.status}</Badge>
        </div>
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-muted-foreground mt-1">
            {item.description}
        </div>
    </div>
)}
```

### Detailed Mobile Card

```tsx
renderMobileCard={(item) => (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <Badge variant="outline">#{item.id}</Badge>
                {item.is_urgent && (
                    <Badge variant="destructive" className="animate-pulse">
                        Urgent
                    </Badge>
                )}
            </div>
            <Badge>{item.status}</Badge>
        </div>
        
        <div className="space-y-2 mb-3 pb-3 border-b">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">
                {format(new Date(item.date), 'MMM dd, yyyy HH:mm')}
            </div>
        </div>
        
        <div className="flex justify-between items-center mb-3">
            <span className="text-sm">Total:</span>
            <span className="font-semibold">₱{item.total.toFixed(2)}</span>
        </div>
        
        <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-3 w-3 mr-1" />
            View Details
        </Button>
    </div>
)}
```

## 🎯 Column Visibility

### Hide on Mobile

```tsx
const columns: BaseTableColumn[] = [
    {
        key: 'id',
        label: 'ID',
        render: (item) => <span>#{item.id}</span>,
    },
    {
        key: 'name',
        label: 'Name',
        render: (item) => <div>{item.name}</div>,
    },
    {
        key: 'email',
        label: 'Email',
        hideOnMobile: true, // 👈 Hidden on mobile
        render: (item) => <div>{item.email}</div>,
    },
    {
        key: 'phone',
        label: 'Phone',
        hideOnMobile: true, // 👈 Hidden on mobile
        render: (item) => <div>{item.phone}</div>,
    },
];
```

## 🎭 Empty States

### Simple Empty State

```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    emptyState={
        <div className="text-center py-12">
            <p className="text-muted-foreground">No data available</p>
        </div>
    }
/>
```

### Rich Empty State

```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    emptyState={
        <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-4">
                Create your first order to get started
            </p>
            <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
            </Button>
        </div>
    }
/>
```

## 🖱️ Interactive Features

### Clickable Rows

```tsx
<BaseTable
    data={items}
    columns={columns}
    keyExtractor={(item) => item.id}
    onRowClick={(item) => {
        router.visit(route('admin.items.show', item.id));
    }}
/>
```

### Row with Hover Effect

Rows automatically get `hover:bg-muted/20` and `cursor-pointer` when `onRowClick` is provided.

## 💡 Pro Tips

1. **Keep render functions simple** - Extract complex logic
2. **Use consistent icons** - Match the design system
3. **Provide mobile cards** - Better UX on small screens
4. **Add empty states** - Guide users when no data
5. **Use TypeScript** - Get full type safety
6. **Test responsiveness** - Check mobile and desktop views
7. **Consider performance** - Memoize expensive renders

## 📚 Full Documentation

See `BASE_TABLE_README.md` for complete documentation and advanced examples.

## 🔗 Related Files

- `resources/js/components/common/base-table.tsx` - Component source
- `resources/js/components/common/base-table-example.tsx` - Usage examples
- `resources/js/components/common/BASE_TABLE_README.md` - Full documentation
