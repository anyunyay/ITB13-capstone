<?php

namespace Tests\Feature;

use App\Models\SalesAudit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SimpleOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $admin = Role::create(['name' => 'admin']);
        
        // Create permissions
        $permissions = [
            'view orders', 'edit orders',
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Assign permissions to admin
        $admin->givePermissionTo(Permission::all());
    }

    public function test_order_route_exists()
    {
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        $order = SalesAudit::create([
            'customer_id' => User::factory()->customer()->create()->id,
            'status' => 'pending',
            'total_amount' => 100,
        ]);

        $response = $this->withoutMiddleware()
            ->actingAs($admin)
            ->get("/admin/orders/{$order->id}");
        
        if ($response->status() === 302) {
            $this->fail("Got redirect to: " . $response->headers->get('Location'));
        }
        
        $response->assertStatus(200);
    }
}
