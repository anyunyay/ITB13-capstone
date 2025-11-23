# Rating-Based Logistics Selection

## Overview
The logistics recommendation system now automatically selects the **highest-rated** logistics personnel when multiple options are available for the same delivery area.

## How It Works

### Selection Algorithm

When multiple logistics are assigned to the customer's barangay:

1. **Filter by Area**: Find all logistics assigned to customer's barangay
2. **Sort by Rating**: Order them by average rating (highest first)
3. **Prioritize Rated**: Logistics with ratings appear before those without
4. **Alphabetical Fallback**: If ratings are equal, sort by name
5. **Auto-Select Best**: The highest-rated logistic is automatically selected

### Sorting Logic

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
```

## Examples

### Example 1: Clear Winner
```
Customer Location: Sala
Available Logistics:
  - Judel Macasinag (★4.8, 12 ratings)
  - Maria Santos (★4.2, 8 ratings)
  - Pedro Garcia (★3.9, 5 ratings)

✓ Recommended: Judel Macasinag (★4.8)
```

### Example 2: Rated vs Unrated
```
Customer Location: Banlic
Available Logistics:
  - Juan Dela Cruz (★4.5, 10 ratings)
  - New Logistic (No ratings yet)

✓ Recommended: Juan Dela Cruz (★4.5)
Reason: Has proven track record
```

### Example 3: Equal Ratings
```
Customer Location: Bigaa
Available Logistics:
  - Anna Santos (★4.7, 15 ratings)
  - Carlos Reyes (★4.7, 12 ratings)

✓ Recommended: Anna Santos (★4.7)
Reason: Alphabetically first when ratings are equal
```

### Example 4: All Unrated
```
Customer Location: Casile
Available Logistics:
  - Zara Lopez (No ratings)
  - Alex Cruz (No ratings)

✓ Recommended: Alex Cruz
Reason: Alphabetically first when no ratings available
```

## Benefits

### For Admins
- **Time Savings**: Best logistic automatically selected
- **Quality Assurance**: Higher-rated logistics prioritized
- **Confidence**: Data-driven recommendations
- **Flexibility**: Can still override if needed

### For Customers
- **Better Service**: Get the best-performing logistics
- **Consistency**: Reliable delivery experience
- **Satisfaction**: Higher chance of positive experience

### For Logistics
- **Motivation**: Good performance leads to more assignments
- **Fair Distribution**: Performance-based allocation
- **Recognition**: High ratings are rewarded
- **Improvement**: Clear incentive to maintain quality

## Rating Display

### In Recommendation Badge
```
┌─────────────────────────────────────┐
│ ✓ Recommended Logistic:             │
│   Judel Macasinag                   │
│   Assigned to area: Sala            │
│   ★ 4.8 / 5 (12 ratings)            │
└─────────────────────────────────────┘
```

### In Dropdown (Sorted by Rating)
```
Recommended for this area:
  ⭐ Judel Macasinag (0912...) - Sala ★4.8
  ⭐ Maria Santos (0917...) - Sala ★4.2
  ⭐ Pedro Garcia (0923...) - Sala ★3.9

Other Logistics:
  Juan Dela Cruz (0928...) - Banlic ★4.5
  ...
```

## Rating Calculation

### Data Source
- **Table**: `sales`
- **Column**: `logistic_rating`
- **Scale**: 1-5 stars
- **Source**: Customer feedback after delivery

### Calculation Method
```php
$ratings = DB::table('sales')
    ->where('logistic_id', $logistic->id)
    ->whereNotNull('logistic_rating')
    ->pluck('logistic_rating');

$average_rating = $ratings->count() > 0 
    ? round($ratings->avg(), 1) 
    : null;

$total_ratings = $ratings->count();
```

### Update Frequency
- Calculated in real-time when loading logistics list
- Always shows current ratings
- Updates immediately after customer provides feedback

## Edge Cases

### No Ratings Available
- Logistic still appears in list
- Sorted alphabetically with other unrated logistics
- Can still be selected and assigned
- Will get rating after first customer feedback

### Single Logistic for Area
- Automatically selected regardless of rating
- Rating still displayed for transparency
- Admin can see performance history

### All Logistics Have Same Rating
- Sorted alphabetically by name
- First alphabetically is auto-selected
- All shown with same priority

### New Logistics
- Appear after rated logistics
- Sorted alphabetically among unrated
- Get priority once they receive ratings

## Performance Considerations

### Sorting Performance
- **Client-Side**: Sorting happens in browser
- **Time Complexity**: O(n log n) where n = number of matched logistics
- **Typical Case**: 1-3 logistics per area = instant
- **Worst Case**: 10+ logistics per area = still < 1ms

### Rating Calculation
- **Server-Side**: Calculated when loading logistics
- **Query per Logistic**: One query to sales table
- **Optimization**: Only active logistics queried
- **Cache Potential**: Could be cached if needed

## Configuration

### Current Settings
- **Primary Sort**: Rating (highest first)
- **Secondary Sort**: Name (alphabetical)
- **Priority**: Rated over unrated

### Alternative Configurations

If you want to change the selection logic, edit `logistic-assignment.tsx`:

**Equal Weight (No Rating Priority)**:
```typescript
const sortedRecommendedLogistics = [...recommendedLogistics].sort((a, b) => {
  return a.name.localeCompare(b.name); // Just alphabetical
});
```

**Minimum Rating Threshold**:
```typescript
const sortedRecommendedLogistics = [...recommendedLogistics]
  .filter(l => !l.average_rating || l.average_rating >= 4.0) // Only 4+ stars
  .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
```

**Weighted by Rating Count**:
```typescript
const sortedRecommendedLogistics = [...recommendedLogistics].sort((a, b) => {
  // More weight to logistics with more ratings
  const scoreA = (a.average_rating || 0) * Math.log(a.total_ratings + 1);
  const scoreB = (b.average_rating || 0) * Math.log(b.total_ratings + 1);
  return scoreB - scoreA;
});
```

## Testing Scenarios

### Test 1: Multiple Rated Logistics
1. Create 3 logistics assigned to "Sala"
2. Give them ratings: 4.8, 4.2, 3.9
3. Create order for customer in "Sala"
4. Verify highest-rated (4.8) is auto-selected

### Test 2: Mixed Rated/Unrated
1. Create 2 logistics assigned to "Banlic"
2. One with rating 4.5, one without rating
3. Create order for customer in "Banlic"
4. Verify rated logistic is auto-selected

### Test 3: Equal Ratings
1. Create 2 logistics assigned to "Bigaa"
2. Give both rating 4.7
3. Create order for customer in "Bigaa"
4. Verify alphabetically first is auto-selected

### Test 4: Rating Updates
1. Assign logistic with rating 4.0
2. Customer gives new rating of 5.0
3. Check that average updates
4. Verify new average affects future recommendations

## Monitoring & Analytics

### Metrics to Track
- **Selection Rate**: How often highest-rated is chosen
- **Override Rate**: How often admins change selection
- **Rating Distribution**: Spread of ratings across logistics
- **Assignment Balance**: Are high-rated logistics overloaded?

### Success Indicators
- ✅ High-rated logistics get more assignments
- ✅ Low override rate (admins trust recommendations)
- ✅ Improving average ratings over time
- ✅ Balanced workload despite rating differences

## Future Enhancements

1. **Load Balancing**: Prevent over-assignment to top-rated logistics
2. **Time-Based**: Consider recent ratings more heavily
3. **Delivery Speed**: Factor in average delivery time
4. **Customer Preference**: Remember customer's preferred logistics
5. **Area Expertise**: Weight ratings from same area more heavily
6. **Availability**: Check if logistic is currently available
7. **Capacity**: Consider current workload before recommending

---

**Implementation Date**: November 24, 2025
**Status**: ✅ Active
**Version**: 1.1 (Rating-Based Selection)
