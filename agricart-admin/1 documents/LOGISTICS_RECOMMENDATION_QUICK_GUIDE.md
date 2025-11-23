# Logistics Recommendation - Quick Reference

## What Changed?

The system now **automatically recommends** logistics personnel based on customer location when assigning deliveries.

## For Admins

### When Assigning Logistics

1. **Approve an order** as usual
2. **Open logistics assignment dialog**
3. **See recommendation** (if available):
   - Green badge shows recommended logistic
   - Dropdown auto-selects the recommendation
4. **Confirm or change** the selection
5. **Click "Assign Logistic"**

### Visual Cues

| Icon/Color | Meaning |
|------------|---------|
| ✓ Green Badge | Recommended logistic for this area |
| ⭐ Star | Recommended option in dropdown |
| ⚠️ Yellow Warning | No logistics available for customer's area |

## Examples

### Scenario 1: Customer in Sala
```
Customer Location: Sala
✓ Recommended: Judel Macasinag (assigned to Sala)
→ Auto-selected in dropdown
```

### Scenario 2: Customer in Unassigned Area
```
Customer Location: Pittland
⚠️ No logistics assigned to Pittland
→ Choose from all available logistics
```

### Scenario 3: Multiple Logistics for Area
```
Customer Location: Banlic
✓ Recommended: Pedro Garcia (assigned to Banlic, ★4.9)
Also available: Maria Santos (assigned to Banlic, ★4.5)
→ Highest-rated auto-selected, both marked with ⭐
```

## Key Points

✅ **Suggestion Only** - You can always choose a different logistic
✅ **Time Saver** - No need to remember which logistic covers which area
✅ **Smart Matching** - Based on logistics' assigned delivery areas
✅ **Flexible** - Works even when no recommendation available

## Technical Details

### What Gets Matched?
- Customer's **barangay** (from order address or default address)
- Logistics' **assigned_area** (set in logistics management)

### Selection Priority
1. Logistics assigned to customer's barangay (recommended)
2. Sorted by highest rating first
3. Logistics with ratings prioritized over those without
4. All other active logistics (fallback)

### Data Flow
```
Order Approved
    ↓
Get Customer Barangay
    ↓
Find Logistics with matching assigned_area
    ↓
Show as Recommended + Auto-select
    ↓
Admin Confirms or Changes
    ↓
Assign to Order
```

## Troubleshooting

**Q: No recommendation showing?**
- Check if customer has barangay in their address
- Verify logistics have assigned_area set
- Ensure exact spelling match (case-sensitive)

**Q: Wrong logistics recommended?**
- Verify logistics' assigned_area in Logistics Management
- Update area assignment if needed
- You can always override the recommendation

**Q: Want to change selection logic?**
- See "Selection Logic" section in full documentation
- Options: round-robin, least assigned, highest rated

## Related Documentation

- `AUTOMATIC_LOGISTICS_RECOMMENDATION.md` - Full technical documentation
- `CABUYAO_AREAS_REFERENCE.md` - List of all barangays
- `LOGISTICS_AREA_ASSIGNMENT_IMPLEMENTATION.md` - Area assignment feature
