<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RoleBasedPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_access_customer_features()
    {
        // Create customer role and permission
        $customerRole = Role::create(['name' => 'customer']);
        $customerPermission = Permission::create(['name' => 'access customer features']);
        $customerRole->givePermissionTo($customerPermission);

        // Create a customer user
        $customer = User::factory()->create([
            'type' => 'customer'
        ]);
        $customer->assignRole($customerRole);

        // Test that customer can access customer routes
        $response = $this->actingAs($customer)->get('/customer/cart');
        $response->assertStatus(200);
    }

    public function test_logistic_can_access_logistic_features()
    {
        // Create logistic role and permission
        $logisticRole = Role::create(['name' => 'logistic']);
        $logisticPermission = Permission::create(['name' => 'access logistic features']);
        $logisticRole->givePermissionTo($logisticPermission);

        // Create a logistic user
        $logistic = User::factory()->create([
            'type' => 'logistic'
        ]);
        $logistic->assignRole($logisticRole);

        // Test that logistic can access logistic routes
        $response = $this->actingAs($logistic)->get('/logistic/dashboard');
        $response->assertStatus(200);
    }

    public function test_member_can_access_member_features()
    {
        // Create member role and permission
        $memberRole = Role::create(['name' => 'member']);
        $memberPermission = Permission::create(['name' => 'access member features']);
        $memberRole->givePermissionTo($memberPermission);

        // Create a member user
        $member = User::factory()->create([
            'type' => 'member'
        ]);
        $member->assignRole($memberRole);

        // Test that member can access member routes
        $response = $this->actingAs($member)->get('/member/dashboard');
        $response->assertStatus(200);
    }

    public function test_customer_cannot_access_logistic_features()
    {
        // Create customer role and permission
        $customerRole = Role::create(['name' => 'customer']);
        $customerPermission = Permission::create(['name' => 'access customer features']);
        $customerRole->givePermissionTo($customerPermission);

        // Create a customer user
        $customer = User::factory()->create([
            'type' => 'customer'
        ]);
        $customer->assignRole($customerRole);

        // Test that customer cannot access logistic routes
        $response = $this->actingAs($customer)->get('/logistic/dashboard');
        $response->assertStatus(403); // Forbidden
    }

    public function test_logistic_cannot_access_member_features()
    {
        // Create logistic role and permission
        $logisticRole = Role::create(['name' => 'logistic']);
        $logisticPermission = Permission::create(['name' => 'access logistic features']);
        $logisticRole->givePermissionTo($logisticPermission);

        // Create a logistic user
        $logistic = User::factory()->create([
            'type' => 'logistic'
        ]);
        $logistic->assignRole($logisticRole);

        // Test that logistic cannot access member routes
        $response = $this->actingAs($logistic)->get('/member/dashboard');
        $response->assertStatus(403); // Forbidden
    }

    public function test_member_cannot_access_customer_features()
    {
        // Create member role and permission
        $memberRole = Role::create(['name' => 'member']);
        $memberPermission = Permission::create(['name' => 'access member features']);
        $memberRole->givePermissionTo($memberPermission);

        // Create a member user
        $member = User::factory()->create([
            'type' => 'member'
        ]);
        $member->assignRole($memberRole);

        // Test that member cannot access customer routes
        $response = $this->actingAs($member)->get('/customer/cart');
        $response->assertStatus(403); // Forbidden
    }
} 