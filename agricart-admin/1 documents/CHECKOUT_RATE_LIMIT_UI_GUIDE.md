# Checkout Rate Limit - UI/UX Guide

## Visual Design

### Normal State (Not Rate Limited)
```
┌─────────────────────────────────────┐
│ Order Summary                       │
├─────────────────────────────────────┤
│ Subtotal:              ₱150.00      │
│ Delivery Fee (10%):    ₱15.00       │
│ ─────────────────────────────────   │
│ Total:                 ₱165.00      │
│                                     │
│ ✓ Minimum Order Amount (₱75)       │
│                                     │
│ ℹ Note: Order requires approval     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      CHECKOUT                   │ │ ← Enabled (Green)
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Rate Limited State (With Countdown)
```
┌─────────────────────────────────────┐
│ Order Summary                       │
├─────────────────────────────────────┤
│ Subtotal:              ₱150.00      │
│ Delivery Fee (10%):    ₱15.00       │
│ ─────────────────────────────────   │
│ Total:                 ₱165.00      │
│                                     │
│ ⚠ CHECKOUT LIMIT REACHED            │ ← Red Warning Banner
│ ─────────────────────────────────   │
│ Checkout Limit Reached              │
│ You have reached the maximum of     │
│ 3 checkouts within 10 minutes.      │
│                                     │
│ Available in:  ┌──────┐             │
│                │ 5:30 │             │ ← Countdown Timer
│                └──────┘             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚠ Checkout available in 5:30   │ │ ← Disabled (Gray)
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## UI Components

### 1. Warning Banner
**Location**: Above checkout button in Order Summary
**Appearance**:
- Background: Red/Pink (`bg-red-50 dark:bg-red-900/20`)
- Border: Red (`border-2 border-red-300`)
- Icon: Alert Triangle (⚠️)
- Text: Bold title + description

**Content**:
```
⚠ Checkout Limit Reached

You have reached the maximum of 3 checkouts within 10 minutes.

Available in: [5:30]
```

### 2. Countdown Timer Badge
**Location**: Inside warning banner
**Appearance**:
- Background: Light red (`bg-red-100`)
- Border: Red (`border border-red-300`)
- Font: Bold, monospace (tabular-nums)
- Size: Larger than surrounding text

**Format**:
- Minutes + Seconds: `5:30` (5 minutes 30 seconds)
- Seconds only: `45s` (45 seconds)

### 3. Checkout Button (Disabled State)
**Location**: Bottom of Order Summary
**Appearance**:
- Background: Gray (`bg-gray-400`)
- Opacity: 50% (`opacity-50`)
- Cursor: Not allowed (`cursor-not-allowed`)
- No hover effects

**Content**:
```
⚠ Checkout available in 5:30
```

## User Flow

### Scenario 1: User Hits Rate Limit

```
1. User completes 3rd checkout
   ↓
2. User adds items to cart again
   ↓
3. User navigates to cart page
   ↓
4. Page loads with rate limit info
   ↓
5. Warning banner appears (animated)
   ↓
6. Countdown timer starts at remaining time
   ↓
7. Timer updates every second
   ↓
8. User sees: 5:30 → 5:29 → 5:28 → ...
   ↓
9. User waits or leaves page
   ↓
10. Timer reaches 0:00
    ↓
11. Warning banner disappears
    ↓
12. Checkout button becomes enabled
    ↓
13. User can checkout again
```

### Scenario 2: User Refreshes Page While Rate Limited

```
1. User is rate limited (timer showing 3:45)
   ↓
2. User refreshes page (F5)
   ↓
3. Server recalculates remaining time
   ↓
4. Page loads with updated timer (e.g., 3:40)
   ↓
5. Timer continues counting down
   ↓
6. No interruption in countdown
```

## Responsive Design

### Desktop (≥1024px)
- Warning banner: Full width in sidebar
- Timer badge: Inline with text
- Button: Full width of sidebar

### Tablet (768px - 1023px)
- Warning banner: Full width
- Timer badge: Inline with text
- Button: Full width

### Mobile (<768px)
- Warning banner: Full width, stacked layout
- Timer badge: Centered below text
- Button: Full width
- Font sizes adjusted for readability

## Color Scheme

### Light Mode
- Warning Background: `#FEF2F2` (red-50)
- Warning Border: `#FECACA` (red-300)
- Warning Text: `#B91C1C` (red-700)
- Timer Background: `#FEE2E2` (red-100)
- Timer Border: `#FECACA` (red-300)
- Timer Text: `#991B1B` (red-800)
- Disabled Button: `#9CA3AF` (gray-400)

### Dark Mode
- Warning Background: `rgba(127, 29, 29, 0.2)` (red-900/20)
- Warning Border: `#991B1B` (red-700)
- Warning Text: `#FCA5A5` (red-300)
- Timer Background: `rgba(127, 29, 29, 0.4)` (red-900/40)
- Timer Border: `#DC2626` (red-600)
- Timer Text: `#FCA5A5` (red-300)
- Disabled Button: `#4B5563` (gray-600)

## Accessibility

### Screen Readers
- Warning banner has proper ARIA labels
- Countdown timer announces updates
- Disabled button state is announced

### Keyboard Navigation
- Disabled button cannot be focused
- Tab order skips disabled elements
- Focus returns to enabled button when countdown expires

### Visual Indicators
- Color is not the only indicator (icons + text)
- High contrast ratios (WCAG AA compliant)
- Clear visual hierarchy

## Animation & Transitions

### Warning Banner
- Fade in: 300ms ease-in
- Slide down: 200ms ease-out
- Fade out: 300ms ease-out (when countdown expires)

### Countdown Timer
- No animation (updates instantly)
- Smooth number transitions
- No flickering or jumping

### Button State Change
- Transition: 300ms ease-in-out
- Color change: Smooth gradient
- Hover effect: Only when enabled

## Technical Implementation

### Timer Update Logic
```typescript
// Update every second
setInterval(() => {
  const now = new Date();
  const diff = resetTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    // Enable checkout
    setIsRateLimited(false);
    return;
  }
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 0) {
    setCountdownText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  } else {
    setCountdownText(`${seconds}s`);
  }
}, 1000);
```

### State Management
```typescript
const [isRateLimited, setIsRateLimited] = useState(false);
const [countdownText, setCountdownText] = useState('');
const [resetTime, setResetTime] = useState<Date | null>(null);
```

### Props Flow
```
CartController (PHP)
  ↓ (Inertia props)
Cart/index.tsx
  ↓ (component props)
CartSummary.tsx
  ↓ (renders)
Warning Banner + Timer + Button
```

## Translation Support

### English
- `checkout_limit_reached`: "Checkout Limit Reached"
- `checkout_limit_message`: "You have reached the maximum of 3 checkouts within 10 minutes."
- `available_in`: "Available in"
- `checkout_available_in`: "Checkout available in"

### Tagalog
- `checkout_limit_reached`: "Naabot na ang Limitasyon sa Checkout"
- `checkout_limit_message`: "Naabot mo na ang maximum na 3 checkout sa loob ng 10 minuto."
- `available_in`: "Available sa"
- `checkout_available_in`: "Checkout available sa"

## Edge Cases Handled

1. **Page Refresh**: Timer recalculates from server time
2. **Browser Tab Switch**: Timer continues in background
3. **Network Delay**: Uses server time, not client time
4. **Timezone Differences**: All times in server timezone
5. **Countdown Reaches Zero**: Automatic cleanup and re-enable
6. **Multiple Tabs**: Each tab updates independently
7. **Slow Connection**: Graceful degradation

## Testing Checklist

- [ ] Warning banner displays correctly
- [ ] Countdown timer updates every second
- [ ] Timer format changes at 1 minute mark
- [ ] Button disables when rate limited
- [ ] Button re-enables when timer expires
- [ ] Warning banner disappears when timer expires
- [ ] Responsive on all screen sizes
- [ ] Works in light and dark mode
- [ ] Accessible to screen readers
- [ ] Translations work correctly
- [ ] Timer persists across page refresh
- [ ] No console errors or warnings
