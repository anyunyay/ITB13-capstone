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

            // Order Management
            'view orders',
            'create orders',
            'edit orders',
            'delete orders', // Available for Staff (with admin approval)
            'generate order report',

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

            // Admin Only (Membership Management)
            'view membership',
            'create members',
            'edit members',
            'delete members',
            'generate membership report',

        // Role-specific permissions
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
        $admin->givePermissionTo(Permission::all());
        
        // Assign role-specific permissions
        $customer->givePermissionTo(['access customer features']);
        $logistic->givePermissionTo(['access logistic features']);
        $member->givePermissionTo(['access member features']);

        // Assign roles to existing users based on their type
        $this->assignRolesToExistingUsers();
    }

    /**
     * Assign roles to existing users based on their type
     */
    private function assignRolesToExistingUsers(): void
    {
        $users = User::all();
        
        foreach ($users as $user) {
            if ($user->type && !$user->hasRole($user->type)) {
                try {
                    $user->assignRole($user->type);
                } catch (\Exception $e) {
                    // Log the error if the role does not exist
                    \Log::error("Role {$user->type} does not exist for user ID {$user->id}");
                }
            }
        }
    }
}
