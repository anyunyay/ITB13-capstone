<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define staff members with unique names and their permission sets
        $staffMembers = [
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos@staff.com',
                'contact_number' => '09171234567',
                'street' => '123 Commerce Street',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Inventory Management
                    'view inventory',
                    'create products',
                    'edit products',
                    'view archive',
                    'archive products',
                    'unarchive products',
                    'view stocks',
                    'create stocks',
                    'edit stocks',
                    'view sold stock',
                    'view stock trail',
                    'generate inventory report',
                ]
            ],
            [
                'name' => 'Elena Rodriguez',
                'email' => 'elena@staff.com',
                'contact_number' => '09182345678',
                'street' => '456 Business Avenue',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Order Management
                    'view orders',
                    'manage orders',
                    'approve orders',
                    'reject orders',
                    'process orders',
                    'assign logistics',
                    'mark orders urgent',
                    'unmark orders urgent',
                    'view order receipts',
                    'generate order report',
                ]
            ],
            [
                'name' => 'Miguel Santos',
                'email' => 'miguel@staff.com',
                'contact_number' => '09193456789',
                'street' => '789 Trade Road',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Sales Management
                    'view sales',
                    'view member sales',
                    'export sales data',
                    'generate sales report',
                    // Dashboard access
                    'view orders', // Required for dashboard access
                ]
            ],
            [
                'name' => 'Patricia Cruz',
                'email' => 'patricia@staff.com',
                'contact_number' => '09204567890',
                'street' => '321 Market Lane',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Logistics Management
                    'view logistics',
                    'create logistics',
                    'edit logistics',
                    'deactivate logistics',
                    'reactivate logistics',
                    'generate logistics report',
                ]
            ],
            [
                'name' => 'Roberto Fernandez',
                'email' => 'roberto@staff.com',
                'contact_number' => '09215678901',
                'street' => '654 Analytics Boulevard',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Trend Analysis
                    'view price trend',
                    'view trend analysis',
                    'generate trend report',
                    // Dashboard access
                    'view inventory', // Required for dashboard access
                ]
            ],
            [
                'name' => 'Diana Reyes',
                'email' => 'diana@staff.com',
                'contact_number' => '09226789012',
                'street' => '987 Operations Street',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Combined: Inventory + Orders
                    'view inventory',
                    'create products',
                    'edit products',
                    'view stocks',
                    'create stocks',
                    'edit stocks',
                    'view orders',
                    'manage orders',
                    'approve orders',
                    'process orders',
                    'generate inventory report',
                    'generate order report',
                ]
            ],
            [
                'name' => 'Antonio Garcia',
                'email' => 'antonio@staff.com',
                'contact_number' => '09237890123',
                'street' => '147 Supply Chain Drive',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Combined: Orders + Logistics
                    'view orders',
                    'manage orders',
                    'assign logistics',
                    'view order receipts',
                    'view logistics',
                    'create logistics',
                    'edit logistics',
                    'generate order report',
                    'generate logistics report',
                ]
            ],
            [
                'name' => 'Sofia Martinez',
                'email' => 'sofia@staff.com',
                'contact_number' => '09248901234',
                'street' => '258 Finance Plaza',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'permissions' => [
                    // Combined: Sales + Trends
                    'view sales',
                    'view member sales',
                    'export sales data',
                    'generate sales report',
                    'view price trend',
                    'view trend analysis',
                    'generate trend report',
                    // Dashboard access
                    'view orders', // Required for dashboard access
                ]
            ],
        ];

        // Get the staff role
        $staffRole = Role::where('name', 'staff')->first();

        // Create each staff member
        foreach ($staffMembers as $staffData) {
            $staff = User::create([
                'type' => 'staff',
                'name' => $staffData['name'],
                'email' => $staffData['email'],
                'contact_number' => $staffData['contact_number'],
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'active' => true,
                'is_default' => false,
            ]);

            // Assign staff role
            if ($staffRole) {
                $staff->assignRole($staffRole);
            }

            // Create address for staff member
            UserAddress::create([
                'user_id' => $staff->id,
                'street' => $staffData['street'],
                'barangay' => $staffData['barangay'],
                'city' => $staffData['city'],
                'province' => $staffData['province'],
                'is_active' => true,
            ]);

            // Assign permissions to staff member
            foreach ($staffData['permissions'] as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission) {
                    $staff->givePermissionTo($permission);
                }
            }
        }
    }
}
