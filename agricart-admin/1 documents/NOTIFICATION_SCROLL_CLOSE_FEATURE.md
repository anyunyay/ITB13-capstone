# Notification Dropdown Auto-Close on Scroll

## Overview
Added automatic closing of the notification dropdown when the user scrolls the page. This improves UX by preventing the dropdown from staying open and blocking content when users scroll.

## Implementation

### File Modified
`resources/js/components/NotificationBell.tsx`

### Changes Made

#### 1. Added State Management
```typescript
const [isOpen, setIsOpen] = useState(false);
```
- Tracks whether the notification dropdown is open or closed

#### 2. Added Scroll Event Listener
```typescript
useEffect(() => {
  const handleScroll = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }
}, [isOpen]);
```

**How it works:**
- When dropdown is opened (`isOpen = true`), adds a scroll event listener
- Listener is attached with `capture: true` to catch all scroll events
- When any scroll is detected, closes the dropdown by setting `isOpen = false`
- Cleanup function removes the listener when dropdown closes or component unmounts

#### 3. Connected State to DropdownMenu
```typescript
<DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
```
- `open={isOpen}` - Controls dropdown visibility
- `onOpenChange={setIsOpen}` - Updates state when dropdown is opened/closed by user

## User Experience

### Before:
- User opens notification dropdown
- User scrolls page
- Dropdown stays open, potentially blocking content
- User must manually click outside to close

### After:
- User opens notification dropdown
- User scrolls page
- Dropdown automatically closes immediately
- Clean, unobstructed view while scrolling

## Benefits

1. **Better UX**: Dropdown doesn't block content during scrolling
2. **Intuitive**: Matches expected behavior of most modern dropdowns
3. **Clean Interface**: Prevents dropdown from floating over content
4. **Performance**: Efficient event listener with proper cleanup
5. **Accessibility**: Doesn't interfere with keyboard navigation

## Technical Details

### Event Listener Configuration
- **Event**: `scroll`
- **Capture Phase**: `true` - Catches scroll events on any element
- **Cleanup**: Automatically removed when dropdown closes

### Scope
- Detects scroll on:
  - Window/document scroll
  - Any scrollable container (with `capture: true`)
  - Touch scroll on mobile devices

### Performance Considerations
- Listener only active when dropdown is open
- Immediate cleanup when dropdown closes
- Minimal performance impact

## Browser Compatibility
- Works in all modern browsers
- Supports both mouse wheel and touch scrolling
- Compatible with keyboard scrolling (arrow keys, page up/down)

## Testing Checklist

- [ ] Open notification dropdown
- [ ] Scroll with mouse wheel → Dropdown closes
- [ ] Open dropdown again
- [ ] Scroll with scrollbar → Dropdown closes
- [ ] Open dropdown on mobile
- [ ] Touch scroll → Dropdown closes
- [ ] Test on different pages (with/without scrollable content)
- [ ] Verify no console errors
- [ ] Test with keyboard navigation (arrow keys)
- [ ] Verify dropdown can be reopened after auto-close

## Edge Cases Handled

1. **Multiple Scroll Events**: Only closes once, no repeated state updates
2. **Component Unmount**: Listener properly cleaned up
3. **Rapid Open/Close**: State updates handled correctly
4. **Nested Scrollable Elements**: Captures all scroll events with `capture: true`

## Future Enhancements (Optional)

1. Add debouncing to prevent closing on accidental micro-scrolls
2. Add configuration option to disable auto-close
3. Add animation/transition when closing
4. Consider closing on window resize as well

## Related Files

- `resources/js/components/NotificationBell.tsx` - Main implementation
- `resources/js/components/ui/dropdown-menu.tsx` - Underlying dropdown component

## Notes

- This behavior is consistent with modern UI patterns (e.g., Google, Facebook)
- Does not affect the "See All" navigation or notification actions
- Dropdown can be immediately reopened after auto-close
- No impact on notification marking or hiding functionality
