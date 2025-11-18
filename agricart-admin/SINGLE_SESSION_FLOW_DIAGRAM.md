# Single-Session System - Flow Diagram

## Flow 1: Cancel Button (Keep Other Session)

```
┌─────────────────────────────────────────────────────────────┐
│                    Device A (Already Logged In)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User browsing dashboard                              │  │
│  │  Session ID: abc123                                   │  │
│  │  Status: Active ✓                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ No interruption
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Device B (New Login Attempt)             │
│                                                              │
│  Step 1: User enters credentials                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /login                                          │  │
│  │  Email: user@example.com                             │  │
│  │  Password: ********                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 2: Backend detects existing session                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CheckSingleSession Middleware                        │  │
│  │  Found: current_session_id = abc123                   │  │
│  │  Action: Redirect to /single-session/restricted      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 3: Show restriction page                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚠️  Multiple Login Detected                          │  │
│  │                                                        │  │
│  │  Your account (user@example.com) is already          │  │
│  │  logged in from another device or browser.           │  │
│  │                                                        │  │
│  │  [End Other Session & Login Here]                    │  │
│  │  [Cancel & Keep Other Session]  ← USER CLICKS THIS   │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 4: Cancel and logout                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /single-session/cancel                          │  │
│  │  Action: SingleSessionController::cancelAndLogout()  │  │
│  │  - Clear current_session_id                           │  │
│  │  - Auth::logout()                                     │  │
│  │  - Invalidate session                                 │  │
│  │  - Redirect to login page                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 5: Redirected to login                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Login Page                                           │  │
│  │  Status: Logged out ✓                                 │  │
│  │  No errors ✓                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Device A (Still Active)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User continues browsing                              │  │
│  │  Session ID: abc123                                   │  │
│  │  Status: Still Active ✓                               │  │
│  │  No interruption ✓                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Flow 2: Continue Here (Terminate Other Session)

```
┌─────────────────────────────────────────────────────────────┐
│                    Device A (Already Logged In)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User browsing dashboard                              │  │
│  │  Session ID: abc123                                   │  │
│  │  Status: Active ✓                                     │  │
│  │                                                        │  │
│  │  Background: useSessionMonitor polling every 5s       │  │
│  │  GET /api/session/check → { valid: true }            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ About to be terminated...
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Device B (New Login Attempt)             │
│                                                              │
│  Step 1: User enters credentials                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /login                                          │  │
│  │  Email: user@example.com                             │  │
│  │  Password: ********                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 2: Backend detects existing session                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CheckSingleSession Middleware                        │  │
│  │  Found: current_session_id = abc123                   │  │
│  │  Action: Redirect to /single-session/restricted      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 3: Show restriction page                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚠️  Multiple Login Detected                          │  │
│  │                                                        │  │
│  │  Your account (user@example.com) is already          │  │
│  │  logged in from another device or browser.           │  │
│  │                                                        │  │
│  │  [End Other Session & Login Here]  ← USER CLICKS     │  │
│  │  [Cancel & Keep Other Session]                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 4: Force logout other sessions                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /single-session/logout                          │  │
│  │  Action: forceLogoutAndLogin()                        │  │
│  │                                                        │  │
│  │  1. Mark Device A session as expired:                │  │
│  │     UPDATE sessions                                   │  │
│  │     SET last_activity = 0                             │  │
│  │     WHERE id = 'abc123'                               │  │
│  │                                                        │  │
│  │  2. Wait 100ms (allow detection)                      │  │
│  │                                                        │  │
│  │  3. Delete Device A session:                          │  │
│  │     DELETE FROM sessions                              │  │
│  │     WHERE id = 'abc123'                               │  │
│  │                                                        │  │
│  │  4. Set new session as active:                        │  │
│  │     UPDATE users                                      │  │
│  │     SET current_session_id = 'xyz789'                 │  │
│  │                                                        │  │
│  │  5. Redirect to dashboard                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 5: Successfully logged in                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dashboard                                            │  │
│  │  Session ID: xyz789                                   │  │
│  │  Status: Active ✓                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Session terminated signal
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Device A (Being Terminated)              │
│                                                              │
│  Step 6: Session monitor detects termination (within 5s)    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Background: useSessionMonitor polling                │  │
│  │  GET /api/session/check                               │  │
│  │                                                        │  │
│  │  Response:                                            │  │
│  │  {                                                     │  │
│  │    "valid": false,                                    │  │
│  │    "reason": "logged_in_elsewhere",                   │  │
│  │    "message": "Your account was logged in from        │  │
│  │                another browser/device."               │  │
│  │  }                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 7: Show session ended modal                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ╔════════════════════════════════════════════════╗  │  │
│  │  ║  ⚠️  Your Session Has Ended                    ║  │  │
│  │  ║                                                 ║  │  │
│  │  ║  Your account was logged in from another       ║  │  │
│  │  ║  browser/device.                               ║  │  │
│  │  ║                                                 ║  │  │
│  │  ║  You will be logged out in 10 seconds          ║  │  │
│  │  ║                                                 ║  │  │
│  │  ║  [Return to Login Now]                         ║  │  │
│  │  ╚════════════════════════════════════════════════╝  │  │
│  │                                                        │  │
│  │  Countdown: 10... 9... 8... 7... 6... 5... 4... 3...  │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 8: Auto logout after countdown (or immediate click)   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /logout                                         │  │
│  │  Action: Auth::logout()                               │  │
│  │  Redirect: Login page                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  Step 9: Redirected to login                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Login Page                                           │  │
│  │  Status: Logged out ✓                                 │  │
│  │  No errors ✓                                          │  │
│  │  Clean termination ✓                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Session Monitoring Loop (Device A)

```
┌─────────────────────────────────────────────────────────────┐
│              useSessionMonitor Hook (Background)             │
│                                                              │
│  Every 5 seconds:                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Check if user is authenticated                     │ │
│  │     ├─ No → Stop monitoring                            │ │
│  │     └─ Yes → Continue                                  │ │
│  │                                                         │ │
│  │  2. Call API: GET /api/session/check                   │ │
│  │                                                         │ │
│  │  3. Check response:                                    │ │
│  │     ├─ { valid: true }                                 │ │
│  │     │  └─ Continue monitoring                          │ │
│  │     │                                                   │ │
│  │     ├─ { valid: false, reason: "logged_in_elsewhere" } │ │
│  │     │  └─ Show SessionEndedModal                       │ │
│  │     │     └─ Stop monitoring                           │ │
│  │     │                                                   │ │
│  │     └─ HTTP 401/419 Error                              │ │
│  │        └─ Show SessionEndedModal                       │ │
│  │           └─ Stop monitoring                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Repeat every 5 seconds...                                   │
└─────────────────────────────────────────────────────────────┘
```

## Backend Session Check Logic

```
┌─────────────────────────────────────────────────────────────┐
│         SessionCheckController::check()                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Is user authenticated?                             │ │
│  │     ├─ No → Return { valid: false,                     │ │
│  │     │              reason: "not_authenticated" }        │ │
│  │     └─ Yes → Continue                                  │ │
│  │                                                         │ │
│  │  2. Get current session ID from request                │ │
│  │                                                         │ │
│  │  3. Is this the user's current_session_id?             │ │
│  │     ├─ No → Return { valid: false,                     │ │
│  │     │              reason: "logged_in_elsewhere",       │ │
│  │     │              message: "Your account was logged    │ │
│  │     │                       in from another browser" }  │ │
│  │     └─ Yes → Continue                                  │ │
│  │                                                         │ │
│  │  4. Does session exist in database?                    │ │
│  │     ├─ No → Return { valid: false,                     │ │
│  │     │              reason: "session_expired" }          │ │
│  │     └─ Yes → Continue                                  │ │
│  │                                                         │ │
│  │  5. Is session marked as expired (last_activity = 0)?  │ │
│  │     ├─ Yes → Return { valid: false,                    │ │
│  │     │               reason: "logged_in_elsewhere" }     │ │
│  │     └─ No → Continue                                   │ │
│  │                                                         │ │
│  │  6. All checks passed                                  │ │
│  │     └─ Return { valid: true }                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Timing

- **Session Check Interval**: 5 seconds
- **Detection Delay**: 100ms (backend wait before deletion)
- **Maximum Detection Time**: ~5 seconds (next poll)
- **Logout Countdown**: 10 seconds
- **Total Time to Logout**: 5-15 seconds after termination

## Error Handling

All operations are designed to fail gracefully:
- API errors → Show session ended modal
- Network errors → Continue monitoring
- Invalid responses → Treat as session ended
- No console errors → Clean user experience
