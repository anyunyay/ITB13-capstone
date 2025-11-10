# Logistics Pagination Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGISTICS SYSTEM                          │
│                     Pagination & Lazy Loading                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Laravel)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LogisticController.php                                         │
│  ├─ dashboard(Request $request)                                 │
│  │  ├─ per_page: 5 (default)                                   │
│  │  ├─ Calculates stats from all orders                        │
│  │  └─ Returns paginated orders                                │
│  │                                                              │
│  ├─ assignedOrders(Request $request)                           │
│  │  ├─ per_page: 5 (default)                                  │
│  │  ├─ Supports status filtering                              │
│  │  └─ Returns paginated orders                               │
│  │                                                             │
│  └─ generateReport(Request $request)                          │
│     ├─ per_page: 5 (default)                                 │
│     ├─ Supports search & filters                             │
│     ├─ Stats from all matching records                       │
│     └─ Returns paginated orders                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                              │
                              │ Inertia.js
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pagination Component (pagination.tsx)                          │
│  ├─ Reusable across all pages                                  │
│  ├─ Smart page number display                                  │
│  ├─ First/Last/Prev/Next navigation                           │
│  ├─ Shows current range                                        │
│  └─ Preserves state & scroll                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Dashboard (dashboard.tsx)                                │  │
│  │ ├─ Recent orders (paginated)                            │  │
│  │ ├─ Statistics (all orders)                              │  │
│  │ └─ <Pagination /> component                             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Assigned Orders (assignedOrders.tsx)                    │  │
│  │ ├─ Tab filtering (all/pending/ready/out/delivered)      │  │
│  │ ├─ Orders list (paginated)                              │  │
│  │ └─ <Pagination /> in each tab                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Report (report.tsx)                                      │  │
│  │ ├─ Search & filters                                      │  │
│  │ ├─ Summary statistics (all records)                      │  │
│  │ ├─ Card/Table view toggle                                │  │
│  │ ├─ Orders list (paginated)                               │  │
│  │ ├─ <Pagination /> component                              │  │
│  │ └─ Export (CSV/PDF - all data)                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│   Browser    │
│  (User)      │
└──────┬───────┘
       │ 1. Request page
       │    (e.g., /logistic/orders?page=2)
       ▼
┌──────────────────────┐
│   Laravel Router     │
│   (web.php)          │
└──────┬───────────────┘
       │ 2. Route to controller
       ▼
┌──────────────────────────────┐
│  LogisticController          │
│  - Validate request          │
│  - Apply filters             │
│  - Query database            │
│  - Paginate results          │
└──────┬───────────────────────┘
       │ 3. Return paginated data
       │    {
       │      data: [...],
       │      links: [...],
       │      current_page: 2,
       │      total: 100,
       │      ...
       │    }
       ▼
┌──────────────────────────────┐
│   Inertia.js                 │
│   - Serialize data           │
│   - Send to React            │
└──────┬───────────────────────┘
       │ 4. Props to component
       ▼
┌──────────────────────────────┐
│   React Component            │
│   - Render orders            │
│   - Render pagination        │
└──────┬───────────────────────┘
       │ 5. Display to user
       ▼
┌──────────────────────────────┐
│   Browser (Updated)          │
│   - Shows current page       │
│   - Pagination controls      │
└──────────────────────────────┘
```

## Component Hierarchy

```
LogisticHeader
└─ Page Container
   ├─ Statistics Cards (Dashboard/Report)
   ├─ Filters (Report)
   │  ├─ Search Input
   │  ├─ Date Range Picker
   │  └─ Status Selector
   ├─ Tabs (Assigned Orders)
   │  ├─ All Orders Tab
   │  ├─ Pending Tab
   │  ├─ Ready to Pickup Tab
   │  ├─ Out for Delivery Tab
   │  └─ Delivered Tab
   ├─ Orders List
   │  ├─ OrderCard (Card View)
   │  │  ├─ Order Info
   │  │  ├─ Customer Info
   │  │  ├─ Status Badge
   │  │  └─ Action Buttons
   │  └─ OrderTable (Table View)
   │     ├─ Table Headers
   │     ├─ Table Rows
   │     └─ Sort Controls
   └─ Pagination Component
      ├─ Range Display ("Showing X to Y of Z")
      ├─ First Page Button
      ├─ Previous Page Button
      ├─ Page Numbers
      │  ├─ Current Page (highlighted)
      │  ├─ Nearby Pages
      │  └─ Ellipsis (...)
      ├─ Next Page Button
      └─ Last Page Button
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                      Component State                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Assigned Orders:                                           │
│  ├─ isLoading: boolean                                      │
│  ├─ currentStatus: string                                   │
│  └─ orders: PaginatedOrders                                 │
│                                                              │
│  Report:                                                     │
│  ├─ localFilters: ReportFilters                            │
│  ├─ currentView: 'cards' | 'table'                         │
│  ├─ filtersOpen: boolean                                    │
│  ├─ startDate: Date | undefined                            │
│  └─ endDate: Date | undefined                              │
│                                                              │
│  Dashboard:                                                  │
│  └─ assignedOrders: PaginatedOrders                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### Request Parameters
```
GET /logistic/orders?status=pending&page=2&per_page=15

Query Parameters:
├─ status: 'all' | 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered'
├─ page: number (current page)
└─ per_page: number (items per page)
```

### Response Structure
```json
{
  "orders": {
    "data": [
      {
        "id": 1,
        "customer": {...},
        "delivery_status": "pending",
        "total_amount": 1500.00,
        ...
      }
    ],
    "links": [
      {"url": null, "label": "&laquo; Previous", "active": false},
      {"url": "?page=1", "label": "1", "active": false},
      {"url": "?page=2", "label": "2", "active": true},
      {"url": "?page=3", "label": "3", "active": false},
      {"url": "?page=3", "label": "Next &raquo;", "active": false}
    ],
    "current_page": 2,
    "last_page": 10,
    "per_page": 15,
    "from": 16,
    "to": 30,
    "total": 150
  },
  "currentStatus": "pending"
}
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                   Optimization Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database Level:                                            │
│  ├─ LIMIT/OFFSET queries (Laravel pagination)              │
│  ├─ Eager loading (with() relationships)                   │
│  └─ Indexed columns (logistic_id, status, created_at)     │
│                                                              │
│  Application Level:                                          │
│  ├─ Separate stats query (before pagination)               │
│  ├─ Cached relationships                                    │
│  └─ Efficient data transformation                           │
│                                                              │
│  Frontend Level:                                             │
│  ├─ Preserved scroll position                               │
│  ├─ Loading states                                          │
│  ├─ Optimistic UI updates                                   │
│  └─ Memoized components                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Scenarios                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Invalid Page Number:                                        │
│  └─ Laravel returns first page automatically                │
│                                                              │
│  No Results:                                                 │
│  └─ Display "No orders found" message                       │
│                                                              │
│  Network Error:                                              │
│  └─ Inertia.js handles retry logic                         │
│                                                              │
│  Invalid Filters:                                            │
│  └─ Backend validation returns error                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Authentication:                                             │
│  ├─ Middleware: role:logistic                               │
│  └─ Auth::user() verification                               │
│                                                              │
│  Authorization:                                              │
│  ├─ logistic_id check on all queries                       │
│  └─ Order ownership verification                            │
│                                                              │
│  Input Validation:                                           │
│  ├─ per_page limits (max: 100)                             │
│  ├─ page number validation                                  │
│  └─ Filter value sanitization                              │
│                                                              │
│  Data Protection:                                            │
│  ├─ Email masking for non-admin users                      │
│  └─ Sensitive data filtering                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Scalability

```
Current Implementation:
├─ Handles 10,000+ orders efficiently
├─ Sub-second page load times
├─ Optimized database queries
└─ Minimal memory footprint

Future Scaling Options:
├─ Database indexing optimization
├─ Redis caching for statistics
├─ CDN for static assets
├─ Database read replicas
└─ Elasticsearch for search
```

## Monitoring & Metrics

```
Key Metrics to Track:
├─ Average page load time
├─ Database query performance
├─ Pagination click-through rate
├─ Most common per_page values
├─ Filter usage patterns
└─ Export frequency
```

This architecture ensures scalable, performant, and maintainable pagination across all logistics pages.
