<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $admin = Role::create(['name' => 'admin']);
        $staff = Role::create(['name' => 'staff']);
        
        // Create permissions
        $permissions = [
            'view inventory', 'create products', 'edit products', 'delete products',
            'view archive', 'archive products', 'unarchive products', 'delete archived products',
            'view stocks', 'create stocks', 'edit stocks', 'delete stocks',
            'view orders', 'create orders', 'edit orders', 'delete orders',
            'view sold stock', 'view stock trail',
            'view logistics', 'create logistics', 'edit logistics', 'delete logistics',
            'view staffs', 'create staffs', 'edit staffs', 'delete staffs',
            'view membership', 'create members', 'edit members', 'delete members',
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Assign all permissions to admin
        $admin->givePermissionTo(Permission::all());
    }

    public function test_admin_can_view_staff_list(): void
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/admin/staff');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Staff/index'));
    }

    public function test_admin_can_create_staff_member(): void
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/admin/staff/add');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Staff/create'));
    }

    public function test_admin_can_store_staff_member(): void
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');

        $staffData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'permissions' => ['view inventory', 'create products', 'edit products'],
        ];

        $response = $this->actingAs($admin)->post('/admin/staff', $staffData);

        $response->assertRedirect('/admin/staff');
        
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'type' => 'staff',
        ]);

        $staff = User::where('email', 'john@example.com')->first();
        $this->assertTrue($staff->hasRole('staff'));
        $this->assertTrue($staff->hasPermissionTo('view inventory'));
        $this->assertTrue($staff->hasPermissionTo('create products'));
        $this->assertTrue($staff->hasPermissionTo('edit products'));
    }

    public function test_admin_can_edit_staff_member(): void
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');

        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');
        $staff->givePermissionTo(['view inventory']);

        $response = $this->actingAs($admin)->get("/admin/staff/{$staff->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Staff/edit'));
    }

    public function test_admin_can_update_staff_member(): void
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');

        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');

        $updateData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'permissions' => ['view inventory', 'create products'],
        ];

        $response = $this->actingAs($admin)->put("/admin/staff/{$staff->id}", $updateData);

        $response->assertRedirect('/admin/staff');
        
        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);

        $staff->refresh();
        $this->assertTrue($staff->hasPermissionTo('view inventory'));
        $this->assertTrue($staff->hasPermissionTo('create products'));
    }

    public function test_admin_can_delete_staff_member(): void
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->assignRole('admin');

        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');

        $response = $this->actingAs($admin)->delete("/admin/staff/{$staff->id}");

        $response->assertRedirect('/admin/staff');
        
        $this->assertDatabaseMissing('users', [
            'id' => $staff->id,
        ]);
    }

    public function test_staff_cannot_access_staff_management(): void
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');
        $staff->givePermissionTo(['view inventory']);

        $response = $this->actingAs($staff)->get('/admin/staff');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_create_other_staff(): void
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');
        $staff->givePermissionTo(['view inventory']);

        $response = $this->actingAs($staff)->get('/admin/staff/add');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_delete_products(): void
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');
        $staff->givePermissionTo(['view inventory', 'create products', 'edit products']);

        $this->assertFalse($staff->hasPermissionTo('delete products'));
    }

    public function test_staff_cannot_manage_members(): void
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->assignRole('staff');
        $staff->givePermissionTo(['view inventory']);

        $this->assertFalse($staff->hasPermissionTo('view membership'));
        $this->assertFalse($staff->hasPermissionTo('create members'));
        $this->assertFalse($staff->hasPermissionTo('edit members'));
        $this->assertFalse($staff->hasPermissionTo('delete members'));
    }
} 