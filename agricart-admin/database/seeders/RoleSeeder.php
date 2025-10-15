<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles (or get existing ones)
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $staff = Role::firstOrCreate(['name' => 'staff']);
        $customer = Role::firstOrCreate(['name' => 'customer']);
        $logistic = Role::firstOrCreate(['name' => 'logistic']);
        $member = Role::firstOrCreate(['name' => 'member']);

        $permissions = [
        // Admin Section
            // Inventory Product
            'view inventory',
            'create products',
            'edit products',
            'delete products', // Available for Staff (with admin approval)

            // Inventory Archive
            'view archive',
            'archive products',
            'unarchive products',
            'delete archived products', // Available for Staff (with admin approval)

            // Inventory Product Stock
            'view stocks',
            'create stocks',
            'edit stocks',
            'delete stocks', // Available for Staff (with admin approval)
            'generate inventory report',

            // Order Management
            'view orders',
            'create orders',
            'edit orders',
            'delete orders', // Available for Staff (with admin approval)
            'generate order report',

            // Sales Management
            'view sales',
            'generate sales report',

            // Logistics
            'view logistics',
            'create logistics',
            'edit logistics',
            'delete logistics', // Available for Staff (with admin approval)
            'generate logistics report',
            
            // Inventory Stock Trailing
            'view sold stock',
            'view stock trail',

            // Admin Only (Staff Management)
            'view staffs',
            'create staffs',
            'edit staffs',
            'delete staffs',
            'generate staff report',

            // Admin Only (Membership Management)
            'view membership',
            'create members',
            'edit members',
            'delete members',
            'generate membership report',

        // Customer permissions
            'access customer features',

        // Logistic permissions
            'access logistic features',

        // Member permissions
            'access member features',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        // Ensure admin has all current and future permissions (except role-specific ones)
        $this->ensureAdminHasAllPermissions($admin);
        
        // Assign role-specific permissions (sync to avoid duplicates)
        $customer->syncPermissions(['access customer features']);
        $logistic->syncPermissions(['access logistic features']);
        $member->syncPermissions(['access member features']);
    }

    /**
     * Ensure admin role has all permissions except role-specific ones
     * This method will automatically assign any new permissions to admin
     */
    private function ensureAdminHasAllPermissions(Role $admin): void
    {
        // Get all permissions except role-specific ones
        $allAdminPermissions = Permission::whereNotIn('name', [
            'access customer features',
            'access logistic features', 
            'access member features'
        ])->pluck('name')->toArray();
        
        // Sync all permissions to admin role
        // This will add any new permissions and remove any that are no longer needed
        $admin->syncPermissions($allAdminPermissions);
        
        // Output info if running in console
        if (app()->runningInConsole()) {
            echo "Admin role permissions synchronized. Total permissions: " . count($allAdminPermissions) . "\n";
        }
    }
}
