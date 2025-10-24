<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Helpers\SystemLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;

class SystemLogsPageTest extends TestCase
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
        // Create some test log entries
        SystemLogger::logAuthentication('login_success', 1, 'admin', ['ip_address' => '192.168.1.1']);
        SystemLogger::logSecurityEvent('password_changed', 1, '192.168.1.1', ['user_type' => 'admin']);
        SystemLogger::logAdminActivity('dashboard_access', 1, ['ip_address' => '192.168.1.1']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function admin_can_access_system_logs_page()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/system-logs')
                ->has('logs')
                ->has('filters')
                ->has('summary')
        );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function staff_can_access_system_logs_page()
    {
        $staff = User::factory()->create(['type' => 'staff', 'is_default' => false]);

        $response = $this->actingAs($staff)->get('/admin/system-logs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/system-logs')
        );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function customer_cannot_access_system_logs_page()
    {
        $customer = User::factory()->create(['type' => 'customer']);

        $response = $this->actingAs($customer)->get('/admin/system-logs');

        $response->assertStatus(403);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function member_cannot_access_system_logs_page()
    {
        $member = User::factory()->create(['type' => 'member']);

        $response = $this->actingAs($member)->get('/admin/system-logs');

        $response->assertStatus(403);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function logistic_cannot_access_system_logs_page()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);

        $response = $this->actingAs($logistic)->get('/admin/system-logs');

        $response->assertStatus(403);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function admin_can_export_system_logs()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs/export');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_page_shows_summary_statistics()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('summary')
                ->where('summary.total_logs', function ($total) {
                    return $total > 0;
                })
        );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function system_logs_page_filters_work()
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_default' => false]);

        $response = $this->actingAs($admin)->get('/admin/system-logs', [
            'search' => 'login',
            'level' => 'info',
            'event_type' => 'authentication',
            'user_type' => 'admin'
        ]);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('filters.search', 'login')
                ->where('filters.level', 'info')
                ->where('filters.event_type', 'authentication')
                ->where('filters.user_type', 'admin')
        );
    }
}
