# Stock Trails Implementation

This document outlines the implementation of using the `stock_trails` table exclusively for tracking stock addition and removal operations in the AgriCart Admin system.

## Overview

The stock_trails table is designed to maintain a comprehensive history of all stock movements, including:
- Stock creation
- Stock quantity updates
- Stock removal (perished/damaged)
- Stock restoration
- Stock sales to customers
- Stock reversals (order rejections)

## Implementation Details

### Database Structure

The `stock_trails` table includes the following key fields:
- `stock_id`: Foreign key to the stock being modified
- `product_id`: Foreign key to the product
- `member_id`: Foreign key to the supplier member
- `performed_by`: User ID of the admin/staff who performed the action
- `action_type`: Type of action ('created', 'updated', 'removed', 'restored', 'sale', 'reversal')
- `old_quantity`: Previous quantity before the action
- `new_quantity`: New quantity after the action
- `category`: Product category (Kilo, Pc, Tali)
- `notes`: Additional information about the action
- `performed_by_type`: Type of user who performed the action (admin, staff, system)

### Stock Operations Recorded

1. **Stock Creation**
   - When a new stock is added to the system
   - Records initial quantity and member assignment

2. **Stock Updates**
   - When stock quantity or details are modified
   - Records both old and new quantities

3. **Stock Removal**
   - When stock is marked as perished/damaged
   - Records reason for removal

4. **Stock Restoration**
   - When previously removed stock is restored
   - Records restoration details

5. **Stock Sales**
   - When stock is sold to customers through orders
   - Records quantity sold and customer order details

6. **Stock Reversals**
   - When an order is rejected and stock is returned
   - Records quantity restored to inventory

### Implementation Components

1. **StockTrail Model**
   - Provides relationships to Stock, Product, Member, and User models
   - Includes a static `record()` method for easy trail creation

2. **InventoryController**
   - Uses StockTrail data for displaying stock history
   - Loads StockTrail records for the inventory view

3. **InventoryStockController**
   - Records stock trails for all stock CRUD operations
   - Ensures proper recording of stock addition and removal

4. **OrderController**
   - Records stock trails for sales and reversals
   - Maintains accurate stock history when orders are processed

5. **Frontend Components**
   - StockManagement component displays stock trail data
   - Calculates and shows total amounts for sales
   - Provides filtering and sorting of stock trail records

## Benefits

1. **Complete History**: Maintains a comprehensive record of all stock movements
2. **Accountability**: Tracks who performed each action and when
3. **Audit Trail**: Provides detailed information for auditing purposes
4. **Financial Tracking**: Records quantities and can calculate financial impacts
5. **Simplified Data Model**: Uses a single source of truth for stock history

## Usage

The stock trails are displayed in the Inventory Management section under the "Stock Trail" tab. This view shows:
- Date and time of the action
- Product affected
- Quantity changed
- Category
- Member (supplier)
- Action type
- Total amount (for sales)
- Notes

## Future Improvements

1. **Reporting**: Add more detailed reporting based on stock trail data
2. **Analytics**: Implement analytics to identify trends in stock movements
3. **Export**: Add functionality to export stock trail data
4. **Filtering**: Enhance filtering options for stock trail data
