# Member Notification Flow Diagram

## Overview Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Member Notification System                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Member Clicks         │
                    │  Notification          │
                    └────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Check Notification    │
                    │  Type                  │
                    └────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  product_sale    │ │ earnings_    │ │ low_stock_   │
    │                  │ │ update       │ │ alert        │
    └──────────────────┘ └──────────────┘ └──────────────┘
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ All Stocks       │ │ Dashboard    │ │ All Stocks   │
    │ (Transactions)   │ │              │ │ (Stocks)     │
    └──────────────────┘ └──────────────┘ └──────────────┘
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Highlight        │ │ Show         │ │ Highlight    │
    │ Transaction      │ │ Earnings     │ │ Low Stock    │
    └──────────────────┘ └──────────────┘ └──────────────┘
                │
                ▼
    ┌──────────────────┐
    │  stock_added     │
    │                  │
    └──────────────────┘
                │
                ▼
    ┌──────────────────┐
    │ All Stocks       │
    │ (Stocks)         │
    └──────────────────┘
                │
                ▼
    ┌──────────────────┐
    │ Highlight        │
    │ New Stock        │
    └──────────────────┘
```

## Detailed Flow by Notification Type

### 1. Product Sale Notification

```
Product Sale Event
       │
       ▼
ProductSaleNotification Created
       │
       ├─ audit_trail_id: 123
       ├─ sale_id: 456
       └─ stock_id: 789
       │
       ▼
Member Clicks Notification
       │
       ▼
Extract audit_trail_id (123)
       │
       ▼
Navigate to:
/member/all-stocks?view=transactions&highlight_transaction=123
       │
       ▼
All Stocks Page Loads
       │
       ▼
Switch to Transactions Tab
       │
       ▼
Find Transaction with ID 123
       │
       ▼
Apply Highlight Animation
       │
       ▼
Scroll to Transaction
       │
       ▼
Remove Highlight After 3s
```

### 2. Earnings Update Notification

```
Earnings Update Event
       │
       ▼
EarningsUpdateNotification Created
       │
       ├─ amount: 1500.00
       ├─ period: "monthly"
       └─ details: {...}
       │
       ▼
Member Clicks Notification
       │
       ▼
Navigate to:
/member/dashboard?highlight_notification={id}
       │
       ▼
Dashboard Loads
       │
       ▼
Display Earnings Summary Cards
       │
       ├─ Total Kilo
       ├─ Total Piece
       ├─ Total Tali
       ├─ Available Stock
       ├─ Sold Stock
       └─ Total Stock
```

### 3. Low Stock Alert Notification

```
Stock Falls Below Threshold
       │
       ▼
LowStockAlertNotification Created
       │
       ├─ stock_id: 789
       ├─ product_id: 456
       ├─ stock_type: "available"
       └─ current_quantity: 5
       │
       ▼
Member Clicks Notification
       │
       ▼
Extract stock_id (789)
       │
       ▼
Navigate to:
/member/all-stocks?view=stocks&highlight_stock=789
       │
       ▼
All Stocks Page Loads
       │
       ▼
Switch to Stocks Tab
       │
       ▼
Find Stock with ID 789
       │
       ▼
Apply Highlight Animation
       │
       ▼
Scroll to Stock
       │
       ▼
Remove Highlight After 3s
```

### 4. Stock Added Notification

```
Admin/Staff Adds Stock
       │
       ▼
StockAddedNotification Created
       │
       ├─ stock_id: 999
       ├─ product_id: 456
       ├─ category: "Kilo"
       └─ quantity: 100
       │
       ▼
Member Clicks Notification
       │
       ▼
Extract stock_id (999)
       │
       ▼
Navigate to:
/member/all-stocks?view=stocks&highlight_stock=999
       │
       ▼
All Stocks Page Loads
       │
       ▼
Switch to Stocks Tab
       │
       ▼
Find Stock with ID 999
       │
       ▼
Apply Highlight Animation
       │
       ▼
Scroll to Stock
       │
       ▼
Remove Highlight After 3s
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Event Occurs     │───▶│ Notification     │                  │
│  │ (Sale, Stock,    │    │ Class Created    │                  │
│  │  Earnings, etc.) │    │                  │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ toArray() Method │                   │
│                          │ Returns Data     │                   │
│                          └──────────────────┘                   │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ Store in         │                   │
│                          │ notifications    │                   │
│                          │ table            │                   │
│                          └──────────────────┘                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Load             │───▶│ Display          │                  │
│  │ Notifications    │    │ Notification     │                  │
│  │ Page             │    │ List             │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ User Clicks      │                   │
│                          │ Notification     │                   │
│                          └──────────────────┘                   │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ handleNotification│                   │
│                          │ Click()          │                   │
│                          └──────────────────┘                   │
│                                   │                              │
│                    ┌──────────────┼──────────────┐             │
│                    ▼              ▼              ▼             │
│           ┌──────────────┐ ┌──────────┐ ┌──────────┐          │
│           │ Mark as Read │ │ Extract  │ │ Build    │          │
│           │              │ │ Data     │ │ URL      │          │
│           └──────────────┘ └──────────┘ └──────────┘          │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ router.visit()   │                   │
│                          │ Navigate to Page │                   │
│                          └──────────────────┘                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Destination Page Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Page Loads       │───▶│ Parse URL        │                  │
│  │ (Dashboard or    │    │ Parameters       │                  │
│  │  All Stocks)     │    │                  │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ Find Target      │                   │
│                          │ Element          │                   │
│                          └──────────────────┘                   │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ Apply Highlight  │                   │
│                          │ Animation        │                   │
│                          └──────────────────┘                   │
│                                   │                              │
│                                   ▼                              │
│                          ┌──────────────────┐                   │
│                          │ Scroll to        │                   │
│                          │ Element          │                   │
│                          └──────────────────┘                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## URL Parameter Patterns

### Transactions View
```
/member/all-stocks
  ?view=transactions
  &highlight_transaction={audit_trail_id}
```

### Stocks View (by Stock ID)
```
/member/all-stocks
  ?view=stocks
  &highlight_stock={stock_id}
```

### Stocks View (by Product + Category)
```
/member/all-stocks
  ?view=stocks
  &highlight_product={product_id}
  &highlight_category={category}
```

### Dashboard
```
/member/dashboard
  ?highlight_notification={notification_id}
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    Notification State Flow                       │
└─────────────────────────────────────────────────────────────────┘

Initial State: Unread
       │
       ▼
User Clicks Notification
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
Mark as Read API Call              Navigate to Page
       │                                     │
       ▼                                     ▼
Update Database                    Load Destination
       │                                     │
       ▼                                     ▼
Update UI State                    Parse Parameters
       │                                     │
       ▼                                     ▼
Remove "New" Badge                 Highlight Element
       │                                     │
       └─────────────────┬───────────────────┘
                         │
                         ▼
                  User Sees Result
```

## Error Handling Flow

```
Notification Click
       │
       ▼
Try to Navigate
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
Success Path                         Error Path
       │                                     │
       ▼                                     ▼
Mark as Read                         Log Error
       │                                     │
       ▼                                     ▼
Navigate                             Fallback to
       │                             action_url
       ▼                                     │
Highlight                                   ▼
       │                             Navigate
       └─────────────────┬───────────────────┘
                         │
                         ▼
                  Complete
```

---

This diagram provides a visual representation of how member notifications flow through the system from creation to user interaction and final destination.
