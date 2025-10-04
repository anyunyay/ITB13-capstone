<?php

namespace Tests\Feature;

use App\Helpers\SystemLogger;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Sales;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class SystemLoggingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Clear any existing log files
        if (file_exists(storage_path('logs/system.log'))) {
            unlink(storage_path('logs/system.log'));
        }
    }

    public function test_system_logger_checkout_logging()
    {
        $user = User::factory()->create(['type' => 'customer']);
        
        SystemLogger::logCheckout(
            $user->id,
            123,
            150.50,
            'success',
            ['cart_items_count' => 3]
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Customer checkout completed', $logContent);
        $this->assertStringContainsString('"user_id":' . $user->id, $logContent);
        $this->assertStringContainsString('"order_id":123', $logContent);
        $this->assertStringContainsString('"total_amount":150.5', $logContent);
        $this->assertStringContainsString('"status":"success"', $logContent);
    }

    public function test_system_logger_order_status_change()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        SystemLogger::logOrderStatusChange(
            456,
            'pending',
            'approved',
            $admin->id,
            'admin',
            ['admin_notes' => 'Order looks good']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Order status changed', $logContent);
        $this->assertStringContainsString('"order_id":456', $logContent);
        $this->assertStringContainsString('"old_status":"pending"', $logContent);
        $this->assertStringContainsString('"new_status":"approved"', $logContent);
        $this->assertStringContainsString('"user_type":"admin"', $logContent);
    }

    public function test_system_logger_stock_update()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $product = Product::factory()->create();
        
        SystemLogger::logStockUpdate(
            789,
            $product->id,
            10.5,
            8.0,
            $admin->id,
            'admin',
            'stock_updated',
            ['product_name' => $product->name]
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Stock quantity updated', $logContent);
        $this->assertStringContainsString('"stock_id":789', $logContent);
        $this->assertStringContainsString('"product_id":' . $product->id, $logContent);
        $this->assertStringContainsString('"old_quantity":10.5', $logContent);
        $this->assertStringContainsString('"new_quantity":8', $logContent);
        $this->assertStringContainsString('"quantity_change":-2.5', $logContent);
    }

    public function test_system_logger_delivery_status_change()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        
        SystemLogger::logDeliveryStatusChange(
            101,
            'pending',
            'out_for_delivery',
            $logistic->id,
            ['customer_id' => 202]
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Delivery status changed', $logContent);
        $this->assertStringContainsString('"order_id":101', $logContent);
        $this->assertStringContainsString('"old_delivery_status":"pending"', $logContent);
        $this->assertStringContainsString('"new_delivery_status":"out_for_delivery"', $logContent);
        $this->assertStringContainsString('"logistic_id":' . $logistic->id, $logContent);
    }

    public function test_system_logger_critical_error()
    {
        SystemLogger::logCriticalError(
            'Database connection failed',
            ['error_code' => 'DB_CONNECTION_ERROR']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Critical system error occurred', $logContent);
        $this->assertStringContainsString('"error":"Database connection failed"', $logContent);
        $this->assertStringContainsString('"error_code":"DB_CONNECTION_ERROR"', $logContent);
    }

    public function test_system_logger_security_event()
    {
        SystemLogger::logSecurityEvent(
            'unauthorized_access_attempt',
            123,
            '192.168.1.100',
            ['attempted_action' => 'admin_panel_access']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Security event detected', $logContent);
        $this->assertStringContainsString('"event":"unauthorized_access_attempt"', $logContent);
        $this->assertStringContainsString('"user_id":123', $logContent);
        $this->assertStringContainsString('"ip_address":"192.168.1.100"', $logContent);
    }

    public function test_system_logger_uses_correct_channel()
    {
        // Mock the Log facade to verify the correct channel is used
        Log::shouldReceive('channel')
            ->once()
            ->with('system')
            ->andReturnSelf();
            
        Log::shouldReceive('info')
            ->once()
            ->with('Customer checkout completed', \Mockery::type('array'));

        SystemLogger::logCheckout(1, 1, 100, 'success');
    }
}
