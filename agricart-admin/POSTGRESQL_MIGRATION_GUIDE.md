# PostgreSQL Migration Guide

This document outlines the changes made to ensure Laravel migration compatibility with PostgreSQL and provides instructions for migrating from MySQL to PostgreSQL.

## Changes Made for PostgreSQL Compatibility

### 1. Data Type Conversions

The following MySQL-specific data types were converted to PostgreSQL-compatible equivalents:

| MySQL Type | PostgreSQL Type | Files Affected |
|------------|-----------------|----------------|
| `mediumText` | `text` | cache table migration |
| `longText` | `text` | jobs, sessions table migrations |
| `unsignedTinyInteger` | `smallInteger` | logistic rating migration |
| `unsignedInteger` | `integer` | jobs table migration |
| `unsignedBigInteger` | `bigInteger` | Multiple files (see details below) |

### 2. Specific Files Modified

#### Core Laravel Tables
- **0001_01_01_000001_create_cache_table.php**: `mediumText` → `text`
- **0001_01_01_000002_create_jobs_table.php**: `longText` → `text`, `unsignedTinyInteger` → `smallInteger`, `unsignedInteger` → `integer`
- **0001_01_01_000003_create_sessions_table.php**: `longText` → `text`

#### Application Tables
- **2025_01_01_000001_create_sales_audit_table.php**: `unsignedBigInteger` → `bigInteger` for address_id
- **2025_07_15_063204_create_permission_tables.php**: 
  - Removed MySQL engine specifications
  - Cleaned up MyISAM/InnoDB comments
  - Converted all `unsignedBigInteger` to `bigInteger`
- **2025_09_17_122149_create_member_earnings_table.php**: `unsignedBigInteger` → `bigInteger` for member_id
- **2025_11_04_041203_create_file_uploads_table.php**: `unsignedBigInteger` → `bigInteger` for owner_id and uploaded_by
- **2025_11_16_190109_create_system_logs_table.php**: `unsignedBigInteger` → `bigInteger` for user_id
- **2025_11_23_100000_add_logistic_rating_to_sales_table.php**: `unsignedTinyInteger` → `smallInteger`
- **2025_11_27_002630_add_linked_merged_order_id_to_sales_audit_table.php**: `unsignedBigInteger` → `bigInteger`

### 3. Engine Specifications Removed

Removed MySQL-specific engine specifications and comments from the permissions table migration that referenced InnoDB and MyISAM.

## Migration Instructions

### Prerequisites

1. **Install PostgreSQL**: Ensure PostgreSQL is installed on your system
2. **Create Database**: Create a new PostgreSQL database for your application
3. **Install PHP PostgreSQL Extension**: Ensure `php-pgsql` extension is installed

### Step-by-Step Migration

#### 1. Backup Current Data (if migrating existing data)

```bash
# For MySQL
mysqldump -u username -p database_name > backup.sql

# Convert MySQL dump to PostgreSQL format (use tools like mysql2postgresql)
```

#### 2. Update Environment Configuration

Update your `.env` file with PostgreSQL credentials:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### 3. Clear Configuration Cache

```bash
php artisan config:clear
php artisan cache:clear
```

#### 4. Run Migrations

```bash
# Fresh migration (for new installations)
php artisan migrate

# Or with fresh database reset
php artisan migrate:fresh
```

#### 5. Seed Database (if applicable)

```bash
php artisan db:seed
```

### Verification

Run the included test script to verify PostgreSQL compatibility:

```bash
php test_postgresql_migrations.php
```

## Key Differences Between MySQL and PostgreSQL

### 1. Data Types
- PostgreSQL doesn't have unsigned integer types
- `TEXT` type in PostgreSQL can handle any length (no need for mediumText/longText)
- Boolean values: PostgreSQL uses `true`/`false`, MySQL uses `1`/`0`

### 2. Auto-increment
- PostgreSQL uses `SERIAL` or `IDENTITY` columns
- Laravel's `id()` method handles this automatically

### 3. Case Sensitivity
- PostgreSQL is case-sensitive for identifiers
- Use consistent naming conventions

### 4. JSON Support
- Both databases support JSON, but syntax may differ slightly
- Laravel's query builder abstracts most differences

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify PostgreSQL service is running
   - Check firewall settings
   - Validate credentials

2. **Migration Errors**
   - Ensure all unsigned types have been converted
   - Check for MySQL-specific functions in custom migrations

3. **Data Type Mismatches**
   - Review any custom migrations not covered in this guide
   - Test with sample data before full migration

### Performance Considerations

- PostgreSQL may have different indexing strategies
- Review and optimize queries after migration
- Consider PostgreSQL-specific features like partial indexes

## Additional Resources

- [Laravel Database Configuration](https://laravel.com/docs/database#configuration)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Laravel Migration Documentation](https://laravel.com/docs/migrations)

## Support

If you encounter issues during migration:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Enable query logging to debug SQL issues
3. Verify all custom code is database-agnostic

---

**Note**: This migration guide assumes you're using Laravel's Eloquent ORM and following Laravel conventions. Custom SQL queries may need additional review for PostgreSQL compatibility.