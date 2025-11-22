# Updated UserSeeder - Customer Information

## Changes Made

Added **3 additional customers** to the UserSeeder for better testing of suspicious order patterns.

## Customer Accounts Created

### 1. Test Customer (Original)
- **Name**: Test Customer
- **Email**: `customer@customer.com`
- **Password**: `12345678`
- **Contact**: 09111222333
- **Address**: 321 Customer Avenue, Sala, Cabuyao, Laguna

### 2. John Doe (NEW)
- **Name**: John Doe
- **Email**: `john.doe@customer.com`
- **Password**: `12345678`
- **Contact**: 09123456789
- **Address**: 456 Main Street, Pulo, Cabuyao, Laguna

### 3. Jane Smith (NEW)
- **Name**: Jane Smith
- **Email**: `jane.smith@customer.com`
- **Password**: `12345678`
- **Contact**: 09234567890
- **Address**: 789 Oak Avenue, Banlic, Cabuyao, Laguna

### 4. Bob Johnson (NEW)
- **Name**: Bob Johnson
- **Email**: `bob.johnson@customer.com`
- **Password**: `12345678`
- **Contact**: 09345678901
- **Address**: 101 Pine Road, Mamatid, Cabuyao, Laguna

## Total Users Created by UserSeeder

- **1 Admin**: Samuel Salazar
- **2 Logistics**: Judel Macasinag, Elmo V. Republica
- **12 Members**: Various farmers
- **4 Customers**: Test Customer, John Doe, Jane Smith, Bob Johnson

## Running the Seeder

```bash
# Run UserSeeder only
php artisan db:seed --class=UserSeeder

# Or run all seeders
php artisan db:seed
```

## Testing Suspicious Orders

With 4 customers, the `SuspiciousOrderSeeder` can now create more diverse test scenarios:

- **Customer 1** (Test Customer): Used for Scenario 1 and 4
- **Customer 2** (John Doe): Used for Scenario 2
- **Customer 3** (Jane Smith): Used for Scenario 3
- **Customer 4** (Bob Johnson): Available for additional testing

## Login Credentials

All customer accounts use the same password for easy testing:

```
Email: customer@customer.com
Password: 12345678

Email: john.doe@customer.com
Password: 12345678

Email: jane.smith@customer.com
Password: 12345678

Email: bob.johnson@customer.com
Password: 12345678
```

## Benefits

✅ **More test data**: 4 customers instead of 1
✅ **Better coverage**: Can test multiple suspicious patterns
✅ **Realistic scenarios**: Different names and addresses
✅ **Easy identification**: Clear naming (John Doe, Jane Smith, etc.)
✅ **Diverse locations**: Different barangays for variety

## Usage with SuspiciousOrderSeeder

The `SuspiciousOrderSeeder` will automatically use these customers:

```php
// Scenario 1: Test Customer - 3 orders in 8 minutes
// Scenario 2: John Doe - 4 orders in 9 minutes  
// Scenario 3: Jane Smith - 2 orders in 5 minutes
// Scenario 4: Test Customer - 2 orders in 7 minutes (different session)
// Scenario 5: Test Customer - 2 normal orders (NOT suspicious)
```

## Quick Test Flow

```bash
# 1. Seed users (includes 4 customers)
php artisan db:seed --class=UserSeeder

# 2. Seed products and stocks (if needed)
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=StockSeeder

# 3. Seed suspicious orders
php artisan db:seed --class=SuspiciousOrderSeeder

# 4. View results
# Visit: /admin/orders/suspicious
```

---

**Updated**: November 22, 2025
**Total Customers**: 4
**Status**: ✅ Ready for Testing
