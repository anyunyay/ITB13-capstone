# Trends Page Refactoring Guide

## Overview
The Trends page has been partially refactored to extract reusable components for better code organization and maintainability.

## Created Components

### 1. TrendChart (`resources/js/components/admin/trends/TrendChart.tsx`)
**Purpose:** Renders the price trend line chart with all its configurations.

**Props:**
- `chartData`: Array of data points for the chart
- `selectedProducts`: Array of selected product names
- `timePeriod`: Current time period selection ('specific' | 'monthly' | 'yearly')
- `startDate`, `endDate`: Date range for specific period
- `selectedMonth`, `selectedYear`: Month/year for monthly/yearly periods

**Features:**
- Automatic color generation for products
- Responsive chart sizing
- Custom tooltip with product details
- Smooth animations (500ms duration)
- Conditional rendering based on data validity

### 2. TimePeriodSelector (`resources/js/components/admin/trends/TimePeriodSelector.tsx`)
**Purpose:** Radio button group for selecting time period type.

**Props:**
- `timePeriod`: Current selection
- `onTimePeriodChange`: Callback when selection changes

**Features:**
- Three options: Specific Date, Monthly, Yearly
- Accessible radio buttons with labels
- Responsive layout

### 3. DateSelector (`resources/js/components/admin/trends/DateSelector.tsx`)
**Purpose:** Conditional date/month/year selector based on time period.

**Props:**
- `timePeriod`: Determines which selector to show
- `startDate`, `endDate`: For specific period
- `selectedMonth`, `selectedYear`: For monthly/yearly periods
- `dateValidationError`: Error message to display
- `onStartDateChange`, `onEndDateChange`: Date change callbacks
- `onMonthChange`, `onYearChange`: Month/year change callbacks
- `onValidateDates`: Validation callback

**Features:**
- Calendar popover for specific dates
- Dropdown selectors for month/year
- Automatic future date prevention
- Visual error indicators (red border)
- Conditional rendering based on time period

### 4. ProductSelector (`resources/js/components/admin/trends/ProductSelector.tsx`)
**Purpose:** Category and product selection interface.

**Props:**
- `selectedCategory`: Current category selection
- `selectedProducts`: Array of selected products
- `availableProducts`: Products to display
- `onCategoryChange`: Category change callback
- `onProductSelectionChange`: Product selection callback

**Features:**
- Category dropdown (All, Fruits, Vegetables)
- Product popover with checkboxes
- Products grouped by pricing units
- Maximum 3 products limit
- Warning message when limit reached

### 5. PriceCategoryToggles (`resources/js/components/admin/trends/PriceCategoryToggles.tsx`)
**Purpose:** Toggle switches for price categories (Per Kilo, Per Tali, Per Piece).

**Props:**
- `priceCategoryToggles`: Current toggle states
- `availablePriceCategories`: Categories available for selection
- `selectedProducts`: Products currently selected
- `onToggle`: Toggle change callback

**Features:**
- Three toggle switches
- Automatic disabling based on product selection
- Responsive layout

## Usage Example

```tsx
import {
    TrendChart,
    TimePeriodSelector,
    DateSelector,
    ProductSelector,
    PriceCategoryToggles,
} from '@/components/admin/trends';

// In your component:
<TimePeriodSelector
    timePeriod={timePeriod}
    onTimePeriodChange={handleTimePeriodChange}
/>

<ProductSelector
    selectedCategory={selectedCategory}
    selectedProducts={selectedProducts}
    availableProducts={availableProducts}
    onCategoryChange={handleCategoryChange}
    onProductSelectionChange={handleProductSelectionChange}
/>

<DateSelector
    timePeriod={timePeriod}
    startDate={startDate}
    endDate={endDate}
    selectedMonth={selectedMonth}
    selectedYear={selectedYear}
    dateValidationError={dateValidationError}
    onStartDateChange={setStartDate}
    onEndDateChange={setEndDate}
    onMonthChange={setSelectedMonth}
    onYearChange={setSelectedYear}
    onValidateDates={validateDates}
/>

<PriceCategoryToggles
    priceCategoryToggles={priceCategoryToggles}
    availablePriceCategories={availablePriceCategories}
    selectedProducts={selectedProducts}
    onToggle={handlePriceCategoryToggle}
/>

<TrendChart
    chartData={chartData}
    selectedProducts={selectedProducts}
    timePeriod={timePeriod}
    startDate={startDate}
    endDate={endDate}
    selectedMonth={selectedMonth}
    selectedYear={selectedYear}
/>
```

## Benefits

1. **Reusability:** Components can be used in other pages or contexts
2. **Maintainability:** Each component has a single responsibility
3. **Testability:** Components can be tested in isolation
4. **Readability:** Main page is cleaner and easier to understand
5. **Type Safety:** All props are properly typed
6. **Separation of Concerns:** UI logic separated from business logic

## Next Steps

To complete the refactoring:

1. Replace remaining inline UI code in `index.tsx` with component calls
2. Move validation logic to custom hooks if needed
3. Consider extracting data fetching logic to a custom hook
4. Add unit tests for each component
5. Document component APIs with JSDoc comments

## File Structure

```
resources/js/
├── components/
│   └── admin/
│       └── trends/
│           ├── index.ts                    # Barrel export
│           ├── TrendChart.tsx              # Chart component
│           ├── TimePeriodSelector.tsx      # Time period radio buttons
│           ├── DateSelector.tsx            # Date/month/year selectors
│           ├── ProductSelector.tsx         # Category & product selection
│           └── PriceCategoryToggles.tsx    # Price category toggles
└── pages/
    └── Admin/
        └── Trends/
            ├── index.tsx                   # Main page (to be refactored)
            └── REFACTORING_GUIDE.md        # This file
```

## Notes

- All components use the `useTranslation` hook for i18n
- Components follow the existing UI/UX patterns
- Accessibility features are preserved (labels, ARIA attributes)
- Responsive design is maintained across all components
