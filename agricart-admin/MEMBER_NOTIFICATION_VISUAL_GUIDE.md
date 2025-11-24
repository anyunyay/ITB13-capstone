# Member Notification UI - Visual Guide

## Header Notification Bell

### No Unread Notifications
```
┌─────────────────────────────────────────────────┐
│  ☰  Dashboard > Overview              🔔        │
└─────────────────────────────────────────────────┘
     ↑                                   ↑
  Sidebar                           Bell Icon
  Toggle                          (No Badge)
```

### With Unread Notifications
```
┌─────────────────────────────────────────────────┐
│  ☰  Dashboard > Overview            🔔 [3]      │
└─────────────────────────────────────────────────┘
     ↑                                 ↑   ↑
  Sidebar                          Bell  Badge
  Toggle                          Icon  Counter
```

### Badge Display Rules
- 1-9 unread: Shows exact number `[3]`
- 10+ unread: Shows `[9+]`
- Badge color: Green (matches member theme)
- Bell icon: Rings when unread (BellRing icon)

## Notification Dropdown

### Dropdown Layout
```
┌─────────────────────────────────────────────────┐
│  Notifications                      [Clear All] │
├─────────────────────────────────────────────────┤
│  ⚠️  5 Kilo of Tomatoes was removed.      ● [×]│
│      Reason: Damaged / Defective               │
│      5 minutes ago                             │
├─────────────────────────────────────────────────┤
│  📦  Stock added for Cabbage by Admin          │
│      1 hour ago                                │
├─────────────────────────────────────────────────┤
│  💰  Your product Lettuce was sold to John     │
│      2 hours ago                               │
├─────────────────────────────────────────────────┤
│  💵  New daily earnings: ₱1,250.00             │
│      Yesterday                                 │
├─────────────────────────────────────────────────┤
│                   [See All]                     │
└─────────────────────────────────────────────────┘
```

### Notification Item Components
```
┌─────────────────────────────────────────────────┐
│  [Icon] [Message Text]              [●] [×]     │
│         [Sub-message (optional)]                │
│         [Time ago]                              │
└─────────────────────────────────────────────────┘
   ↑      ↑                            ↑   ↑
 Emoji  Message                     Unread Dismiss
 Icon   Content                      Dot   Button
```

## Notification States

### Unread Notification
```
┌─────────────────────────────────────────────────┐
│  ⚠️  5 Kilo of Tomatoes was removed.      ● [×]│
│      Reason: Damaged / Defective               │
│      5 minutes ago                             │
└─────────────────────────────────────────────────┘
  ↑                                        ↑
Green                                   Green
Background                               Dot
```

### Read Notification
```
┌─────────────────────────────────────────────────┐
│  📦  Stock added for Cabbage by Admin      [×] │
│      1 hour ago                                │
└─────────────────────────────────────────────────┘
  ↑                                          ↑
White                                     No Dot
Background
```

### Hover State
```
┌─────────────────────────────────────────────────┐
│  ⚠️  5 Kilo of Tomatoes was removed.      ● [×]│
│      Reason: Damaged / Defective          ↑    │
│      5 minutes ago                     Visible  │
└─────────────────────────────────────────────────┘
  ↑                                    Dismiss
Lighter                                Button
Background                            Appears
```

## Notification Icons & Colors

### Icon Legend
```
📦  Stock Added          (Blue)
⚠️  Stock Removed        (Red)
💰  Product Sale         (Amber)
💵  Earnings Update      (Amber)
⚠️  Low Stock Alert      (Red)
```

### Color Scheme
```
Unread Background:  Light Green (#f0fdf4)
Read Background:    White
Hover Background:   Lighter Green
Badge Color:        Green (#16a34a)
Dismiss Button:     Red on hover
```

## User Interactions

### Click Bell Icon
```
[Bell Icon] → [Dropdown Opens]
     ↓
Shows 4 most recent notifications
```

### Click Notification (Unread)
```
[Notification] → [Mark as Read] → [Navigate to Page]
     ↓                ↓                    ↓
  Clicked        Read status         Stocks page
                   updated           with highlight
```

### Click Notification (Read)
```
[Notification] → [Navigate to Page]
     ↓                    ↓
  Clicked           Stocks page
                   with highlight
```

### Click Dismiss Button
```
[× Button] → [Hide from Header]
     ↓              ↓
  Clicked    Notification removed
             from dropdown
             (still in full list)
```

### Click Clear All
```
[Clear All] → [Hide All from Header]
     ↓              ↓
  Clicked    All notifications
             removed from dropdown
             (still in full list)
```

### Click See All
```
[See All] → [Navigate to Notifications Page]
     ↓              ↓
  Clicked    /member/profile/notifications
```

## Responsive Design

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────┐
│  ☰  Dashboard > Overview            🔔 [3]      │
└─────────────────────────────────────────────────┘
     ↑                                 ↑   ↑
  Large                            Large Badge
  Icon                             Icon  (20px)
  (24px)
```

### Tablet (768px - 1024px)
```
┌─────────────────────────────────────────────────┐
│  ☰  Dashboard > Overview          🔔 [3]        │
└─────────────────────────────────────────────────┘
     ↑                               ↑   ↑
  Medium                          Medium Badge
  Icon                            Icon  (18px)
  (20px)
```

### Mobile (<768px)
```
┌─────────────────────────────────────────────────┐
│  ☰  Dashboard                   🔔 [3]          │
└─────────────────────────────────────────────────┘
     ↑                             ↑   ↑
  Small                         Small Badge
  Icon                          Icon  (16px)
  (18px)
```

## Notification Flow Diagram

```
┌─────────────────┐
│  Admin Action   │
│  (Remove Stock) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Notification   │
│    Created      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │
│  Fetches & Shares│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Member Header  │
│  Shows Badge    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Member Clicks  │
│      Bell       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Dropdown     │
│     Opens       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Member Clicks   │
│  Notification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Mark as Read   │
│   & Navigate    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Stocks Page    │
│  (Highlighted)  │
└─────────────────┘
```

## Example Scenarios

### Scenario 1: Stock Removed
```
1. Admin removes 5 Kilo of Tomatoes (Damaged)
2. Member sees badge: 🔔 [1]
3. Member clicks bell
4. Sees: "⚠️ 5 Kilo of Tomatoes was removed. Reason: Damaged / Defective"
5. Clicks notification
6. Navigates to stocks page
7. Tomatoes highlighted
8. Badge updates: 🔔 (no badge)
```

### Scenario 2: Multiple Notifications
```
1. Admin adds stock (Badge: [1])
2. Product sold (Badge: [2])
3. Stock removed (Badge: [3])
4. Member clicks bell
5. Sees all 3 notifications
6. Clicks "Clear All"
7. Dropdown empty
8. Badge: 🔔 (no badge)
```

### Scenario 3: Navigation
```
Stock Added → /member/all-stocks?view=stocks
Stock Removed → /member/all-stocks?view=stocks&highlight_product=12
Product Sale → /member/all-stocks?view=transactions
Earnings Update → /member/dashboard
Low Stock Alert → /member/all-stocks?view=stocks
```

## Accessibility Features

### Keyboard Navigation
```
Tab → Focus on bell icon
Enter/Space → Open dropdown
Tab → Navigate through notifications
Enter/Space → Select notification
Escape → Close dropdown
```

### Screen Reader
```
"Notification bell, 3 unread notifications"
"Stock removed notification, unread, 5 minutes ago"
"Click to view details and mark as read"
```

### High Contrast Mode
```
- Clear borders around elements
- High contrast text
- Visible focus indicators
- Sufficient color contrast ratios
```

## Status Indicators

### Loading State
```
🔔 [···]  (Animated dots)
```

### Error State
```
🔔 [!]  (Exclamation mark)
```

### Success State
```
🔔 [✓]  (Checkmark after action)
```

---

This visual guide provides a complete reference for the member notification UI implementation.
