# Footer CSS Variables - Quick Reference

## Overview
The footer now uses CSS variables from `app.css` instead of hardcoded colors. This provides centralized theme management and automatic dark mode support.

## Quick Color Reference

### Tailwind Classes Used in Footer

| Tailwind Class | CSS Variable | Purpose |
|----------------|--------------|---------|
| `bg-primary` | `--color-primary` | Primary brand color (buttons, accents) |
| `bg-secondary` | `--color-secondary` | Secondary/accent color |
| `text-foreground` | `--color-foreground` | Main text color |
| `text-muted-foreground` | `--color-muted-foreground` | Secondary/muted text |
| `text-primary-foreground` | `--color-primary-foreground` | Text on primary backgrounds |
| `bg-card` | `--color-card` | Card backgrounds |
| `border-border` | `--color-border` | Borders and dividers |

### With Opacity Modifiers

| Class | Result |
|-------|--------|
| `bg-primary/10` | Primary color at 10% opacity |
| `bg-primary/20` | Primary color at 20% opacity |
| `border-primary/50` | Primary border at 50% opacity |
| `hover:shadow-primary/10` | Primary shadow at 10% opacity |

## Color Values

### Light Mode (Default)
```css
--primary: oklch(0.502 0.176 142.495);           /* green-600 */
--secondary: oklch(0.659 0.15 142.495);          /* emerald-500 */
--foreground: oklch(0.267 0.013 142.495);        /* gray-800 */
--muted-foreground: oklch(0.459 0.015 142.495);  /* gray-600 */
--card: oklch(1 0 0);                            /* white */
--border: oklch(0.922 0.006 142.495);            /* gray-200 */
--primary-foreground: oklch(1 0 0);              /* white */
```

### Dark Mode
```css
--primary: oklch(0.7 0.16 142.495);              /* lighter green */
--secondary: oklch(0.659 0.15 142.495);          /* emerald-500 */
--foreground: oklch(0.961 0.006 142.495);        /* light gray */
--muted-foreground: oklch(0.6 0.01 142.495);     /* muted light */
--card: oklch(0.12 0.003 142.495);               /* dark gray */
--border: oklch(0.2 0.003 142.495);              /* subtle dark */
--primary-foreground: oklch(0.08 0.003 142.495); /* dark text */
```

## Common Patterns

### Gradient Backgrounds
```tsx
// Primary to Secondary gradient
className="bg-gradient-to-br from-secondary to-primary"

// Card with opacity
className="bg-gradient-to-br from-card/50 to-card/30"
```

### Interactive States
```tsx
// Hover effects
className="hover:text-secondary hover:bg-primary/10"

// Border transitions
className="border-border/50 hover:border-primary/50"

// Shadow effects
className="hover:shadow-lg hover:shadow-primary/10"
```

### Text Hierarchy
```tsx
// Primary heading
className="text-foreground"

// Secondary/muted text
className="text-muted-foreground"

// Text on colored backgrounds
className="text-primary-foreground"
```

## How to Update Colors

### Change Primary Color
Edit `resources/css/app.css`:

```css
:root {
    --primary: oklch(0.502 0.176 220);  /* Change to blue */
}
```

### Change Secondary Color
```css
:root {
    --secondary: oklch(0.659 0.15 280);  /* Change to purple */
}
```

### Adjust Dark Mode
```css
.dark {
    --primary: oklch(0.6 0.15 220);  /* Darker blue for dark mode */
}
```

## Testing Checklist

- [ ] View footer in light mode
- [ ] Toggle to dark mode (if available)
- [ ] Hover over contact cards
- [ ] Check navigation link hovers
- [ ] Verify text readability
- [ ] Test on mobile devices
- [ ] Check color contrast ratios

## Benefits

✅ **Centralized Management**: Update colors in one place  
✅ **Dark Mode**: Automatic theme switching  
✅ **Consistency**: Same colors across all components  
✅ **Maintainability**: Easy to update and maintain  
✅ **Flexibility**: Support for multiple themes  
✅ **Accessibility**: Easier to maintain contrast ratios  

## Troubleshooting

**Colors not showing?**
- Clear browser cache
- Rebuild: `npm run build`
- Check `app.css` is imported

**Dark mode not working?**
- Verify `.dark` class on root element
- Check dark mode variables in `app.css`

**Wrong colors displaying?**
- Check for CSS conflicts in dev tools
- Verify Tailwind is using CSS variables
- Ensure no hardcoded colors override variables

## Related Files

- **Footer Component**: `resources/js/components/Footer.tsx`
- **CSS Variables**: `resources/css/app.css`
- **Full Documentation**: `FOOTER_COLOR_VARIABLES_UPDATE.md`
- **Complete Guide**: `FOOTER_REDESIGN_COMPLETE.md`

---

**Quick Tip**: Use semantic color names (`primary`, `secondary`) instead of color names (`green`, `blue`) for better maintainability.
