# Grouped Order Detail View - Quick Start

## What's New

✅ **Unified Group View** - Click "View Group Details" on any suspicious group to see all orders together in one page

## How to Use

### Step 1: Navigate to Suspicious Orders
```
Visit: /admin/orders/suspicious
```

### Step 2: Click "View Group Details"
```
On any suspicious group card, click the button:
[View Group Details]
```

### Step 3: Review All Orders Together
```
You'll see:
- Customer information
- Group summary (total orders, amount, time span)
- All individual orders with their items
- Links to view full details of each order
```

## Example

### Before (Old Behavior)
```
Suspicious Orders Page
    ↓
Click "Review First Order"
    ↓
See ONLY Order #21
    ↓
Must manually open Order #22, #23 separately
```

### After (New Behavior)
```
Suspicious Orders Page
    ↓
Click "View Group Details"
    ↓
See ALL orders (#21, #22, #23) together
    ↓
Customer info + Group summary + All order details
```

## What You'll See

```
┌─────────────────────────────────────────────────────┐
│ Suspicious Order Group - Test Customer             │
│ [Back to Suspicious Orders]                         │
└─────────────────────────────────────────────────────┘

⚠️ Warning: 3 orders placed within 8 minutes

┌──────────────────┬──────────────────────────────────┐
│ Customer Info    │ Individual Orders                │
│                  │                                  │
│ Test Customer    │ 1️⃣ Order #21 - ₱1,204.50        │
│ customer@...     │    Nov 22, 22:11:02              │
│ 09111222333      │    Items: Product A, Product B   │
│ 321 Customer Ave │    [View Full Order Details]     │
│                  │                                  │
│ Group Summary    │ 2️⃣ Order #22 - ₱272.80          │
│ Total: 3 orders  │    Nov 22, 22:16:02              │
│ Amount: ₱1,706   │    Items: Product C              │
│ Span: 8 minutes  │    [View Full Order Details]     │
│                  │                                  │
│                  │ 3️⃣ Order #23 - ₱228.80          │
│                  │    Nov 22, 22:19:02              │
│                  │    Items: Product D              │
│                  │    [View Full Order Details]     │
└──────────────────┴──────────────────────────────────┘
```

## Key Features

✅ **All Orders in One View** - No need to open multiple tabs
✅ **Customer Context** - Customer info always visible
✅ **Group Statistics** - See totals and time span at a glance
✅ **Individual Details** - Each order shows its items and total
✅ **Quick Navigation** - Links to full order details if needed

## URL Format

```
/admin/orders/group?orders=21,22,23

Parameters:
- orders: Comma-separated list of order IDs
```

## Navigation

```
Main Orders → Suspicious Orders → Group Details
                                      ↓
                                Individual Order Details
```

## Testing

```bash
# 1. Seed test data
php artisan db:seed --class=SuspiciousOrderSeeder

# 2. Visit suspicious orders
http://localhost:8000/admin/orders/suspicious

# 3. Click "View Group Details" on any group

# 4. You should see all orders together!
```

## Benefits

- **Faster Review**: See all related orders at once
- **Better Context**: Customer info and group stats always visible
- **Easy Comparison**: Compare orders side-by-side
- **Streamlined Workflow**: No need to open multiple tabs

---

**Status**: ✅ Ready to Use
**Route**: `/admin/orders/group`
**Button**: "View Group Details" on suspicious order groups
