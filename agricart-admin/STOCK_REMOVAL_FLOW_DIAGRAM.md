# Stock Removal Flow Diagram

## Visual Flow of Stock Removal Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK REMOVAL INITIATED                       │
│                  (Admin selects stock to remove)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SELECT REMOVAL REASON                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Sold Outside │  │   Damaged/   │  │Listing Error │         │
│  │              │  │  Defective   │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  SOLD OUTSIDE   │ │ DAMAGED/DEFECT  │ │ LISTING ERROR   │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK QUANTITY DEDUCTION                      │
│                                                                  │
│  Stock.quantity -= quantityToRemove                             │
│  Stock.removed_quantity += quantityToRemove                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Example: Remove 20 units from 100 available            │    │
│  │ Before: quantity = 100, removed_quantity = 0           │    │
│  │ After:  quantity = 80,  removed_quantity = 20          │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOSS CALCULATION CHECK                        │
└─────────┬───────────────────┬───────────────────┬───────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  SOLD OUTSIDE   │ │ DAMAGED/DEFECT  │ │ LISTING ERROR   │
│                 │ │                 │ │                 │
│ Loss = ₱0       │ │ Loss = qty × $  │ │ Loss = ₱0       │
│ ❌ NOT COUNTED  │ │ ✅ COUNTED      │ │ ❌ NOT COUNTED  │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK TRAIL RECORD                            │
│                                                                  │
│  action_type: 'removed'                                         │
│  old_quantity: [quantity before removal]                        │
│  new_quantity: [quantity after removal]                         │
│  notes: "[Reason] - [Impact statement]"                         │
│                                                                  │
│  Examples:                                                       │
│  • "Sold Outside - No impact on system..."                      │
│  • "Damaged / Defective - Loss recorded: ₱1,500.00"            │
│  • "Listing Error - No impact on system..."                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MEMBER DASHBOARD UPDATE                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Stock Overview Table                                      │  │
│  ├──────────┬──────┬──────┬───────────┬──────────┬─────────┤  │
│  │ Product  │Total │ Sold │ Available │ Damaged  │  Loss   │  │
│  ├──────────┼──────┼──────┼───────────┼──────────┼─────────┤  │
│  │ Tomatoes │ 100  │  0   │    80     │    0     │   ₱0    │  │
│  │ (Sold    │      │      │           │          │         │  │
│  │ Outside) │      │      │           │          │         │  │
│  ├──────────┼──────┼──────┼───────────┼──────────┼─────────┤  │
│  │ Lettuce  │  70  │  20  │    35     │   15     │  ₱450   │  │
│  │ (Damaged)│      │      │           │          │         │  │
│  ├──────────┼──────┼──────┼───────────┼──────────┼─────────┤  │
│  │ Cabbage  │ 100  │  0   │    70     │    0     │   ₱0    │  │
│  │ (Listing │      │      │           │          │         │  │
│  │  Error)  │      │      │           │          │         │  │
│  └──────────┴──────┴──────┴───────────┴──────────┴─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Breakdown by Reason

### 1. Sold Outside Flow

```
┌──────────────────┐
│  Initial Stock   │
│  Qty: 100 units  │
│  Price: ₱50/unit │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Remove 20 units  │
│ Reason: Sold     │
│        Outside   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stock Table Update               │
│ • quantity: 100 → 80             │
│ • removed_quantity: 0 → 20       │
│ • sold_quantity: unchanged       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stock Trail Record               │
│ • old_quantity: 100              │
│ • new_quantity: 80               │
│ • notes: "Sold Outside - No      │
│   impact on system..."           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Loss Calculation                 │
│ • Check notes for "Damaged"      │
│ • NOT FOUND ❌                   │
│ • Loss = ₱0                      │
│ • NOT added to member loss       │
└──────────────────────────────────┘
```

### 2. Damaged/Defective Flow

```
┌──────────────────┐
│  Initial Stock   │
│  Qty: 50 units   │
│  Price: ₱30/unit │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Remove 15 units  │
│ Reason: Damaged/ │
│       Defective  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stock Table Update               │
│ • quantity: 50 → 35              │
│ • removed_quantity: 0 → 15       │
│ • sold_quantity: unchanged       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Loss Calculation                 │
│ • Calculate: 15 × ₱30 = ₱450    │
│ • Store in variable              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stock Trail Record               │
│ • old_quantity: 50               │
│ • new_quantity: 35               │
│ • notes: "Damaged / Defective -  │
│   Loss recorded: ₱450.00"        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Loss Calculation (Member View)   │
│ • Check notes for "Damaged"      │
│ • FOUND ✅                       │
│ • Calculate: (50-35) × ₱30       │
│ • Loss = ₱450                    │
│ • ADDED to member loss column    │
└──────────────────────────────────┘
```

### 3. Listing Error Flow

```
┌──────────────────┐
│  Initial Stock   │
│  Qty: 200 units  │
│  Price: ₱10/unit │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Remove 30 units  │
│ Reason: Listing  │
│        Error     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stock Table Update               │
│ • quantity: 200 → 170            │
│ • removed_quantity: 0 → 30       │
│ • sold_quantity: unchanged       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stock Trail Record               │
│ • old_quantity: 200              │
│ • new_quantity: 170              │
│ • notes: "Listing Error - No     │
│   impact on system..."           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Loss Calculation                 │
│ • Check notes for "Damaged"      │
│ • NOT FOUND ❌                   │
│ • Loss = ₱0                      │
│ • NOT added to member loss       │
└──────────────────────────────────┘
```

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA TRACKING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stock Table (stocks)                                           │
│  ├─ quantity (current available)                                │
│  ├─ sold_quantity (cumulative sold)                             │
│  ├─ removed_quantity (cumulative removed) ← NEW                 │
│  ├─ initial_quantity (original amount)                          │
│  └─ removed_at (timestamp if fully removed)                     │
│                                                                  │
│  Stock Trail Table (stock_trails)                               │
│  ├─ action_type ('removed')                                     │
│  ├─ old_quantity (before removal)                               │
│  ├─ new_quantity (after removal)                                │
│  ├─ notes (reason + impact)                                     │
│  └─ created_at (when removed)                                   │
│                                                                  │
│  System Logs (system_logs)                                      │
│  ├─ action ('stock_removed')                                    │
│  ├─ data (JSON with details)                                    │
│  │   ├─ reason                                                  │
│  │   ├─ quantity_removed                                        │
│  │   ├─ remaining_quantity                                      │
│  │   └─ loss_amount (if damaged/defective)                     │
│  └─ created_at                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Loss Calculation Logic

```
FOR EACH stock_trail WHERE action_type = 'removed':
    
    IF notes CONTAINS 'Damaged' OR notes CONTAINS 'Defective':
        removed_qty = old_quantity - new_quantity
        price = get_unit_price(product, category)
        loss = removed_qty × price
        
        ADD loss TO total_loss
        ADD removed_qty TO damaged_defective_count
        
    ELSE:
        // Sold Outside or Listing Error
        // Do NOT add to loss
        // Do NOT add to damaged_defective_count
        
    END IF
    
END FOR

DISPLAY total_loss IN member's loss column
DISPLAY damaged_defective_count IN damaged/defective column
```

## Key Points

1. **All Removals Deduct Stock** ✅
   - Sold Outside: Deducts from quantity
   - Damaged/Defective: Deducts from quantity
   - Listing Error: Deducts from quantity

2. **Only Damaged/Defective Counts as Loss** ✅
   - Sold Outside: Loss = ₱0
   - Damaged/Defective: Loss = qty × price
   - Listing Error: Loss = ₱0

3. **Complete Data Tracking** ✅
   - Stock table: removed_quantity field
   - Stock trail: Complete history
   - System logs: Detailed records

4. **Flexible Detection** ✅
   - Uses LIKE query: `notes LIKE '%Damaged%'`
   - Case-insensitive: `stripos($notes, 'Damaged')`
   - Handles variations in notes format

5. **Existing Functionality Preserved** ✅
   - All stock operations work
   - All reports accurate
   - All filters functional
