<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\EmailChangeRequest;
use App\Notifications\EmailChangeOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use Database\Seeders\RoleSeeder;

class EmailChangeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_customer_can_access_email_change_page()
    {
        $user = User::factory()->create([
            'type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');
        
        $response = $this->actingAs($user)->get('/customer/profile/email-change');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Profile/change-email')
            ->has('user')
        );
    }

    public function test_customer_can_send_otp_for_email_change()
    {
        Notification::fake();
        
        $user = User::factory()->create([
            'type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');
        $newEmail = 'newemail@example.com';
        
        $response = $this->actingAs($user)->post('/customer/profile/email-change/send-otp', [
            'new_email' => $newEmail,
        ]);
        
        $response->assertRedirect();
        
        // Check that email change request was created
        $this->assertDatabaseHas('email_change_requests', [
            'user_id' => $user->id,
            'new_email' => $newEmail,
            'is_used' => false,
        ]);
        
        // Check that notification was sent
        Notification::assertSentTo($user, EmailChangeOtpNotification::class);
    }

    public function test_email_change_validation_works()
    {
        $user = User::factory()->create([
            'type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');
        
        // Test invalid email format
        $response = $this->actingAs($user)->post('/customer/profile/email-change/send-otp', [
            'new_email' => 'invalid-email',
        ]);
        
        $response->assertSessionHasErrors(['new_email']);
        
        // Test same email as current - this should fail with our custom validation
        $response = $this->actingAs($user)->post('/customer/profile/email-change/send-otp', [
            'new_email' => $user->email,
        ]);
        
        $response->assertSessionHasErrors(['new_email']);
    }

    public function test_customer_can_verify_otp_and_change_email()
    {
        $user = User::factory()->create([
            'type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');
        $newEmail = 'newemail@example.com';
        
        // Create email change request
        $emailChangeRequest = EmailChangeRequest::createForUser($user->id, $newEmail);
        
        $response = $this->actingAs($user)->postJson("/customer/profile/email-change/verify/{$emailChangeRequest->id}", [
            'otp' => $emailChangeRequest->otp,
        ]);
        
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Email address changed successfully!',
        ]);
        
        // Check that user's email was updated
        $user->refresh();
        $this->assertEquals($newEmail, $user->email);
        
        // Check that email_verified_at was reset in the database
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => $newEmail,
        ]);
        
        // Check that email_verified_at is not null (should be verified)
        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        
        // Check that request was marked as used
        $emailChangeRequest->refresh();
        $this->assertTrue($emailChangeRequest->is_used);
    }

    public function test_invalid_otp_returns_error()
    {
        $user = User::factory()->create([
            'type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');
        $newEmail = 'newemail@example.com';
        
        // Create email change request
        $emailChangeRequest = EmailChangeRequest::createForUser($user->id, $newEmail);
        
        $response = $this->actingAs($user)->postJson("/customer/profile/email-change/verify/{$emailChangeRequest->id}", [
            'otp' => '000000',
        ]);
        
        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid or expired verification code.',
        ]);
    }

    public function test_customer_can_cancel_email_change()
    {
        $user = User::factory()->create([
            'type' => 'customer',
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');
        $newEmail = 'newemail@example.com';
        
        // Create email change request
        $emailChangeRequest = EmailChangeRequest::createForUser($user->id, $newEmail);
        
        $response = $this->actingAs($user)->postJson("/customer/profile/email-change/cancel/{$emailChangeRequest->id}");
        
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Email change request cancelled.',
        ]);
        
        // Check that request was marked as used
        $emailChangeRequest->refresh();
        $this->assertTrue($emailChangeRequest->is_used);
    }
}
