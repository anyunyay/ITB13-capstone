# Order Modal Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS NOTIFICATION                  │
│              "Order #150 is out for delivery"               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Navigate to Order History Page                  │
│         URL: /customer/orders/history#order-150             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              useEffect Detects Hash (#order-150)            │
│         Extracts orderId = 150 from hash                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│     Check: Does Order #150 exist in displayedOrders?       │
│     const orderElement = document.getElementById(...)       │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
        YES  │                                │  NO
             ▼                                ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│   EXISTING BEHAVIOR      │    │    NEW MODAL BEHAVIOR        │
│   (Order is loaded)      │    │   (Order not loaded)         │
└──────────┬───────────────┘    └──────────┬───────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│  Scroll to Order #150    │    │  Open OrderDetailsModal      │
│  Highlight with border   │    │  setDetailsModalOpen(true)   │
│  User sees order         │    │  setSelectedOrderId(150)     │
└──────────────────────────┘    └──────────┬───────────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────────┐
                                │  Modal useEffect Triggers    │
                                │  Fetch order from API        │
                                └──────────┬───────────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────────┐
                                │  API Call:                   │
                                │  GET /customer/orders/150    │
                                └──────────┬───────────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────────┐
                                │  OrderController@show()      │
                                │  - Check sales table         │
                                │  - Check sales_audit table   │
                                │  - Verify ownership          │
                                │  - Return order JSON         │
                                └──────────┬───────────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────────┐
                                │  Display Order in Modal      │
                                │  - Order items               │
                                │  - Delivery status           │
                                │  - Admin notes               │
                                │  - Logistics info            │
                                │  - Total amount              │
                                └──────────┬───────────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────────┐
                                │  User Actions:               │
                                │  1. View details             │
                                │  2. Click "View in History"  │
                                │  3. Close modal              │
                                └──────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Order History Component                   │
├─────────────────────────────────────────────────────────────┤
│  State Variables:                                           │
│  - displayedOrders: Order[]        (lazy loaded list)       │
│  - detailsModalOpen: boolean       (modal visibility)       │
│  - selectedOrderIdForDetails: number | null                 │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  OrderDetailsModal Component                 │
├─────────────────────────────────────────────────────────────┤
│  Props:                                                     │
│  - isOpen: boolean                                          │
│  - onClose: () => void                                      │
│  - orderId: number                                          │
│                                                             │
│  Internal State:                                            │
│  - order: Order | null             (fetched data)           │
│  - isLoading: boolean              (fetch status)           │
│  - error: string | null            (error message)          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│ Notification │
│   Service    │
└──────┬───────┘
       │ Creates notification with order_id
       ▼
┌──────────────┐
│ NotificationBell │
│   Component  │
└──────┬───────┘
       │ Navigates to: /customer/orders/history#order-{id}
       ▼
┌──────────────┐
│ Order History│
│     Page     │
└──────┬───────┘
       │ Detects hash, checks if order loaded
       ▼
┌──────────────┐         ┌──────────────┐
│ If Loaded:   │         │ If Not:      │
│ Scroll       │         │ Open Modal   │
└──────────────┘         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ OrderDetails │
                         │    Modal     │
                         └──────┬───────┘
                                │ Fetches from API
                                ▼
                         ┌──────────────┐
                         │ OrderController│
                         │   @show()    │
                         └──────┬───────┘
                                │ Returns order data
                                ▼
                         ┌──────────────┐
                         │ Display in   │
                         │    Modal     │
                         └──────────────┘
```

## Component Hierarchy

```
AppHeaderLayout
└── OrderHistory (index.tsx)
    ├── NotificationBell (shows notifications)
    ├── Order List (lazy loaded, 4 at a time)
    │   └── Order Cards (visible orders)
    ├── OrderReceivedConfirmationModal
    ├── OrderReceiptPreview
    └── OrderDetailsModal ← NEW
        ├── Dialog (shadcn/ui)
        ├── Order Header (ID, date, status)
        ├── Delivery Progress Bar
        ├── Admin Notes
        ├── Logistics Info
        ├── Order Items Table/Cards
        ├── Order Total
        └── Action Buttons
            ├── Close
            └── View in History
```

## API Endpoint Details

```
Endpoint: GET /customer/orders/{orderId}
Method: GET
Auth: Required (customer middleware)
Parameters:
  - orderId (path parameter)

Response Success (200):
{
  "order": {
    "id": 150,
    "total_amount": 1250.00,
    "status": "approved",
    "delivery_status": "out_for_delivery",
    "created_at": "2024-11-20T10:30:00Z",
    "admin_notes": "Order approved",
    "logistic": { ... },
    "audit_trail": [ ... ],
    "source": "sales_audit"
  }
}

Response Error (404):
{
  "error": "Order not found"
}
```

## Decision Tree

```
                    Notification Clicked
                            │
                            ▼
                  Navigate to Order History
                            │
                            ▼
                    Extract Order ID from Hash
                            │
                            ▼
              ┌─────────────┴─────────────┐
              │                           │
         Order in List?              Order in List?
              YES                         NO
              │                           │
              ▼                           ▼
      ┌───────────────┐          ┌───────────────┐
      │ Scroll to it  │          │ Open Modal    │
      │ Highlight it  │          │ Fetch from API│
      │ Done!         │          │ Display       │
      └───────────────┘          └───────────────┘
```

## Benefits Visualization

```
BEFORE:
User → Notification → Order History → Empty (Order not loaded)
                                    → Click "Show More" x5
                                    → Finally see order
Time: ~30 seconds, 5+ clicks

AFTER:
User → Notification → Order History → Modal with Order Details
Time: ~2 seconds, 1 click
```

## Error Handling Flow

```
Modal Opens
    │
    ▼
Fetch Order from API
    │
    ├─ Success → Display Order
    │
    ├─ 404 Not Found → Show "Order not found" message
    │
    └─ Network Error → Show "Failed to load" with retry option
```
