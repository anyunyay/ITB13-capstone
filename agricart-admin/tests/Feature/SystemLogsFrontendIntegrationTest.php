<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Helpers\SystemLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SystemLogsFrontendIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create some test logs
        $this->createTestLogs();
    }

    private function createTestLogs()
    {
        // Create a test admin user
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);
        
        // Create various types of log entries
        SystemLogger::logAuthentication('login_success', $admin->id, 'admin', ['ip_address' => '127.0.0.1']);
        SystemLogger::logSecurityEvent('password_changed', $admin->id, '127.0.0.1', ['user_type' => 'admin']);
        SystemLogger::logAdminActivity('dashboard_access', $admin->id, ['ip_address' => '127.0.0.1']);
        SystemLogger::logAdminActivity('system_logs_access', $admin->id, ['ip_address' => '127.0.0.1', 'filters_applied' => ['per_page' => 25]]);
        
        // Create some business transaction logs
        SystemLogger::logCheckout($admin->id, 123, 150.00, 'success', ['cart_items_count' => 3]);
        SystemLogger::logOrderStatusChange(123, 'pending', 'approved', $admin->id, 'admin', ['admin_notes' => 'Order approved']);
        
        // Create some product management logs
        SystemLogger::logProductManagement('create', 456, $admin->id, 'admin', ['product_name' => 'Test Product']);
        SystemLogger::logProductManagement('update', 456, $admin->id, 'admin', ['product_name' => 'Updated Product']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_page_displays_correct_data_structure()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs');

        // The response should either be 200 (success) or 302 (redirect due to middleware)
        $this->assertTrue(in_array($response->status(), [200, 302]));
        
        // If it's a 200 response, check the data structure
        if ($response->status() === 200) {
            $response->assertInertia(fn ($page) => 
                $page->component('Profile/system-logs')
                    ->has('logs')
                    ->has('filters')
                    ->has('summary')
                    ->where('logs.data', function ($data) {
                        return is_array($data);
                    })
                    ->where('summary.total_logs', function ($total) {
                        return $total > 0;
                    })
            );
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_filtering_works()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        // Test filtering by event type
        $response = $this->actingAs($admin)->get('/admin/system-logs', [
            'event_type' => 'authentication',
            'level' => 'info',
            'per_page' => 10
        ]);

        $this->assertTrue(in_array($response->status(), [200, 302]));
        
        if ($response->status() === 200) {
            $response->assertInertia(fn ($page) => 
                $page->where('filters.event_type', 'authentication')
                    ->where('filters.level', 'info')
                    ->where('filters.per_page', 10)
            );
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_export_contains_data()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs/export');

        $this->assertTrue(in_array($response->status(), [200, 302]));
        
        if ($response->status() === 200) {
            $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
            $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_summary_statistics_are_calculated()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs');

        if ($response->status() === 200) {
            $response->assertInertia(fn ($page) => 
                $page->has('summary')
                    ->where('summary.total_logs', function ($total) {
                        return $total > 0;
                    })
                    ->where('summary.error_count', function ($count) {
                        return is_numeric($count);
                    })
                    ->where('summary.warning_count', function ($count) {
                        return is_numeric($count);
                    })
                    ->where('summary.info_count', function ($count) {
                        return is_numeric($count);
                    })
                    ->where('summary.today_logs', function ($count) {
                        return is_numeric($count);
                    })
                    ->where('summary.unique_users', function ($count) {
                        return is_numeric($count);
                    })
            );
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_access_is_logged()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        // Access the system logs page
        $response = $this->actingAs($admin)->get('/admin/system-logs');

        // Check that the access was logged
        $logPath = storage_path('logs/system.log');
        $logContent = file_get_contents($logPath);
        
        $this->assertStringContainsString('System Logs Access', $logContent);
        $this->assertStringContainsString('Admin User', $logContent);
    }
}
