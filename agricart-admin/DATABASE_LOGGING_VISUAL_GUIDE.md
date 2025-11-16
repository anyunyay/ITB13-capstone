# Database Logging - Visual Guide

## Database Table Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         system_logs TABLE                            │
├─────────────────────────────────────────────────────────────────────┤
│ id              │ bigint (PK, Auto Increment)                        │
│ user_id         │ bigint (FK → users.id) [INDEXED]                  │
│ user_email      │ varchar(255) [nullable]                           │
│ user_type       │ varchar(255) [nullable] [INDEXED]                 │
│ action          │ varchar(255) [INDEXED]                            │
│ event_type      │ varchar(255) [INDEXED]                            │
│ details         │ text [nullable]                                   │
│ ip_address      │ varchar(45) [nullable]                            │
│ context         │ json [nullable]                                   │
│ performed_at    │ timestamp [INDEXED]                               │
│ created_at      │ timestamp                                         │
│ updated_at      │ timestamp                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Example Log Entry

```
┌─────────────────────────────────────────────────────────────────────┐
│ ID: 1                                                                │
├─────────────────────────────────────────────────────────────────────┤
│ User ID:        │ 5                                                  │
│ User Email:     │ admin@example.com                                  │
│ User Type:      │ admin                                              │
│ Action:         │ created                                            │
│ Event Type:     │ product_management                                 │
│ Details:        │ Admin admin@example.com created product:           │
│                 │ Fresh Tomatoes on November 16, 2025 at 2:30 PM    │
│                 │ from IP address 192.168.1.100                      │
│ IP Address:     │ 192.168.1.100                                      │
│ Context:        │ {                                                  │
│                 │   "product_id": 123,                               │
│                 │   "product_name": "Fresh Tomatoes",                │
│                 │   "price_kilo": 50.00                              │
│                 │ }                                                  │
│ Performed At:   │ 2025-11-16 14:30:00                               │
│ Created At:     │ 2025-11-16 14:30:01                               │
│ Updated At:     │ 2025-11-16 14:30:01                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌─────────────────┐
│  User Action    │
│  (e.g., create  │
│   product)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Controller     │
│  calls          │
│  SystemLogger   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  SystemLogger::logProductManagement()   │
│  - Checks if should log                 │
│  - Formats details                      │
│  - Extracts user info                   │
└────────┬────────────────────────────────┘
         │
         ├─────────────────┬──────────────────┐
         ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│  Save to DB     │ │  Save to     │ │  Return      │
│  (SystemLog     │ │  File        │ │  Success     │
│   model)        │ │  (backup)    │ │              │
└─────────────────┘ └──────────────┘ └──────────────┘
```

---

## Event Types

```
┌──────────────────────────────────────────────────────────────┐
│                      EVENT TYPES                              │
├──────────────────────────────────────────────────────────────┤
│ security_event          │ Password changes, failed logins    │
│ authentication          │ Login attempts, wrong portal       │
│ product_management      │ Product CRUD operations            │
│ stock_update            │ Stock additions/updates/removals   │
│ user_management         │ User/staff CRUD operations         │
│ order_status_change     │ Order status updates               │
│ delivery_status_change  │ Delivery status updates            │
│ checkout                │ Customer checkout                  │
│ data_export             │ Data exports (CSV, PDF)            │
│ maintenance             │ System maintenance                 │
│ critical_error          │ Critical system errors             │
└──────────────────────────────────────────────────────────────┘
```

---

## User Types

```
┌──────────────────────────────────────────────────────────────┐
│                      USER TYPES                               │
├──────────────────────────────────────────────────────────────┤
│ admin                   │ System administrators              │
│ staff                   │ Staff members                      │
│ member                  │ Cooperative members                │
│ customer                │ Customers                          │
│ logistic                │ Logistics staff                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Common Actions

```
┌──────────────────────────────────────────────────────────────┐
│                      ACTIONS                                  │
├──────────────────────────────────────────────────────────────┤
│ created                 │ Resource created                   │
│ updated                 │ Resource updated                   │
│ deleted                 │ Resource deleted                   │
│ login_failed            │ Failed login attempt               │
│ login_failed_wrong_portal │ Wrong portal access             │
│ password_changed        │ Password changed                   │
│ email_changed           │ Email changed                      │
│ phone_changed           │ Phone number changed               │
│ create_staff            │ Staff member created               │
│ update_staff            │ Staff member updated               │
│ delete_staff            │ Staff member deleted               │
└──────────────────────────────────────────────────────────────┘
```

---

## Query Examples

### Get All Security Events
```sql
SELECT * FROM system_logs 
WHERE event_type = 'security_event' 
ORDER BY performed_at DESC;
```

### Get Failed Login Attempts
```sql
SELECT user_email, ip_address, performed_at, details
FROM system_logs 
WHERE action = 'login_failed' 
ORDER BY performed_at DESC;
```

### Get Today's Logs
```sql
SELECT * FROM system_logs 
WHERE DATE(performed_at) = CURDATE() 
ORDER BY performed_at DESC;
```

### Get Logs by User
```sql
SELECT * FROM system_logs 
WHERE user_id = 5 
ORDER BY performed_at DESC;
```

### Get Product Management Logs
```sql
SELECT user_email, action, details, performed_at
FROM system_logs 
WHERE event_type = 'product_management' 
ORDER BY performed_at DESC;
```

### Count Logs by Event Type
```sql
SELECT event_type, COUNT(*) as count
FROM system_logs 
GROUP BY event_type 
ORDER BY count DESC;
```

---

## Admin Panel View

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM LOGS                                 │
├─────────────────────────────────────────────────────────────────┤
│ Filters:                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Event Type ▼│ │ User Type  ▼│ │ From Date│ │ To Date  │     │
│ └─────────────┘ └─────────────┘ └──────────┘ └──────────┘     │
│ ┌──────────────────────────────────────────┐ ┌──────────┐     │
│ │ Search...                                 │ │  Export  │     │
│ └──────────────────────────────────────────┘ └──────────┘     │
├─────────────────────────────────────────────────────────────────┤
│ User              │ Action  │ Date & Time      │ IP Address    │
├─────────────────────────────────────────────────────────────────┤
│ admin@example.com │ created │ 2025-11-16 14:30 │ 192.168.1.100│
│ user@example.com  │ login_  │ 2025-11-16 14:25 │ 192.168.1.200│
│                   │ failed  │                  │               │
│ staff@example.com │ updated │ 2025-11-16 14:20 │ 192.168.1.150│
├─────────────────────────────────────────────────────────────────┤
│ Details:                                                         │
│ Admin admin@example.com created product: Fresh Tomatoes on      │
│ November 16, 2025 at 2:30 PM from IP address 192.168.1.100     │
└─────────────────────────────────────────────────────────────────┘
```

---

## CSV Export Format

```
ID,User,Action,Date & Time,Location (IP Address),Details,Event Type
1,admin@example.com,created,2025-11-16 14:30:00,192.168.1.100,"Admin admin@example.com created product: Fresh Tomatoes on November 16, 2025 at 2:30 PM from IP address 192.168.1.100",product_management
2,user@example.com,login_failed,2025-11-16 14:25:00,192.168.1.200,"Failed login attempt for user@example.com with 2 attempts remaining on November 16, 2025 at 2:25 PM from IP address 192.168.1.200",security_event
```

---

## Relationships

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │  system_logs    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ user_id (FK)    │
│ email           │         │ user_email      │
│ type            │         │ user_type       │
│ ...             │         │ action          │
└─────────────────┘         │ event_type      │
                            │ details         │
                            │ ip_address      │
                            │ context         │
                            │ performed_at    │
                            └─────────────────┘
```

---

## Performance Optimization

### Indexes
```
✓ user_id        - Fast user filtering
✓ user_type      - Fast user type filtering
✓ action         - Fast action filtering
✓ event_type     - Fast event type filtering
✓ performed_at   - Fast date range queries
```

### Query Tips
```
✓ Use indexes in WHERE clauses
✓ Limit results with LIMIT
✓ Use date ranges instead of full table scans
✓ Archive old logs periodically
✓ Use pagination for large result sets
```

---

## Summary

The database logging system provides:

✅ **Structured Storage** - Organized table with indexed columns
✅ **Fast Queries** - Indexed fields for quick filtering
✅ **Human-Readable** - Details field contains full description
✅ **Flexible Filtering** - Multiple filter options
✅ **Export Ready** - Easy CSV export
✅ **Scalable** - Handle large volumes of logs
✅ **Secure** - Foreign key constraints and access control

**Format**: User | Action | Date & Time | Location (IP Address) | Details
