# Suspicious Order Seeder - Stock Filter Update

## Summary
Updated the `SuspiciousOrderSeeder` to only generate suspicious orders using products that currently have available stock, ensuring all seeded orders can be approved without validation failures.

## Changes Made

### 1. Enhanced Stock Filtering
**Location:** `database/seeders/SuspiciousOrderSeeder.php`

#### Member Query Enhancement
- Added `whereNull('removed_at')` filter to member stock query
- Ensures only members with active (non-removed) stock are selected

```php
$member = User::where('type', 'member')->whereHas('stocks', function($query) {
    $query->where('quantity', '>', 0)->whereNull('removed_at');
})->first();
```

#### Product Query Enhancement
- Added `whereNull('removed_at')` filter to product stock queries
- Filters products to only those with available, non-removed stock entries
- Ensures stock quantity > 0 for all selected products

```php
$products = Product::with(['stocks' => function($query) use ($member) {
    $query->where('member_id', $member->id)
          ->where('quantity', '>', 0)
          ->whereNull('removed_at');
}])->whereHas('stocks', function($query) use ($member) {
    $query->where('member_id', $member->id)
          ->where('quantity', '>', 0)
          ->whereNull('removed_at');
})->take(20)->get();
```

### 2. Improved Order Creation Logic
**Location:** `createOrder()` method

#### Available Products Filter
- Added runtime filter to verify products have actual available stock before order creation
- Prevents edge cases where stock might have been depleted between queries

```php
$availableProducts = $products->filter(function($product) use ($member) {
    return $product->stocks->where('member_id', $member->id)
                           ->where('quantity', '>', 0)
                           ->whereNull('removed_at')
                           ->isNotEmpty();
});
```

#### Stock Validation
- Enhanced stock retrieval to include `whereNull('removed_at')` check
- Added explicit validation: `if (!$stock || $stock->quantity <= 0) continue;`
- Ensures only valid, available stock is used for orders

#### Quantity Constraints
- Order quantity now respects available stock: `$maxQuantity = min(5, (int)$stock->quantity)`
- Prevents orders from exceeding available stock quantities

### 3. Enhanced Error Handling

#### No Stock Available Scenario
- If no products with available stock are found, seeder now:
  - Displays clear error message
  - Shows warning about skipping generation
  - Exits gracefully without creating invalid orders

```php
if ($products->isEmpty()) {
    $this->command->error('No products with available stock found...');
    $this->command->info('⚠️  Skipping suspicious order generation to avoid creating un-approvable orders.');
    return;
}
```

#### Order Creation Safeguards
- Returns `null` if no available products found during order creation
- Skips products without valid stock or pricing
- Warns about any issues encountered

### 4. Updated Documentation

#### Class-Level Documentation
- Added note about stock availability requirement
- Clarifies that orders are only generated for products with available stock

#### Summary Output Enhancement
- Added line: "All orders use products with available stock"
- Provides clear confirmation of stock validation

## Benefits

1. **Prevents Un-approvable Orders**
   - All seeded orders can be approved without validation failures
   - No orders created for out-of-stock products

2. **Data Integrity**
   - Ensures realistic test data that matches production constraints
   - Respects stock availability rules

3. **Better Testing**
   - Suspicious orders can be fully tested through approval workflow
   - No edge cases with zero-stock products

4. **Graceful Degradation**
   - If no stock available, seeder exits cleanly
   - Clear messaging about why generation was skipped

## Testing Recommendations

1. **Run the seeder:**
   ```bash
   php artisan db:seed --class=SuspiciousOrderSeeder
   ```

2. **Verify all orders:**
   - Check that all created orders have products with available stock
   - Attempt to approve orders to ensure no validation errors
   - Verify order quantities don't exceed available stock

3. **Test edge cases:**
   - Run seeder with no stock available (should skip gracefully)
   - Run seeder with limited stock (should respect quantity limits)
   - Run seeder with removed stock entries (should exclude them)

## Files Modified

- `database/seeders/SuspiciousOrderSeeder.php` - Complete rewrite with stock filtering enhancements
