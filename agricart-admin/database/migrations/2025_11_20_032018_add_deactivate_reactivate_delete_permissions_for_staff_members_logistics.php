<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create new permissions for staff
        $staffPermissions = [
            'deactivate staffs',
            'reactivate staffs',
        ];

        // Create new permissions for members
        $memberPermissions = [
            'delete members',
        ];

        // Create new permissions for logistics
        $logisticPermissions = [
            'delete logistics',
        ];

        // Create all permissions
        $allPermissions = array_merge($staffPermissions, $memberPermissions, $logisticPermissions);
        
        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign staff permissions to admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($staffPermissions);
            $adminRole->givePermissionTo($memberPermissions);
            $adminRole->givePermissionTo($logisticPermissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the permissions
        $permissions = [
            'deactivate staffs',
            'reactivate staffs',
            'delete members',
            'delete logistics',
        ];

        foreach ($permissions as $permission) {
            Permission::where('name', $permission)->delete();
        }
    }
};
