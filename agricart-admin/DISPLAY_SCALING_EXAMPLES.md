# Display Scaling - Practical Examples

## Quick Start Examples for Your Application

### Example 1: Update Your Home Page (Optional Enhancement)

You can optionally wrap specific sections with `AdaptiveContainer` for fine-tuned control:

```tsx
import { AdaptiveContainer } from '@/components/ui/adaptive-container';

export default function CustomerHome({ products }: PageProps) {
  // ... existing code ...

  return (
    <AppHeaderLayout>
      <Head title="Home - SMMC Cooperative" />

      {/* Hero Section - Keep as is, global scaling applies */}
      <section className="fixed top-0 left-0 w-full h-screen z-0">
        {/* ... existing hero code ... */}
      </section>

      {/* Main scroll container with adaptive scaling */}
      <AdaptiveContainer 
        as="div" 
        className="relative z-10 snap-y snap-proximity"
        enableScale={true}
      >
        {/* ... rest of your content ... */}
      </AdaptiveContainer>
    </AppHeaderLayout>
  );
}
```

### Example 2: Scale-Aware Product Cards

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';

export function ProductCard({ product }) {
  const { isScaled, scalePercentage } = useDisplayScale();

  return (
    <div className="bg-card rounded-lg shadow-md scale-stable">
      {/* Show scaling indicator in dev mode */}
      {process.env.NODE_ENV === 'development' && isScaled && (
        <div className="text-xs text-muted-foreground">
          Scaled: {scalePercentage}%
        </div>
      )}
      
      <img 
        src={product.image_url} 
        alt={product.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-primary font-bold">{product.price}</p>
      </div>
    </div>
  );
}
```

### Example 3: Responsive Hero with Scaling

```tsx
import { useResponsiveScale } from '@/hooks/use-display-scale';

export function HeroSection() {
  const scaleClass = useResponsiveScale();

  return (
    <section className={`hero-section ${scaleClass}`}>
      <h1 className="text-6xl lg:text-9xl font-bold">
        Grown Here
      </h1>
      <h2 className="text-5xl lg:text-8xl text-primary">
        For You
      </h2>
    </section>
  );
}
```

### Example 4: Adaptive Button Component

```tsx
import { AdaptiveContainer } from '@/components/ui/adaptive-container';
import { Button } from '@/components/ui/button';

export function AdaptiveButton({ children, ...props }) {
  return (
    <AdaptiveContainer 
      as="span" 
      className="inline-block"
      scaleMode="both"
    >
      <Button {...props}>{children}</Button>
    </AdaptiveContainer>
  );
}

// Usage
<AdaptiveButton onClick={() => router.visit('/customer/produce')}>
  Show All Produce
</AdaptiveButton>
```

### Example 5: Scale-Aware Modal/Dialog

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function ScaledDialog({ open, onOpenChange, children }) {
  const { scaleFactor } = useDisplayScale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="scale-stable"
        style={{
          maxWidth: `${600 * scaleFactor}px`,
          maxHeight: `${800 * scaleFactor}px`,
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Example 6: Carousel with Scaling Compensation

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';
import { Carousel } from '@/components/ui/carousel';

export function ProductCarousel({ products }) {
  const { scaleFactor } = useDisplayScale();

  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      className="w-full max-w-6xl mx-auto scale-stable"
      style={{
        // Adjust carousel item spacing based on scale
        '--carousel-spacing': `${1 * scaleFactor}rem`,
      }}
    >
      {/* ... carousel items ... */}
    </Carousel>
  );
}
```

### Example 7: Responsive Grid with Scaling

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';

export function ProductGrid({ products }) {
  const { devicePixelRatio } = useDisplayScale();
  
  // Adjust grid columns based on scaling
  const getGridCols = () => {
    if (devicePixelRatio >= 1.5) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <div className={`grid ${getGridCols()} gap-6 scale-stable`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Example 8: Debug Panel (Development Only)

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';

export function ScaleDebugPanel() {
  const scaleInfo = useDisplayScale();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 text-xs">
      <h3 className="font-bold mb-2">Display Scale Info</h3>
      <div className="space-y-1">
        <p>DPR: {scaleInfo.devicePixelRatio}</p>
        <p>Scale: {scaleInfo.scalePercentage}%</p>
        <p>Factor: {scaleInfo.scaleFactor.toFixed(3)}</p>
        <p>Scaled: {scaleInfo.isScaled ? 'Yes' : 'No'}</p>
        <p>Screen: {scaleInfo.screenWidth}x{scaleInfo.screenHeight}</p>
        <p>Effective: {scaleInfo.effectiveWidth}x{scaleInfo.effectiveHeight}</p>
      </div>
    </div>
  );
}

// Add to your layout
<AppHeaderLayout>
  {/* ... your content ... */}
  <ScaleDebugPanel />
</AppHeaderLayout>
```

### Example 9: Conditional Scaling for Specific Sections

```tsx
import { AdaptiveContainer } from '@/components/ui/adaptive-container';

export function MixedContentPage() {
  return (
    <div>
      {/* This section scales automatically */}
      <AdaptiveContainer className="hero-section">
        <h1>Scaled Hero</h1>
      </AdaptiveContainer>

      {/* This section maintains original size */}
      <AdaptiveContainer enableScale={false} className="data-table">
        <table>
          {/* Table that should maintain exact sizing */}
        </table>
      </AdaptiveContainer>

      {/* This section uses font-based scaling only */}
      <AdaptiveContainer scaleMode="font" className="article">
        <p>Long article text that scales via font-size</p>
      </AdaptiveContainer>
    </div>
  );
}
```

### Example 10: Custom Hook for Component-Specific Scaling

```tsx
import { useDisplayScale } from '@/hooks/use-display-scale';

// Custom hook for your specific needs
export function useCardScaling() {
  const { devicePixelRatio, scaleFactor } = useDisplayScale();

  const cardPadding = devicePixelRatio >= 1.5 ? 'p-3' : 'p-4';
  const cardGap = devicePixelRatio >= 1.5 ? 'gap-3' : 'gap-4';
  const imageHeight = devicePixelRatio >= 1.5 ? 'h-40' : 'h-48';

  return {
    cardPadding,
    cardGap,
    imageHeight,
    scaleFactor,
  };
}

// Usage in component
export function ProductCard({ product }) {
  const { cardPadding, imageHeight } = useCardScaling();

  return (
    <div className={`bg-card rounded-lg ${cardPadding}`}>
      <img className={`w-full ${imageHeight} object-cover`} src={product.image} />
      <h3>{product.name}</h3>
    </div>
  );
}
```

---

## Testing Your Implementation

### 1. Visual Test on MateBook D15 (125% Scaling)

```bash
# Open your app
npm run dev

# Navigate to http://localhost:5173
# Check if content appears properly sized
```

### 2. Browser DevTools Test

```javascript
// Open Console (F12)
// Check current scaling
console.log('DPR:', window.devicePixelRatio);
console.log('Scale:', Math.round(window.devicePixelRatio * 100) + '%');

// Test zoom changes
// Press Ctrl + Plus/Minus and watch content adjust
```

### 3. Enable Debug Mode

```tsx
// In resources/js/app.tsx
<ScaleProvider enableAutoScale={true} debugMode={true}>
  <App {...props} />
</ScaleProvider>

// Check console for scaling information
```

---

## Common Patterns

### Pattern 1: Full Page Scaling (Recommended)

```tsx
// No changes needed - ScaleProvider handles it globally
// Just build your components normally with Tailwind classes
```

### Pattern 2: Section-Specific Scaling

```tsx
<AdaptiveContainer className="section-hero">
  {/* Hero content */}
</AdaptiveContainer>

<div className="section-content">
  {/* Regular content without extra scaling */}
</div>
```

### Pattern 3: Hybrid Approach

```tsx
// Global scaling via ScaleProvider
// + Manual adjustments for specific elements
<div className="scale-[0.98] lg:scale-100">
  {/* Fine-tuned scaling */}
</div>
```

---

## Performance Tips

1. **Use `scale-stable` class** - Prevents layout shift
2. **Apply scaling to containers** - Not individual elements
3. **Avoid nested scaling** - One level is enough
4. **Use CSS transforms** - GPU accelerated
5. **Lazy load images** - Better performance on scaled displays

---

## Quick Reference

### Hooks
- `useDisplayScale()` - Get full scaling info
- `useResponsiveScale()` - Get Tailwind scale class
- `useScaleCSSProperties()` - Get CSS variables
- `useScaledFontSize(size)` - Get scaled font size
- `useScaledSpacing(spacing)` - Get scaled spacing

### Components
- `<ScaleProvider>` - Global scaling provider
- `<AdaptiveContainer>` - Adaptive scaling wrapper

### CSS Classes
- `scale-auto` - Automatic DPR-based scaling
- `scale-adaptive` - CSS variable scaling
- `scale-adaptive-text` - Font-size scaling
- `scale-stable` - Prevent layout shift

### CSS Variables
- `--scale-factor` - Compensation factor
- `--dpr` - Device pixel ratio
- `--base-font-size` - Adjusted base size
- `--scale-compensation` - Scale multiplier
