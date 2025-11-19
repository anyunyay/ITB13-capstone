# Logistics Report Mobile Optimization Update

## Overview
Updated the Logistic Report page with mobile-specific optimizations including pagination and layout adjustments for screens < 768px width while keeping the desktop layout unchanged.

## Changes Made

### File Modified
- `resources/js/pages/Logistic/report.tsx`

### Implementation Details

#### 1. Mobile Detection
   - Added `isMobile` state to track screen size
   - Implemented `useEffect` hook to detect screen width changes
   - Mobile breakpoint set at 768px (matches Tailwind's `md` breakpoint)

#### 2. Dynamic Pagination
   - Added `per_page=5` parameter to API requests when on mobile
   - Desktop maintains default pagination (unchanged)
   - Mobile pagination applies to:
     - Initial page load
     - Filter applications
     - Filter clearing

#### 3. Automatic Adjustment
   - On initial load, if mobile is detected and per_page is not 5, automatically requests data with mobile pagination
   - Responds to window resize events to adjust pagination when switching between mobile/desktop views

#### 4. Mobile Layout Reorganization
   - **Back to Dashboard Button**: Moved above the title, full width
   - **Title Section**: Positioned between Back button and Export buttons
   - **Export Buttons**: Placed in a 2-column grid (CSV | PDF) spanning full width
   - All elements properly spaced with consistent gaps

## Layout Comparison

### Mobile Layout (< 768px)
```
┌─────────────────────────────┐
│  Back to Dashboard (full)   │
├─────────────────────────────┤
│  Logistics Report Title     │
│  Description                │
├─────────────────────────────┤
│  Export CSV  │  Export PDF  │
└─────────────────────────────┘
```

### Desktop Layout (≥ 768px)
```
┌──────────────────────────────────────────────┐
│  Title & Description    │  Back │ CSV │ PDF │
└──────────────────────────────────────────────┘
```

## How It Works

- **Mobile (< 768px)**: 
  - Shows 5 orders per page
  - Vertical button layout with reorganized header
  - Full-width buttons for better touch targets
  
- **Desktop (≥ 768px)**: 
  - Shows default number of orders per page
  - Horizontal layout with buttons on the right
  - Original desktop layout preserved

## Testing

To test the implementation:
1. Open the Logistic Report page on a mobile device or resize browser to < 768px
2. Verify the button layout:
   - Back to Dashboard button appears first (full width)
   - Title appears below the Back button
   - Export buttons appear in a row below the title
3. Verify that only 5 orders are displayed per page
4. Navigate through pages to confirm pagination works correctly
5. Resize to desktop view and verify original layout is restored
6. Apply filters on mobile and confirm 5 items per page is maintained
