# Order History Pagination Implementation

## Overview
Implemented lazy loading and full pagination for the Customer Order History page with backend limiting to 5 items per page and frontend displaying all 5 items with navigation controls.

## Backend Changes (OrderController.php)

### Pagination Logic
- Backend now returns 5 orders per page
- Added pagination metadata to response:
  - `current_page`: Current backend page number
  - `per_page`: Items per backend page (5)
  - `total`: Total number of orders for the current tab
  - `last_page`: Total number of backend pages

### Implementation Details
```php
// Pagination: 5 items per page
$page = $request->get('page', 1);
$perPage = 5;
$total = $allOrders->count(); // Total for current tab
$paginatedOrders = $allOrders->forPage($page, $perPage)->values();

return Inertia::render('Customer/Order History/index', [
    'orders' => $paginatedOrders,
    'pagination' => [
        'current_page' => (int) $page,
        'per_page' => $perPage,
        'total' => $total,
        'last_page' => (int) ceil($total / $perPage),
    ],
    // ... other props
]);
```

## Frontend Changes (index.tsx)

### State Management
- Removed client-side pagination (backend handles all pagination)
- Display all orders returned from backend (5 items)
- Use `pagination.current_page` and `pagination.last_page` directly

### Pagination Features
1. **Server-Side Pagination**: Backend returns exactly 5 items per page
2. **Lazy Loading**: Fetches new page data on demand
3. **Tab Reset**: Resets to page 1 when switching between tabs
4. **Smooth Scrolling**: Scrolls to top on page change
5. **Preserve State**: Maintains filters when paginating
6. **Accurate Page Count**: "Page X of Y" reflects actual total for current tab

### UI Components
- Previous/Next buttons with chevron icons
- Page indicator showing "Page X of Y"
- Disabled state for buttons at boundaries
- Responsive design (hides button text on mobile)

### Key Functions

#### handlePageChange
```typescript
const handlePageChange = (newPage: number) => {
  const params = new URLSearchParams();
  if (currentDeliveryStatus !== 'all') {
    params.append('delivery_status', currentDeliveryStatus);
  }
  params.append('page', newPage.toString());
  
  router.get('/customer/orders/history', Object.fromEntries(params), {
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });
};
```

#### handleDeliveryStatusFilter
```typescript
const handleDeliveryStatusFilter = (deliveryStatus: string) => {
  const params = new URLSearchParams();
  if (deliveryStatus !== 'all') {
    params.append('delivery_status', deliveryStatus);
  }
  params.append('page', '1');
  router.get('/customer/orders/history', Object.fromEntries(params), {
    preserveScroll: true,
  });
};
```

### Pagination Controls UI
```tsx
{totalPages > 1 && (
  <nav className="flex items-center justify-center gap-2 sm:gap-4 mt-6 pt-4 border-t border-border">
    <Button
      variant="outline"
      size="sm"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Previous</span>
    </Button>
    <div className="text-sm text-muted-foreground px-2">
      Page {currentPage} of {totalPages}
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={isLastPage}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  </nav>
)}
```

## Features

### ✅ Implemented
- Backend pagination (5 items per page)
- Frontend displays all 5 items from backend
- Previous/Next navigation buttons
- Page indicator (Page X of Y) - accurately reflects tab total
- Lazy loading (fetches new page on demand)
- Tab-specific pagination (resets on tab switch)
- Filter preservation across pages
- Smooth scrolling on page change
- Responsive design
- Disabled states for boundary conditions

### 🎯 Behavior
1. **Initial Load**: Backend fetches and displays 5 orders for current tab
2. **Page 2**: Backend fetches next 5 orders for current tab
3. **Page 3**: Backend fetches next 5 orders for current tab
4. **Tab Switch**: Resets to page 1, fetches 5 orders for new tab
5. **Page Count**: Accurately shows total pages based on tab's total order count

## Testing Checklist
- [ ] Navigate between pages using Previous/Next buttons
- [ ] Verify page indicator shows correct page numbers
- [ ] Switch between tabs and confirm reset to page 1
- [ ] Test with different numbers of orders (0, 5, 10, 15, 20+)
- [ ] Verify lazy loading fetches new data when needed
- [ ] Check responsive design on mobile devices
- [ ] Confirm filters are preserved when paginating
- [ ] Test boundary conditions (first/last page)

## Notes
- No changes to UI design or styling
- All existing functionality preserved
- Pagination controls only appear when there's more than 1 page
- Smooth user experience with preserved scroll position where appropriate
