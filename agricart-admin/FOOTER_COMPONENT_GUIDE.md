# Footer Component Usage Guide

## Component Overview

The redesigned Footer component is a modern, fully responsive footer with enhanced visual appeal and better user engagement.

## Import

```tsx
import Footer from '@/components/Footer';
```

## Basic Usage

```tsx
<Footer />
```

## Props Interface

```typescript
interface FooterProps {
  companyName?: string;           // Default: "AgriCart"
  currentYear?: number;           // Default: current year
  facebookUrl?: string;           // Default: "#"
  emailAddress?: string;          // Default: "contact@agricart.com"
  physicalAddress?: string;       // Default: "123 Farm Street, Agriculture City"
  navigationLinks?: Array<{       // Default: About, Contact, Privacy, Terms
    title: string;
    href: string;
  }>;
  className?: string;             // Additional CSS classes
}
```

## Examples

### Example 1: Basic Usage (Default Values)
```tsx
<Footer />
```

### Example 2: Custom Company Information
```tsx
<Footer 
  companyName="SMMC Cooperative"
  facebookUrl="https://facebook.com/smmccooperative"
  emailAddress="contact@smmccooperative.com"
  physicalAddress="Cabuyao, Laguna, Philippines"
/>
```

### Example 3: Custom Navigation Links
```tsx
<Footer 
  companyName="SMMC Cooperative"
  navigationLinks={[
    { title: "About Us", href: "/about" },
    { title: "Our Farmers", href: "/farmers" },
    { title: "Products", href: "/products" },
    { title: "Contact", href: "/contact" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" }
  ]}
/>
```

### Example 4: With Custom Styling
```tsx
<Footer 
  companyName="SMMC Cooperative"
  className="shadow-2xl"
/>
```

### Example 5: Complete Customization
```tsx
<Footer 
  companyName="SMMC Cooperative"
  currentYear={2024}
  facebookUrl="https://facebook.com/smmccooperative"
  emailAddress="info@smmccooperative.com"
  physicalAddress="123 Farm Road, Cabuyao, Laguna, Philippines"
  navigationLinks={[
    { title: "Home", href: "/" },
    { title: "Shop", href: "/shop" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" }
  ]}
  className="mt-20"
/>
```

## Component Structure

```
Footer
├── Decorative Background (blur orbs)
├── Main Content
│   ├── Top Section
│   │   ├── Left Column (Brand Identity)
│   │   │   ├── Logo + Company Name
│   │   │   ├── Tagline
│   │   │   ├── Description
│   │   │   └── Trust Badges
│   │   └── Right Column (Contact Info)
│   │       ├── Section Heading
│   │       └── Contact Cards Grid
│   │           ├── Facebook Card
│   │           ├── Email Card
│   │           └── Address Card
│   ├── Divider Line
│   └── Bottom Section
│       ├── Copyright
│       └── Navigation Links
```

## Styling Customization

### Background Color
The footer uses a dark gradient. To customize:
```tsx
// Modify the className prop
<Footer className="bg-gradient-to-b from-blue-900 to-blue-800" />
```

### Accent Color
The default accent is green. To change throughout:
1. Modify the Tailwind classes in Footer.tsx
2. Replace `green-500`, `green-400`, `green-600` with your color

### Typography
Font sizes are responsive and scale automatically. To override:
```tsx
<Footer className="[&_h3]:text-4xl [&_p]:text-lg" />
```

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1023px | 2-column contact grid |
| Desktop | ≥ 1024px | Side-by-side brand/contact |

## Accessibility Features

- ✅ Semantic HTML (`<footer>`, `<nav>`, etc.)
- ✅ ARIA labels on links
- ✅ Keyboard navigation support
- ✅ Proper heading hierarchy
- ✅ High contrast text
- ✅ Focus states on interactive elements

## Interactive Elements

### Hover Effects
- **Contact Cards**: Lift animation, glow effect, color change
- **Icons**: Scale up to 110%
- **Navigation Links**: Background color and text color change

### Click Targets
All interactive elements have adequate touch targets (minimum 44x44px on mobile).

## Performance Considerations

- Uses Tailwind utility classes (no custom CSS)
- GPU-accelerated animations
- Optimized for all screen sizes
- No external dependencies beyond lucide-react icons

## Common Use Cases

### 1. E-commerce Site
```tsx
<Footer 
  companyName="Your Store"
  emailAddress="support@yourstore.com"
  navigationLinks={[
    { title: "Shop", href: "/shop" },
    { title: "Returns", href: "/returns" },
    { title: "Shipping", href: "/shipping" },
    { title: "FAQ", href: "/faq" }
  ]}
/>
```

### 2. Corporate Website
```tsx
<Footer 
  companyName="Your Company"
  navigationLinks={[
    { title: "About", href: "/about" },
    { title: "Services", href: "/services" },
    { title: "Careers", href: "/careers" },
    { title: "Contact", href: "/contact" }
  ]}
/>
```

### 3. Portfolio Site
```tsx
<Footer 
  companyName="Your Name"
  emailAddress="hello@yourname.com"
  navigationLinks={[
    { title: "Work", href: "/work" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" }
  ]}
/>
```

## Troubleshooting

### Footer not showing
- Ensure the parent container allows the footer to render
- Check z-index conflicts (footer uses z-20)

### Links not working
- Verify href values are correct
- Check if Inertia.js is properly configured

### Styling issues
- Clear browser cache
- Ensure Tailwind CSS is properly compiled
- Check for conflicting CSS

### Responsive issues
- Test on actual devices, not just browser resize
- Verify viewport meta tag is present
- Check for parent container constraints

## Best Practices

1. **Always provide real contact information** for production
2. **Keep navigation links concise** (4-6 links recommended)
3. **Use descriptive link text** for accessibility
4. **Test on multiple devices** before deployment
5. **Ensure email and social links work** before going live

## Migration from Old Footer

If upgrading from the previous footer version:

1. **No code changes needed** - props are the same
2. **Visual changes only** - layout and styling updated
3. **Test thoroughly** - verify all links and information
4. **Update content** - review and update contact info if needed

## Support

For issues or questions:
- Check the component source code
- Review this documentation
- Test in isolation to identify conflicts
- Verify all props are correctly passed

---

**Last Updated**: November 2025
**Component Version**: 2.0 (Redesigned)
**Compatibility**: React 18+, Inertia.js, Tailwind CSS 3+
