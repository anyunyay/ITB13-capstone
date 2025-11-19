# Login Lockout System - Visual Guide

## User Interface States

### State 1: Normal Login (No Failed Attempts)
```
┌─────────────────────────────────────┐
│  Customer Login                     │
├─────────────────────────────────────┤
│                                     │
│  Email address                      │
│  ┌───────────────────────────────┐ │
│  │ email@example.com             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Password                           │
│  ┌───────────────────────────────┐ │
│  │ ••••••••••                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ☐ Remember me                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        Log in                 │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### State 2: First Failed Attempt (Yellow Warning)
```
┌─────────────────────────────────────┐
│  Customer Login                     │
├─────────────────────────────────────┤
│  ⚠️  Login Attempt Warning          │
│  1 failed login attempt detected.   │
│  Please ensure you're using the     │
│  correct credentials.               │
├─────────────────────────────────────┤
│  Email address                      │
│  ┌───────────────────────────────┐ │
│  │ email@example.com             │ │
│  └───────────────────────────────┘ │
│  ❌ These credentials do not match  │
│     our records.                    │
│                                     │
│  Password                           │
│  ┌───────────────────────────────┐ │
│  │ ••••••••••                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ☐ Remember me                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        Log in                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### State 3: Second Failed Attempt (Yellow Warning - Critical)
```
┌─────────────────────────────────────┐
│  Customer Login                     │
├─────────────────────────────────────┤
│  ⚠️  Login Attempt Warning          │
│  2 failed login attempts detected.  │
│  One more failed attempt will lock  │
│  your account. Please ensure you're │
│  using the correct credentials.     │
├─────────────────────────────────────┤
│  Email address                      │
│  ┌───────────────────────────────┐ │
│  │ email@example.com             │ │
│  └───────────────────────────────┘ │
│  ❌ These credentials do not match  │
│     our records.                    │
│                                     │
│  Password                           │
│  ┌───────────────────────────────┐ │
│  │ ••••••••••                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ☐ Remember me                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        Log in                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### State 4: Account Locked (Red Alert)
```
┌─────────────────────────────────────┐
│  Customer Login                     │
├─────────────────────────────────────┤
│  🚫 Account Temporarily Locked      │
│  Too many failed login attempts.    │
│  Please wait 0:58 before trying     │
│  again, or use forgot password.     │
├─────────────────────────────────────┤
│  Email address                      │
│  ┌───────────────────────────────┐ │
│  │ email@example.com             │ │
│  └───────────────────────────────┘ │
│  ❌ Too many failed login attempts. │
│     Account locked for 1 minute.    │
│     Please try again later.         │
│                                     │
│  Password                           │
│  ┌───────────────────────────────┐ │
│  │ ••••••••••                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ☐ Remember me                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Try again in 0:58  [DISABLED]│ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Color Coding

### Yellow Warning Box (Failed Attempts)
- **Background**: Light yellow (#FEF3C7)
- **Border**: Yellow (#FCD34D)
- **Text**: Dark yellow (#92400E)
- **Icon**: Warning triangle
- **Purpose**: Alert user before lockout

### Red Alert Box (Account Locked)
- **Background**: Light red (#FEE2E2)
- **Border**: Red (#FCA5A5)
- **Text**: Dark red (#991B1B)
- **Icon**: X in circle
- **Purpose**: Indicate lockout state

## Message Progression

### Attempt Count Messages

| Attempts | Message | Color | Action |
|----------|---------|-------|--------|
| 0 | None | - | Normal login |
| 1 | "1 failed login attempt detected." | Yellow | Warning |
| 2 | "2 failed login attempts detected. One more will lock your account." | Yellow | Critical warning |
| 3+ | "Account Temporarily Locked" | Red | Lockout active |

### Lockout Duration Messages

| Lock Level | Duration | Message |
|------------|----------|---------|
| 1 | 1 minute | "Account locked for 1 minute" |
| 2 | 3 minutes | "Account locked for 3 minutes" |
| 3 | 5 minutes | "Account locked for 5 minutes" |
| 4+ | 24 hours | "Account locked for 24 hours" |

## Button States

### Normal State
```
┌───────────────────────────────┐
│        Log in                 │  ← Enabled, clickable
└───────────────────────────────┘
```

### Processing State
```
┌───────────────────────────────┐
│  ⟳  Log in                    │  ← Spinner, disabled
└───────────────────────────────┘
```

### Locked State
```
┌───────────────────────────────┐
│  Try again in 0:58            │  ← Countdown, disabled
└───────────────────────────────┘
```

## Countdown Timer Format

### Less than 1 minute
```
Format: "Xs"
Examples: "59s", "30s", "5s"
```

### 1 minute to 1 hour
```
Format: "M:SS"
Examples: "1:00", "3:45", "59:59"
```

### More than 1 hour
```
Format: "H:MM:SS"
Examples: "1:00:00", "23:59:59"
```

## Portal-Specific Styling

### Customer Portal
- **Primary Color**: Blue
- **Button**: Blue background
- **Icon**: User icon

### Admin Portal
- **Primary Color**: Blue (darker shade)
- **Button**: Blue background
- **Icon**: Shield icon

### Member Portal
- **Primary Color**: Green
- **Button**: Green background
- **Icon**: Users icon

### Logistic Portal
- **Primary Color**: Orange
- **Button**: Orange background
- **Icon**: Truck icon

## Responsive Design

### Desktop (≥768px)
- Full-width alert boxes with padding
- Side-by-side icon and text
- Larger font sizes

### Mobile (<768px)
- Stacked layout
- Smaller padding
- Adjusted font sizes
- Touch-friendly button sizes

## Accessibility Features

✅ **Color contrast**: WCAG AA compliant
✅ **Icon + text**: Not relying on color alone
✅ **Clear hierarchy**: Headings and structure
✅ **Keyboard navigation**: Tab order maintained
✅ **Screen reader friendly**: Semantic HTML
✅ **Focus indicators**: Visible focus states

## Animation & Transitions

### Alert Box Appearance
- Fade in with slide down
- Duration: 300ms
- Easing: ease-out

### Countdown Timer
- Updates every 1 second
- No animation (prevents distraction)
- Bold font weight for emphasis

### Button State Changes
- Smooth transition: 200ms
- Color and opacity changes
- Disabled state clearly visible

## Error Message Hierarchy

1. **Lockout Alert Box** (Top priority)
   - Most prominent
   - Red background
   - Large icon

2. **Failed Attempts Warning** (Medium priority)
   - Yellow background
   - Warning icon
   - Below lockout alert

3. **Field-level Errors** (Low priority)
   - Below input fields
   - Small red text
   - Standard validation errors

## User Flow Diagram

```
┌─────────────┐
│ Enter Login │
│ Credentials │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Attempt 1  │────▶│ Yellow Alert │
│   (Failed)  │     │  "1 attempt" │
└──────┬──────┘     └──────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Attempt 2  │────▶│ Yellow Alert │
│   (Failed)  │     │ "2 attempts" │
└──────┬──────┘     │ "One more!"  │
       │            └──────────────┘
       ▼
┌─────────────┐     ┌──────────────┐
│  Attempt 3  │────▶│  Red Alert   │
│   (Failed)  │     │   "LOCKED"   │
└──────┬──────┘     │  Timer: 1:00 │
       │            └──────┬───────┘
       │                   │
       │            ┌──────▼───────┐
       │            │ Wait & Watch │
       │            │ Timer Count  │
       │            └──────┬───────┘
       │                   │
       │            ┌──────▼───────┐
       │            │ Timer: 0:00  │
       │            │ Alert Clears │
       │            └──────┬───────┘
       │                   │
       └───────────────────┘
       │
       ▼
┌─────────────┐
│ Try Again   │
└─────────────┘
```

## Best Practices Implemented

✅ **Progressive disclosure**: Show warnings before lockout
✅ **Clear feedback**: Users always know their status
✅ **Actionable messages**: Provide alternatives (forgot password)
✅ **Visual hierarchy**: Most important info most prominent
✅ **Consistent design**: Same across all portals
✅ **Mobile-first**: Works on all screen sizes
✅ **Accessible**: Meets WCAG standards
✅ **Performance**: Lightweight, no heavy animations
