# Pending Orders System - Flow Diagram

## Stock Lifecycle with Pending Orders

```
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK LIFECYCLE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Initial State:
┌──────────────────────────────────────┐
│ Stock Record                         │
│ ─────────────────────────────────── │
│ quantity: 100                        │
│ pending_order_qty: 0                 │
│ sold_quantity: 0                     │
│ ─────────────────────────────────── │
│ Available Stock: 100                 │
└──────────────────────────────────────┘


CUSTOMER CHECKOUT (Order #1: 20 units)
│
│ Action: incrementPendingOrders(20)
│
▼
┌──────────────────────────────────────┐
│ Stock Record                         │
│ ─────────────────────────────────── │
│ quantity: 100         (unchanged)    │
│ pending_order_qty: 20 (increased)    │
│ sold_quantity: 0      (unchanged)    │
│ ─────────────────────────────────── │
│ Available Stock: 80   (100 - 20)     │
└──────────────────────────────────────┘
                │
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
   APPROVED          REJECTED


ADMIN APPROVES ORDER
│
│ Action: processPendingOrderApproval(20)
│
▼
┌──────────────────────────────────────┐
│ Stock Record                         │
│ ─────────────────────────────────── │
│ quantity: 80          (decreased)    │
│ pending_order_qty: 0  (decreased)    │
│ sold_quantity: 20     (increased)    │
│ ─────────────────────────────────── │
│ Available Stock: 80   (unchanged)    │
└──────────────────────────────────────┘


ADMIN REJECTS ORDER
│
│ Action: processPendingOrderRejection(20)
│
▼
┌──────────────────────────────────────┐
│ Stock Record                         │
│ ─────────────────────────────────── │
│ quantity: 100         (unchanged)    │
│ pending_order_qty: 0  (decreased)    │
│ sold_quantity: 0      (unchanged)    │
│ ─────────────────────────────────── │
│ Available Stock: 100  (released)     │
└──────────────────────────────────────┘
```

## Multiple Pending Orders Scenario

```
Initial State:
┌──────────────────────────────────────┐
│ quantity: 100                        │
│ pending_order_qty: 0                 │
│ Available: 100                       │
└──────────────────────────────────────┘

Customer A checks out (30 units)
│
▼
┌──────────────────────────────────────┐
│ quantity: 100                        │
│ pending_order_qty: 30                │
│ Available: 70                        │
└──────────────────────────────────────┘

Customer B checks out (25 units)
│
▼
┌──────────────────────────────────────┐
│ quantity: 100                        │
│ pending_order_qty: 55                │
│ Available: 45                        │
└──────────────────────────────────────┘

Customer C tries to order 50 units
│
▼
❌ REJECTED - Only 45 available

Admin approves Customer A's order
│
▼
┌──────────────────────────────────────┐
│ quantity: 70                         │
│ pending_order_qty: 25                │
│ sold_quantity: 30                    │
│ Available: 45                        │
└──────────────────────────────────────┘

Admin rejects Customer B's order
│
▼
┌──────────────────────────────────────┐
│ quantity: 70                         │
│ pending_order_qty: 0                 │
│ sold_quantity: 30                    │
│ Available: 70                        │
└──────────────────────────────────────┘
```

## Admin Adds Stock During Pending Orders

```
Current State:
┌──────────────────────────────────────┐
│ quantity: 50                         │
│ pending_order_qty: 30                │
│ Available: 20                        │
└──────────────────────────────────────┘

Admin adds 50 units of new stock
│
▼
┌──────────────────────────────────────┐
│ quantity: 100        (increased)     │
│ pending_order_qty: 30 (unchanged)    │
│ Available: 70        (increased!)    │
└──────────────────────────────────────┘

✅ New stock immediately available
✅ Pending orders still reserved
✅ Customers can order from new stock
```

## Complete Order Flow

```
┌─────────────┐
│  CUSTOMER   │
└──────┬──────┘
       │
       │ 1. Browse Products
       ▼
┌─────────────────────────────────────┐
│ Display Available Stock             │
│ = quantity - pending_order_qty      │
└──────┬──────────────────────────────┘
       │
       │ 2. Add to Cart
       ▼
┌─────────────────────────────────────┐
│ Validate Against Available Stock    │
└──────┬──────────────────────────────┘
       │
       │ 3. Checkout
       ▼
┌─────────────────────────────────────┐
│ Check: available >= order_qty?      │
└──────┬──────────────────────────────┘
       │
       │ Yes
       ▼
┌─────────────────────────────────────┐
│ incrementPendingOrders(order_qty)   │
│ Create SalesAudit (status=pending)  │
└──────┬──────────────────────────────┘
       │
       │ 4. Notify Admin
       ▼
┌─────────────┐
│    ADMIN    │
└──────┬──────┘
       │
       │ 5. Review Order
       ▼
┌─────────────────────────────────────┐
│ View Order Details                  │
│ Check Stock Availability            │
└──────┬──────────────────────────────┘
       │
       │
   ┌───┴────┐
   │        │
   ▼        ▼
APPROVE  REJECT
   │        │
   │        │ processPendingOrderRejection()
   │        │ - pending_order_qty -= qty
   │        │ - Stock released
   │        │
   │        ▼
   │   ┌─────────────┐
   │   │  REJECTED   │
   │   └─────────────┘
   │
   │ processPendingOrderApproval()
   │ - quantity -= qty
   │ - sold_quantity += qty
   │ - pending_order_qty -= qty
   │
   ▼
┌─────────────┐
│  APPROVED   │
└─────────────┘
```

## Stock Calculation Examples

### Example 1: Simple Order

```
Before Checkout:
┌────────────────────────────────┐
│ Physical Stock:     100 kg     │
│ Pending Orders:       0 kg     │
│ ─────────────────────────────  │
│ Available Stock:    100 kg     │
└────────────────────────────────┘

Customer orders 25 kg
↓
After Checkout:
┌────────────────────────────────┐
│ Physical Stock:     100 kg     │ ← Unchanged
│ Pending Orders:      25 kg     │ ← Increased
│ ─────────────────────────────  │
│ Available Stock:     75 kg     │ ← Decreased
└────────────────────────────────┘

Admin approves
↓
After Approval:
┌────────────────────────────────┐
│ Physical Stock:      75 kg     │ ← Decreased
│ Pending Orders:       0 kg     │ ← Decreased
│ Sold Quantity:       25 kg     │ ← Increased
│ ─────────────────────────────  │
│ Available Stock:     75 kg     │ ← Same as before
└────────────────────────────────┘
```

### Example 2: Multiple Orders

```
Initial:
┌────────────────────────────────┐
│ Physical:    200 kg            │
│ Pending:       0 kg            │
│ Available:   200 kg            │
└────────────────────────────────┘

Order A: 50 kg
┌────────────────────────────────┐
│ Physical:    200 kg            │
│ Pending:      50 kg            │
│ Available:   150 kg            │
└────────────────────────────────┘

Order B: 75 kg
┌────────────────────────────────┐
│ Physical:    200 kg            │
│ Pending:     125 kg            │
│ Available:    75 kg            │
└────────────────────────────────┘

Approve Order A:
┌────────────────────────────────┐
│ Physical:    150 kg            │
│ Pending:      75 kg            │
│ Sold:         50 kg            │
│ Available:    75 kg            │
└────────────────────────────────┘

Reject Order B:
┌────────────────────────────────┐
│ Physical:    150 kg            │
│ Pending:       0 kg            │
│ Sold:         50 kg            │
│ Available:   150 kg            │
└────────────────────────────────┘
```

### Example 3: Stock Addition During Pending Orders

```
Current State:
┌────────────────────────────────┐
│ Physical:     30 kg            │
│ Pending:      25 kg            │
│ Available:     5 kg            │
└────────────────────────────────┘

Admin adds 70 kg:
┌────────────────────────────────┐
│ Physical:    100 kg            │ ← Increased
│ Pending:      25 kg            │ ← Unchanged
│ Available:    75 kg            │ ← Increased!
└────────────────────────────────┘

✅ Customers can now order up to 75 kg
✅ Pending order still reserved
✅ Real-time availability updated
```

## Database State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE RECORD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  State 1: INITIAL                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ id: 1                                                 │ │
│  │ product_id: 5                                         │ │
│  │ quantity: 100.00                                      │ │
│  │ pending_order_qty: 0.00                               │ │
│  │ sold_quantity: 0.00                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ↓ Customer Checkout (20 units)                             │
│                                                             │
│  State 2: PENDING ORDER                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ id: 1                                                 │ │
│  │ product_id: 5                                         │ │
│  │ quantity: 100.00          ← No change                 │ │
│  │ pending_order_qty: 20.00  ← Incremented               │ │
│  │ sold_quantity: 0.00       ← No change                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ↓ Admin Approves                                           │
│                                                             │
│  State 3: APPROVED                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ id: 1                                                 │ │
│  │ product_id: 5                                         │ │
│  │ quantity: 80.00           ← Decreased                 │ │
│  │ pending_order_qty: 0.00   ← Decreased                 │ │
│  │ sold_quantity: 20.00      ← Increased                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Formulas

```
┌─────────────────────────────────────────────────────────────┐
│                      FORMULAS                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Available Stock (Customer View):                           │
│  ═══════════════════════════════                            │
│  available_stock = quantity - pending_order_qty             │
│                                                             │
│  Total Reserved:                                            │
│  ═══════════════                                            │
│  reserved = pending_order_qty                               │
│                                                             │
│  Total Sold (Historical):                                   │
│  ═════════════════════════                                  │
│  total_sold = sold_quantity                                 │
│                                                             │
│  Original Stock:                                            │
│  ═══════════════                                            │
│  original = quantity + sold_quantity + pending_order_qty    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual Guide Version:** 1.0
**Last Updated:** November 19, 2025
