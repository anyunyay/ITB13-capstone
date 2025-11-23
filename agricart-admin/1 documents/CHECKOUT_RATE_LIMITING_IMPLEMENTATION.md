# Checkout Rate Limiting Implementation

## Overview
Implemented a rate-limiting system for customer checkouts to prevent abuse and ensure fair usage. Each customer account is limited to **3 successful checkouts within any rolling 10-minute window**.

## Features

### Rate Limit Configuration
- **Maximum Checkouts**: 3 per user
- **Time Window**: 10 minutes (rolling window)
- **Scope**: Per user account
- **Type**: Rolling window (not fixed intervals)

### How It Works

1. **Before Checkout**
   - System checks the user's checkout history within the last 10 minutes
   - If user has made 3+ checkouts, the request is blocked
   - User receives a clear error message with countdown timer

2. **After Successful Checkout**
   - System records the checkout timestamp
   - Automatically cleans up old records (older than 20 minutes)

3. **Rolling Window**
   - The 10-minute window rolls with each checkout
   - Example: If you checkout at 2:00 PM, 2:05 PM, and 2:08 PM, you must wait until 2:10 PM for the next checkout

## Database Schema

### `checkout_rate_limits` Table
```sql
- id (primary key)
- user_id (foreign key to users)
- checkout_at (timestamp)
- created_at
- updated_at
- Index on (user_id, checkout_at) for fast queries
```

## Implementation Files

### 1. Migration
**File**: `database/migrations/2025_11_23_200954_create_checkout_rate_limits_table.php`
- Creates the `checkout_rate_limits` table
- Adds indexes for performance

### 2. Model
**File**: `app/Models/CheckoutRateLimit.php`
- Eloquent model for checkout rate limit records
- Relationships with User model

### 3. Service
**File**: `app/Services/CheckoutRateLimiter.php`

**Key Methods**:
- `canCheckout($userId)` - Check if user can checkout
- `recordCheckout($userId)` - Record a successful checkout
- `cleanupOldRecords($userId)` - Remove expired records
- `getRateLimitMessage($resetAt)` - Generate user-friendly error message
- `resetUserLimit($userId)` - Admin function to reset limits

### 4. Controller Integration
**File**: `app/Http/Controllers/Customer/CartController.php`
- Rate limit check added at the start of `checkout()` method
- Records successful checkouts after order placement
- Logs rate limit events for monitoring
- Passes rate limit info to frontend via Inertia props

### 5. Frontend Components
**Files**: 
- `resources/js/pages/Customer/Cart/index.tsx` - Main cart page with countdown logic
- `resources/js/pages/Customer/Cart/components/CartSummary.tsx` - Displays rate limit warning and countdown

**Features**:
- Real-time countdown timer (updates every second)
- Disabled checkout button when rate limited
- Visual warning banner with countdown
- Automatic re-enable when cooldown expires
- Responsive design for all screen sizes

## Error Messages & UI Feedback

### When Rate Limited

**Backend Error Message** (when attempting checkout):
```
"You have reached the maximum checkout limit (3 checkouts per 10 minutes). 
Please try again in X minute(s)."
```

**Frontend UI Display**:
- Checkout button is disabled
- Real-time countdown timer displayed showing time remaining
- Visual warning banner with rate limit information
- Timer updates every second until cooldown expires
- Button automatically re-enables when cooldown completes

**Countdown Format**:
- Minutes and seconds: `5:30` (5 minutes 30 seconds)
- Seconds only: `45s` (45 seconds)

## Usage Examples

### Scenario 1: Normal Usage
```
2:00 PM - Checkout #1 ✓ (2 remaining)
2:05 PM - Checkout #2 ✓ (1 remaining)
2:15 PM - Checkout #3 ✓ (0 remaining)
2:20 PM - Checkout #4 ✓ (First checkout at 2:00 PM expired)
```

### Scenario 2: Rate Limited
```
2:00 PM - Checkout #1 ✓
2:03 PM - Checkout #2 ✓
2:06 PM - Checkout #3 ✓
2:08 PM - Checkout #4 ✗ (Rate limited - wait until 2:10 PM)
```

## System Logging

All checkout attempts are logged with the following information:
- **Successful Checkout**: Includes rate limit remaining count
- **Rate Limited**: Includes current count and reset time
- **Failed Checkout**: Includes error details

## Admin Functions

### Reset User Rate Limit
```php
CheckoutRateLimiter::resetUserLimit($userId);
```

This can be used by admins to manually reset a user's rate limit if needed.

## Performance Considerations

1. **Indexed Queries**: The `(user_id, checkout_at)` index ensures fast lookups
2. **Automatic Cleanup**: Old records are automatically deleted to prevent table bloat
3. **Minimal Overhead**: Only adds one database query before checkout

## Security Benefits

1. **Prevents Abuse**: Stops users from rapidly placing multiple orders
2. **Fair Usage**: Ensures all customers have equal access to checkout
3. **System Protection**: Reduces load on order processing systems
4. **Fraud Prevention**: Makes it harder to exploit the system

## Testing Checklist

- [ ] User can checkout 3 times within 10 minutes
- [ ] 4th checkout within 10 minutes is blocked
- [ ] Checkout button is disabled when rate limited
- [ ] Countdown timer displays and updates in real-time
- [ ] Timer shows correct format (MM:SS or Xs)
- [ ] Button re-enables automatically when countdown reaches zero
- [ ] User can checkout again after oldest checkout expires
- [ ] Error message shows correct countdown time
- [ ] Rate limit resets properly after time window
- [ ] Multiple users don't interfere with each other's limits
- [ ] System logs all rate limit events
- [ ] Old records are cleaned up automatically
- [ ] UI is responsive on mobile devices
- [ ] Countdown persists across page refreshes

## Configuration

To modify the rate limit settings, edit the constants in `CheckoutRateLimiter.php`:

```php
const MAX_CHECKOUTS = 3;           // Maximum checkouts allowed
const TIME_WINDOW_MINUTES = 10;    // Time window in minutes
```

## Future Enhancements

Possible improvements:
1. Different limits for different user types (VIP, regular, etc.)
2. Admin dashboard to view rate limit statistics
3. Configurable limits via admin panel
4. Email notifications when users hit rate limits frequently
5. Grace period for legitimate high-volume customers
