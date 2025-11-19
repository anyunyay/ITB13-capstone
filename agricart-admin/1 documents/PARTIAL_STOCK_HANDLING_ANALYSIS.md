# Partial Stock Handling Analysis Report

## Executive Summary

This technical report provides a comprehensive analysis of partial stock handling implementation across the Agricart Admin system. The system implements a sophisticated partial stock management system that tracks stock quantities through various states (available, partial, sold) and maintains detailed audit trails for all stock movements.

## System Overview

The partial stock handling system operates on a multi-state model where stocks can transition between:
- **Available**: Stock with quantity > 0 and no customer assignment
- **Partial**: Stock with quantity > 0 and assigned to a customer (last_customer_id set)
- **Sold**: Stock with quantity = 0 and assigned to a customer
- **Removed**: Stock marked as removed (soft deleted)

## Key Components Analysis

### 1. Database Schema

#### Stocks Table (`stocks`)
```sql
- id (Primary Key)
- product_id (Foreign Key to products)
- quantity (Decimal - core field for partial tracking)
- member_id (Foreign Key to users)
- category (String: Kilo, Pc, Tali)
- status (String: partial, sold, removed, null)
- last_customer_id (Foreign Key to users - tracks customer assignment)
- removed_at (Timestamp - soft delete)
- notes (Text)
- timestamps
```

#### Audit Trails Table (`audit_trails`)
```sql
- id (Primary Key)
- sale_id (Foreign Key to sales_audit)
- stock_id (Foreign Key to stocks)
- product_id (Foreign Key to products)
- category (String)
- quantity (Decimal - quantity deducted from stock)
- price_kilo, price_pc, price_tali (Decimal - stored prices)
- unit_price (Decimal)
- timestamps
```

#### Sales Audit Table (`sales_audit`)
```sql
- id (Primary Key)
- customer_id (Foreign Key to users)
- total_amount, subtotal, coop_share, member_share (Decimal)
- status (Enum: pending, approved, rejected, expired, delayed, cancelled)
- delivery_status (Enum: pending, ready_to_pickup, out_for_delivery, delivered)
- admin_id, logistic_id (Foreign Key to users)
- timestamps
```

### 2. Model Implementations

#### Stock Model (`app/Models/Stock.php`)

**Key Scopes for Partial Handling:**
- `scopePartial()`: Stocks with quantity > 0, last_customer_id set, not removed
- `scopeSold()`: Stocks with quantity = 0, last_customer_id set, not removed
- `scopeAvailable()`: Stocks with quantity > 0, no last_customer_id, not removed
- `scopeCustomerVisible()`: Stocks with quantity > 0, not removed (includes both available and partial)

**Critical Methods:**
- `setPartialStatus()`: Sets status to 'partial' when quantity > 0 and customer assigned
- `setSoldStatus()`: Sets status to 'sold' when quantity = 0 and customer assigned
- `remove()`: Soft deletes stock
- `restore()`: Restores removed stock

#### SalesAudit Model (`app/Models/SalesAudit.php`)

**Key Methods for Partial Handling:**
- `getAggregatedAuditTrail()`: Combines quantities from different stock sources
- `hasSufficientStock()`: Validates stock availability before approval
- `getInsufficientStockItems()`: Returns items with insufficient stock

#### AuditTrail Model (`app/Models/AuditTrail.php`)

**Key Methods:**
- `getSalePrice()`: Returns price based on category
- `storeProductPrices()`: Stores product prices at time of sale

### 3. Controller Logic

#### Cart Controller (`app/Http/Controllers/Customer/CartController.php`)

**Partial Stock Processing Logic:**
```php
// Lines 248-296: Checkout process
foreach ($cart->items as $item) {
    $stocks = Stock::customerVisible()
        ->where('product_id', $item->product_id)
        ->where('category', $item->category)
        ->orderBy('created_at', 'asc')
        ->get();
    
    $totalAvailable = $stocks->sum('quantity');
    
    if ($totalAvailable < $item->quantity) {
        // Error handling
    }
    
    $remainingQty = $item->quantity;
    foreach ($stocks as $stock) {
        $deduct = min($stock->quantity, $remainingQty);
        // Create audit trail record
        AuditTrail::create([...]);
        $remainingQty -= $deduct;
    }
}
```

#### Order Controller (`app/Http/Controllers/Admin/OrderController.php`)

**Stock Deduction Logic:**
```php
// Lines 289-306: Order approval process
foreach ($order->auditTrail as $trail) {
    if ($trail->stock) {
        $trail->stock->quantity -= $trail->quantity;
        $trail->stock->last_customer_id = $order->customer_id;
        $trail->stock->save();
        
        // Set status based on remaining quantity
        if ($trail->stock->quantity == 0) {
            $trail->stock->setSoldStatus();
        } else {
            $trail->stock->setPartialStatus();
        }
    }
}
```

### 4. Data Flow Analysis

#### Order Processing Flow:
1. **Cart Creation**: Customer adds items to cart
2. **Stock Validation**: System checks available stock using `customerVisible()` scope
3. **Audit Trail Creation**: Creates audit trail records with stored prices (no stock deduction yet)
4. **Order Submission**: Creates SalesAudit record with 'pending' status
5. **Admin Approval**: 
   - Validates sufficient stock using `hasSufficientStock()`
   - Deducts quantities from stocks
   - Sets `last_customer_id` on affected stocks
   - Updates stock status (partial/sold)
   - Changes order status to 'approved'

#### Stock State Transitions:
```
Available Stock (quantity > 0, last_customer_id = null)
    ↓ [Order Approval]
Partial Stock (quantity > 0, last_customer_id = customer_id, status = 'partial')
    ↓ [Further Sales]
Sold Stock (quantity = 0, last_customer_id = customer_id, status = 'sold')
```

### 5. Notification System

#### Low Stock Alerts (`app/Console/Commands/CheckLowStockAlerts.php`)
- Monitors both available and partial stocks
- Separate thresholds for available (default: 10) and partial (default: 5) stocks
- Sends notifications to members when stocks fall below thresholds

#### Stock Status Notifications
- `ProductSaleNotification`: Sent to members when stock is sold/partially sold
- `LowStockAlertNotification`: Sent when stock falls below threshold

## Identified Issues and Inconsistencies

### 1. Critical Issues

#### Issue 1: Race Condition in Stock Deduction
**Location**: `app/Http/Controllers/Admin/OrderController.php:292`
**Problem**: No database-level locking during stock deduction
**Impact**: Potential negative quantities if multiple orders processed simultaneously
**Recommendation**: Implement database transactions with row-level locking

#### Issue 2: Incomplete Error Handling in CheckLowStockAlerts
**Location**: `app/Console/Commands/CheckLowStockAlerts.php:62-65`
**Problem**: Missing condition check for recent alerts on partial stocks
**Impact**: Duplicate notifications may be sent
**Code**: 
```php
foreach ($partialLowStocks as $stock) {
    // Missing: if (!$this->hasRecentAlert($stock)) {
        $stock->member->notify(new LowStockAlertNotification($stock, $partialThreshold));
        $partialAlertCount++;
    // Missing: }
}
```

#### Issue 3: Potential Negative Quantity Edge Case
**Location**: `app/Http/Controllers/Admin/OrderController.php:292`
**Problem**: No validation to prevent negative quantities
**Impact**: System could allow negative stock quantities
**Recommendation**: Add validation: `max(0, $trail->stock->quantity - $trail->quantity)`

### 2. Minor Issues

#### Issue 4: Inconsistent Status Field Usage
**Location**: `app/Models/Stock.php`
**Problem**: Status field is nullable and not consistently used
**Impact**: Some stocks may have null status when they should be 'partial' or 'sold'

#### Issue 5: Missing Validation in Stock Updates
**Location**: `app/Http/Controllers/Admin/InventoryStockController.php:114`
**Problem**: Only validates minimum quantity (0.01) but not maximum
**Impact**: Could allow unrealistic quantities

### 3. Data Integrity Concerns

#### Issue 6: Orphaned Audit Trail Records
**Location**: `app/Http/Controllers/Customer/CartController.php:303-305`
**Problem**: If checkout fails, audit trail records are deleted but stock validation might have changed
**Impact**: Potential data inconsistency

#### Issue 7: Missing Foreign Key Constraints
**Location**: Database migrations
**Problem**: Some relationships lack proper foreign key constraints
**Impact**: Data integrity issues

## Recommendations

### 1. Immediate Fixes Required

1. **Fix Race Condition**: Implement database transactions with row-level locking
2. **Fix Low Stock Alert Logic**: Add missing condition check for partial stocks
3. **Add Negative Quantity Protection**: Implement validation to prevent negative quantities

### 2. Short-term Improvements

1. **Enhance Error Handling**: Add comprehensive error handling for all stock operations
2. **Implement Audit Trail Cleanup**: Add proper cleanup for failed transactions
3. **Add Quantity Validation**: Implement maximum quantity limits

### 3. Long-term Enhancements

1. **Implement Stock Reservation System**: Reserve stock during checkout process
2. **Add Stock Movement History**: Track all stock movements with timestamps
3. **Implement Stock Reconciliation**: Add periodic reconciliation processes

## File Locations Summary

### Core Models
- `app/Models/Stock.php` - Main stock model with partial handling logic
- `app/Models/SalesAudit.php` - Order management with stock validation
- `app/Models/AuditTrail.php` - Stock movement tracking
- `app/Models/Sales.php` - Completed sales records

### Controllers
- `app/Http/Controllers/Customer/CartController.php` - Cart and checkout logic
- `app/Http/Controllers/Admin/OrderController.php` - Order approval and stock deduction
- `app/Http/Controllers/Admin/InventoryStockController.php` - Stock management
- `app/Http/Controllers/Member/MemberController.php` - Member stock views

### Database Migrations
- `database/migrations/2025_06_24_092805_create_stocks_table.php` - Stocks table
- `database/migrations/2025_07_25_093830_create_audit_trails_table.php` - Audit trails
- `database/migrations/2025_01_01_000001_create_sales_audit_table.php` - Sales audit
- `database/migrations/2025_01_01_000002_create_sales_table.php` - Sales records

### Notifications and Commands
- `app/Notifications/LowStockAlertNotification.php` - Low stock alerts
- `app/Console/Commands/CheckLowStockAlerts.php` - Automated stock monitoring
- `app/Helpers/SystemLogger.php` - System logging

### Frontend Components
- `resources/js/pages/Customer/Cart/index.tsx` - Cart interface
- `resources/js/lib/stock-manager.ts` - Stock management utilities

## Conclusion

The partial stock handling system is well-designed with comprehensive tracking and audit capabilities. However, there are critical issues that need immediate attention, particularly around race conditions and error handling. The system's architecture supports the business requirements but requires refinement to ensure data integrity and prevent edge cases.

The implementation demonstrates good separation of concerns with clear model relationships and proper use of Laravel's Eloquent features. The notification system provides adequate monitoring capabilities, though the alert logic needs correction.

**Priority Actions:**
1. Fix race condition in stock deduction (Critical)
2. Correct low stock alert logic (High)
3. Add negative quantity protection (High)
4. Implement comprehensive error handling (Medium)

This analysis provides a foundation for improving the system's reliability and maintaining data integrity across all partial stock operations.
