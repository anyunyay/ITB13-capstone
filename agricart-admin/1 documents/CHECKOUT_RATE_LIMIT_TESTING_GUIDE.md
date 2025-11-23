# Checkout Rate Limit - Testing Guide

## Test Environment Setup

### Prerequisites
1. Database migration completed: `php artisan migrate`
2. At least one customer account
3. Products with available stock
4. Valid delivery address configured

## Test Cases

### Test 1: Normal Checkout Flow (Pass)
**Objective**: Verify user can complete 3 checkouts successfully

**Steps**:
1. Login as customer
2. Add items to cart (ensure total ≥ ₱75)
3. Complete checkout #1
   - ✅ Should succeed
   - ✅ Message: "Order placed successfully!"
4. Add items to cart again
5. Complete checkout #2
   - ✅ Should succeed
   - ✅ Message: "Order placed successfully!"
6. Add items to cart again
7. Complete checkout #3
   - ✅ Should succeed
   - ✅ Message: "Order placed successfully!"

**Expected Result**: All 3 checkouts complete successfully

---

### Test 2: Rate Limit Enforcement (Block)
**Objective**: Verify 4th checkout is blocked within 10 minutes

**Steps**:
1. Continue from Test 1 (3 checkouts completed)
2. Add items to cart immediately
3. Navigate to cart page
   - ✅ Checkout button should be disabled
   - ✅ Warning banner displayed with rate limit message
   - ✅ Countdown timer visible and updating
4. Attempt to click checkout button
   - ❌ Button should not respond (disabled state)
5. Observe countdown timer
   - ✅ Timer updates every second
   - ✅ Shows format: `MM:SS` or `Xs`
   - ✅ Countdown is accurate

**Expected Result**: Checkout blocked with disabled button and real-time countdown

---

### Test 3: Rolling Window Reset (Pass)
**Objective**: Verify checkout becomes available after oldest checkout expires

**Steps**:
1. Note the time of checkout #1 from Test 1
2. Wait until 10 minutes have passed since checkout #1
3. Attempt checkout #4
   - ✅ Should succeed
   - ✅ Message: "Order placed successfully!"

**Expected Result**: Checkout succeeds after window expires

---

### Test 4: Multiple Users Independence (Pass)
**Objective**: Verify rate limits are per-user, not global

**Steps**:
1. User A: Complete 3 checkouts (rate limited)
2. User B: Login and attempt checkout
   - ✅ Should succeed
   - ✅ User B is not affected by User A's limit

**Expected Result**: Each user has independent rate limits

---

### Test 5: Countdown Timer Accuracy (Pass)
**Objective**: Verify countdown timer is accurate and updates in real-time

**Steps**:
1. Complete 3 checkouts at known times:
   - Checkout #1: 2:00:00 PM
   - Checkout #2: 2:03:00 PM
   - Checkout #3: 2:06:00 PM
2. Navigate to cart at 2:07:00 PM
   - ✅ Timer should show approximately `3:00` (3 minutes until 2:10:00 PM)
3. Wait and observe timer
   - ✅ Timer counts down: `2:59`, `2:58`, `2:57`...
   - ✅ Updates every second without lag
4. Observe at 2:09:30 PM
   - ✅ Timer should show `0:30` or `30s`
5. Watch timer reach zero
   - ✅ At 2:10:00 PM, timer disappears
   - ✅ Checkout button becomes enabled
   - ✅ Warning banner disappears

**Expected Result**: Countdown is accurate, updates smoothly, and button re-enables automatically

---

### Test 6: Countdown Timer Persistence (Pass)
**Objective**: Verify countdown persists across page refreshes

**Steps**:
1. Get rate limited (3 checkouts completed)
2. Note the countdown time (e.g., `5:30`)
3. Refresh the page (F5 or Ctrl+R)
   - ✅ Countdown timer still visible
   - ✅ Time is recalculated correctly based on server time
   - ✅ Button remains disabled
4. Navigate away and back to cart
   - ✅ Countdown timer still present
   - ✅ Shows correct remaining time

**Expected Result**: Countdown persists and recalculates correctly after page refresh

---

### Test 7: Database Cleanup (Pass)
**Objective**: Verify old records are cleaned up

**Steps**:
1. Complete a checkout
2. Check database: `SELECT * FROM checkout_rate_limits WHERE user_id = X;`
3. Wait 20+ minutes
4. Complete another checkout
5. Check database again
   - ✅ Old record (20+ minutes) should be deleted
   - ✅ Only recent records remain

**Expected Result**: Records older than 20 minutes are automatically deleted

---

### Test 7: System Logging (Pass)
**Objective**: Verify all events are logged

**Steps**:
1. Complete a successful checkout
   - ✅ Check logs for "success" status with rate_limit_remaining
2. Trigger rate limit
   - ✅ Check logs for "rate_limited" status with reset_at
3. Verify log entries contain:
   - User ID
   - Timestamp
   - Status (success/rate_limited/failed)
   - Additional context

**Expected Result**: All checkout attempts are properly logged

---

### Test 8: Empty Cart Protection (Pass)
**Objective**: Verify rate limit doesn't apply to empty cart attempts

**Steps**:
1. Complete 3 checkouts (rate limited)
2. Clear cart
3. Attempt checkout with empty cart
   - ✅ Should show "Your cart is empty" (not rate limit message)

**Expected Result**: Empty cart check happens before rate limit check

---

### Test 9: Concurrent Checkouts (Edge Case)
**Objective**: Verify race condition handling

**Steps**:
1. Complete 2 checkouts
2. Open two browser tabs
3. Attempt checkout simultaneously in both tabs
   - ✅ One should succeed (3rd checkout)
   - ✅ One should be blocked (4th checkout)

**Expected Result**: System handles concurrent requests correctly

---

### Test 10: Admin Reset Function (Pass)
**Objective**: Verify admin can reset user limits

**Steps**:
1. User completes 3 checkouts (rate limited)
2. Admin runs: `CheckoutRateLimiter::resetUserLimit($userId);`
3. User attempts checkout immediately
   - ✅ Should succeed
   - ✅ Rate limit has been reset

**Expected Result**: Admin can manually reset limits

---

## Database Verification Queries

### Check User's Recent Checkouts
```sql
SELECT * FROM checkout_rate_limits 
WHERE user_id = [USER_ID] 
ORDER BY checkout_at DESC;
```

### Count Checkouts in Last 10 Minutes
```sql
SELECT COUNT(*) FROM checkout_rate_limits 
WHERE user_id = [USER_ID] 
AND checkout_at >= NOW() - INTERVAL 10 MINUTE;
```

### View All Active Rate Limits
```sql
SELECT user_id, COUNT(*) as checkout_count, 
       MIN(checkout_at) as oldest_checkout,
       MAX(checkout_at) as newest_checkout
FROM checkout_rate_limits 
WHERE checkout_at >= NOW() - INTERVAL 10 MINUTE
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

## Log Verification

### Check System Logs
```bash
# View recent checkout logs
tail -f storage/logs/laravel.log | grep "checkout"

# Search for rate limit events
grep "rate_limited" storage/logs/laravel.log
```

## Performance Testing

### Load Test Scenario
1. Create 10 test users
2. Each user performs 3 checkouts rapidly
3. Monitor database performance
4. Verify:
   - ✅ All queries complete in < 100ms
   - ✅ No database locks
   - ✅ Cleanup runs efficiently

## Troubleshooting

### Issue: Rate limit not working
**Check**:
- Migration ran successfully
- `CheckoutRateLimiter` service imported in controller
- Database table exists and has correct schema

### Issue: Incorrect countdown time
**Check**:
- Server timezone configuration
- Carbon date handling
- Database timestamp storage

### Issue: Records not cleaning up
**Check**:
- `cleanupOldRecords()` is called after `recordCheckout()`
- Database permissions for DELETE operations

## Success Criteria

✅ All 10 test cases pass  
✅ Error messages are clear and accurate  
✅ Rate limits are enforced consistently  
✅ No performance degradation  
✅ Logs capture all events  
✅ Database cleanup works automatically  
✅ Multiple users don't interfere with each other  
✅ Rolling window calculates correctly  

## Test Report Template

```
Test Date: ___________
Tester: ___________

Test 1 (Normal Flow):        [ ] Pass  [ ] Fail
Test 2 (Rate Limit):          [ ] Pass  [ ] Fail
Test 3 (Rolling Window):      [ ] Pass  [ ] Fail
Test 4 (Multi-User):          [ ] Pass  [ ] Fail
Test 5 (Error Messages):      [ ] Pass  [ ] Fail
Test 6 (Cleanup):             [ ] Pass  [ ] Fail
Test 7 (Logging):             [ ] Pass  [ ] Fail
Test 8 (Empty Cart):          [ ] Pass  [ ] Fail
Test 9 (Concurrent):          [ ] Pass  [ ] Fail
Test 10 (Admin Reset):        [ ] Pass  [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```
