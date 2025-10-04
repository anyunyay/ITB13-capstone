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

class ComprehensiveSystemLoggingTest extends TestCase
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

    public function test_admin_activities_logging()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        // Test admin activity logging
        SystemLogger::logAdminActivity(
            'dashboard_access',
            $admin->id,
            ['ip_address' => '192.168.1.1']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Admin activity performed', $logContent);
        $this->assertStringContainsString('"admin_id":' . $admin->id, $logContent);
        $this->assertStringContainsString('"user_type":"admin"', $logContent);
        $this->assertStringContainsString('"action":"dashboard_access"', $logContent);
    }

    public function test_staff_activities_logging()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        
        // Test staff activity logging
        SystemLogger::logStaffActivity(
            'inventory_management',
            $staff->id,
            'staff',
            ['action_detail' => 'product_created']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Staff activity performed', $logContent);
        $this->assertStringContainsString('"staff_id":' . $staff->id, $logContent);
        $this->assertStringContainsString('"user_type":"staff"', $logContent);
        $this->assertStringContainsString('"action":"inventory_management"', $logContent);
    }

    public function test_customer_activities_logging()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        // Test customer activity logging
        SystemLogger::logCustomerActivity(
            'product_viewed',
            $customer->id,
            ['product_id' => 123, 'product_name' => 'Test Product']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Customer activity performed', $logContent);
        $this->assertStringContainsString('"customer_id":' . $customer->id, $logContent);
        $this->assertStringContainsString('"user_type":"customer"', $logContent);
        $this->assertStringContainsString('"action":"product_viewed"', $logContent);
    }

    public function test_member_activities_logging()
    {
        $member = User::factory()->create(['type' => 'member']);
        
        // Test member activity logging
        SystemLogger::logMemberActivity(
            'revenue_report_generated',
            $member->id,
            ['report_type' => 'csv', 'date_range' => '2025-01-01 to 2025-01-31']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Member activity performed', $logContent);
        $this->assertStringContainsString('"member_id":' . $member->id, $logContent);
        $this->assertStringContainsString('"user_type":"member"', $logContent);
        $this->assertStringContainsString('"action":"revenue_report_generated"', $logContent);
    }

    public function test_logistic_activities_logging()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        
        // Test logistic activity logging
        SystemLogger::logLogisticActivity(
            'delivery_status_updated',
            $logistic->id,
            ['order_id' => 456, 'old_status' => 'pending', 'new_status' => 'out_for_delivery']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Logistic activity performed', $logContent);
        $this->assertStringContainsString('"logistic_id":' . $logistic->id, $logContent);
        $this->assertStringContainsString('"user_type":"logistic"', $logContent);
        $this->assertStringContainsString('"action":"delivery_status_updated"', $logContent);
    }

    public function test_authentication_events_logging()
    {
        $user = User::factory()->create(['type' => 'customer']);
        
        // Test login success
        SystemLogger::logAuthentication(
            'login_success',
            $user->id,
            'customer',
            ['ip_address' => '192.168.1.100']
        );

        // Test login failure
        SystemLogger::logAuthentication(
            'login_failed',
            null,
            null,
            ['email' => 'test@example.com', 'ip_address' => '192.168.1.101']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Authentication event', $logContent);
        $this->assertStringContainsString('"event":"login_success"', $logContent);
        $this->assertStringContainsString('"event":"login_failed"', $logContent);
    }

    public function test_report_generation_logging()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        // Test report generation
        SystemLogger::logReportGeneration(
            'sales_report',
            $admin->id,
            'admin',
            ['format' => 'pdf', 'date_range' => '2025-01-01 to 2025-01-31']
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Report generated', $logContent);
        $this->assertStringContainsString('"report_type":"sales_report"', $logContent);
        $this->assertStringContainsString('"user_type":"admin"', $logContent);
    }

    public function test_data_export_logging()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        
        // Test data export
        SystemLogger::logDataExport(
            'inventory_export',
            $staff->id,
            'staff',
            ['format' => 'csv', 'records_count' => 150]
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('Data export performed', $logContent);
        $this->assertStringContainsString('"export_type":"inventory_export"', $logContent);
        $this->assertStringContainsString('"user_type":"staff"', $logContent);
    }

    public function test_user_management_logging()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $targetUser = User::factory()->create(['type' => 'staff']);
        
        // Test user management actions
        SystemLogger::logUserManagement(
            'create_staff',
            $targetUser->id,
            $admin->id,
            'admin',
            ['staff_name' => $targetUser->name, 'permissions' => ['view inventory']]
        );

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        $this->assertStringContainsString('User management action performed', $logContent);
        $this->assertStringContainsString('"action":"create_staff"', $logContent);
        $this->assertStringContainsString('"target_user_id":' . $targetUser->id, $logContent);
        $this->assertStringContainsString('"performed_by_user_id":' . $admin->id, $logContent);
    }

    public function test_comprehensive_user_type_coverage()
    {
        // Test all user types in one comprehensive test
        $admin = User::factory()->create(['type' => 'admin']);
        $staff = User::factory()->create(['type' => 'staff']);
        $customer = User::factory()->create(['type' => 'customer']);
        $member = User::factory()->create(['type' => 'member']);
        $logistic = User::factory()->create(['type' => 'logistic']);

        // Log activities for all user types
        SystemLogger::logAdminActivity('system_configuration', $admin->id, ['setting' => 'email_config']);
        SystemLogger::logStaffActivity('inventory_audit', $staff->id, 'staff', ['items_checked' => 50]);
        SystemLogger::logCustomerActivity('order_placed', $customer->id, ['order_id' => 789, 'total' => 150.50]);
        SystemLogger::logMemberActivity('stock_added', $member->id, ['product_id' => 101, 'quantity' => 25.5]);
        SystemLogger::logLogisticActivity('delivery_completed', $logistic->id, ['order_id' => 789, 'delivery_time' => '2 hours']);

        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        
        // Verify all user types are logged
        $this->assertStringContainsString('"user_type":"admin"', $logContent);
        $this->assertStringContainsString('"user_type":"staff"', $logContent);
        $this->assertStringContainsString('"user_type":"customer"', $logContent);
        $this->assertStringContainsString('"user_type":"member"', $logContent);
        $this->assertStringContainsString('"user_type":"logistic"', $logContent);
        
        // Verify all event types are logged
        $this->assertStringContainsString('Admin activity performed', $logContent);
        $this->assertStringContainsString('Staff activity performed', $logContent);
        $this->assertStringContainsString('Customer activity performed', $logContent);
        $this->assertStringContainsString('Member activity performed', $logContent);
        $this->assertStringContainsString('Logistic activity performed', $logContent);
    }

    public function test_log_structure_consistency()
    {
        $user = User::factory()->create(['type' => 'admin']);
        
        // Test that all log entries have consistent structure
        SystemLogger::logAdminActivity('test_action', $user->id, ['test' => 'value']);
        
        $this->assertFileExists(storage_path('logs/system.log'));
        
        $logContent = file_get_contents(storage_path('logs/system.log'));
        
        // Verify JSON structure
        $this->assertStringContainsString('"admin_id":' . $user->id, $logContent);
        $this->assertStringContainsString('"user_type":"admin"', $logContent);
        $this->assertStringContainsString('"event_type":"admin_activity"', $logContent);
        $this->assertStringContainsString('"action":"test_action"', $logContent);
        $this->assertStringContainsString('"timestamp":', $logContent);
        $this->assertStringContainsString('"test":"value"', $logContent);
    }
}
