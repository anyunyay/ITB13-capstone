# Display Scaling - Quick Start Guide

## ✅ Installation Complete!

Your application now automatically adjusts for display scaling (125%, 150%, etc.) on devices like the MateBook D15.

---

## 🚀 What's Already Working

### Automatic Features (No Code Changes Needed)

1. **Global Scaling** - All content automatically adjusts via `ScaleProvider`
2. **Font Sizing** - Base font size compensates for display scaling
3. **Image Sharpness** - Images render crisp on scaled displays
4. **Responsive Breakpoints** - Tailwind breakpoints work seamlessly

### Files Created

```
✓ resources/js/hooks/use-display-scale.ts
✓ resources/js/components/providers/ScaleProvider.tsx
✓ resources/js/components/ui/adaptive-container.tsx
✓ resources/js/lib/scale-utils.ts
✓ resources/js/app.tsx (updated)
✓ resources/css/app.css (updated)
```

---

## 🧪 Test It Now

### 1. Start Your Dev Server

```bash
npm run dev
```

### 2. Open in Browser

Navigate to `http://localhost:5173`

### 3. Check Scaling

**Option A: Enable Debug Mode**
```tsx
// In resources/js/app.tsx, change:
<ScaleProvider enableAutoScale={true} debugMode={true}>
```

**Option B: Check Console**
```javascript
// Open DevTools (F12) and run:
console.log('DPR:', window.devicePixelRatio);
console.log('Scale:', Math.round(window.devicePixelRatio * 100) + '%');
```

### 4. Test Different Scales

- **Browser Zoom**: Press `Ctrl + Plus/Minus` (or `Cmd + Plus/Minus` on Mac)
- **Windows Display Scaling**: Settings → Display → Scale (100%, 125%, 150%)

---

## 📖 Usage Patterns

### Pattern 1: No Changes (Recommended)

Your existing code works automatically:

```tsx
// This already scales properly!
export default function MyPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <p className="text-lg">Content automatically adjusts</p>
    </div>
  );
}
```

### Pattern 2: Adaptive Container (Optional)

For fine-tuned control:

```tsx
import { AdaptiveContainer } from '@/components/ui/adaptive-container';

export function MyComponent() {
  return (
    <AdaptiveContainer className="p-6">
      <h1>This section has custom scaling</h1>
    </AdaptiveContainer>
  );
}
```

### Pattern 3: Scale Hooks (Advanced)

For custom logic:

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';

export function MyComponent() {
  const { isScaled, scalePercentage } = useDisplayScale();

  return (
    <div>
      {isScaled && <p>Scaled to {scalePercentage}%</p>}
    </div>
  );
}
```

---

## 🎨 CSS Utilities

### Available Classes

```css
/* Automatic scaling based on DPR */
.scale-auto

/* CSS variable-based scaling */
.scale-adaptive

/* Font-size scaling */
.scale-adaptive-text

/* Prevent layout shift */
.scale-stable
```

### Usage Example

```tsx
<div className="scale-auto scale-stable p-6">
  <h1>Scaled Content</h1>
</div>
```

---

## 🔧 Configuration

### Enable/Disable Scaling

```tsx
// In resources/js/app.tsx
<ScaleProvider 
  enableAutoScale={true}  // Set to false to disable
  debugMode={false}       // Set to true for console logs
>
  <App {...props} />
</ScaleProvider>
```

### Adjust Scale Factors

```ts
// In resources/js/hooks/use-display-scale.ts
// Around line 35: Adjust these values
if (dpr >= 1.75) scaleFactor = 0.4;  // 175%+ scaling
if (dpr >= 1.5) scaleFactor = 0.6;   // 150% scaling
if (dpr >= 1.25) scaleFactor = 0.8;  // 125% scaling

// Less aggressive: increase values (e.g., 0.5, 0.7, 0.85)
// More aggressive: decrease values (e.g., 0.3, 0.5, 0.75)
```

---

## 📊 Scaling Reference

| Display Scale | DPR | Scale Factor | Result |
|--------------|-----|--------------|--------|
| 100% | 1.0 | 1.00 | No change |
| 125% | 1.25 | 0.80 | Aggressive reduction |
| 150% | 1.5 | 0.60 | Strong reduction |
| 175% | 1.75 | 0.40 | Significant reduction |
| 200% | 2.0 | 0.40 | Significant reduction |

---

## 🐛 Troubleshooting

### Content Too Small?

**Solution 1:** Increase scale values
```ts
// In use-display-scale.ts, around line 35
if (dpr >= 1.75) scaleFactor = 0.5;  // Instead of 0.4
if (dpr >= 1.5) scaleFactor = 0.7;   // Instead of 0.6
if (dpr >= 1.25) scaleFactor = 0.85; // Instead of 0.8
```

**Solution 2:** Disable for specific sections
```tsx
<AdaptiveContainer enableScale={false}>
  {/* Content at original size */}
</AdaptiveContainer>
```

### Content Too Large?

**Solution:** Decrease scale values
```ts
// In use-display-scale.ts, around line 35
if (dpr >= 1.75) scaleFactor = 0.3;  // Instead of 0.4
if (dpr >= 1.5) scaleFactor = 0.5;   // Instead of 0.6
if (dpr >= 1.25) scaleFactor = 0.75; // Instead of 0.8
```

### Images Blurry?

**Solution:** Use higher resolution images
```tsx
<img 
  src="/image.jpg"
  srcSet="/image.jpg 1x, /image@2x.jpg 2x"
  className="scale-stable"
/>
```

### Scaling Not Detected?

**Solution:** Check browser compatibility
```javascript
// In console
console.log('DPR:', window.devicePixelRatio);
console.log('Supported:', window.devicePixelRatio !== undefined);
```

---

## 📚 Documentation

- **Full Guide**: `DISPLAY_SCALING_GUIDE.md`
- **Examples**: `DISPLAY_SCALING_EXAMPLES.md`
- **This File**: `DISPLAY_SCALING_QUICK_START.md`

---

## ✨ Key Features

✅ **Zero Configuration** - Works out of the box  
✅ **Automatic Detection** - Detects Windows display scaling  
✅ **Tailwind Compatible** - Works with all Tailwind classes  
✅ **Performance Optimized** - GPU-accelerated transforms  
✅ **Responsive** - Works with sm, md, lg, xl breakpoints  
✅ **Sharp Images** - Optimized image rendering  
✅ **Flexible** - Multiple usage patterns  
✅ **TypeScript** - Full type safety  

---

## 🎯 Next Steps

1. **Test on MateBook D15** (or device with 125% scaling)
2. **Enable debug mode** to see scaling info
3. **Adjust scale factors** if needed
4. **Apply to specific sections** using `AdaptiveContainer`
5. **Check all pages** for consistent appearance

---

## 💡 Pro Tips

1. **Use `scale-stable` class** on all scaled elements
2. **Test with browser zoom** (Ctrl +/-) for quick testing
3. **Enable debug mode** during development
4. **Use higher resolution images** for scaled displays
5. **Apply scaling to containers**, not individual elements

---

## 🔍 Quick Debug

Add this to any page to see scaling info:

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';

export function DebugInfo() {
  const scale = useDisplayScale();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-card p-4 rounded shadow-lg text-xs">
      <p>DPR: {scale.devicePixelRatio}</p>
      <p>Scale: {scale.scalePercentage}%</p>
      <p>Factor: {scale.scaleFactor.toFixed(3)}</p>
    </div>
  );
}
```

---

## ✅ You're All Set!

Your application now handles display scaling automatically. No further action required unless you want to customize the behavior.

**Questions?** Check the full documentation in `DISPLAY_SCALING_GUIDE.md`
