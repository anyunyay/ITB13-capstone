# Suspicious Order Card Visual Guide

## Card States

### 1. Grouped Suspicious Orders (2+ Orders)
```
┌─────────────────────────────────────────────────────────┐
│ 🔴 RED BORDER                                           │
├─────────────────────────────────────────────────────────┤
│ 3 Orders from Same Customer                             │
│ Nov 26, 2025 14:30 - 14:35 (5 minutes)                 │
│                                                          │
│ [⚠️ Suspicious]                                         │
├─────────────────────────────────────────────────────────┤
│ ⚠️ 3 orders placed within 5 minutes (Total: ₱1,500.00) │
│                                                          │
│ 👤 Customer Information                                 │
│ Name: John Doe                                          │
│ Email: john@example.com                                 │
│                                                          │
│ 📦 Combined Order Summary                               │
│ Total Orders: 3                                         │
│ Total Amount: ₱1,500.00                                 │
│ Total Items: 15                                         │
│                                                          │
│ Individual Orders                                       │
│ Order #123 [Pending] ₱500.00                           │
│ Order #124 [Pending] ₱500.00                           │
│ Order #125 [Pending] ₱500.00                           │
│                                                          │
│ [View Group Details]                                    │
└─────────────────────────────────────────────────────────┘
```

### 2. Single Suspicious Order (Other Orders Processed)
```
┌─────────────────────────────────────────────────────────┐
│ 🟠 ORANGE BORDER                                        │
├─────────────────────────────────────────────────────────┤
│ Order #123                                              │
│ Nov 26, 2025 14:30                                      │
│                                                          │
│ [⚠️ Suspicious] [🔗 Connected to #124] [Pending]       │
├─────────────────────────────────────────────────────────┤
│ ⚠️ Part of suspicious group - other order(s) already   │
│    processed. Connected to Order #124.                  │
│                                                          │
│ 👤 Customer Information                                 │
│ Name: John Doe                                          │
│ Email: john@example.com                                 │
│                                                          │
│ 📦 Order Summary                                        │
│ Total Amount: ₱500.00                                   │
│ Items: 5                                                │
│ Processed by: Admin User                                │
│                                                          │
│ Order Items                                             │
│ Product A (kilo) - 2 kilo                              │
│ Product B (pc) - 3 pc                                  │
│                                                          │
│ [View Details]                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Single Suspicious Order (Not Part of Group)
```
┌─────────────────────────────────────────────────────────┐
│ 🟠 ORANGE BORDER                                        │
├─────────────────────────────────────────────────────────┤
│ Order #126                                              │
│ Nov 26, 2025 15:00                                      │
│                                                          │
│ [⚠️ Suspicious] [Pending]                              │
├─────────────────────────────────────────────────────────┤
│ ⚠️ Unusual order amount detected                        │
│                                                          │
│ 👤 Customer Information                                 │
│ Name: Jane Smith                                        │
│ Email: jane@example.com                                 │
│                                                          │
│ 📦 Order Summary                                        │
│ Total Amount: ₱5,000.00                                 │
│ Items: 20                                               │
│                                                          │
│ Order Items                                             │
│ Product C (kilo) - 10 kilo                             │
│ Product D (pc) - 10 pc                                 │
│                                                          │
│ [View Details]                                          │
└─────────────────────────────────────────────────────────┘
```

## Badge Legend

| Badge | Meaning | Color |
|-------|---------|-------|
| ⚠️ Suspicious | Order flagged as suspicious | Red, animated pulse |
| ⚠️ Suspicious Group | Multiple orders grouped | Red, animated pulse |
| 🔗 Connected to #X | Linked to another order | Purple |
| Pending | Order awaiting approval | Yellow |
| Approved | Order approved | Green |
| Rejected | Order rejected | Red |
| Merged | Order merged into another | Purple |

## Border Colors

| Color | Meaning |
|-------|---------|
| 🔴 Red | Multiple suspicious orders grouped together |
| 🟠 Orange | Single suspicious order (may be part of processed group) |
| 🔵 Blue | Highlighted order (when navigating from notification) |

## User Flow

### When Admin Processes Grouped Orders:

1. **Initial State**: 3 orders in group → Red border, "View Group Details"
2. **After Approving Order #124**: 
   - Order #124 → Removed from suspicious list
   - Order #123 → Orange border, "Connected to #124", "View Details"
   - Order #125 → Orange border, "Connected to #124", "View Details"
3. **After Merging Orders #123 & #125**:
   - Order #123 (primary) → Orange border, "Connected to #125", "View Details"
   - Order #125 → Status: Merged, removed from suspicious list

## Key Differences

### Grouped Card (Red Border)
- Shows combined statistics
- Lists all orders
- "View Group Details" button
- Can merge or reject all at once

### Single Card (Orange Border)
- Shows individual order details
- "View Details" button (direct to order page)
- Shows connection to other orders if applicable
- Process like a normal order

## Implementation Notes

The system automatically detects single orders by:
1. Checking if `orders.length === 1`
2. Parsing `admin_notes` for connection patterns:
   - "Merged into order #X"
   - "Merged from orders: X, Y, Z"
3. Displaying appropriate badges and warnings
4. Adjusting border color and layout
