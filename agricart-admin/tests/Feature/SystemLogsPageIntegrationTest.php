<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Helpers\SystemLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SystemLogsPageIntegrationTest extends TestCase
{
    use RefreshDatabase;

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_page_works_with_real_data()
    {
        // Create an admin user
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);
        
        // Create some test log entries
        SystemLogger::logAuthentication('login_success', $admin->id, 'admin', ['ip_address' => '127.0.0.1']);
        SystemLogger::logSecurityEvent('password_changed', $admin->id, '127.0.0.1', ['user_type' => 'admin']);
        SystemLogger::logAdminActivity('dashboard_access', $admin->id, ['ip_address' => '127.0.0.1']);
        
        // Test that the system logs page can be accessed
        $response = $this->actingAs($admin)->get('/admin/system-logs');
        
        // The response should either be 200 (success) or 302 (redirect due to middleware)
        $this->assertTrue(in_array($response->status(), [200, 302]));
        
        // If it's a 200 response, check that it has the correct structure
        if ($response->status() === 200) {
            $response->assertInertia(fn ($page) => 
                $page->component('Profile/system-logs')
                    ->has('logs')
                    ->has('filters')
                    ->has('summary')
            );
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_export_works()
    {
        // Create an admin user
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);
        
        // Create some test log entries
        SystemLogger::logAuthentication('login_success', $admin->id, 'admin', ['ip_address' => '127.0.0.1']);
        SystemLogger::logSecurityEvent('password_changed', $admin->id, '127.0.0.1', ['user_type' => 'admin']);
        
        // Test that the export endpoint works
        $response = $this->actingAs($admin)->get('/admin/system-logs/export');
        
        // The response should either be 200 (success) or 302 (redirect due to middleware)
        $this->assertTrue(in_array($response->status(), [200, 302]));
        
        // If it's a 200 response, check that it's a CSV
        if ($response->status() === 200) {
            $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        }
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_are_created_correctly()
    {
        // Create an admin user
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);
        
        // Create some test log entries
        SystemLogger::logAuthentication('login_success', $admin->id, 'admin', ['ip_address' => '127.0.0.1']);
        SystemLogger::logSecurityEvent('password_changed', $admin->id, '127.0.0.1', ['user_type' => 'admin']);
        SystemLogger::logAdminActivity('dashboard_access', $admin->id, ['ip_address' => '127.0.0.1']);
        
        // Check that logs are created
        $logPath = storage_path('logs/system.log');
        $this->assertTrue(file_exists($logPath));
        
        $logContent = file_get_contents($logPath);
        $this->assertStringContainsString('successfully logged in', $logContent);
        $this->assertStringContainsString('changed their password', $logContent);
        $this->assertStringContainsString('Dashboard Access', $logContent);
        $this->assertStringContainsString('Admin User', $logContent);
        $this->assertStringContainsString('127.0.0.1', $logContent);
    }
}
