# Stock Removal Reasons Update

## Overview
Updated the Admin Stock Management "Remove Stock" feature to only include three specific removal reasons with clearly defined system impacts.

## Changes Made

### 1. Frontend Changes (`resources/js/components/inventory/remove-stock-modal.tsx`)

**Removed Reasons:**
- Discontinued
- Expired
- Season Ended
- Vendor Inactive
- Under Update
- Regulatory Issue
- Other (with custom text input)

**New Reasons (Only 3):**

1. **Sold Outside**
   - Impact: No impact on the system
   - Does not add revenue or losses
   - Only removes the stock quantity

2. **Damaged / Defective**
   - Impact: Creates a loss in the system
   - Deducts stock and records the loss amount
   - Loss amount is calculated and displayed in stock trail and financial logs

3. **Listing Error**
   - Impact: No impact on the system
   - No revenue or loss recorded
   - Simply removes the incorrect stock quantity

**UI Improvements:**
- Added impact information display that shows when a reason is selected
- Removed the "Other" reason option and custom text input
- Simplified the selection to only the three approved reasons
- Impact descriptions are color-coded (destructive for loss-creating actions)

### 2. Backend Changes (`app/Http/Controllers/Admin/InventoryStockController.php`)

**Validation:**
- Updated validation to only accept the three specific reasons
- Added strict validation: `'reason' => 'required|string|in:Sold Outside,Damaged / Defective,Listing Error'`

**Loss Calculation:**
- For "Damaged / Defective" reason, the system now:
  - Calculates the loss amount based on product price and quantity
  - Records the loss in the stock trail notes
  - Includes loss amount in system logs
  - Displays loss amount in success message

**Stock Trail Recording:**
- Enhanced notes to include impact information:
  - "Sold Outside - No impact on system (no revenue or loss recorded)"
  - "Damaged / Defective - Loss recorded: ₱X,XXX.XX"
  - "Listing Error - No impact on system (incorrect stock quantity removed)"

**System Logging:**
- Added loss_amount to log data when applicable
- Enhanced log context with reason and impact information

## Impact on System

### No Financial Impact:
- **Sold Outside**: Stock removed, no financial records affected
- **Listing Error**: Stock removed, no financial records affected

### Financial Impact:
- **Damaged / Defective**: 
  - Stock removed
  - Loss amount calculated: `quantity × price`
  - Loss recorded in stock trail
  - Loss logged in system logs
  - Loss amount displayed to admin

## Usage

When removing stock:
1. Select the stock to remove
2. Choose one of the three reasons
3. View the impact information displayed below the selection
4. Confirm removal
5. For "Damaged / Defective", the success message will show the loss amount

## Example

**Removing 10 kg of damaged tomatoes at ₱50/kg:**
- Reason: "Damaged / Defective"
- Loss calculated: 10 × 50 = ₱500.00
- Stock trail note: "Damaged / Defective - Loss recorded: ₱500.00"
- Success message: "Stock removed successfully - Loss of ₱500.00 recorded"

## Database

No database migration required. The existing `stock_trails` table structure supports all the necessary fields:
- `notes` field stores the reason and impact information
- System logs store the loss_amount in the metadata

## Testing Checklist

- [ ] Verify only 3 reasons appear in the dropdown
- [ ] Test "Sold Outside" - confirm no loss recorded
- [ ] Test "Damaged / Defective" - confirm loss is calculated and displayed
- [ ] Test "Listing Error" - confirm no loss recorded
- [ ] Check stock trail entries show correct impact information
- [ ] Verify system logs include loss_amount for damaged items
- [ ] Confirm success messages display correctly
- [ ] Test with different categories (Kilo, Pc, Tali)
- [ ] Verify validation rejects invalid reasons

## Notes

- All other stock management logic remains intact
- Stock trail correctly reflects the chosen reason with accurate impact
- The system now provides clear visibility into financial losses from damaged/defective stock
- Admins can easily track and audit stock removals with proper categorization
