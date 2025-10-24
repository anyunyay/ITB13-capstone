<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\SalesAudit;
use App\Helpers\SystemLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class ComprehensiveSystemLoggingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Clear the system log before each test
        $logPath = storage_path('logs/system.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_authentication_events()
    {
        // Test successful login
        $user = User::factory()->create(['type' => 'customer']);
        
        SystemLogger::logAuthentication(
            'login_success',
            $user->id,
            'customer',
            ['ip_address' => '192.168.1.1']
        );

        // Test failed login
        SystemLogger::logSecurityEvent(
            'login_failed',
            null,
            '192.168.1.1',
            [
                'email' => 'test@example.com',
                'user_type' => 'customer',
                'is_locked' => false
            ]
        );

        // Test logout
        SystemLogger::logAuthentication(
            'logout',
            $user->id,
            'customer',
            ['ip_address' => '192.168.1.1']
        );

        $this->assertLogContains('login_success');
        $this->assertLogContains('login_failed');
        $this->assertLogContains('logout');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_crud_operations()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $product = Product::factory()->create();

        // Test product creation
        SystemLogger::logProductManagement(
            'create',
            $product->id,
            $admin->id,
            'admin',
            [
                'product_name' => $product->name,
                'produce_type' => $product->produce_type
            ]
        );

        // Test product update
        SystemLogger::logProductManagement(
            'update',
            $product->id,
            $admin->id,
            'admin',
            [
                'product_name' => $product->name,
                'price_changed' => true
            ]
        );

        // Test product deletion
        SystemLogger::logProductManagement(
            'delete',
            $product->id,
            $admin->id,
            'admin',
            [
                'product_name' => $product->name
            ]
        );

        $this->assertLogContains('create');
        $this->assertLogContains('update');
        $this->assertLogContains('delete');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_security_events()
    {
        $user = User::factory()->create(['type' => 'customer']);

        // Test password change
        SystemLogger::logSecurityEvent(
            'password_changed',
            $user->id,
            '192.168.1.1',
            [
                'user_type' => 'customer',
                'user_email' => $user->email
            ]
        );

        // Test email change
        SystemLogger::logSecurityEvent(
            'email_changed',
            $user->id,
            '192.168.1.1',
            [
                'user_type' => 'customer',
                'old_value' => 'old@example.com',
                'new_value' => 'new@example.com'
            ]
        );

        $this->assertLogContains('password_changed');
        $this->assertLogContains('email_changed');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_business_transactions()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        $product = Product::factory()->create();
        $member = User::factory()->create(['type' => 'member']);
        $order = SalesAudit::factory()->create(['customer_id' => $customer->id]);

        // Test checkout
        SystemLogger::logCheckout(
            $customer->id,
            $order->id,
            100.00,
            'success',
            [
                'cart_items_count' => 3,
                'minimum_order_met' => true
            ]
        );

        // Test order status change
        SystemLogger::logOrderStatusChange(
            $order->id,
            'pending',
            'approved',
            $customer->id,
            'admin',
            [
                'admin_notes' => 'Order approved',
                'total_amount' => 100.00
            ]
        );

        // Test stock update - create stock manually to avoid factory issues
        $stock = Stock::create([
            'product_id' => $product->id,
            'quantity' => 10,
            'sold_quantity' => 0,
            'initial_quantity' => 10,
            'member_id' => $member->id,
            'category' => 'Kilo'
        ]);

        SystemLogger::logStockUpdate(
            $stock->id,
            $stock->product_id,
            10,
            5,
            $customer->id,
            'admin',
            'stock_sold',
            [
                'product_name' => 'Test Product',
                'member_id' => $member->id
            ]
        );

        $this->assertLogContains('checkout');
        $this->assertLogContains('order_status_change');
        $this->assertLogContains('stock_update');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_user_management_activities()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $staff = User::factory()->create(['type' => 'staff']);

        // Test staff creation
        SystemLogger::logUserManagement(
            'create_staff',
            $staff->id,
            $admin->id,
            'admin',
            [
                'staff_name' => $staff->name,
                'staff_email' => $staff->email
            ]
        );

        // Test staff update
        SystemLogger::logUserManagement(
            'update_staff',
            $staff->id,
            $admin->id,
            'admin',
            [
                'staff_name' => $staff->name,
                'permissions_count' => 5
            ]
        );

        $this->assertLogContains('create_staff');
        $this->assertLogContains('update_staff');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_member_activities()
    {
        $member = User::factory()->create(['type' => 'member']);

        // Test dashboard access
        SystemLogger::logMemberActivity(
            'dashboard_access',
            $member->id,
            ['ip_address' => '192.168.1.1']
        );

        // Test transactions access
        SystemLogger::logMemberActivity(
            'transactions_access',
            $member->id,
            ['ip_address' => '192.168.1.1']
        );

        $this->assertLogContains('dashboard_access');
        $this->assertLogContains('transactions_access');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_admin_activities()
    {
        $admin = User::factory()->create(['type' => 'admin']);

        // Test dashboard access
        SystemLogger::logAdminActivity(
            'dashboard_access',
            $admin->id,
            ['ip_address' => '192.168.1.1']
        );
        
        // Test report generation
        SystemLogger::logReportGeneration(
            'sales_report',
            $admin->id,
            'admin',
            [
                'start_date' => '2024-01-01',
                'end_date' => '2024-01-31',
                'format' => 'pdf'
            ]
        );

        $this->assertLogContains('dashboard_access');
        $this->assertLogContains('sales_report');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_logistic_activities()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);

        // Test delivery status change
        SystemLogger::logDeliveryStatusChange(
            1,
            'out_for_delivery',
            'delivered',
            $logistic->id,
            [
                'customer_id' => 1,
                'order_status' => 'approved'
            ]
        );

        // Test sales creation
        SystemLogger::logLogisticActivity(
            'sales_created',
            $logistic->id,
            [
                'sale_id' => 1,
                'order_id' => 1,
                'total_amount' => 100.00
            ]
        );

        $this->assertLogContains('delivery_status_change');
        $this->assertLogContains('sales_created');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_customer_activities()
    {
        $customer = User::factory()->create(['type' => 'customer']);

        // Test cart item addition
        SystemLogger::logCustomerActivity(
            'cart_item_added',
            $customer->id,
            [
                'product_id' => 1,
                'quantity' => 2,
                'category' => 'Kilo'
            ]
        );

        // Test checkout success
        SystemLogger::logCustomerActivity(
            'checkout_success',
            $customer->id,
            [
                'order_id' => 1,
                'total_amount' => 100.00
            ]
        );

        $this->assertLogContains('cart_item_added');
        $this->assertLogContains('checkout_success');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_critical_errors()
    {
        // Test critical error logging
        SystemLogger::logCriticalError(
            'Database connection failed',
            [
                'error_code' => 'DB_CONNECTION_FAILED',
                'database' => 'mysql'
            ]
        );

        $this->assertLogContains('critical_error');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_maintenance_activities()
    {
        $admin = User::factory()->create(['type' => 'admin']);

        // Test maintenance logging
        SystemLogger::logMaintenance(
            'database_backup',
            $admin->id,
            [
                'backup_size' => '500MB',
                'backup_location' => '/backups/'
            ]
        );

        $this->assertLogContains('maintenance');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_logs_data_export_activities()
    {
        $admin = User::factory()->create(['type' => 'admin']);

        // Test data export logging
        SystemLogger::logDataExport(
            'orders_export',
            $admin->id,
            'admin',
            [
                'format' => 'csv',
                'record_count' => 100,
                'date_range' => '2024-01-01 to 2024-01-31'
            ]
        );

        $this->assertLogContains('data_export');
    }

    /**
     * Assert that the system log contains a specific string
     */
    private function assertLogContains(string $expected): void
    {
        $logPath = storage_path('logs/system.log');
        $logContent = File::exists($logPath) ? File::get($logPath) : '';
        
        $this->assertStringContainsString($expected, $logContent, 
            "Expected to find '{$expected}' in system log, but it was not found. Log content: " . substr($logContent, 0, 500)
        );
    }

    /**
     * Assert that the system log contains a specific JSON structure
     */
    private function assertLogContainsJson(array $expected): void
    {
        $logPath = storage_path('logs/system.log');
        $logContent = File::exists($logPath) ? File::get($logPath) : '';
        
        $this->assertStringContainsString(json_encode($expected), $logContent,
            "Expected to find JSON structure in system log, but it was not found."
        );
    }
}