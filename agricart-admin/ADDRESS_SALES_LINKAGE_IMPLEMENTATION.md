# Address-Sales Linkage Implementation

## Overview
This implementation links the `user_addresses` table to the `sales` table to preserve each order's original delivery address reference, allowing customers to change their current address without affecting previous orders.

## Changes Made

### 1. Database Migration
- **File**: `database/migrations/2025_10_08_140934_add_address_id_to_sales_table.php`
- **Changes**: Added `address_id` foreign key column to `sales` table
- **Purpose**: Links each sale to the specific address used for that order

### 2. Model Updates

#### Sales Model (`app/Models/Sales.php`)
- Added `address_id` to `$fillable` array
- Added `address()` relationship method linking to `UserAddress` model

#### UserAddress Model (`app/Models/UserAddress.php`)
- Added `sales()` relationship method for reverse relationship
- Added `HasMany` import for relationship type

### 3. Controller Updates

#### CartController (`app/Http/Controllers/Customer/CartController.php`)
- Updated checkout process to save `address_id` when creating sales
- Maintains backward compatibility with existing `delivery_address` text field

#### OrderController (`app/Http/Controllers/Admin/OrderController.php`)
- Updated queries to load `address` relationship
- Added `order_address` data to order transformations
- Maintains existing `delivery_address` text field for backward compatibility

### 4. Testing
- **File**: `tests/Feature/OrderApprovalTest.php`
- Added `test_sales_address_relationship_works()` test
- Verifies both forward and reverse relationships work correctly
- Confirms database integrity

## Benefits

1. **Address Preservation**: Each order maintains a reference to the exact address used at the time of order creation
2. **Customer Flexibility**: Customers can change their current address without affecting previous orders
3. **Data Integrity**: Historical order data remains accurate and unchanged
4. **Backward Compatibility**: Existing `delivery_address` text field is preserved
5. **Audit Trail**: Complete address history is maintained for each order

## Database Schema

```sql
-- Sales table now includes:
ALTER TABLE sales ADD COLUMN address_id BIGINT UNSIGNED NULL;
ALTER TABLE sales ADD CONSTRAINT sales_address_id_foreign 
    FOREIGN KEY (address_id) REFERENCES user_addresses(id) ON DELETE SET NULL;
CREATE INDEX sales_address_id_index ON sales(address_id);
```

## Usage Examples

### Creating a Sale with Address Reference
```php
$sale = Sales::create([
    'customer_id' => $customer->id,
    'status' => 'pending',
    'delivery_address' => $address->street . ', ' . $address->barangay . ', ' . $address->city . ', ' . $address->province,
    'address_id' => $address->id, // New: Link to address record
]);
```

### Accessing Order Address Information
```php
// Get the address used for a specific order
$orderAddress = $sale->address;

// Get all orders that used a specific address
$ordersForAddress = $address->sales;
```

### Frontend Integration
The admin order views now receive both:
- `delivery_address`: Text field (existing)
- `order_address`: Structured address object (new)

## Migration Notes

- The migration is backward compatible
- Existing orders will have `address_id` as `NULL`
- New orders will have both `delivery_address` text and `address_id` reference
- No data loss occurs during migration

## Testing

Run the test to verify the implementation:
```bash
php artisan test --filter="test_sales_address_relationship_works"
```

## Future Enhancements

1. **Address History View**: Display address changes over time for customers
2. **Order Address Comparison**: Show differences between current and order addresses
3. **Address Analytics**: Track most used addresses, delivery success rates by address
4. **Migration Tool**: Option to populate `address_id` for existing orders based on `delivery_address` text matching
