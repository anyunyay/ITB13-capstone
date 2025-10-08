<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Sales;
use App\Models\Stock;
use App\Models\User;
use App\Notifications\OrderReceipt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class OrderApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $admin = Role::create(['name' => 'admin']);
        $customer = Role::create(['name' => 'customer']);
        $member = Role::create(['name' => 'member']);
        $logistic = Role::create(['name' => 'logistic']);
        
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

    public function test_sales_address_relationship_works()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a default address for the customer
        $address = \App\Models\UserAddress::create([
            'user_id' => $customer->id,
            'street' => '123 Test Street',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);
        
        // Create a sale with address reference
        $sale = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
            'address_id' => $address->id,
        ]);
        
        // Test the relationship
        $this->assertNotNull($sale->address);
        $this->assertEquals($address->id, $sale->address->id);
        $this->assertEquals($address->street, $sale->address->street);
        
        // Test reverse relationship
        $this->assertTrue($address->sales->contains($sale));
        $this->assertEquals(1, $address->sales->count());
        
        // Verify database has correct data
        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'customer_id' => $customer->id,
            'address_id' => $address->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_approve_order()
    {
        // Create an admin
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a member for stock
        $member = User::factory()->member()->create();
        $member->assignRole('member');
        
        // Create a product
        $product = Product::factory()->create();
        
        // Create stock for the product
        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);

        // Create a pending order manually
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
        ]);

        // Admin approves the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/approve", [
            'admin_notes' => 'Order approved successfully',
        ]);
        
        $response->assertRedirect("/admin/orders/{$order->id}");
        
        // Check that the order status was updated
        $this->assertDatabaseHas('sales', [
            'id' => $order->id,
            'status' => 'approved',
            'admin_id' => $admin->id,
            'admin_notes' => 'Order approved successfully',
        ]);
    }

    public function test_approval_redirects_to_order_show_page()
    {
        // Create an admin
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a pending order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
        ]);

        // Admin approves the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/approve", [
            'admin_notes' => 'Order approved successfully',
        ]);
        
        // Should redirect to order show page, not orders index
        $response->assertRedirect("/admin/orders/{$order->id}");
        
        // Check that the order status was updated
        $this->assertDatabaseHas('sales', [
            'id' => $order->id,
            'status' => 'approved',
            'admin_id' => $admin->id,
        ]);
    }

    public function test_admin_can_reject_order()
    {
        // Create an admin
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a pending order manually
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
        ]);

        // Admin rejects the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/reject", [
            'admin_notes' => 'Order rejected due to insufficient stock',
        ]);
        
        $response->assertRedirect('/admin/orders');
        
        // Check that the order status was updated
        $this->assertDatabaseHas('sales', [
            'id' => $order->id,
            'status' => 'rejected',
            'admin_id' => $admin->id,
            'admin_notes' => 'Order rejected due to insufficient stock',
        ]);
    }

    public function test_admin_can_view_orders()
    {
        // Create an admin
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        // Create some orders manually
        Sales::create(['customer_id' => 1, 'status' => 'pending', 'total_amount' => 100]);
        Sales::create(['customer_id' => 1, 'status' => 'pending', 'total_amount' => 200]);
        Sales::create(['customer_id' => 1, 'status' => 'pending', 'total_amount' => 300]);
        Sales::create(['customer_id' => 1, 'status' => 'approved', 'total_amount' => 400]);
        Sales::create(['customer_id' => 1, 'status' => 'approved', 'total_amount' => 500]);
        Sales::create(['customer_id' => 1, 'status' => 'rejected', 'total_amount' => 600]);

        // Admin views orders
        $response = $this->actingAs($admin)->get('/admin/orders');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Orders/index'));
    }

    public function test_customer_can_view_order_history()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create some orders for the customer manually
        Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
        ]);
        Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 200,
        ]);
        Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'total_amount' => 300,
        ]);

        // Customer views order history
        $response = $this->actingAs($customer)->get('/customer/orders/history');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Order History/index'));
    }

    public function test_admin_can_assign_logistic_to_approved_order()
    {
        // Create an admin
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a logistic
        $logistic = User::factory()->logistic()->create();
        $logistic->assignRole('logistic');
        
        // Create an approved order
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'total_amount' => 100,
        ]);

        // Admin assigns logistic to the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/assign-logistic", [
            'logistic_id' => $logistic->id,
        ]);
        
        $response->assertRedirect("/admin/orders/{$order->id}");
        
        // Check that the logistic was assigned
        $this->assertDatabaseHas('sales', [
            'id' => $order->id,
            'logistic_id' => $logistic->id,
        ]);
    }

    public function test_order_approval_sends_receipt_email()
    {
        Notification::fake();

        // Create an admin
        $admin = User::factory()->admin()->create();
        $admin->assignRole('admin');
        
        // Create a customer
        $customer = User::factory()->customer()->create();
        $customer->assignRole('customer');
        
        // Create a member for stock
        $member = User::factory()->member()->create();
        $member->assignRole('member');
        
        // Create a product
        $product = Product::factory()->create();
        
        // Create stock for the product
        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10,
            'category' => 'Kilo',
        ]);

        // Create a pending order manually
        $order = Sales::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
        ]);

        // Admin approves the order
        $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/approve", [
            'admin_notes' => 'Order approved successfully',
        ]);
        
        $response->assertRedirect("/admin/orders/{$order->id}");
        
        // Check that receipt email was sent to customer
        Notification::assertSentTo(
            $customer,
            OrderReceipt::class,
            function ($notification) use ($order) {
                return $notification->order->id === $order->id;
            }
        );
    }
}
