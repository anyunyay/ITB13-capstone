<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Permission;

class LogisticReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::create(['name' => 'generate logistics report']);
    }

    public function test_admin_can_access_logistics_report()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate logistics report');

        $response = $this->actingAs($admin)
            ->get(route('logistics.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Logistics/report'));
    }

    public function test_staff_can_access_logistics_report()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->givePermissionTo('generate logistics report');

        $response = $this->actingAs($staff)
            ->get(route('logistics.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Logistics/report'));
    }

    public function test_user_without_permission_cannot_access_logistics_report()
    {
        $user = User::factory()->create(['type' => 'customer']);

        $response = $this->actingAs($user)
            ->get(route('logistics.report'));

        $response->assertStatus(403);
    }

    public function test_logistics_report_shows_correct_summary()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate logistics report');

        // Create test logistics
        $verifiedLogistic = User::factory()->create([
            'type' => 'logistic',
            'email_verified_at' => now(),
            'created_at' => now()->subDays(10),
        ]);

        $pendingLogistic = User::factory()->create([
            'type' => 'logistic',
            'email_verified_at' => null,
            'created_at' => now()->subDays(5),
        ]);

        $recentLogistic = User::factory()->create([
            'type' => 'logistic',
            'email_verified_at' => now(),
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('logistics.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('summary', fn ($summary) =>
                $summary->get('total_logistics') === 3 &&
                $summary->get('active_logistics') === 2 &&
                $summary->get('pending_verification') === 1 &&
                $summary->get('recent_registrations') === 1
            )
        );
    }

    public function test_logistics_report_filters_by_date_range()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate logistics report');

        // Create logistics on different dates
        $oldLogistic = User::factory()->create([
            'type' => 'logistic',
            'created_at' => now()->subDays(10),
        ]);

        $recentLogistic = User::factory()->create([
            'type' => 'logistic',
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('logistics.report', [
                'start_date' => now()->subDays(5)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('logistics', fn ($logistics) =>
                $logistics->count() === 1 &&
                $logistics->first()->get('id') === $recentLogistic->id
            )
        );
    }

    public function test_logistics_report_export_csv()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate logistics report');

        $logistic = User::factory()->create([
            'type' => 'logistic',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('logistics.report', ['format' => 'csv']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="logistics_report_' . date('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_logistics_report_export_pdf()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate logistics report');

        $logistic = User::factory()->create([
            'type' => 'logistic',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('logistics.report', ['format' => 'pdf']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="logistics_report_' . date('Y-m-d_H-i-s') . '.txt"');
    }
} 