# Seeder Updates for New Sales Structure

## Overview

This document outlines the updates made to seeders and factories to work with the new sales table structure where:

- **`sales_audit`** table stores all order processing information (pending, approved, rejected, in-progress orders)
- **`sales`** table stores only delivered orders with plain text addresses

## Updated Files

### 1. UrgentOrderTestSeeder.php

**Changes Made:**
- ✅ Added `SalesAudit` and `UserAddress` imports
- ✅ Updated to find customer's default address before creating orders
- ✅ Changed `Sales::create()` to `SalesAudit::create()`
- ✅ Added `address_id` field to link orders to customer addresses
- ✅ Updated method signature to include `$defaultAddress` parameter

**Key Updates:**
```php
// Before
$order = Sales::create([
    'customer_id' => $customer->id,
    'total_amount' => $totalAmount,
    'status' => $status,
    'created_at' => $createdAt,
    'updated_at' => $createdAt,
]);

// After
$order = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => $totalAmount,
    'status' => $status,
    'address_id' => $defaultAddress->id, // NEW: Link to address
    'created_at' => $createdAt,
    'updated_at' => $createdAt,
]);
```

**Verification:**
- ✅ Seeder runs successfully
- ✅ Creates 9 test orders with proper status logic
- ✅ All orders linked to customer's default address
- ✅ Address relationships working correctly

### 2. SalesFactory.php

**Changes Made:**
- ✅ Updated to work with new `Sales` model (delivered orders only)
- ✅ Added `SalesAudit` import for referencing original orders
- ✅ Removed order processing fields (`status`, `delivery_status`, `address_id`, `is_urgent`)
- ✅ Added delivered order fields (`delivery_address`, `sales_audit_id`, `delivered_at`)
- ✅ Removed state methods (pending, approved, rejected) - not applicable to delivered orders

**Key Updates:**
```php
// Before (SalesAudit structure)
return [
    'customer_id' => $customer->id,
    'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
    'delivery_status' => $this->faker->randomElement(['pending', 'out_for_delivery', 'delivered']),
    'address_id' => $address->id,
    'is_urgent' => $this->faker->boolean(20),
    // ...
];

// After (Sales structure - delivered orders only)
return [
    'customer_id' => $customer->id,
    'delivery_address' => $this->faker->streetAddress . ', ' . $this->faker->city . ', ' . $this->faker->state,
    'sales_audit_id' => $salesAudit->id, // Reference to original order
    'delivered_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
    // ...
];
```

### 3. SalesAuditFactory.php (NEW)

**Purpose:** Factory for creating order processing records in `sales_audit` table

**Features:**
- ✅ Creates customers and addresses automatically
- ✅ Links orders to customer addresses via `address_id`
- ✅ Includes all order processing fields (`status`, `delivery_status`, `is_urgent`)
- ✅ State methods for different order statuses (pending, approved, rejected)

**Key Features:**
```php
return [
    'customer_id' => $customer->id,
    'address_id' => $address->id, // Links to customer's address
    'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
    'delivery_status' => $this->faker->randomElement(['pending', 'out_for_delivery', 'delivered']),
    'is_urgent' => $this->faker->boolean(20), // 20% chance of being urgent
    // ...
];
```

### 4. DeliveredSalesFactory.php (NEW)

**Purpose:** Factory for creating delivered order records in `sales` table

**Features:**
- ✅ Creates plain text delivery addresses
- ✅ Links to original orders via `sales_audit_id`
- ✅ Includes delivery-specific fields (`delivered_at`, `logistic_id`)
- ✅ Generates realistic delivery timestamps

**Key Features:**
```php
return [
    'customer_id' => $customer->id,
    'delivery_address' => $this->faker->streetAddress . ', ' . $this->faker->city . ', ' . $this->faker->state,
    'sales_audit_id' => $salesAudit->id, // Reference to original order
    'delivered_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
    'logistic_id' => $logistic->id, // Logistic who delivered
    // ...
];
```

## Testing Results

### Factory Tests
- ✅ **SalesAuditFactory**: Creates order processing records with address links
- ✅ **SalesFactory**: Creates delivered order records with plain text addresses
- ✅ **DeliveredSalesFactory**: Creates delivered order records with proper relationships

### Seeder Tests
- ✅ **UrgentOrderTestSeeder**: Creates 9 test orders with proper status logic
- ✅ **Address Relationships**: All orders properly linked to customer addresses
- ✅ **Status Logic**: Orders correctly categorized as delayed, urgent, or recent

## Usage Examples

### Creating Order Processing Records
```php
// Create a pending order
$order = SalesAudit::factory()->pending()->create();

// Create an approved order
$order = SalesAudit::factory()->approved()->create();

// Create an urgent order
$order = SalesAudit::factory()->create(['is_urgent' => true]);
```

### Creating Delivered Order Records
```php
// Create a delivered order
$deliveredOrder = Sales::factory()->create();

// Create multiple delivered orders
$deliveredOrders = Sales::factory()->count(10)->create();
```

### Running Seeders
```bash
# Run the urgent order test seeder
php artisan db:seed --class=UrgentOrderTestSeeder

# Run all seeders
php artisan db:seed
```

## Benefits

### Data Integrity
- ✅ **Address Preservation**: Orders linked to addresses used at time of creation
- ✅ **Order History**: Complete order processing history in `sales_audit`
- ✅ **Delivery Records**: Only delivered orders in `sales` table

### Testing Support
- ✅ **Realistic Data**: Factories create realistic test data
- ✅ **Relationship Testing**: Proper foreign key relationships
- ✅ **Status Testing**: Different order statuses for testing

### Development Efficiency
- ✅ **Easy Testing**: Quick creation of test data
- ✅ **Consistent Data**: Standardized test data structure
- ✅ **Relationship Support**: Automatic creation of related records

## Migration Compatibility

All seeders and factories are compatible with the new table structure:

- ✅ **sales_audit** table: Order processing records
- ✅ **sales** table: Delivered order records
- ✅ **Foreign key relationships**: Properly maintained
- ✅ **Address linking**: Orders linked to customer addresses

## Summary

The seeder and factory updates successfully support the new sales table structure:

1. **UrgentOrderTestSeeder** creates test orders in `sales_audit` table with address links
2. **SalesAuditFactory** creates order processing records with full functionality
3. **SalesFactory** creates delivered order records with plain text addresses
4. **DeliveredSalesFactory** creates delivered order records with proper relationships

All updates maintain backward compatibility while supporting the new architecture for separating order processing from delivery records.
