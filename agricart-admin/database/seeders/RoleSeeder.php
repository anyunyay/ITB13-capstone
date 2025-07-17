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

        // Create roles
        $admin = Role::create(['name' => 'admin']);
        $staff = Role::create(['name' => 'staff']);
        $customer = Role::create(['name' => 'customer']);
        $logistic = Role::create(['name' => 'logistic']);
        $member = Role::create(['name' => 'member']);

        $permissions = [
        // Admin Section
            // Inventory Product
            'view inventory',
            'create products',
            'edit products',
            'delete products', // Optional for Staff

            // Inventory Archive
            'view archive',
            'archive products',
            'unarchive products',
            'delete archived products', // Optional for Staff

            // Inventory Product Stock
            'view stocks',
            'create stocks',
            'edit stocks',
            'delete stocks', // Optional for Staff

            // Order Management
            'view orders',
            'create orders',
            'edit orders',
            'delete orders', // Optional for Staff

            // Inventory Stock Trailing
            'view stock trail',

            // Logistics
            'view logistics',
            'create logistics',
            'edit logistics',
            'delete logistics', // Optional for Staff

        // Only for Admin
            // Staff
            'view staffs',
            'create staffs',
            'edit staffs',
            'delete staffs',

            // Member
            'view membership',
            'create members',
            'edit members',
            'delete members',

        // TO BE ADDED
        // Customer

        // Logistic

        // Member
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Assign permissions to roles
        $admin->givePermissionTo(Permission::all());
        // LIMITED PERMISSIONS
        // $customer->syncPermission();
        // $logistic->givePermissionTo();
        // $member->givePermissionTo();

        $adminDB = User::where('type', 'admin')->first();
        if ($adminDB) {
            $adminDB->assignRole($admin);
        }
    }
}
