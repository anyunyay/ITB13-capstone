# Order History Lazy Loading Seeder Documentation

## Overview

The `OrderHistoryLazyLoadingSeeder` creates realistic test data specifically designed for the lazy loading Order History system. It generates **at least 20 orders per customer** with proper timestamps, statuses, and relationships.

---

## Key Features

### 1. Realistic Order Distribution

The seeder creates orders in the following categories:

| Category | Count | Purpose |
|----------|-------|---------|
| Recently Updated | 5 | Test sorting by `updated_at` (appear at top) |
| Pending Orders | 5 | Test pending approval workflow |
| Out for Delivery | 4 | Test delivery status tracking |
| Delivered Orders | 6 | Test completed orders |
| Historical Orders | 8 | Test pagination with older data |
| Rejected/Cancelled | 3 | Test failed order scenarios |
| **Total** | **31** | **Exceeds 20 minimum requirement** |

### 2. Timestamp Strategy

Orders are created with staggered timestamps to simulate real-world usage:

```php
// Recently Updated Orders (appear at top)
$createdAt = Carbon::now()->subDays(rand(2, 7));
$updatedAt = Carbon::now()->subMinutes(rand(5, 120)); // Last 2 hours

// Pending Orders
$createdAt = Carbon::now()->subHours(rand(1, 48));

// Historical Orders
$createdAt = Carbon::now()->subWeeks(rand(2, 12));
```

### 3. Status Distribution

Orders are assigned various statuses to test all scenarios:

- **pending**: Awaiting admin approval
- **delayed**: Pending for over 24 hours
- **approved**: Approved by admin
- **rejected**: Rejected due to insufficient stock
- **cancelled**: Cancelled by customer
- **delivered**: Successfully delivered

### 4. Delivery Status Tracking

For approved orders, delivery status progresses through:

- **pending**: Order being prepared
- **ready_to_pickup**: Ready for logistics pickup
- **out_for_delivery**: In transit to customer
- **delivered**: Successfully delivered

---

## Database Structure

### Tables Populated

1. **sales_audit** - Main order records
2. **audit_trail** - Order items and stock tracking
3. **sales** - Completed/delivered orders
4. **stocks** - Updated quantities for approved orders

### Relationships Created

```
SalesAudit (Order)
├── Customer (User)
├── Admin (User)
├── Logistic (User)
├── Address (UserAddress)
├── AuditTrail (Order Items)
│   ├── Product
│   ├── Stock
│   └── Member
└── Sales (if delivered)
```

---

## Usage

### Run the Seeder

```bash
# Run all seeders (includes OrderHistoryLazyLoadingSeeder)
php artisan db:seed

# Run only the Order History seeder
php artisan db:seed --class=OrderHistoryLazyLoadingSeeder

# Fresh migration + seed
php artisan migrate:fresh --seed
```

### Prerequisites

The seeder requires these to be seeded first:
1. ✅ RoleSeeder
2. ✅ UserSeeder (creates admin, logistics, customer, members)
3. ✅ ProductSeeder
4. ✅ StockSeeder

---

## Order Scenarios Created

### 1. Recently Updated Orders (5 orders)

**Purpose**: Test that recently modified orders appear at the top

**Characteristics**:
- Created 2-7 days ago
- Updated within last 2 hours
- Various statuses (pending, approved, delivered)
- Simulates admin modifications

**Example**:
```
Order #1 - Created 3 days ago, Updated 15 minutes ago
Status: approved, Delivery: ready_to_pickup
Admin Notes: "Recently updated by admin"
```

### 2. Pending Orders (5 orders)

**Purpose**: Test pending approval workflow

**Characteristics**:
- Created within last 48 hours
- Status: pending or delayed (if > 24 hours)
- No admin or logistic assigned yet
- Awaiting approval

**Example**:
```
Order #6 - Created 6 hours ago
Status: pending, Delivery: pending
Admin: Not assigned
```

### 3. Out for Delivery Orders (4 orders)

**Purpose**: Test delivery tracking

**Characteristics**:
- Created 6-36 hours ago
- Status: approved
- Delivery: ready_to_pickup or out_for_delivery
- Assigned to logistics

**Example**:
```
Order #11 - Created 12 hours ago
Status: approved, Delivery: out_for_delivery
Logistic: Judel Macasinag
Ready Time: 8 hours ago
```

### 4. Delivered Orders (6 orders)

**Purpose**: Test completed orders

**Characteristics**:
- Created 1-7 days ago
- Status: approved, Delivery: delivered
- Some confirmed by customer, some not
- Creates Sales record if confirmed

**Example**:
```
Order #15 - Created 3 days ago, Delivered 2 days ago
Status: delivered, Confirmed: Yes
Customer Rating: 5 stars
```

### 5. Historical Orders (8 orders)

**Purpose**: Test pagination with older data

**Characteristics**:
- Created 2-12 weeks ago
- All delivered and confirmed
- Has customer ratings and feedback
- Creates Sales records

**Example**:
```
Order #21 - Created 8 weeks ago, Delivered 8 weeks ago
Status: delivered, Confirmed: Yes
Rating: 4 stars
Feedback: "Excellent quality! Will definitely order again."
```

### 6. Rejected/Cancelled Orders (3 orders)

**Purpose**: Test failed order scenarios

**Characteristics**:
- Created 1-14 days ago
- Status: rejected or cancelled
- Has admin notes explaining reason
- No delivery status

**Example**:
```
Order #29 - Created 5 days ago, Rejected 4 days ago
Status: rejected
Admin Notes: "Insufficient stock available"
```

---

## Lazy Loading Behavior

### Initial Page Load (offset=0, limit=4)

The first 4 orders returned will be the **most recently updated**:

```
GET /customer/orders/history?offset=0&limit=4

Response:
[
  Order #1 - Updated 15 minutes ago (recently updated)
  Order #2 - Updated 30 minutes ago (recently updated)
  Order #3 - Updated 1 hour ago (recently updated)
  Order #4 - Updated 2 hours ago (recently updated)
]
```

### Second Batch (offset=4, limit=4)

```
GET /customer/orders/history?offset=4&limit=4

Response:
[
  Order #5 - Updated 2 hours ago (recently updated)
  Order #6 - Created 6 hours ago (pending)
  Order #7 - Created 12 hours ago (pending)
  Order #8 - Created 18 hours ago (pending)
]
```

### Subsequent Batches

Continue loading 4 orders at a time until all 31 orders are loaded.

---

## Sorting Logic

Orders are sorted by `updated_at DESC` to ensure:

1. **Recently modified orders appear first** (admin updates)
2. **New orders appear near the top**
3. **Older orders appear at the bottom**
4. **Consistent ordering** across page loads

### SQL Query

```sql
SELECT * FROM sales_audit
WHERE customer_id = ?
ORDER BY updated_at DESC
LIMIT 4 OFFSET 0;
```

---

## Testing Scenarios

### Test 1: Initial Load
```bash
# Expected: 4 most recently updated orders
curl "http://localhost/customer/orders/history?offset=0&limit=4"
```

### Test 2: Load More
```bash
# Expected: Next 4 orders
curl "http://localhost/customer/orders/history?offset=4&limit=4"
```

### Test 3: Filter by Status
```bash
# Expected: Only pending orders
curl "http://localhost/customer/orders/history?offset=0&limit=4&delivery_status=pending"
```

### Test 4: Single Order Fetch
```bash
# Expected: Specific order details
curl "http://localhost/customer/orders/1"
```

---

## Data Integrity

### Stock Management

The seeder properly manages stock quantities:

```php
// For approved orders only
if ($order->status === 'approved') {
    $stock->decrement('quantity', $quantity);
    $stock->increment('sold_quantity', $quantity);
}
```

### Financial Calculations

All orders have correct financial breakdown:

```php
$subtotal = sum(item_price * quantity);
$coopShare = $subtotal * 0.10;  // 10% co-op share
$memberShare = $subtotal;        // 100% to members
$totalAmount = $subtotal + $coopShare;  // Customer pays
```

### Audit Trail

Every order item is tracked in `audit_trail`:

```php
AuditTrail::create([
    'sale_id' => $order->id,
    'product_id' => $product->id,
    'stock_id' => $stock->id,
    'member_id' => $member->id,
    'quantity' => $quantity,
    'unit_price' => $price,
    // ... more fields
]);
```

---

## Customization

### Adjust Order Counts

Edit the seeder to change how many orders are created:

```php
// In OrderHistoryLazyLoadingSeeder.php

// Change these numbers:
$this->createRecentlyUpdatedOrders(..., 5);  // Change 5 to desired count
$this->createPendingOrders(..., 5);          // Change 5 to desired count
$this->createOutForDeliveryOrders(..., 4);   // Change 4 to desired count
// ... etc
```

### Adjust Timestamp Ranges

Modify the timestamp generation:

```php
// Make orders more recent
$createdAt = Carbon::now()->subHours(rand(1, 24));  // Last 24 hours

// Make orders older
$createdAt = Carbon::now()->subMonths(rand(1, 6));  // Last 6 months
```

### Add More Customers

To seed orders for multiple customers:

```php
$customers = User::where('type', 'customer')->get();

foreach ($customers as $customer) {
    // Create orders for each customer
    $this->createRecentlyUpdatedOrders($customer, ...);
    // ... etc
}
```

---

## Verification

### Check Order Count

```sql
SELECT COUNT(*) FROM sales_audit WHERE customer_id = 1;
-- Expected: 31 orders
```

### Check Sorting

```sql
SELECT id, status, created_at, updated_at 
FROM sales_audit 
WHERE customer_id = 1 
ORDER BY updated_at DESC 
LIMIT 10;
-- Expected: Most recently updated orders first
```

### Check Status Distribution

```sql
SELECT status, COUNT(*) as count 
FROM sales_audit 
WHERE customer_id = 1 
GROUP BY status;

-- Expected:
-- pending: 5
-- approved: 15
-- rejected: 2
-- cancelled: 1
-- delayed: 0-2 (depends on timing)
```

### Check Delivery Status

```sql
SELECT delivery_status, COUNT(*) as count 
FROM sales_audit 
WHERE customer_id = 1 
GROUP BY delivery_status;

-- Expected:
-- pending: 5-7
-- ready_to_pickup: 2-3
-- out_for_delivery: 1-2
-- delivered: 14-16
-- NULL: 3 (rejected/cancelled)
```

---

## Troubleshooting

### Issue: Not enough orders created

**Cause**: Insufficient stock available

**Solution**: 
```bash
# Ensure StockSeeder runs before OrderHistoryLazyLoadingSeeder
php artisan db:seed --class=StockSeeder
php artisan db:seed --class=OrderHistoryLazyLoadingSeeder
```

### Issue: Orders not sorted correctly

**Cause**: `updated_at` not set properly

**Solution**: Check that manual timestamp updates are working:
```php
DB::table('sales_audit')
    ->where('id', $order->id)
    ->update(['updated_at' => $updatedAt]);
```

### Issue: Duplicate orders

**Cause**: Running seeder multiple times

**Solution**: Clear existing data first:
```bash
php artisan migrate:fresh --seed
```

---

## Performance

### Seeding Time

Expected time to seed 31 orders:
- **Development**: 2-5 seconds
- **Production**: 1-3 seconds

### Database Impact

- **sales_audit**: +31 rows
- **audit_trail**: +62-124 rows (2-4 items per order)
- **sales**: +14-16 rows (delivered orders only)
- **stocks**: Updated quantities for approved orders

---

## Integration with Lazy Loading System

### Frontend Integration

The seeded data works perfectly with the lazy loading frontend:

```typescript
// Initial load
const response = await axios.get('/customer/orders/history', {
    params: { offset: 0, limit: 4 }
});
// Returns: 4 most recently updated orders

// Load more
const response = await axios.get('/customer/orders/history', {
    params: { offset: 4, limit: 4 }
});
// Returns: Next 4 orders
```

### Backend Integration

The seeded data is queried efficiently with indexes:

```php
$orders = $user->salesAudit()
    ->orderBy('updated_at', 'desc')
    ->offset($offset)
    ->limit($limit)
    ->get();
```

---

## Summary

The `OrderHistoryLazyLoadingSeeder` provides:

✅ **31 orders per customer** (exceeds 20 minimum)
✅ **Realistic timestamps** with proper sorting
✅ **Various statuses** for comprehensive testing
✅ **Recent updates** to test sorting behavior
✅ **Proper relationships** (audit trails, stocks, sales)
✅ **Financial accuracy** (subtotal, co-op share, total)
✅ **Stock management** (quantities updated correctly)
✅ **Ready for lazy loading** (works with offset/limit)

**Status**: ✅ Complete and ready to use
**Compatibility**: ✅ Works with lazy loading Order History system
**Performance**: ✅ Fast seeding (2-5 seconds)
