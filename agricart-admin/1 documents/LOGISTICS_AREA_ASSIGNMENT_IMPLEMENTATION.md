# Logistics Area Assignment Implementation

## Overview
Added functionality to assign specific barangay areas in Cabuyao to logistics personnel. This allows admins to manage delivery zones and track which logistics personnel are responsible for which areas.

## Features Implemented

### 1. Database Changes
- **Migration**: `2025_11_23_235447_add_assigned_area_to_users_table.php`
  - Added `assigned_area` column to `users` table (nullable string)
  - Positioned after `registration_date` column

### 2. Backend Changes

#### User Model (`app/Models/User.php`)
- Added `assigned_area` to `$fillable` array

#### LogisticController (`app/Http/Controllers/Admin/LogisticController.php`)
- Updated `index()` method to include `assigned_area` in select and response
- Updated `store()` method to validate and save `assigned_area`
- Updated `update()` method to validate and update `assigned_area`
- Added new `assignArea()` method for dedicated area assignment

#### Routes (`routes/web.php`)
- Added new route: `POST /logistics/{logistic}/assign-area` → `logistics.assign-area`
- Protected with `can:edit logistics` middleware

### 3. Frontend Changes

#### Type Definitions (`resources/js/types/logistics.ts`)
- Added `assigned_area?: string` to `Logistic` interface

#### New Component: Area Assignment Modal
**File**: `resources/js/components/logistics/area-assignment-modal.tsx`
- Modal dialog for assigning areas to logistics personnel
- Dropdown select with 18 Cabuyao barangay areas:
  - Baclaran
  - Banay-Banay
  - Banlic
  - Butong
  - Bigaa
  - Casile
  - Gulod
  - Mamatid
  - Marinig
  - Niugan
  - Pittland
  - Pulo
  - Sala
  - San Isidro
  - Diezmo
  - Barangay Uno (Poblacion)
  - Barangay Dos (Poblacion)
  - Barangay Tres (Poblacion)
- Shows current assigned area
- Form validation and loading states

#### Updated Components

**Logistics Table Columns** (`resources/js/components/logistics/logistics-table-columns.tsx`)
- Added new "Assigned Area" column in desktop table view
- Shows assigned area or "N/A" if not assigned
- Includes "Assign" or "Change" button (permission-gated)
- Updated mobile card view to display assigned area with assign/change button

**Logistic Management** (`resources/js/components/logistics/logistic-management.tsx`)
- Added `onAssignArea` prop and callback
- Passed callback to table columns and mobile cards

**Logistics Index Page** (`resources/js/Pages/Admin/Logistics/index.tsx`)
- Imported `AreaAssignmentModal` component
- Added state management for area assignment modal
- Added `handleAssignArea` and `handleCloseAreaAssignment` handlers
- Integrated modal into page layout

**Add Logistics Form** (`resources/js/Pages/Admin/Logistics/add.tsx`)
- Added `assigned_area` field to form data (optional)

**Edit Logistics Form** (`resources/js/Pages/Admin/Logistics/edit.tsx`)
- Added `assigned_area` field to form data
- Included in change detection logic

## User Interface

### Desktop View
- New "Assigned Area" column in logistics table
- Displays assigned area or "N/A"
- Action button to assign/change area (requires "edit logistics" permission)

### Mobile View
- Assigned area displayed in logistics card with blue background
- Inline assign/change button

### Area Assignment Modal
- Clean dialog interface
- Dropdown selector with all 18 Cabuyao barangays
- Shows current assignment
- Cancel and Assign buttons
- Loading state during submission

## Permissions
- Area assignment requires `edit logistics` permission
- Assign button only visible to users with proper permissions

## Data Flow
1. Admin clicks "Assign" or "Change" button on logistics row
2. Area Assignment Modal opens with current area (if any)
3. Admin selects area from dropdown
4. Form submits to `POST /logistics/{id}/assign-area`
5. Backend validates and updates `assigned_area` field
6. Page refreshes with success message
7. Table displays updated assigned area

## Database Schema
```sql
ALTER TABLE users ADD COLUMN assigned_area VARCHAR(255) NULL AFTER registration_date;
```

## API Endpoints

### Assign Area
- **Route**: `POST /admin/logistics/{logistic}/assign-area`
- **Permission**: `edit logistics`
- **Request Body**:
  ```json
  {
    "assigned_area": "Baclaran"
  }
  ```
- **Validation**:
  - `assigned_area`: required, string, max 255 characters
- **Response**: Redirect to logistics index with success message

## Testing Checklist
- [x] Migration runs successfully
- [x] Area can be assigned to new logistics during creation
- [x] Area can be assigned to existing logistics via modal
- [x] Area can be changed via modal
- [x] Area displays correctly in table (desktop)
- [x] Area displays correctly in mobile card
- [x] "N/A" shows when no area assigned
- [x] Permission gate works correctly
- [x] Form validation works
- [x] Success message displays after assignment
- [x] TypeScript compilation successful

## Future Enhancements
- Add area-based filtering in logistics list
- Show logistics count per area in dashboard
- Prevent duplicate area assignments (if needed)
- Add area-based order routing
- Generate area coverage reports

## Seeders Updated

### UserSeeder (`database/seeders/UserSeeder.php`)
**Changes:**
- Added 27 logistics personnel (increased from 2)
- 25 logistics have assigned areas covering all 18 Cabuyao barangays
- 2 logistics have no assigned area (NULL) to demonstrate N/A display
- Each logistic's address barangay matches their assigned area
- Contact numbers follow pattern: 0912300XXXX

**Logistics Distribution:**
- Each of the 18 barangays has at least one assigned logistic
- Some popular areas (Sala, Pulo, Baclaran, Banlic, Bigaa) have 2 logistics
- 2 logistics (Teresa Jimenez, Beatriz Romero) have no assigned area

### RoleSeeder (`database/seeders/RoleSeeder.php`)
**Changes:**
- Added new permission: `assign logistics area`
- Added existing permission: `delete logistics` (for hard delete)
- Both permissions automatically assigned to admin role
- Total permissions increased from 64 to 66

## Seeder Verification Results

```
Total Logistics: 27
With Assigned Area: 25
Without Area (N/A): 2

Sample Logistics:
  - Judel Macasinag: Sala
  - Elmo V. Republica: Pulo
  - Maria Santos: Baclaran
  - Juan Dela Cruz: Banay-Banay
  - Pedro Reyes: Banlic
  - Ana Garcia: Butong
  - Carlos Mendoza: Bigaa
  - Rosa Fernandez: Casile
  - Miguel Torres: Gulod
  - Sofia Ramirez: Mamatid
  ... (17 more)

Permissions:
✅ 'assign logistics area' permission created
✅ Admin role has the permission
✅ Total permissions: 66
```

## Files Modified
1. `database/migrations/2025_11_23_235447_add_assigned_area_to_users_table.php` (new)
2. `app/Models/User.php`
3. `app/Http/Controllers/Admin/LogisticController.php`
4. `routes/web.php`
5. `resources/js/types/logistics.ts`
6. `resources/js/components/logistics/area-assignment-modal.tsx` (new)
7. `resources/js/components/logistics/logistics-table-columns.tsx`
8. `resources/js/components/logistics/logistic-management.tsx`
9. `resources/js/Pages/Admin/Logistics/index.tsx`
10. `resources/js/Pages/Admin/Logistics/add.tsx`
11. `resources/js/Pages/Admin/Logistics/edit.tsx`
12. `database/seeders/UserSeeder.php` (updated)
13. `database/seeders/RoleSeeder.php` (updated)

## Running the Seeders

To seed the database with the new logistics data:

```bash
# Seed roles and permissions first
php artisan db:seed --class=RoleSeeder

# Then seed users (including logistics)
php artisan db:seed --class=UserSeeder

# Or run all seeders
php artisan db:seed
```

## Notes
- Area assignment is optional (nullable field)
- No duplicate prevention implemented (multiple logistics can be assigned to same area)
- Areas are hardcoded based on Cabuyao barangays
- Assignment history is not tracked (consider adding audit trail if needed)
- Default credentials for all seeded logistics: password `12345678`
- All logistics are active and email verified by default
