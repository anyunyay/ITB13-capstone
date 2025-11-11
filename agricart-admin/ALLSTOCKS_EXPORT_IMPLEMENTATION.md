# AllStocks Export Implementation

## Overview
Added CSV and PDF export functionality to the AllStocks page for both Stock Overview and Transaction History views.

## Features Implemented

### 1. Frontend Changes (allStocks.tsx)

#### Export Buttons
- **Desktop Layout**: Positioned on the right side of the page title
- **Mobile Layout**: Positioned below the title description
- **Responsive Design**: Text changes from "Export CSV/PDF" to "CSV/PDF" on small screens
- **Icons**: Download icon for CSV, FileText icon for PDF

#### Export Handler
- Captures current state: pagination, sorting, and filters
- Exports only the data currently visible in the table (respects pagination)
- Includes all applied filters and sorting
- For PDF: Downloads file and opens in new tab for viewing
- For CSV: Downloads file directly

### 2. Backend Changes (MemberController.php)

#### Modified allStocks() Method
- Added format detection (`csv` or `pdf`)
- Added view detection (`stocks` or `transactions`)
- Routes to appropriate export method based on format and view

#### New Export Methods

**exportStocksToCsv()**
- Exports paginated stock data to CSV
- Includes summary statistics (totals from all data)
- UTF-8 BOM for Excel compatibility
- Columns: Product Name, Category, Total Qty, Sold, Available, Unit Price, Revenue, COGS, Profit

**exportStocksToPdf()**
- Exports paginated stock data to PDF
- Professional layout with summary cards
- Color-coded headers (green theme)
- Formatted currency values

**exportTransactionsToCsv()**
- Exports paginated transaction data to CSV
- Includes transaction summary statistics
- Columns: Date, Product, Category, Quantity, Unit Price, Revenue, Customer, Status

**exportTransactionsToPdf()**
- Exports paginated transaction data to PDF
- Professional layout with summary section
- Formatted dates and currency

### 3. PDF Templates

#### member-stocks-pdf.blade.php
- Clean, professional design
- Summary statistics grid (6 metrics)
- Detailed stock table
- Green color scheme matching the app
- Responsive layout

#### member-transactions-pdf.blade.php
- Transaction history layout
- Summary statistics (5 metrics)
- Detailed transaction table
- Customer and status information
- Formatted dates and currency

## Export Behavior

### Data Scope
- **Paginated Data**: Only exports the current page of data visible in the table
- **Filters Applied**: Respects all active filters (category, status)
- **Sorting Applied**: Maintains current sort order
- **Summary Stats**: Always calculated from ALL data (not just current page)

### File Naming Convention
- CSV: `member_stocks_YYYY-MM-DD.csv` or `member_transactions_YYYY-MM-DD.csv`
- PDF: `member_stock_overview_YYYY-MM-DD_HHMMSS.pdf` or `member_transactions_YYYY-MM-DD_HHMMSS.pdf`

## Technical Details

### Frontend
- Uses URLSearchParams to build export URL with all current state
- Creates temporary anchor element for download
- Removes anchor after download
- PDF opens in new tab after download (500ms delay)

### Backend
- CSV uses streaming response for memory efficiency
- PDF uses DomPDF library
- Proper headers for file download
- UTF-8 encoding with BOM for Excel

### Styling
- Consistent with existing app design
- Green (#16a34a) as primary color
- Responsive button sizing
- Icon + text on desktop, icon + short text on mobile

## Usage

1. Navigate to AllStocks page
2. Apply desired filters and sorting
3. Navigate to desired page
4. Click "Export CSV" or "Export PDF"
5. File downloads automatically
6. PDF also opens in new tab for viewing

## Files Modified
- `resources/js/pages/Member/allStocks.tsx`
- `app/Http/Controllers/Member/MemberController.php`

## Files Created
- `resources/views/exports/member-stocks-pdf.blade.php`
- `resources/views/exports/member-transactions-pdf.blade.php`

## Dependencies
- Existing: `barryvdh/laravel-dompdf` (already installed)
- No new dependencies required

## Testing Checklist
- [ ] Export CSV for Stock Overview
- [ ] Export PDF for Stock Overview
- [ ] Export CSV for Transaction History
- [ ] Export PDF for Transaction History
- [ ] Test with filters applied
- [ ] Test with different sorting
- [ ] Test on different pages
- [ ] Test on mobile devices
- [ ] Verify summary statistics are correct
- [ ] Verify PDF opens in new tab
- [ ] Verify CSV opens in Excel correctly
