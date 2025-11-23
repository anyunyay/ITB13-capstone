# Checkout Rate Limit - Quick Reference

## Summary
✅ **3 checkouts maximum per 10-minute rolling window per customer account**

## Key Points

### Limits
- **Max Checkouts**: 3
- **Time Window**: 10 minutes (rolling)
- **Scope**: Per user account
- **Action**: Blocks additional checkouts with error message

### User Experience
```
Checkout 1 → ✓ Success (2 remaining)
Checkout 2 → ✓ Success (1 remaining)
Checkout 3 → ✓ Success (0 remaining)
Checkout 4 → ✗ Blocked "Please try again in X minutes"
```

### User Experience When Rate Limited

**Visual Feedback**:
- 🔴 Checkout button disabled
- ⏱️ Real-time countdown timer displayed
- ⚠️ Warning banner with rate limit message
- ✅ Button automatically re-enables when timer expires

**Countdown Display**:
- Format: `5:30` (5 minutes 30 seconds) or `45s` (45 seconds)
- Updates every second
- Visible in checkout button and warning banner

**Error Message**:
```
"You have reached the maximum checkout limit (3 checkouts per 10 minutes). 
Please try again in X minute(s)."
```

## Technical Implementation

### Files Created
1. `database/migrations/2025_11_23_200954_create_checkout_rate_limits_table.php`
2. `app/Models/CheckoutRateLimit.php`
3. `app/Services/CheckoutRateLimiter.php`

### Files Modified
1. `app/Http/Controllers/Customer/CartController.php`
   - Added rate limit check before checkout
   - Records successful checkouts
   - Logs rate limit events
   - Passes rate limit info to frontend
2. `resources/js/pages/Customer/Cart/index.tsx`
   - Added countdown timer logic
   - Real-time updates every second
   - Automatic button re-enable
3. `resources/js/pages/Customer/Cart/components/CartSummary.tsx`
   - Displays rate limit warning
   - Shows countdown timer
   - Disables checkout button
4. `resources/lang/en/ui.php` & `resources/lang/tl/ui.php`
   - Added rate limit translation keys

### Database Table
```
checkout_rate_limits
├── id
├── user_id (indexed)
├── checkout_at (indexed)
├── created_at
└── updated_at
```

## Code Usage

### Check if User Can Checkout
```php
$check = CheckoutRateLimiter::canCheckout($userId);
// Returns: ['allowed' => bool, 'remaining' => int, 'reset_at' => Carbon|null]
```

### Record Successful Checkout
```php
CheckoutRateLimiter::recordCheckout($userId);
```

### Get Error Message
```php
$message = CheckoutRateLimiter::getRateLimitMessage($resetAt);
```

### Reset User Limit (Admin)
```php
CheckoutRateLimiter::resetUserLimit($userId);
```

## Configuration
Edit constants in `CheckoutRateLimiter.php`:
```php
const MAX_CHECKOUTS = 3;           // Change limit
const TIME_WINDOW_MINUTES = 10;    // Change window
```

## Testing Commands

### Run Migration
```bash
php artisan migrate
```

### Test Scenario
1. Login as customer
2. Add items to cart
3. Checkout 3 times quickly
4. Attempt 4th checkout → Should be blocked
5. Wait 10 minutes from first checkout
6. Try again → Should succeed

## Monitoring

### System Logs
All events are logged via `SystemLogger::logCheckout()`:
- Successful checkouts (with remaining count)
- Rate limited attempts (with reset time)
- Failed checkouts (with error details)

### Database Cleanup
- Automatic cleanup of records older than 20 minutes
- Runs after each successful checkout
- Prevents table bloat

## Benefits
✅ Prevents checkout abuse  
✅ Fair usage for all customers  
✅ Reduces system load  
✅ Fraud prevention  
✅ Clear user feedback  
✅ Automatic cleanup  
✅ Performance optimized  

## Rolling Window Example
```
Time    | Action      | Status | Next Available
--------|-------------|--------|----------------
2:00 PM | Checkout #1 | ✓      | Immediate
2:05 PM | Checkout #2 | ✓      | Immediate
2:08 PM | Checkout #3 | ✓      | 2:10 PM
2:09 PM | Checkout #4 | ✗      | 2:10 PM
2:10 PM | Checkout #5 | ✓      | 2:15 PM
```

The window "rolls" - each checkout's 10-minute timer is independent.
