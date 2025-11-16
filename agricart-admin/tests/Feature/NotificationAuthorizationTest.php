<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Notification;

class NotificationAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that admin can access admin notifications page
     */
    public function test_admin_can_access_admin_notifications()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/admin/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
        );
    }

    /**
     * Test that admin cannot access customer notifications page
     */
    public function test_admin_cannot_access_customer_notifications()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/customer/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that admin cannot access member notifications page
     */
    public function test_admin_cannot_access_member_notifications()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/member/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that admin cannot access logistic notifications page
     */
    public function test_admin_cannot_access_logistic_notifications()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/logistic/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that staff can access admin notifications page
     */
    public function test_staff_can_access_admin_notifications()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        
        $response = $this->actingAs($staff)
            ->get('/admin/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
        );
    }

    /**
     * Test that staff cannot access customer notifications page
     */
    public function test_staff_cannot_access_customer_notifications()
    {
        $staff = User::factory()->create(['type' => 'staff']);
        
        $response = $this->actingAs($staff)
            ->get('/customer/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that customer can access customer notifications page
     */
    public function test_customer_can_access_customer_notifications()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        $response = $this->actingAs($customer)
            ->get('/customer/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
        );
    }

    /**
     * Test that customer cannot access admin notifications page
     */
    public function test_customer_cannot_access_admin_notifications()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        $response = $this->actingAs($customer)
            ->get('/admin/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that customer cannot access member notifications page
     */
    public function test_customer_cannot_access_member_notifications()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        $response = $this->actingAs($customer)
            ->get('/member/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that customer cannot access logistic notifications page
     */
    public function test_customer_cannot_access_logistic_notifications()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        $response = $this->actingAs($customer)
            ->get('/logistic/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that member can access member notifications page
     */
    public function test_member_can_access_member_notifications()
    {
        $member = User::factory()->create(['type' => 'member']);
        
        $response = $this->actingAs($member)
            ->get('/member/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
        );
    }

    /**
     * Test that member cannot access admin notifications page
     */
    public function test_member_cannot_access_admin_notifications()
    {
        $member = User::factory()->create(['type' => 'member']);
        
        $response = $this->actingAs($member)
            ->get('/admin/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that member cannot access customer notifications page
     */
    public function test_member_cannot_access_customer_notifications()
    {
        $member = User::factory()->create(['type' => 'member']);
        
        $response = $this->actingAs($member)
            ->get('/customer/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that logistic can access logistic notifications page
     */
    public function test_logistic_can_access_logistic_notifications()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        
        $response = $this->actingAs($logistic)
            ->get('/logistic/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
        );
    }

    /**
     * Test that logistic cannot access admin notifications page
     */
    public function test_logistic_cannot_access_admin_notifications()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        
        $response = $this->actingAs($logistic)
            ->get('/admin/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that logistic cannot access customer notifications page
     */
    public function test_logistic_cannot_access_customer_notifications()
    {
        $logistic = User::factory()->create(['type' => 'logistic']);
        
        $response = $this->actingAs($logistic)
            ->get('/customer/profile/notifications');
        
        $response->assertStatus(403);
    }

    /**
     * Test that unauthenticated user cannot access any notifications page
     */
    public function test_unauthenticated_user_cannot_access_notifications()
    {
        $response = $this->get('/admin/profile/notifications');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/profile/notifications');
        $response->assertRedirect('/login');

        $response = $this->get('/member/profile/notifications');
        $response->assertRedirect('/login');

        $response = $this->get('/logistic/profile/notifications');
        $response->assertRedirect('/login');
    }

    /**
     * Test that admin receives correct notification data structure
     */
    public function test_admin_receives_correct_notification_data_structure()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/admin/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
                ->has('paginatedNotifications')
                ->has('auth.user')
                ->where('auth.user.type', 'admin')
        );
    }

    /**
     * Test that customer receives correct notification data structure
     */
    public function test_customer_receives_correct_notification_data_structure()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        $response = $this->actingAs($customer)
            ->get('/customer/profile/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Profile/all-notifications')
                ->has('paginatedNotifications')
                ->has('auth.user')
                ->where('auth.user.type', 'customer')
        );
    }

    /**
     * Test pagination works correctly for admin
     */
    public function test_admin_notifications_pagination_works()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->get('/admin/profile/notifications?page=1');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('paginatedNotifications.data')
                ->has('paginatedNotifications.current_page')
                ->has('paginatedNotifications.last_page')
        );
    }

    /**
     * Test that mark as read endpoint requires correct role
     */
    public function test_admin_cannot_mark_customer_notifications_as_read()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        $response = $this->actingAs($admin)
            ->post('/customer/notifications/mark-read', ['ids' => ['test-id']]);
        
        // Should fail due to middleware or authorization
        $this->assertTrue(
            $response->status() === 403 || $response->status() === 404
        );
    }

    /**
     * Test that customer cannot mark admin notifications as read
     */
    public function test_customer_cannot_mark_admin_notifications_as_read()
    {
        $customer = User::factory()->create(['type' => 'customer']);
        
        $response = $this->actingAs($customer)
            ->post('/admin/notifications/mark-read', ['ids' => ['test-id']]);
        
        // Should fail due to middleware or authorization
        $this->assertTrue(
            $response->status() === 403 || $response->status() === 404
        );
    }
}
