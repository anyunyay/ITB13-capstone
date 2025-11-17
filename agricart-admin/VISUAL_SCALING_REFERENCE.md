# Visual Scaling Reference

## 📐 Scale Factor Visualization

This document helps you visualize what the different scale factors mean for your content.

---

## Current Configuration

```
100% Display Scaling (DPR 1.0)  →  Scale: 1.0   (100% size)
125% Display Scaling (DPR 1.25) →  Scale: 0.8   (80% size)
150% Display Scaling (DPR 1.5)  →  Scale: 0.6   (60% size)
175% Display Scaling (DPR 1.75) →  Scale: 0.4   (40% size)
```

---

## Visual Examples

### Example 1: Text Sizing

**Original (100% / DPR 1.0):**
```
Font Size: 16px
Heading: 32px
Button: 14px
```

**At 125% Scaling (DPR 1.25) - Scale 0.8:**
```
Font Size: 12.8px  (16px × 0.8)
Heading: 25.6px    (32px × 0.8)
Button: 11.2px     (14px × 0.8)
```

**At 150% Scaling (DPR 1.5) - Scale 0.6:**
```
Font Size: 9.6px   (16px × 0.6)
Heading: 19.2px    (32px × 0.6)
Button: 8.4px      (14px × 0.6)
```

**At 175% Scaling (DPR 1.75) - Scale 0.4:**
```
Font Size: 6.4px   (16px × 0.4)  ⚠️ Small but readable
Heading: 12.8px    (32px × 0.4)  ⚠️ Small but readable
Button: 5.6px      (14px × 0.4)  ⚠️ Small but usable
```

---

## ⚠️ Warning: 175% Scaling

The 0.2 scale factor for 175%+ scaling is **extremely aggressive** and will likely make content unreadable. Consider using a higher value:

```ts
// Recommended for 175%+
if (dpr >= 1.75) scaleFactor = 0.7;  // 70% size (more reasonable)
```

---

## Practical Impact on Your Application

### Hero Section (text-6xl = 60px)

| Display Scale | Scale Factor | Actual Size | Readable? |
|--------------|--------------|-------------|-----------|
| 100% | 1.0 | 60px | ✅ Yes |
| 125% | 0.8 | 48px | ✅ Yes |
| 150% | 0.6 | 36px | ⚠️ Small |
| 175% | 0.4 | 24px | ⚠️ Small |

### Body Text (text-base = 16px)

| Display Scale | Scale Factor | Actual Size | Readable? |
|--------------|--------------|-------------|-----------|
| 100% | 1.0 | 16px | ✅ Yes |
| 125% | 0.8 | 12.8px | ✅ Yes |
| 150% | 0.6 | 9.6px | ⚠️ Difficult |
| 175% | 0.4 | 6.4px | ⚠️ Small |

### Buttons (py-3 px-6 = 12px 24px)

| Display Scale | Scale Factor | Actual Size | Clickable? |
|--------------|--------------|-------------|------------|
| 100% | 1.0 | 12px × 24px | ✅ Yes |
| 125% | 0.8 | 9.6px × 19.2px | ✅ Yes |
| 150% | 0.6 | 7.2px × 14.4px | ⚠️ Small |
| 175% | 0.4 | 4.8px × 9.6px | ⚠️ Small |

---

## Recommended Adjustments

### For MateBook D15 (125% Scaling)

**Current:** Scale 0.8 (80% size)

This should work well. Content will be 20% smaller, which is noticeable but still readable.

**If too small, try:**
```ts
if (dpr >= 1.25) scaleFactor = 0.85;  // 85% size (15% reduction)
// or
if (dpr >= 1.25) scaleFactor = 0.90;  // 90% size (10% reduction)
```

### For 150% Scaling

**Current:** Scale 0.6 (60% size)

This is quite aggressive. Text at 9.6px may be difficult to read.

**Recommended:**
```ts
if (dpr >= 1.5) scaleFactor = 0.75;  // 75% size (25% reduction)
// or
if (dpr >= 1.5) scaleFactor = 0.80;  // 80% size (20% reduction)
```

### For 175%+ Scaling

**Current:** Scale 0.4 (40% size)

This is **quite aggressive** but more reasonable than before.

**If still too small, try:**
```ts
if (dpr >= 1.75) scaleFactor = 0.60;  // 60% size (40% reduction)
// or
if (dpr >= 1.75) scaleFactor = 0.70;  // 70% size (30% reduction)
```

---

## Balanced Configuration (Recommended)

For a more balanced approach that works across all scaling levels:

```ts
// In resources/js/hooks/use-display-scale.ts
let scaleFactor = 1;
if (dpr >= 1.75) {
  scaleFactor = 0.75;  // 25% reduction (was 0.2)
} else if (dpr >= 1.5) {
  scaleFactor = 0.80;  // 20% reduction (was 0.6)
} else if (dpr >= 1.25) {
  scaleFactor = 0.85;  // 15% reduction (was 0.8)
}
```

This provides:
- **125%:** 15% reduction (more subtle)
- **150%:** 20% reduction (moderate)
- **175%:** 25% reduction (noticeable but readable)

---

## Testing Checklist

### Visual Tests

- [ ] Open application on device with 125% scaling
- [ ] Check hero text is readable
- [ ] Verify body text is comfortable to read
- [ ] Ensure buttons are easily clickable
- [ ] Check images are clear and not pixelated
- [ ] Verify cards and containers look proportional

### Functional Tests

- [ ] All links are clickable
- [ ] Buttons have adequate hit area
- [ ] Forms are usable
- [ ] Modals/dialogs display correctly
- [ ] Navigation menus work properly
- [ ] Carousel controls are accessible

### Responsive Tests

- [ ] Test on mobile (different DPR)
- [ ] Test on tablet
- [ ] Test on desktop (100% scaling)
- [ ] Test on high-DPI display (150%+)
- [ ] Test all Tailwind breakpoints (sm, md, lg, xl)

---

## Quick Comparison

### Conservative (Subtle Changes)
```ts
125% → 0.95 (5% reduction)
150% → 0.90 (10% reduction)
175% → 0.85 (15% reduction)
```
**Best for:** Minimal visual change, maintaining original design

### Moderate (Balanced)
```ts
125% → 0.85 (15% reduction)
150% → 0.80 (20% reduction)
175% → 0.75 (25% reduction)
```
**Best for:** Good balance between scaling and readability

### Aggressive (Current)
```ts
125% → 0.80 (20% reduction)
150% → 0.60 (40% reduction)
175% → 0.40 (60% reduction)
```
**Best for:** High content density with acceptable readability

---

## Real-World Scenarios

### Scenario 1: MateBook D15 User (125% Scaling)

**With Current Settings (0.8):**
- 16px text becomes 12.8px
- 24px heading becomes 19.2px
- 48px hero becomes 38.4px

**User Experience:**
- ✅ More content visible on screen
- ⚠️ Text is noticeably smaller
- ⚠️ May strain eyes for extended reading

### Scenario 2: High-DPI Monitor (150% Scaling)

**With Current Settings (0.6):**
- 16px text becomes 9.6px
- 24px heading becomes 14.4px
- 48px hero becomes 28.8px

**User Experience:**
- ✅ Much more content visible
- ❌ Text is quite small
- ❌ May be difficult to read

### Scenario 3: Accessibility User (175% Scaling)

**With Current Settings (0.4):**
- 16px text becomes 6.4px
- 24px heading becomes 9.6px
- 48px hero becomes 19.2px

**User Experience:**
- ⚠️ Content is quite small
- ⚠️ May be difficult for some users
- ✅ More reasonable than 0.2

---

## Recommendation Summary

### For Your Use Case (MateBook D15 at 125%)

**Option A: Keep Current (Aggressive)**
```ts
if (dpr >= 1.25) scaleFactor = 0.8;  // 20% reduction
```
- More content on screen
- Smaller text (may be too small for some users)

**Option B: Moderate (Recommended)**
```ts
if (dpr >= 1.25) scaleFactor = 0.85;  // 15% reduction
```
- Good balance
- Still readable
- More content than default

**Option C: Conservative**
```ts
if (dpr >= 1.25) scaleFactor = 0.90;  // 10% reduction
```
- Subtle change
- Very readable
- Slight increase in content density

---

## How to Change

1. Open `resources/js/hooks/use-display-scale.ts`
2. Find lines ~35-40 (and ~65-70 in useEffect)
3. Change the scaleFactor values
4. Save the file
5. Refresh browser (Vite HMR will apply changes)

---

## Final Notes

- **Test on actual device** before finalizing
- **Get user feedback** on readability
- **Consider accessibility** - some users need larger text
- **Monitor analytics** - check if users zoom in/out frequently
- **Iterate based on feedback** - adjust values as needed

The current aggressive values (0.8, 0.6, 0.2) will make content significantly smaller. For most applications, more moderate values (0.85, 0.80, 0.75) provide better user experience while still achieving the goal of fitting more content on screen.
