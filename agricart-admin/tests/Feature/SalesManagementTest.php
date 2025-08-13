<?php

namespace Tests\Feature;

use App\Models\Sales;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_sales_page()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo(['view sales']);

        $response = $this->actingAs($admin)->get('/admin/sales');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Sales/index'));
    }

    public function test_admin_can_view_member_sales_page()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo(['view sales']);

        $response = $this->actingAs($admin)->get('/admin/sales/member-sales');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Sales/memberSales'));
    }

    public function test_admin_can_generate_sales_report()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo(['generate sales report']);

        $response = $this->actingAs($admin)->get('/admin/sales/report');

        $response->assertStatus(200);
    }

    public function test_sales_page_shows_correct_data()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo(['view sales']);

        $customer = User::factory()->create(['type' => 'customer']);
        $member = User::factory()->create(['type' => 'member']);
        $product = Product::factory()->create();

        // Create stock for member
        $stock = Stock::factory()->create([
            'member_id' => $member->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'category' => 'Kilo'
        ]);

        // Create approved sale
        $sale = Sales::factory()->create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'status' => 'approved',
            'total_amount' => 1000.00
        ]);

        // Create audit trail
        AuditTrail::factory()->create([
            'sale_id' => $sale->id,
            'stock_id' => $stock->id,
            'product_id' => $product->id,
            'quantity' => 5,
            'category' => 'Kilo'
        ]);

        $response = $this->actingAs($admin)->get('/admin/sales');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('sales')
                ->has('summary')
                ->has('memberSales')
                ->where('summary.total_revenue', 1000.00)
                ->where('summary.total_orders', 1)
        );
    }

    public function test_member_sales_calculation_is_correct()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo(['view sales']);

        $customer = User::factory()->create(['type' => 'customer']);
        $member = User::factory()->create(['type' => 'member']);
        $product = Product::factory()->create();

        // Create stock for member
        $stock = Stock::factory()->create([
            'member_id' => $member->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'category' => 'Kilo'
        ]);

        // Create approved sale
        $sale = Sales::factory()->create([
            'customer_id' => $customer->id,
            'admin_id' => $admin->id,
            'status' => 'approved',
            'total_amount' => 1000.00
        ]);

        // Create audit trail
        AuditTrail::factory()->create([
            'sale_id' => $sale->id,
            'stock_id' => $stock->id,
            'product_id' => $product->id,
            'quantity' => 5,
            'category' => 'Kilo'
        ]);

        $response = $this->actingAs($admin)->get('/admin/sales/member-sales');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('memberSales')
                ->where('memberSales.0.member_name', $member->name)
                ->where('memberSales.0.total_revenue', 1000.00)
                ->where('memberSales.0.total_orders', 1)
                ->where('memberSales.0.total_quantity_sold', 5)
        );
    }

    public function test_unauthorized_user_cannot_access_sales()
    {
        $user = User::factory()->create(['type' => 'customer']);

        $response = $this->actingAs($user)->get('/admin/sales');

        $response->assertStatus(403);
    }
}
