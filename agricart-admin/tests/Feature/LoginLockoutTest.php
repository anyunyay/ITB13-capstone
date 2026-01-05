<?php

namespace Tests\Feature;

use App\Models\LoginAttempt;
use App\Services\LoginLockoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginLockoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_failed_attempts_are_recorded()
    {
        $result = LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        
        $this->assertEquals(1, $result['failed_attempts']);
        $this->assertFalse($result['is_locked']);
        
        $attempt = LoginAttempt::where('identifier', 'test@example.com')
            ->where('user_type', 'customer')
            ->where('ip_address', '127.0.0.1')
            ->first();
            
        $this->assertNotNull($attempt);
        $this->assertEquals(1, $attempt->failed_attempts);
        $this->assertEquals(0, $attempt->lock_level);
    }

    public function test_account_locks_after_three_failed_attempts()
    {
        // First 2 attempts should not lock
        for ($i = 1; $i <= 2; $i++) {
            $result = LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
            $this->assertFalse($result['is_locked']);
        }
        
        // 3rd attempt should lock for 1 minute
        $result = LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        $this->assertTrue($result['is_locked']);
        $this->assertEquals(1, $result['lock_level']);
        $this->assertGreaterThanOrEqual(0, $result['remaining_time']);
        
        // Verify the lock expires at is set correctly
        $attempt = LoginAttempt::where('identifier', 'test@example.com')->first();
        $this->assertNotNull($attempt->lock_expires_at);
        $this->assertTrue($attempt->lock_expires_at->isFuture());
    }

    public function test_lockout_escalation()
    {
        // Test escalation: 3 fails → 1m, next → 3m, next → 5m, next → 24h
        
        // First lockout (3 attempts) - Level 1: 1 minute
        for ($i = 1; $i <= 3; $i++) {
            LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        }
        
        $attempt = LoginAttempt::where('identifier', 'test@example.com')->first();
        $this->assertEquals(1, $attempt->lock_level);
        
        // Simulate lock expiry and next attempt (4th) - Level 2: 3 minutes
        $attempt->update(['lock_expires_at' => now()->subMinute()]);
        LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        
        $attempt->refresh();
        $this->assertEquals(2, $attempt->lock_level);
        
        // Simulate lock expiry and next attempt (5th) - Level 3: 5 minutes
        $attempt->update(['lock_expires_at' => now()->subMinute()]);
        LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        
        $attempt->refresh();
        $this->assertEquals(3, $attempt->lock_level);
        
        // Simulate lock expiry and next attempt (6th) - Level 4: 24 hours
        $attempt->update(['lock_expires_at' => now()->subMinute()]);
        LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        
        $attempt->refresh();
        $this->assertEquals(4, $attempt->lock_level);
    }

    public function test_successful_login_clears_failed_attempts()
    {
        // Record some failed attempts
        LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        
        // Verify attempts are recorded
        $this->assertDatabaseHas('login_attempts', [
            'identifier' => 'test@example.com',
            'failed_attempts' => 2
        ]);
        
        // Clear failed attempts (simulate successful login)
        LoginLockoutService::clearFailedAttempts('test@example.com', 'customer', '127.0.0.1');
        
        // Verify attempts are cleared
        $this->assertDatabaseMissing('login_attempts', [
            'identifier' => 'test@example.com'
        ]);
    }

    public function test_lockout_status_api_returns_correct_data()
    {
        // Record failed attempts to trigger lockout
        for ($i = 1; $i <= 3; $i++) {
            LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        }
        
        $response = $this->postJson('/api/lockout/customer/check', [
            'email' => 'test@example.com'
        ]);
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'locked',
            'failed_attempts',
            'lock_level',
            'remaining_time',
            'lock_expires_at',
            'server_time',
            'formatted_time'
        ]);
        
        $data = $response->json();
        $this->assertTrue($data['locked']);
        $this->assertEquals(3, $data['failed_attempts']);
        $this->assertEquals(1, $data['lock_level']);
        $this->assertNotNull($data['lock_expires_at']);
        $this->assertNotNull($data['server_time']);
    }

    public function test_rate_limiting_on_lockout_api()
    {
        // Make 10 requests (should be allowed)
        for ($i = 1; $i <= 10; $i++) {
            $response = $this->postJson('/api/lockout/customer/check', [
                'email' => 'test@example.com'
            ]);
            $response->assertStatus(200);
        }
        
        // 11th request should be rate limited
        $response = $this->postJson('/api/lockout/customer/check', [
            'email' => 'test@example.com'
        ]);
        
        $response->assertStatus(429);
        $response->assertJsonStructure([
            'error',
            'message',
            'retry_after'
        ]);
    }

    public function test_different_user_types_have_separate_lockouts()
    {
        // Customer lockout
        for ($i = 1; $i <= 3; $i++) {
            LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        }
        
        // Admin should not be locked
        $adminStatus = LoginLockoutService::getLockoutStatus('test@example.com', 'admin', '127.0.0.1');
        $this->assertFalse($adminStatus['is_locked']);
        
        // Customer should be locked
        $customerStatus = LoginLockoutService::getLockoutStatus('test@example.com', 'customer', '127.0.0.1');
        $this->assertTrue($customerStatus['is_locked']);
    }

    public function test_different_ips_have_separate_lockouts()
    {
        // Lock account from one IP
        for ($i = 1; $i <= 3; $i++) {
            LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '192.168.1.1');
        }
        
        // Same account from different IP should not be locked
        $status = LoginLockoutService::getLockoutStatus('test@example.com', 'customer', '192.168.1.2');
        $this->assertFalse($status['is_locked']);
        
        // Same account from original IP should be locked
        $status = LoginLockoutService::getLockoutStatus('test@example.com', 'customer', '192.168.1.1');
        $this->assertTrue($status['is_locked']);
    }

    public function test_lockout_expires_correctly()
    {
        // Create a locked account
        for ($i = 1; $i <= 3; $i++) {
            LoginLockoutService::recordFailedAttempt('test@example.com', 'customer', '127.0.0.1');
        }
        
        $attempt = LoginAttempt::where('identifier', 'test@example.com')->first();
        $this->assertTrue($attempt->lock_expires_at->isFuture());
        
        // Simulate time passing (lock expires)
        $attempt->update(['lock_expires_at' => now()->subMinute()]);
        
        $status = LoginLockoutService::getLockoutStatus('test@example.com', 'customer', '127.0.0.1');
        $this->assertFalse($status['is_locked']);
        $this->assertEquals(0, $status['remaining_time']);
    }
}