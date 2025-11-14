# Base Table Component

A reusable, flexible table component that provides consistent design, structure, and behavior across the application. Built on top of shadcn/ui Table components with enhanced features for sorting, responsive design, and customization.

## Features

- ✅ **Consistent Design**: Unified styling matching the orders table design
- ✅ **Responsive**: Automatic mobile card view with custom rendering
- ✅ **Sortable Columns**: Built-in sorting with visual indicators
- ✅ **Flexible Rendering**: Custom cell and mobile card renderers
- ✅ **Row Highlighting**: Conditional row styling support
- ✅ **Empty States**: Customizable empty state messages
- ✅ **TypeScript**: Full type safety with generics
- ✅ **Accessible**: Built on shadcn/ui accessible components

## Basic Usage

```tsx
import { BaseTable, BaseTableColumn } from '@/components/common/base-table';

interface Order {
    id: number;
    customer: string;
    total: number;
    status: string;
}

function OrdersTable({ orders }: { orders: Order[] }) {
    const columns: BaseTableColumn<Order>[] = [
        {
            key: 'id',
            label: 'Order ID',
            sortable: true,
            align: 'center',
            render: (order) => <span>#{order.id}</span>,
        },
        {
            key: 'customer',
            label: 'Customer',
            sortable: true,
            align: 'left',
            render: (order) => <div>{order.customer}</div>,
        },
        {
            key: 'total',
            label: 'Total',
            sortable: true,
            align: 'right',
            render: (order) => <span>₱{order.total.toFixed(2)}</span>,
        },
    ];

    return (
        <BaseTable
            data={orders}
            columns={columns}
            keyExtractor={(order) => order.id}
        />
    );
}
```

## Column Configuration

### BaseTableColumn Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | ✅ | Unique identifier for the column |
| `label` | `string` | ✅ | Column header text |
| `icon` | `LucideIcon` | ❌ | Icon to display in header |
| `sortable` | `boolean` | ❌ | Enable sorting for this column |
| `align` | `'left' \| 'center' \| 'right'` | ❌ | Text alignment (default: 'center') |
| `maxWidth` | `string` | ❌ | Maximum width (e.g., '200px') |
| `hideOnMobile` | `boolean` | ❌ | Hide column on mobile devices |
| `className` | `string` | ❌ | Additional CSS classes |
| `headerClassName` | `string` | ❌ | Header-specific CSS classes |
| `cellClassName` | `string` | ❌ | Cell-specific CSS classes |
| `render` | `(item: T, index: number) => ReactNode` | ❌ | Custom cell renderer |

## Table Props

### BaseTableProps

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `data` | `T[]` | ✅ | Array of data items to display |
| `columns` | `BaseTableColumn<T>[]` | ✅ | Column definitions |
| `keyExtractor` | `(item: T) => string \| number` | ✅ | Function to extract unique key from item |
| `sortBy` | `string` | ❌ | Current sort field |
| `sortOrder` | `'asc' \| 'desc'` | ❌ | Current sort order |
| `onSort` | `(field: string) => void` | ❌ | Sort change handler |
| `getRowClassName` | `(item: T, index: number) => string` | ❌ | Dynamic row styling |
| `onRowClick` | `(item: T, index: number) => void` | ❌ | Row click handler |
| `emptyState` | `ReactNode` | ❌ | Custom empty state component |
| `renderMobileCard` | `(item: T, index: number) => ReactNode` | ❌ | Custom mobile card renderer |
| `className` | `string` | ❌ | Table CSS classes |
| `headerClassName` | `string` | ❌ | Header CSS classes |
| `bodyClassName` | `string` | ❌ | Body CSS classes |
| `hideMobileCards` | `boolean` | ❌ | Disable mobile card view |

## Advanced Examples

### 1. Sortable Table with Icons

```tsx
import { Package, User, Calendar } from 'lucide-react';

const columns: BaseTableColumn<Order>[] = [
    {
        key: 'id',
        label: 'Order ID',
        icon: Package,
        sortable: true,
        align: 'center',
        render: (order) => (
            <Badge variant="outline">#{order.id}</Badge>
        ),
    },
    {
        key: 'customer',
        label: 'Customer',
        icon: User,
        sortable: true,
        align: 'left',
        render: (order) => (
            <div className="font-medium">{order.customer}</div>
        ),
    },
    {
        key: 'date',
        label: 'Date',
        icon: Calendar,
        sortable: true,
        align: 'left',
        render: (order) => (
            <div>{format(new Date(order.date), 'MMM dd, yyyy')}</div>
        ),
    },
];
```

### 2. Conditional Row Highlighting

```tsx
<BaseTable
    data={orders}
    columns={columns}
    keyExtractor={(order) => order.id}
    getRowClassName={(order) => {
        if (order.is_urgent) {
            return 'bg-orange-50 border-l-4 border-l-orange-500';
        }
        if (order.is_highlighted) {
            return 'bg-primary/10 border-l-4 border-l-primary';
        }
        return '';
    }}
/>
```

### 3. Custom Mobile Cards

```tsx
<BaseTable
    data={orders}
    columns={columns}
    keyExtractor={(order) => order.id}
    renderMobileCard={(order) => (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <Badge variant="outline">#{order.id}</Badge>
                <Badge>{order.status}</Badge>
            </div>
            <div className="space-y-2">
                <div className="font-medium">{order.customer}</div>
                <div className="text-sm text-muted-foreground">
                    {format(new Date(order.date), 'MMM dd, yyyy')}
                </div>
                <div className="font-semibold">
                    ₱{order.total.toFixed(2)}
                </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
                View Details
            </Button>
        </div>
    )}
/>
```

### 4. Custom Empty State

```tsx
<BaseTable
    data={orders}
    columns={columns}
    keyExtractor={(order) => order.id}
    emptyState={
        <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground">
                Create your first order to get started
            </p>
            <Button className="mt-4">Create Order</Button>
        </div>
    }
/>
```

### 5. Hide Columns on Mobile

```tsx
const columns: BaseTableColumn<Order>[] = [
    {
        key: 'id',
        label: 'ID',
        render: (order) => <span>#{order.id}</span>,
    },
    {
        key: 'customer',
        label: 'Customer',
        render: (order) => <div>{order.customer}</div>,
    },
    {
        key: 'email',
        label: 'Email',
        hideOnMobile: true, // Hidden on mobile
        render: (order) => <div>{order.email}</div>,
    },
    {
        key: 'phone',
        label: 'Phone',
        hideOnMobile: true, // Hidden on mobile
        render: (order) => <div>{order.phone}</div>,
    },
];
```

### 6. Clickable Rows

```tsx
<BaseTable
    data={orders}
    columns={columns}
    keyExtractor={(order) => order.id}
    onRowClick={(order) => {
        router.visit(route('admin.orders.show', order.id));
    }}
/>
```

## Design System

The BaseTable follows the established design patterns from the orders table:

### Header Styling
- Background: `bg-muted/50`
- Border: `border-b-2`
- Text: `text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Padding: `p-3`

### Cell Styling
- Padding: `p-3`
- Alignment: `align-top`
- Border: `border-b`
- Min height: `min-h-[40px]`
- Vertical padding: `py-2`

### Row Styling
- Border: `border-b`
- Hover: `hover:bg-muted/20`
- Transition: `transition-all`

### Mobile Cards
- Background: `bg-card`
- Border: `border border-border`
- Rounded: `rounded-lg`
- Padding: `p-4`
- Shadow: `shadow-sm`
- Spacing: `space-y-3`

## Migration Guide

### From OrderTable to BaseTable

**Before:**
```tsx
<OrderTable
    orders={orders}
    highlightOrderId={highlightId}
    urgentOrders={urgentOrders}
    showActions={true}
/>
```

**After:**
```tsx
<BaseTable
    data={orders}
    columns={orderColumns}
    keyExtractor={(order) => order.id}
    getRowClassName={(order) => {
        if (urgentOrders.includes(order.id)) {
            return 'bg-orange-50 border-l-4 border-l-orange-500';
        }
        if (order.id === highlightId) {
            return 'bg-primary/10 border-l-4 border-l-primary';
        }
        return '';
    }}
/>
```

## Best Practices

1. **Always provide a keyExtractor**: Ensures proper React reconciliation
2. **Use TypeScript generics**: Get full type safety for your data
3. **Provide mobile cards**: Better UX on small screens
4. **Keep render functions simple**: Extract complex logic to separate functions
5. **Use consistent alignment**: Follow the design system guidelines
6. **Add empty states**: Improve UX when no data is available
7. **Consider performance**: Use React.memo for expensive render functions

## Related Components

- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`

## Support

For questions or issues, refer to:
- `base-table-example.tsx` for usage examples
- Orders table implementation for reference design
- shadcn/ui documentation for underlying components
