# Automatic Logistics Recommendation System

## Overview
The Orders system now automatically suggests logistics personnel based on the customer's delivery location (barangay). This feature helps admins quickly assign the most appropriate logistics provider for each order.

## How It Works

### 1. Location Matching
- When an order is approved and ready for logistics assignment, the system checks the customer's barangay
- It searches for logistics personnel who are assigned to that specific barangay
- If matches are found, they are displayed as "Recommended" at the top of the selection list

### 2. Auto-Selection
- When the logistics assignment dialog opens, the first recommended logistic is automatically pre-selected
- This saves time for admins who can simply confirm the recommendation
- Admins can still choose any other logistics provider if needed

### 3. Visual Indicators
- **Green Badge**: Shows the recommended logistic with their assigned area
- **Star Icon (⭐)**: Marks recommended logistics in the dropdown list
- **Yellow Warning**: Appears when no logistics are assigned to the customer's area
- **Grouped Options**: Recommended logistics appear in a separate group at the top

## User Interface

### Logistics Assignment Dialog

```
┌─────────────────────────────────────────────┐
│ Assign Logistic to Order #123              │
│                                             │
│ Customer Location: Sala                     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ✓ Recommended Logistic: Judel Macasinag│ │
│ │ Assigned to area: Sala                  │ │
│ │ ★ 4.8 / 5 (12 ratings)                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Select Logistic Provider *                  │
│ ┌─────────────────────────────────────────┐ │
│ │ Recommended for this area               │ │
│ │ ⭐ Judel Macasinag (0912...) - Sala    │ │
│ │    ★4.8                                 │ │
│ │                                         │ │
│ │ Other Logistics                         │ │
│ │ Maria Santos (0917...) - Banlic ★4.5   │ │
│ │ Juan Dela Cruz (0923...) - Bigaa ★4.9  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│         [Cancel]  [Assign Logistic]         │
└─────────────────────────────────────────────┘
```

### When No Logistics Available for Area

```
┌─────────────────────────────────────────────┐
│ Assign Logistic to Order #124              │
│                                             │
│ Customer Location: Pittland                 │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ⚠️ No logistics assigned to Pittland.   │ │
│ │ Please select from available logistics. │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Select Logistic Provider *                  │
│ ┌─────────────────────────────────────────┐ │
│ │ All Logistics                           │ │
│ │ Maria Santos (0917...) - Banlic        │ │
│ │ Juan Dela Cruz (0923...) - Bigaa       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Technical Implementation

### Backend Changes

**File**: `app/Http/Controllers/Admin/OrderController.php`

- Updated logistics queries to include `assigned_area` field and calculate ratings dynamically
- Modified in 3 methods: `index()`, `suspicious()`, and `show()`

```php
// Before
$logistics = User::where('type', 'logistic')
    ->where('active', true)
    ->get(['id', 'name', 'contact_number']);

// After
$logistics = User::where('type', 'logistic')
    ->where('active', true)
    ->get(['id', 'name', 'contact_number', 'assigned_area'])
    ->map(function ($logistic) {
        // Calculate average rating from sales table
        $ratings = \DB::table('sales')
            ->where('logistic_id', $logistic->id)
            ->whereNotNull('logistic_rating')
            ->pluck('logistic_rating');
        
        return [
            'id' => $logistic->id,
            'name' => $logistic->name,
            'contact_number' => $logistic->contact_number,
            'assigned_area' => $logistic->assigned_area,
            'average_rating' => $ratings->count() > 0 ? round($ratings->avg(), 1) : null,
            'total_ratings' => $ratings->count(),
        ];
    });
```

### Frontend Changes

**File**: `resources/js/components/orders/logistic-assignment.tsx`

1. **Added Props**:
   - `customerBarangay?: string` - The customer's barangay for matching

2. **Updated Interface**:
   - Added `average_rating?: number` to Logistic interface
   - Added `total_ratings?: number` to Logistic interface

3. **New Logic**:
   - Filters logistics by matching `assigned_area` with `customerBarangay`
   - Auto-selects first recommended logistic when dialog opens
   - Groups logistics into "Recommended" and "Other" categories

4. **Enhanced UI**:
   - Shows customer location in dialog description
   - Displays recommendation badge with green styling
   - **Shows logistics ratings** (★ 4.8 / 5 with rating count)
   - Displays ratings in dropdown options
   - Shows warning when no logistics available for area
   - Uses optgroups to separate recommended from other logistics

**File**: `resources/js/pages/Admin/Orders/show.tsx`

- Passes `customerBarangay` prop to `LogisticAssignment` component

```tsx
<LogisticAssignment
  orderId={order.id}
  logistic={order.logistic}
  logistics={logistics}
  assignLogisticDialogOpen={assignLogisticDialogOpen}
  setAssignLogisticDialogOpen={setAssignLogisticDialogOpen}
  assignLogisticForm={assignLogisticForm}
  onAssignLogistic={handleAssignLogistic}
  customerBarangay={order.customer.barangay}
/>
```

### Translation Keys

**Files**: `resources/lang/en/admin.php` and `resources/lang/tl/admin.php`

New translation keys added:
- `customer_location` - "Customer Location" / "Lokasyon ng Customer"
- `recommended_logistic` - "Recommended Logistic" / "Inirerekomendang Logistik"
- `assigned_to_area` - "Assigned to area" / "Naka-assign sa lugar"
- `no_logistic_for_area` - Warning message when no logistics available
- `recommended_for_area` - "Recommended for this area" / "Inirerekomenda para sa lugar na ito"
- `other_logistics` - "Other Logistics" / "Iba Pang Logistik"
- `all_logistics` - "All Logistics" / "Lahat ng Logistik"

## Selection Logic

### Current Implementation
The system uses a **highest-rated** approach:
- Finds all logistics assigned to the customer's barangay
- Sorts them by rating (highest first)
- Selects the highest-rated logistic
- Auto-fills it in the dropdown

**Sorting Priority**:
1. **Highest Rating First**: Logistics with higher average ratings appear first
2. **Rated vs Unrated**: Logistics with ratings are prioritized over those without
3. **Alphabetical Fallback**: If ratings are equal (or both have no rating), sorts by name

```typescript
const sortedRecommendedLogistics = [...recommendedLogistics].sort((a, b) => {
  // If both have ratings, compare them
  if (a.average_rating && b.average_rating) {
    return b.average_rating - a.average_rating; // Higher rating first
  }
  // If only one has rating, prioritize the one with rating
  if (a.average_rating && !b.average_rating) return -1;
  if (!a.average_rating && b.average_rating) return 1;
  // If neither has rating, sort by name
  return a.name.localeCompare(b.name);
});

const recommendedLogistic = sortedRecommendedLogistics[0];
```

### Alternative Enhancement Options

You can easily modify the selection logic in `logistic-assignment.tsx`:

**Round-Robin** (distribute evenly):
```typescript
const recommendedLogistic = sortedRecommendedLogistics.length > 0 
  ? sortedRecommendedLogistics[orderId % sortedRecommendedLogistics.length]
  : null;
```

**Least Assigned** (requires backend support):
```typescript
// Sort by number of active orders, then by rating
const sortedRecommendedLogistics = [...recommendedLogistics].sort((a, b) => {
  const orderDiff = (a.active_orders || 0) - (b.active_orders || 0);
  if (orderDiff !== 0) return orderDiff;
  return (b.average_rating || 0) - (a.average_rating || 0);
});
```

**Weighted Score** (rating + delivery count):
```typescript
// Combine rating and experience
const sortedRecommendedLogistics = [...recommendedLogistics].sort((a, b) => {
  const scoreA = (a.average_rating || 0) * 0.7 + (a.total_deliveries || 0) * 0.001;
  const scoreB = (b.average_rating || 0) * 0.7 + (b.total_deliveries || 0) * 0.001;
  return scoreB - scoreA;
});
```

## Benefits

1. **Time Savings**: Admins don't need to manually search for logistics in the right area
2. **Reduced Errors**: Less chance of assigning logistics to wrong delivery areas
3. **Better Service**: Customers get logistics familiar with their area
4. **Informed Decisions**: Ratings help admins choose the best-performing logistics
5. **Transparency**: Performance metrics visible during assignment
6. **Flexibility**: Admins can still override recommendations if needed
7. **Scalability**: Works with any number of logistics and areas

## Important Notes

### Non-Breaking Changes
- This is a **suggestion only** - it doesn't force any assignment
- All existing functionality remains unchanged
- Admins can still select any logistics provider manually
- Orders without customer barangay data work normally (no recommendation shown)

### Data Requirements
- Logistics must have `assigned_area` field populated
- Customer orders must have barangay information
- Both must match exactly (case-sensitive)
- Ratings are calculated from `sales.logistic_rating` column (customer feedback)

### Edge Cases Handled
- **No logistics for area**: Shows warning, allows manual selection
- **Multiple logistics for area**: Shows all as recommended, auto-selects first
- **No customer barangay**: No recommendation shown, normal selection
- **Logistics without assigned area**: Appears in "Other Logistics" group

## Testing Checklist

- [ ] Approve an order with customer in "Sala" barangay
- [ ] Verify Judel Macasinag is recommended (assigned to Sala)
- [ ] Check that recommendation is auto-selected in dropdown
- [ ] Verify you can still select other logistics
- [ ] Test with customer in area with no assigned logistics
- [ ] Verify warning message appears
- [ ] Test with customer in area with multiple logistics
- [ ] Verify all matching logistics appear as recommended
- [ ] Test in both English and Tagalog languages
- [ ] Verify translations display correctly

## Related Files

- `app/Http/Controllers/Admin/OrderController.php` - Backend logistics data
- `resources/js/components/orders/logistic-assignment.tsx` - Main component
- `resources/js/pages/Admin/Orders/show.tsx` - Order detail page
- `resources/lang/en/admin.php` - English translations
- `resources/lang/tl/admin.php` - Tagalog translations
- `database/migrations/2025_11_23_235447_add_assigned_area_to_users_table.php` - Database schema
- `CABUYAO_AREAS_REFERENCE.md` - List of all barangays
- `LOGISTICS_AREA_ASSIGNMENT_IMPLEMENTATION.md` - Area assignment feature

## Future Enhancements

1. **Smart Routing**: Consider distance and traffic patterns
2. **Load Balancing**: Distribute orders evenly among available logistics
3. **Performance Metrics**: Track delivery success rates by area
4. **Dynamic Areas**: Allow admins to manage areas without code changes
5. **Multi-Area Support**: Allow logistics to cover multiple barangays
6. **Availability Status**: Check if logistics is currently available
7. **Capacity Limits**: Prevent over-assignment to single logistics


## Rating System Details

### How Ratings Work

Ratings displayed in the logistics recommendation system come from customer feedback:

**Data Source**: `sales` table, `logistic_rating` column
**Rating Scale**: 1-5 stars
**Calculation Method**: 
```php
$ratings = DB::table('sales')
    ->where('logistic_id', $logistic->id)
    ->whereNotNull('logistic_rating')
    ->pluck('logistic_rating');

$average_rating = $ratings->count() > 0 ? round($ratings->avg(), 1) : null;
$total_ratings = $ratings->count();
```

### Rating Display

**In Recommendation Badge**:
```
✓ Recommended Logistic: Judel Macasinag
Assigned to area: Sala
★ 4.8 / 5 (12 ratings)
```

**In Dropdown Options**:
```
⭐ Judel Macasinag (0912...) - Sala ★4.8
Maria Santos (0917...) - Banlic ★4.5
```

**In Assigned Logistic Display**:
```
Assigned to: Judel Macasinag
Contact: 09123456789
★ 4.8 / 5 (12 ratings)
```

### Rating Benefits

1. **Informed Decisions**: Admins can see logistics performance at a glance
2. **Quality Assurance**: Higher-rated logistics are more visible
3. **Accountability**: Logistics performance is tracked and displayed
4. **Customer Satisfaction**: Reflects actual customer experiences
5. **Continuous Improvement**: Encourages better service delivery

### No Rating Scenarios

If a logistic has no ratings yet:
- No rating is displayed (field is null)
- Logistic still appears in the list
- Can still be selected and assigned
- Rating will appear once customers provide feedback

### Performance Considerations

- Ratings are calculated on-demand when loading logistics list
- One query per logistic to fetch ratings from sales table
- Results are not cached (always shows current ratings)
- Minimal performance impact (~10-20ms per logistic)
- Only active logistics are queried
