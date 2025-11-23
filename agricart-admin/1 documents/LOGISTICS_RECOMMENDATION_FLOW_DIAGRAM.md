# Logistics Recommendation Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORDER APPROVAL FLOW                          │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ Admin Views  │
    │ Order #123   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Clicks       │
    │ "Approve"    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Order Status: pending → approved     │
    │ Delivery Status: → pending           │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Auto-opens Logistics Assignment      │
    │ Dialog                               │
    └──────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│              RECOMMENDATION ENGINE (NEW)                          │
└──────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │ 1. Get Customer Barangay             │
    │    order.customer.barangay = "Sala"  │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ 2. Filter Logistics                  │
    │    WHERE assigned_area = "Sala"      │
    └──────┬───────────────────────────────┘
           │
           ├─── Match Found? ───┐
           │                    │
           ▼ YES                ▼ NO
    ┌──────────────┐    ┌──────────────────┐
    │ Sort by      │    │ Show Warning:    │
    │ Rating       │    │ "No logistics    │
    │ (Highest     │    │ for this area"   │
    │ First)       │    │                  │
    └──────┬───────┘    └──────┬───────────┘
           │                    │
           ▼                    │
    ┌──────────────┐            │
    │ Auto-select  │            │
    │ Highest-     │            │
    │ Rated Match  │            │
    └──────┬───────┘            │
           │                    │
           └────────┬───────────┘
                    │
                    ▼
           ┌────────────────────┐
           │ Admin Reviews      │
           │ Selection          │
           └────────┬───────────┘
                    │
                    ├─── Confirms? ───┐
                    │                 │
                    ▼ YES             ▼ NO
           ┌────────────────┐  ┌──────────────┐
           │ Assign         │  │ Admin        │
           │ Recommended    │  │ Selects      │
           │ Logistic       │  │ Different    │
           └────────┬───────┘  └──────┬───────┘
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Order Assigned │
                    │ to Logistic    │
                    └────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (PHP)                             │
└─────────────────────────────────────────────────────────────────┘

OrderController::show()
    │
    ├─→ Load Order with Customer Address
    │   └─→ customer.barangay = "Sala"
    │
    ├─→ Load Logistics with Areas
    │   └─→ SELECT id, name, contact_number, assigned_area
    │       FROM users
    │       WHERE type = 'logistic' AND active = true
    │
    └─→ Pass to Frontend via Inertia
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
└─────────────────────────────────────────────────────────────────┘

show.tsx
    │
    └─→ Passes to LogisticAssignment Component
        │   - order.customer.barangay
        │   - logistics array
        │
        ▼
LogisticAssignment.tsx
    │
    ├─→ Filter Logistics
    │   const recommendedLogistics = logistics.filter(
    │     l => l.assigned_area === customerBarangay
    │   )
    │
    ├─→ Select First Match
    │   const recommendedLogistic = recommendedLogistics[0]
    │
    ├─→ Auto-fill Form
    │   assignLogisticForm.setData('logistic_id', recommendedLogistic.id)
    │
    └─→ Render UI
        ├─→ Show customer location
        ├─→ Show recommendation badge (if match)
        ├─→ Show warning (if no match)
        └─→ Group dropdown options
```

## UI Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Assign Logistic to Order #123                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ This order has been approved and is ready for delivery.         │
│ Customer Location: Sala                                         │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ Recommended Logistic: Judel Macasinag                    │ │
│ │ Assigned to area: Sala                                      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Select Logistic Provider *                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ▼ Recommended for this area                                │ │
│ │   ⭐ Judel Macasinag (0912...) - Sala                      │ │
│ │                                                             │ │
│ │ ▼ Other Logistics                                          │ │
│ │   Maria Santos (0917...) - Banlic                          │ │
│ │   Juan Dela Cruz (0923...) - Bigaa                         │ │
│ │   Pedro Garcia (0928...) - Casile                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                    [Cancel] [Assign Logistic]   │
└─────────────────────────────────────────────────────────────────┘
```

## Matching Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATCHING LOGIC                                │
└─────────────────────────────────────────────────────────────────┘

Input:
  - customerBarangay: string (e.g., "Sala")
  - logistics: Logistic[] (all active logistics)

Process:
  1. Filter logistics array
     ├─→ Check each logistic.assigned_area
     ├─→ Compare with customerBarangay
     └─→ Keep if exact match (case-sensitive)

  2. Sort matched logistics
     ├─→ By rating (highest first)
     ├─→ Rated logistics before unrated
     └─→ Alphabetical if ratings equal

  3. Count matches
     ├─→ 0 matches: Show warning, no recommendation
     ├─→ 1 match: Show as recommended, auto-select
     └─→ 2+ matches: Show all as recommended, auto-select highest-rated

  4. Auto-selection
     ├─→ Get highest-rated recommended logistic
     ├─→ Set form value to logistic.id
     └─→ Trigger when dialog opens

Output:
  - recommendedLogistics: Logistic[] (filtered list)
  - recommendedLogistic: Logistic | null (first match)
  - UI updates automatically based on results
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT STATE                               │
└─────────────────────────────────────────────────────────────────┘

LogisticAssignment Component
│
├─→ Props (from parent)
│   ├─ orderId: number
│   ├─ logistic?: Logistic (current assignment)
│   ├─ logistics: Logistic[] (all available)
│   ├─ customerBarangay?: string (NEW)
│   ├─ assignLogisticDialogOpen: boolean
│   ├─ setAssignLogisticDialogOpen: function
│   ├─ assignLogisticForm: InertiaForm
│   └─ onAssignLogistic: function
│
├─→ Computed Values (NEW)
│   ├─ recommendedLogistics: Logistic[]
│   │   = logistics.filter(l => l.assigned_area === customerBarangay)
│   │
│   ├─ sortedRecommendedLogistics: Logistic[]
│   │   = recommendedLogistics.sort(by rating, highest first)
│   │
│   └─ recommendedLogistic: Logistic | null
│       = sortedRecommendedLogistics[0] || null (highest-rated)
│
└─→ Effects (NEW)
    └─ On Dialog Open
        ├─ Check if recommendedLogistic exists
        ├─ Check if form is empty
        └─ Auto-fill form with recommended ID
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: No Customer Barangay
├─→ customerBarangay is undefined/null
├─→ recommendedLogistics = []
├─→ No recommendation shown
└─→ Normal selection process

Scenario 2: No Matching Logistics
├─→ customerBarangay = "Pittland"
├─→ No logistics with assigned_area = "Pittland"
├─→ Show yellow warning message
└─→ Display all logistics in single group

Scenario 3: Logistics Without Area
├─→ logistic.assigned_area is null/undefined
├─→ Filtered out from recommendations
├─→ Appears in "Other Logistics" group
└─→ Can still be manually selected

Scenario 4: Case Mismatch
├─→ customerBarangay = "sala" (lowercase)
├─→ logistic.assigned_area = "Sala" (capitalized)
├─→ No match (case-sensitive comparison)
└─→ Ensure consistent data formatting

Scenario 5: Admin Override
├─→ Recommendation shown and auto-selected
├─→ Admin selects different logistic
├─→ Form updates normally
└─→ Selected logistic is assigned (no restrictions)
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                  SYSTEM INTEGRATION                              │
└─────────────────────────────────────────────────────────────────┘

Depends On:
├─→ Logistics Area Assignment Feature
│   └─→ users.assigned_area column must exist
│
├─→ Customer Address System
│   └─→ Customer must have barangay in address
│
└─→ Order Management System
    └─→ Order approval workflow

Integrates With:
├─→ Notification System
│   └─→ Notifies assigned logistic
│
├─→ Delivery Tracking
│   └─→ Tracks delivery by assigned logistic
│
└─→ Reporting System
    └─→ Can track assignments by area

Does Not Affect:
├─→ Order approval process
├─→ Stock management
├─→ Payment processing
└─→ Customer notifications
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE                                   │
└─────────────────────────────────────────────────────────────────┘

Backend:
├─→ Query Time: +0ms (adds one field to existing query)
├─→ Memory: +negligible (one string field per logistic)
└─→ Network: +~20 bytes per logistic (assigned_area field)

Frontend:
├─→ Filter Time: O(n) where n = number of logistics (~27)
├─→ Render Time: +negligible (conditional rendering)
└─→ Memory: +minimal (computed values, no state)

User Experience:
├─→ Dialog Open: Instant (auto-selection is synchronous)
├─→ Recommendation Display: Instant (client-side filtering)
└─→ Overall Impact: Imperceptible to user
```

---

**Legend:**
- `│` = Flow continues
- `├─→` = Branch/Option
- `└─→` = Final step/Result
- `▼` = Continues below
- `✓` = Success indicator
- `⭐` = Recommended indicator
- `⚠️` = Warning indicator
