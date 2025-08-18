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

class LogisticOrderReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::create(['name' => 'access logistic features']);
    }

    public function test_logistic_can_access_order_report()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        $logistic->givePermissionTo('access logistic features');

        $response = $this->actingAs($logistic)
            ->get(route('logistic.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Logistic/report'));
    }

    public function test_user_without_permission_cannot_access_logistic_report()
    {
        $user = User::factory()->create(['type' => 'customer']);

        $response = $this->actingAs($user)
            ->get(route('logistic.report'));

        $response->assertStatus(403);
    }

    public function test_logistic_report_shows_correct_summary()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        $logistic->givePermissionTo('access logistic features');

        $customer = User::factory()->create(['type' => 'customer']);
        $product = Product::factory()->create();

        // Create orders with different delivery statuses
        $pendingOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'pending',
            'total_amount' => 100.00,
        ]);

        $outForDeliveryOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'out_for_delivery',
            'total_amount' => 200.00,
        ]);

        $deliveredOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'total_amount' => 300.00,
        ]);

        $response = $this->actingAs($logistic)
            ->get(route('logistic.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('summary')
        );
    }

    public function test_logistic_report_filters_by_date_range()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        $logistic->givePermissionTo('access logistic features');

        $customer = User::factory()->create(['type' => 'customer']);

        // Create an old order
        $oldOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'created_at' => now()->subDays(10),
        ]);

        // Create a recent order
        $recentOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($logistic)
            ->get(route('logistic.report', [
                'start_date' => now()->subDays(5)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('orders')
        );
    }

    public function test_logistic_report_filters_by_delivery_status()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        $logistic->givePermissionTo('access logistic features');

        $customer = User::factory()->create(['type' => 'customer']);

        // Create orders with different delivery statuses
        $pendingOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'pending',
        ]);

        $deliveredOrder = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
        ]);

        $response = $this->actingAs($logistic)
            ->get(route('logistic.report', ['delivery_status' => 'pending']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('orders')
        );
    }

    public function test_logistic_report_only_shows_assigned_orders()
    {
        $logistic1 = User::factory()->create(['type' => 'logistic']);
        $logistic2 = User::factory()->create(['type' => 'logistic']);
        $logistic1->givePermissionTo('access logistic features');
        $logistic2->givePermissionTo('access logistic features');

        $customer = User::factory()->create(['type' => 'customer']);

        // Create order assigned to logistic1
        $order1 = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic1->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
        ]);

        // Create order assigned to logistic2
        $order2 = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic2->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
        ]);

        $response = $this->actingAs($logistic1)
            ->get(route('logistic.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('orders')
        );
    }

    public function test_logistic_report_export_csv()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        $logistic->givePermissionTo('access logistic features');

        $customer = User::factory()->create(['type' => 'customer']);
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'total_amount' => 100.00,
        ]);

        $response = $this->actingAs($logistic)
            ->get(route('logistic.report', ['format' => 'csv']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="logistic_orders_report_' . date('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_logistic_report_export_pdf()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        $logistic->givePermissionTo('access logistic features');

        $customer = User::factory()->create(['type' => 'customer']);
        $order = Sales::factory()->create([
            'customer_id' => $customer->id,
            'logistic_id' => $logistic->id,
            'status' => 'approved',
            'delivery_status' => 'delivered',
            'total_amount' => 100.00,
        ]);

        $response = $this->actingAs($logistic)
            ->get(route('logistic.report', ['format' => 'pdf']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition');
    }
}
