# System Logging Quick Reference

## ✅ What Gets Logged (Critical Activities Only)

### Security Events
- Password changes
- Email changes
- Phone number changes
- Failed login attempts
- Wrong portal access attempts
- Account lockouts

### Data Changes
- Product: create, update, delete
- Stock: add, update, remove, restore
- User/Staff: create, update, delete
- Permissions: role changes, permission updates

### Business Transactions
- Customer checkout (order placement)
- Order status changes
- Delivery status changes
- Sales record creation

### Data Access
- Data exports (CSV, PDF, etc.)
- System maintenance activities
- Critical system errors

---

## ❌ What Is NOT Logged (Routine Activities)

### Removed Activities
- Dashboard access
- Page views and navigation
- Successful logins
- Logouts
- Report generation
- Cart operations (add/update/remove items)
- System logs viewing

---

## Log Entry Format

All logs are human-readable sentences with context:

**Example 1 - Security Event:**
```
Customer user@example.com changed their password on November 16, 2025 at 2:30 PM from IP address 192.168.1.100
```

**Example 2 - Data Change:**
```
Admin admin@example.com created product: Fresh Tomatoes on November 16, 2025 at 3:45 PM from IP address 192.168.1.50
```

**Example 3 - Failed Login:**
```
Failed login attempt for user@example.com with 2 attempts remaining on November 16, 2025 at 4:15 PM from IP address 192.168.1.200
```

**Example 4 - Order Status:**
```
Order #123 status was changed from Pending to Approved by Admin admin@example.com on November 16, 2025 at 3:45 PM from IP address 192.168.1.50
```

---

## Viewing Logs

**Admin Panel:**
- Navigate to `/profile/system-logs`
- Filter by date, event type, user type
- Search for specific activities
- Export to CSV

**Log File:**
- Location: `storage/logs/system.log`
- Format: Human-readable sentences
- Rotation: Automatic (Laravel configuration)

---

## Key Benefits

1. **Cleaner Logs** - Only meaningful activities
2. **Better Security** - Focus on threats and unauthorized access
3. **Easier Auditing** - Clear trail of data changes
4. **Improved Performance** - Smaller log files, faster searches
5. **Compliance Ready** - Complete audit trail of critical activities
