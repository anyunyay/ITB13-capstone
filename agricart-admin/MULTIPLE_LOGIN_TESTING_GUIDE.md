# Multiple Login Detection - Testing Guide

## Quick Test Steps

### Test 1: Basic Multiple Login Detection

1. **Open Browser A** (e.g., Chrome)
   - Navigate to login page
   - Login with test account
   - You should be redirected to dashboard
   - Keep this browser open

2. **Open Browser B** (e.g., Firefox or Chrome Incognito)
   - Navigate to login page
   - Login with the SAME account
   - **Expected**: You should see a modal titled "Multiple Login Detected"
   - **Expected**: Modal shows account email and two buttons

3. **Verify Modal Content**
   - Title: "Multiple Login Detected"
   - Description: "Your account is already logged in from another device or browser."
   - Account email is displayed
   - Two buttons visible:
     - "Continue Here & End Other Session" (red/destructive)
     - "Cancel & Keep Other Session" (outline)

### Test 2: Continue Here (Force Logout)

1. **In Browser B** (from Test 1)
   - Click "Continue Here & End Other Session"
   - **Expected**: You should be redirected to dashboard
   - **Expected**: Browser B is now the active session

2. **In Browser A** (within 5-10 seconds)
   - **Expected**: A modal appears titled "Your Session Has Ended"
   - **Expected**: Reason shown: "You logged in on another device or browser."
   - **Expected**: 10-second countdown timer visible
   - **Expected**: "Return to Login Now" button visible

3. **Wait for countdown or click button**
   - **Expected**: You are logged out
   - **Expected**: Redirected to home page

### Test 3: Cancel Button

1. **Open Browser A**
   - Login with test account
   - Keep browser open

2. **Open Browser B**
   - Try to login with same account
   - Modal appears: "Multiple Login Detected"
   - Click "Cancel & Keep Other Session"
   - **Expected**: You are logged out from Browser B
   - **Expected**: Redirected to home page

3. **In Browser A**
   - **Expected**: Session remains active
   - **Expected**: No modal appears
   - **Expected**: Can continue using the application

### Test 4: All User Types

Repeat Tests 1-3 for each user type:

- [ ] **Customer** - Login at `/login`
- [ ] **Admin** - Login at `/admin/login`
- [ ] **Staff** - Login at `/admin/login`
- [ ] **Member** - Login at `/member/login`
- [ ] **Logistic** - Login at `/logistic/login`

### Test 5: Modal Behavior

1. **Try to close modal during processing**
   - Click "Continue Here & End Other Session"
   - Try to click outside modal or press ESC
   - **Expected**: Modal cannot be closed while processing

2. **Close modal with X button (when not processing)**
   - Open multiple login modal
   - Click X button in top-right
   - **Expected**: Same behavior as clicking "Cancel"

### Test 6: Session Monitoring

1. **Login on Browser A**
   - Open browser console (F12)
   - Go to Network tab
   - Filter by "session"

2. **Observe polling**
   - **Expected**: See requests to `/api/session/check` every 5 seconds
   - **Expected**: Response: `{"valid":true}`

3. **Login on Browser B and continue**
   - In Browser A's console
   - **Expected**: Within 5-10 seconds, see response: `{"valid":false,"reason":"You logged in on another device or browser."}`
   - **Expected**: Session ended modal appears

### Test 7: Edge Cases

1. **Network Error Handling**
   - Login on Browser A
   - Disconnect internet
   - Wait 10 seconds
   - Reconnect internet
   - **Expected**: Session monitoring resumes
   - **Expected**: No errors in console

2. **Rapid Multiple Logins**
   - Login on Browser A
   - Quickly login on Browser B and continue
   - Immediately login on Browser C and continue
   - **Expected**: Only Browser C remains active
   - **Expected**: Both A and B show session ended modal

3. **Normal Logout**
   - Login on Browser A
   - Click logout normally
   - **Expected**: No session ended modal
   - **Expected**: Redirected to home page

## Expected Console Output

### Browser A (Active Session)
```
[Session Monitor] Checking session validity...
[Session Monitor] Session valid: true
[Session Monitor] Checking session validity...
[Session Monitor] Session valid: true
```

### Browser A (After Being Terminated)
```
[Session Monitor] Checking session validity...
[Session Monitor] Session invalid: You logged in on another device or browser.
[Session Monitor] Showing session ended modal
```

### Browser B (New Login Attempt)
```
[Inertia] Navigating to: /single-session/restricted
[Modal] Multiple login detected for: user@example.com
```

## Common Issues and Solutions

### Issue: Modal doesn't appear on old session
**Solution**: 
- Check browser console for errors
- Verify `/api/session/check` returns 200
- Ensure session monitoring is running (check Network tab)

### Issue: "Continue Here" doesn't work
**Solution**:
- Check `/single-session/force-logout` route exists
- Verify CSRF token is valid
- Check database for `current_session_id` column

### Issue: Cancel button causes error
**Solution**:
- Verify `/logout` route is accessible
- Check browser console for JavaScript errors
- Ensure logout route doesn't require additional parameters

### Issue: Session monitoring stops
**Solution**:
- Check if component unmounted
- Verify no JavaScript errors in console
- Ensure user is still authenticated

## Performance Checks

1. **Network Traffic**
   - Open Network tab
   - Monitor for 1 minute
   - **Expected**: ~12 requests to `/api/session/check` (one every 5 seconds)
   - **Expected**: Each request < 100ms response time
   - **Expected**: Payload size < 100 bytes

2. **Memory Usage**
   - Open Performance Monitor
   - Login and wait 5 minutes
   - **Expected**: No memory leaks
   - **Expected**: Stable memory usage

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile
- [ ] Safari Mobile

## Test Accounts

Create test accounts for each user type:
```
Customer: customer@test.com / password
Admin: admin@test.com / password
Staff: staff@test.com / password
Member: member@test.com / password
Logistic: logistic@test.com / password
```

## Automated Testing (Optional)

If you have automated tests, add these scenarios:

```php
// Feature Test Example
public function test_multiple_login_shows_restriction_modal()
{
    $user = User::factory()->create();
    
    // First login
    $this->actingAs($user)->get('/dashboard');
    
    // Second login attempt
    $response = $this->actingAs($user)->get('/dashboard');
    
    $response->assertRedirect('/single-session/restricted');
}

public function test_force_logout_terminates_other_sessions()
{
    $user = User::factory()->create();
    
    // Create first session
    $this->actingAs($user)->get('/dashboard');
    $firstSessionId = session()->getId();
    
    // Create second session and force logout
    $this->actingAs($user)->post('/single-session/force-logout');
    
    // Verify first session is deleted
    $this->assertDatabaseMissing('sessions', ['id' => $firstSessionId]);
}
```

## Success Criteria

✅ All modals appear correctly without page redirects
✅ Cancel button properly logs out and keeps other session active
✅ Continue button terminates all previous sessions
✅ Session ended modal appears on old sessions within 10 seconds
✅ Countdown timer works correctly
✅ No UI glitches or flashing
✅ Works across all user types
✅ Works in different browsers
✅ No console errors
✅ Session monitoring runs continuously
✅ Proper cleanup on logout

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. User type being tested
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)
6. Network tab screenshot
7. Video recording (if possible)
