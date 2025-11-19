# Single-Session System - Quick Test Guide

## Quick Test (5 minutes)

### Setup
1. Open two different browsers (e.g., Chrome and Firefox)
2. Or use one normal window and one incognito window

### Test 1: Cancel Button (2 minutes)
```
Browser A:
1. Go to login page
2. Login with any account
3. Verify you're logged in
4. Navigate to a few pages (confirm session is active)

Browser B:
5. Go to login page
6. Login with THE SAME account
7. You should see "Multiple Login Detected" page
8. ⚠️ IMPORTANT: Check Browser A - it should STILL be working (no interruption)
9. Click "Cancel & Keep Other Session"
10. ✅ Should redirect to login page (no errors)

Browser A:
11. ✅ Should STILL be logged in and working
12. ✅ Navigate around - everything should work normally
13. ✅ NO session ended modal should appear
```

### Test 2: Continue with New Login (3 minutes)
```
Browser A:
1. Go to login page
2. Login with any account
3. Navigate around (to confirm you're logged in)

Browser B:
4. Go to login page
5. Login with THE SAME account
6. You should see "Multiple Login Detected" page
7. ⚠️ IMPORTANT: Check Browser A - it should STILL be working (no interruption yet)
8. Click "End Other Session & Login Here"
9. ✅ Should login successfully

Browser A (within 5-10 seconds):
10. ✅ Should see "Your Session Has Ended" modal
11. ✅ Modal should display comprehensive security message:
    - "Your previous session has been automatically closed..."
    - "For your security, the system only allows one active session..."
    - "If this wasn't you, please change your password immediately..."
12. ✅ Should see countdown from 10 seconds
13. Wait for countdown OR click "Return to Login Now"
14. ✅ Should logout and redirect to CORRECT login page:
    - Customer → /login
    - Admin/Staff → /admin/login
    - Member → /member/login
    - Logistic → /logistic/login
```

## Critical Test: No Premature Termination

**This is the most important test!**

```
Browser A:
1. Login and navigate to dashboard
2. Keep this browser open and visible

Browser B:
3. Login with same account
4. You should see "Multiple Login Detected" page
5. ⚠️ CRITICAL: Look at Browser A immediately
6. ✅ Browser A should STILL be working (no modal, no logout)
7. ✅ Try clicking around in Browser A - everything should work
8. ✅ Browser A should NOT show any "Session Ended" modal

Browser B:
9. Now click "Cancel & Keep Other Session"
10. Browser B logs out and returns to login

Browser A:
11. ✅ Should STILL be working perfectly
12. ✅ NO modal should appear
13. ✅ Session should remain active indefinitely
```

**If Browser A shows a modal or logs out before you click Continue in Browser B, the fix is NOT working correctly!**

## Expected Results

### Cancel Button
- ✅ No console errors
- ✅ Clean redirect to login page
- ✅ Other session remains active
- ✅ **NO premature termination of previous session**

### Continue with New Login
- ✅ New session logs in successfully
- ✅ Old session shows modal within 5-10 seconds (ONLY after clicking Continue)
- ✅ Modal has clear message
- ✅ Countdown works (10 seconds)
- ✅ Logout is clean (no errors)

## Common Issues

### Modal doesn't appear
- Wait up to 10 seconds (polling interval is 5 seconds)
- Check browser console for errors
- Verify you're on a page that's not the login page

### Cancel button gives error
- Clear browser cache
- Rebuild frontend: `npm run build`
- Check Laravel logs: `storage/logs/laravel.log`

## User Types to Test

Test with different user types to verify redirects:

### Customer Test
1. Login as customer on Browser A
2. Login as same customer on Browser B and click "Continue"
3. Browser A should show modal and redirect to `/login` ✅

### Admin Test
1. Login as admin on Browser A
2. Login as same admin on Browser B and click "Continue"
3. Browser A should show modal and redirect to `/admin/login` ✅

### Member Test
1. Login as member on Browser A
2. Login as same member on Browser B and click "Continue"
3. Browser A should show modal and redirect to `/member/login` ✅

### Logistic Test
1. Login as logistic on Browser A
2. Login as same logistic on Browser B and click "Continue"
3. Browser A should show modal and redirect to `/logistic/login` ✅

## Success Criteria

✅ All tests pass without errors
✅ No console warnings or errors
✅ Clean user experience
✅ Clear messaging
✅ Proper redirects for each user type
