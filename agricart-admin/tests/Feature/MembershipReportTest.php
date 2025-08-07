<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Permission;

class MembershipReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::create(['name' => 'generate membership report']);
    }

    public function test_admin_can_access_membership_report()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate membership report');

        $response = $this->actingAs($admin)->get('/admin/membership/report');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Membership/report')
        );
    }

    public function test_staff_can_access_membership_report()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        $staff->givePermissionTo('generate membership report');

        $response = $this->actingAs($staff)->get('/admin/membership/report');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Membership/report')
        );
    }

    public function test_user_without_permission_cannot_access_membership_report()
    {
        $user = User::factory()->create(['type' => 'customer']);

        $response = $this->actingAs($user)->get('/admin/membership/report');

        $response->assertStatus(403);
    }

    public function test_membership_report_shows_correct_summary()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate membership report');

        // Create test members
        User::factory()->count(3)->create(['type' => 'member']);
        User::factory()->create(['type' => 'member', 'email_verified_at' => now()]);
        User::factory()->create(['type' => 'member', 'created_at' => now()->subDays(15)]);

        $response = $this->actingAs($admin)->get('/admin/membership/report');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->has('summary', fn ($summary) =>
                $summary['total_members'] === 5 &&
                $summary['active_members'] === 1 &&
                $summary['pending_verification'] === 4 &&
                $summary['recent_registrations'] === 1
            )
        );
    }

    public function test_membership_report_filters_by_date_range()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate membership report');

        // Create members with different dates
        $oldMember = User::factory()->create([
            'type' => 'member',
            'registration_date' => '2024-01-01'
        ]);
        $recentMember = User::factory()->create([
            'type' => 'member',
            'registration_date' => '2024-12-01'
        ]);

        $response = $this->actingAs($admin)->get('/admin/membership/report?start_date=2024-12-01&end_date=2024-12-31');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->has('members', fn ($members) =>
                $members->count() === 1 &&
                $members->first()->get('id') === $recentMember->id
            )
        );
    }

    public function test_membership_report_export_csv()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate membership report');

        User::factory()->create(['type' => 'member']);

        $response = $this->actingAs($admin)->get('/admin/membership/report?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="membership_report_' . date('Y-m-d_H-i-s') . '.csv"');
    }

    public function test_membership_report_export_pdf()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $admin->givePermissionTo('generate membership report');

        User::factory()->create(['type' => 'member']);

        $response = $this->actingAs($admin)->get('/admin/membership/report?format=pdf');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename="membership_report_' . date('Y-m-d_H-i-s') . '.pdf"');
    }
} 