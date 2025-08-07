<?php

namespace Tests\Feature;

use App\Models\Sales;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Permission;

class OrderReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::create(['name' => 'generate order report']);
    }

    public function test_admin_can_access_order_report()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate order report');

        $response = $this->actingAs($admin)
            ->get(route('admin.orders.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Orders/report'));
    }

    public function test_staff_can_access_order_report()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->givePermissionTo('generate order report');

        $response = $this->actingAs($staff)
            ->get(route('admin.orders.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Orders/report'));
    }

    public function test_user_without_permission_cannot_access_order_report()
    {
        $user = User::factory()->create(['type' => 'customer']);

        $response = $this->actingAs($user)
            ->get(route('admin.orders.report'));

        $response->assertStatus(403);
    }

    public function test_order_report_shows_correct_summary()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate order report');

        // Create test orders
        $customer = User::factory()->create(['type' => 'customer']);

        // Create orders with different statuses
        $pendingOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100.00,
        ]);

        $approvedOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'total_amount' => 200.00,
        ]);

        $rejectedOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'rejected',
            'total_amount' => 150.00,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.orders.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('summary', fn ($summary) =>
                $summary->get('total_orders') === 3 &&
                $summary->get('total_revenue') === 450.00 &&
                $summary->get('pending_orders') === 1 &&
                $summary->get('approved_orders') === 1 &&
                $summary->get('rejected_orders') === 1 &&
                $summary->get('delivered_orders') === 1
            )
        );
    }

    public function test_order_report_filters_by_date_range()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate order report');

        $customer = User::factory()->create(['type' => 'customer']);

        // Create orders on different dates
        $oldOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'created_at' => now()->subDays(10),
            'total_amount' => 100.00,
        ]);

        $recentOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'created_at' => now()->subDays(2),
            'total_amount' => 200.00,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.orders.report', [
                'start_date' => now()->subDays(5)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('orders', fn ($orders) =>
                $orders->count() === 1 &&
                $orders->first()->get('id') === $recentOrder->id
            )
        );
    }

    public function test_order_report_filters_by_status()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate order report');

        $customer = User::factory()->create(['type' => 'customer']);

        // Create orders with different statuses
        $pendingOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);

        $approvedOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.orders.report', ['status' => 'pending']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('orders', fn ($orders) =>
                $orders->count() === 1 &&
                $orders->first()->get('id') === $pendingOrder->id
            )
        );
    }

    public function test_order_report_export_csv()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate order report');

        $customer = User::factory()->create(['type' => 'customer']);
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'total_amount' => 100.00,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.orders.report', ['format' => 'csv']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="orders_report_' . date('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_order_report_export_pdf()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate order report');

        $customer = User::factory()->create(['type' => 'customer']);
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'approved',
            'total_amount' => 100.00,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.orders.report', ['format' => 'pdf']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="orders_report_' . date('Y-m-d_H-i-s') . '.txt"');
    }
} 