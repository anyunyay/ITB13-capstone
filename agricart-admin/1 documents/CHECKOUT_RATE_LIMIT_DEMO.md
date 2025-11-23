# Checkout Rate Limiting - Visual Demo

## 🎬 Demo Scenario

### Timeline: Customer Shopping Experience

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT TIMELINE                            │
└─────────────────────────────────────────────────────────────────┘

2:00 PM ─┬─ Checkout #1 ✓
         │  Status: Success
         │  Remaining: 2 checkouts
         │  
2:05 PM ─┼─ Checkout #2 ✓
         │  Status: Success
         │  Remaining: 1 checkout
         │  
2:08 PM ─┼─ Checkout #3 ✓
         │  Status: Success
         │  Remaining: 0 checkouts
         │  
2:09 PM ─┼─ Checkout #4 ✗
         │  Status: RATE LIMITED
         │  Message: "Wait 1 minute"
         │  UI: Button disabled, countdown showing
         │  
2:10 PM ─┼─ Checkout #5 ✓
         │  Status: Success (oldest checkout expired)
         │  Remaining: 2 checkouts
         │  
2:15 PM ─┼─ Checkout #6 ✓
         │  Status: Success
         │  Remaining: 1 checkout
         │  
2:18 PM ─┴─ Checkout #7 ✓
             Status: Success
             Remaining: 0 checkouts
```

## 📱 UI States

### State 1: Normal (Can Checkout)
```
╔═══════════════════════════════════════╗
║         ORDER SUMMARY                 ║
╠═══════════════════════════════════════╣
║                                       ║
║  Subtotal:              ₱150.00       ║
║  Delivery Fee (10%):     ₱15.00       ║
║  ─────────────────────────────────    ║
║  Total:                 ₱165.00       ║
║                                       ║
║  ✓ Minimum Order Amount (₱75)        ║
║                                       ║
║  ╔═══════════════════════════════╗   ║
║  ║       CHECKOUT               ║   ║  ← GREEN, ENABLED
║  ╚═══════════════════════════════╝   ║
║                                       ║
╚═══════════════════════════════════════╝
```

### State 2: Rate Limited (5 minutes remaining)
```
╔═══════════════════════════════════════╗
║         ORDER SUMMARY                 ║
╠═══════════════════════════════════════╣
║                                       ║
║  Subtotal:              ₱150.00       ║
║  Delivery Fee (10%):     ₱15.00       ║
║  ─────────────────────────────────    ║
║  Total:                 ₱165.00       ║
║                                       ║
║  ╔═══════════════════════════════╗   ║
║  ║  ⚠ CHECKOUT LIMIT REACHED    ║   ║  ← RED WARNING
║  ║                               ║   ║
║  ║  You have reached the maximum ║   ║
║  ║  of 3 checkouts within        ║   ║
║  ║  10 minutes.                  ║   ║
║  ║                               ║   ║
║  ║  Available in: ┌──────┐       ║   ║
║  ║                │ 5:00 │       ║   ║  ← COUNTDOWN
║  ║                └──────┘       ║   ║
║  ╚═══════════════════════════════╝   ║
║                                       ║
║  ╔═══════════════════════════════╗   ║
║  ║ ⚠ Checkout available in 5:00 ║   ║  ← GRAY, DISABLED
║  ╚═══════════════════════════════╝   ║
║                                       ║
╚═══════════════════════════════════════╝
```

### State 3: Rate Limited (30 seconds remaining)
```
╔═══════════════════════════════════════╗
║         ORDER SUMMARY                 ║
╠═══════════════════════════════════════╣
║                                       ║
║  Subtotal:              ₱150.00       ║
║  Delivery Fee (10%):     ₱15.00       ║
║  ─────────────────────────────────    ║
║  Total:                 ₱165.00       ║
║                                       ║
║  ╔═══════════════════════════════╗   ║
║  ║  ⚠ CHECKOUT LIMIT REACHED    ║   ║
║  ║                               ║   ║
║  ║  You have reached the maximum ║   ║
║  ║  of 3 checkouts within        ║   ║
║  ║  10 minutes.                  ║   ║
║  ║                               ║   ║
║  ║  Available in: ┌─────┐        ║   ║
║  ║                │ 30s │        ║   ║  ← SECONDS FORMAT
║  ║                └─────┘        ║   ║
║  ╚═══════════════════════════════╝   ║
║                                       ║
║  ╔═══════════════════════════════╗   ║
║  ║ ⚠ Checkout available in 30s  ║   ║
║  ╚═══════════════════════════════╝   ║
║                                       ║
╚═══════════════════════════════════════╝
```

### State 4: Countdown Expired (Back to Normal)
```
╔═══════════════════════════════════════╗
║         ORDER SUMMARY                 ║
╠═══════════════════════════════════════╣
║                                       ║
║  Subtotal:              ₱150.00       ║
║  Delivery Fee (10%):     ₱15.00       ║
║  ─────────────────────────────────    ║
║  Total:                 ₱165.00       ║
║                                       ║
║  ✓ Minimum Order Amount (₱75)        ║
║                                       ║
║  ╔═══════════════════════════════╗   ║
║  ║       CHECKOUT               ║   ║  ← GREEN, ENABLED AGAIN
║  ╚═══════════════════════════════╝   ║
║                                       ║
╚═══════════════════════════════════════╝
```

## 🎥 Animation Sequence

### When Rate Limit is Hit

```
Frame 1 (0ms):
User clicks checkout → Request sent to server

Frame 2 (200ms):
Server responds with rate limit error

Frame 3 (300ms):
Page reloads with rate limit info

Frame 4 (400ms):
Warning banner fades in ↓

Frame 5 (500ms):
Countdown timer appears: 5:00

Frame 6 (1500ms):
Timer updates: 4:59

Frame 7 (2500ms):
Timer updates: 4:58

... continues every second ...
```

### When Countdown Expires

```
Frame 1:
Timer shows: 0:03

Frame 2 (1s later):
Timer shows: 0:02

Frame 3 (1s later):
Timer shows: 0:01

Frame 4 (1s later):
Timer shows: 0:00

Frame 5 (100ms later):
Warning banner fades out ↑

Frame 6 (200ms later):
Button changes to green

Frame 7 (300ms later):
Button becomes enabled
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CHECKOUT FLOW                       │
└─────────────────────────────────────────────────────────────┘

User clicks "Checkout"
        ↓
┌───────────────────┐
│  CartController   │
│   checkout()      │
└───────────────────┘
        ↓
┌───────────────────────────────────┐
│  CheckoutRateLimiter              │
│  canCheckout($userId)             │
│                                   │
│  Query: SELECT * FROM             │
│  checkout_rate_limits             │
│  WHERE user_id = ?                │
│  AND checkout_at >= NOW() - 10min │
└───────────────────────────────────┘
        ↓
   ┌────┴────┐
   │  Count  │
   └────┬────┘
        │
   ┌────┴────────────────────────┐
   │                             │
   │ < 3 checkouts?              │ ≥ 3 checkouts?
   │                             │
   ↓                             ↓
┌──────────────┐        ┌──────────────────┐
│  ALLOWED     │        │  RATE LIMITED    │
│              │        │                  │
│ Process      │        │ Calculate reset  │
│ checkout     │        │ time             │
│              │        │                  │
│ Record in    │        │ Return error     │
│ database     │        │ with countdown   │
│              │        │                  │
│ Clear cart   │        │ Redirect to cart │
│              │        │ with rate limit  │
│ Success!     │        │ info             │
└──────────────┘        └──────────────────┘
        ↓                       ↓
┌──────────────┐        ┌──────────────────┐
│  Frontend    │        │  Frontend        │
│              │        │                  │
│ Show success │        │ Show warning     │
│ message      │        │ banner           │
│              │        │                  │
│              │        │ Start countdown  │
│              │        │ timer            │
│              │        │                  │
│              │        │ Disable button   │
└──────────────┘        └──────────────────┘
```

## 🔄 State Machine

```
┌─────────────────────────────────────────────────────────────┐
│              CHECKOUT RATE LIMIT STATE MACHINE              │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   INITIAL    │
                    │  (Page Load) │
                    └──────┬───────┘
                           │
                           ↓
                  ┌────────────────┐
                  │  Check Rate    │
                  │  Limit Status  │
                  └────────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ↓                         ↓
    ┌─────────────────┐      ┌─────────────────┐
    │   NOT LIMITED   │      │  RATE LIMITED   │
    │                 │      │                 │
    │ • Button ON     │      │ • Button OFF    │
    │ • No warning    │      │ • Show warning  │
    │ • Can checkout  │      │ • Show timer    │
    └────────┬────────┘      └────────┬────────┘
             │                        │
             │                        ↓
             │              ┌─────────────────┐
             │              │  COUNTDOWN      │
             │              │  ACTIVE         │
             │              │                 │
             │              │ • Timer updates │
             │              │ • Every second  │
             │              └────────┬────────┘
             │                       │
             │                       ↓
             │              ┌─────────────────┐
             │              │  Timer = 0      │
             │              └────────┬────────┘
             │                       │
             └───────────────────────┘
                           │
                           ↓
                  ┌────────────────┐
                  │  CHECKOUT      │
                  │  AVAILABLE     │
                  └────────────────┘
```

## 💻 Code Flow

### Backend (PHP)
```php
// 1. Check rate limit
$check = CheckoutRateLimiter::canCheckout($userId);

// 2. If not allowed
if (!$check['allowed']) {
    $message = CheckoutRateLimiter::getRateLimitMessage($check['reset_at']);
    return redirect()->back()->with('error', $message);
}

// 3. Process checkout
// ... checkout logic ...

// 4. Record successful checkout
CheckoutRateLimiter::recordCheckout($userId);
```

### Frontend (TypeScript/React)
```typescript
// 1. Receive rate limit info from server
const rateLimitInfo = page?.props?.rateLimitInfo;

// 2. Initialize state
const [isRateLimited, setIsRateLimited] = useState(false);
const [countdownText, setCountdownText] = useState('');
const [resetTime, setResetTime] = useState<Date | null>(null);

// 3. Start countdown timer
useEffect(() => {
    if (!isRateLimited || !resetTime) return;
    
    const interval = setInterval(() => {
        const diff = resetTime.getTime() - Date.now();
        
        if (diff <= 0) {
            setIsRateLimited(false);
            return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        setCountdownText(
            minutes > 0 
                ? `${minutes}:${seconds.toString().padStart(2, '0')}`
                : `${seconds}s`
        );
    }, 1000);
    
    return () => clearInterval(interval);
}, [isRateLimited, resetTime]);

// 4. Render UI
<Button disabled={isRateLimited}>
    {isRateLimited ? `Checkout available in ${countdownText}` : 'Checkout'}
</Button>
```

## 🎯 Key Interactions

### User Attempts Checkout (Rate Limited)
```
1. User clicks "Checkout" button
   ↓
2. Button shows loading state
   ↓
3. Request sent to server
   ↓
4. Server checks rate limit
   ↓
5. Server returns error (rate limited)
   ↓
6. Page redirects to cart
   ↓
7. Cart page loads with rate limit info
   ↓
8. Warning banner appears
   ↓
9. Countdown timer starts
   ↓
10. Button becomes disabled
    ↓
11. User sees countdown: 5:00 → 4:59 → 4:58 → ...
```

### User Waits for Countdown
```
1. User sees countdown timer
   ↓
2. Timer updates every second
   ↓
3. User can browse other pages
   ↓
4. User returns to cart
   ↓
5. Timer still counting (recalculated from server time)
   ↓
6. Timer reaches 0:00
   ↓
7. Warning banner fades out
   ↓
8. Button becomes enabled
   ↓
9. User can checkout again
```

## 📱 Responsive Behavior

### Desktop (1920x1080)
```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  Home  Products  Cart  Orders         [User Menu]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────┐    │
│  │                         │  │  ORDER SUMMARY       │    │
│  │   CART ITEMS            │  │                      │    │
│  │                         │  │  ⚠ Rate Limited      │    │
│  │   [Product 1]           │  │  Countdown: 5:30     │    │
│  │   [Product 2]           │  │                      │    │
│  │   [Product 3]           │  │  [CHECKOUT DISABLED] │    │
│  │                         │  │                      │    │
│  └─────────────────────────┘  └──────────────────────┘    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Mobile (375x667)
```
┌──────────────────────┐
│  [☰]  Cart    [👤]   │
├──────────────────────┤
│                      │
│  CART ITEMS          │
│  ┌────────────────┐  │
│  │  [Product 1]   │  │
│  └────────────────┘  │
│  ┌────────────────┐  │
│  │  [Product 2]   │  │
│  └────────────────┘  │
│                      │
│  ORDER SUMMARY       │
│  ┌────────────────┐  │
│  │ ⚠ Rate Limited │  │
│  │                │  │
│  │ Countdown:     │  │
│  │    5:30        │  │
│  │                │  │
│  │ [CHECKOUT OFF] │  │
│  └────────────────┘  │
│                      │
└──────────────────────┘
```

## ✨ Summary

This visual demo shows:
- ✅ Complete user journey through rate limiting
- ✅ UI states at different stages
- ✅ Animation sequences
- ✅ Data flow through the system
- ✅ State machine transitions
- ✅ Code flow (backend & frontend)
- ✅ Responsive behavior on different devices

The implementation provides a smooth, intuitive experience that clearly communicates rate limit status to users while preventing abuse.
