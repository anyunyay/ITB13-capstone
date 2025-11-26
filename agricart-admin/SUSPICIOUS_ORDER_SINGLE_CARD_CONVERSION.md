# Suspicious Order Single Card Conversion

## Overview
Implemented automatic conversion of grouped suspicious orders into normal order cards when only one order remains in the group (because other orders were already approved/rejected/merged).

## Changes Made

### 1. GroupedOrderCard Component (`resources/js/components/orders/grouped-order-card.tsx`)

#### New Features:
- **Automatic Detection**: Detects when a suspicious order group contains only one order
- **Connected Order Badge**: Shows a purple badge indicating which order it's connected to
- **Visual Distinction**: Uses orange border instead of red for single orders
- **Normal Card Layout**: Displays as a regular order card with suspicious badge

#### Logic:
```typescript
// Detects single order in group
const isSingleOrder = orders.length === 1;

// Extracts connected order ID from admin_notes
const getConnectedOrderId = (order: Order): number | null => {
    // Checks for "Merged into order #X" pattern
    // Checks for "Merged from orders: X, Y, Z" pattern
    // Returns the connected order ID
};
```

#### Visual Changes:
- **Border Color**: Orange (`border-orange-500`) for single orders vs red for groups
- **Warning Box**: Orange background for single orders vs red for groups
- **Badge**: Shows "🔗 Connected to #X" badge when connected order is detected
- **Action Button**: Shows "View Details" instead of "View Group Details"

### 2. OrderCard Component (`resources/js/components/orders/order-card.tsx`)

#### New Features:
- **Connected Order Badge**: Also shows the connection badge on regular order cards if they're suspicious and part of a group
- **Consistent Experience**: Maintains visual consistency across all order card types

## How It Works

### Scenario 1: Group with Multiple Orders
- Displays as a grouped card with red border
- Shows "Suspicious Group" badge
- Lists all orders in the group
- "View Group Details" button

### Scenario 2: Single Order (Other Orders Processed)
- Displays as a normal order card with orange border
- Shows "Suspicious" badge
- Shows "🔗 Connected to #X" badge (if connection detected)
- Shows warning: "Part of suspicious group - other order(s) already processed"
- "View Details" button (goes directly to order detail page)

### Scenario 3: Single Suspicious Order (Not Part of Group)
- Displays as a normal order card with orange border
- Shows "Suspicious" badge
- Shows the suspicious reason
- "View Details" button

## Connection Detection

The system detects connected orders by parsing the `admin_notes` field:

1. **Merged Into Pattern**: `"Merged into order #123"`
   - Indicates this order was merged into order #123

2. **Merged From Pattern**: `"Merged from orders: 123, 456, 789"`
   - Indicates this order has other orders merged into it
   - Shows the first connected order ID

## Benefits

1. **Better UX**: Single orders are easier to process as normal cards
2. **Clear Context**: Connection badge shows relationship to other orders
3. **Visual Hierarchy**: Orange vs red helps distinguish single vs group
4. **Consistent Actions**: Appropriate buttons for each scenario
5. **Audit Trail**: Connection information preserved and displayed

## Testing Recommendations

1. Create a suspicious order group with 2+ orders
2. Approve/reject one order
3. Verify the remaining order displays as a single card with:
   - Orange border
   - "Suspicious" badge
   - "Connected to #X" badge
   - Appropriate warning message
   - "View Details" button

4. Merge orders in a group
5. Verify the merged order shows connection to merged orders
6. Verify merged orders show connection to primary order
