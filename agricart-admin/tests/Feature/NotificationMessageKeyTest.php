<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\SalesAudit;
use App\Models\Stock;
use App\Notifications\NewOrderNotification;
use App\Notifications\LowStockAlertNotification;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

class NotificationMessageKeyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that notification is created with message_key
     */
    public function test_notification_created_with_message_key()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $order = SalesAudit::factory()->create();
        
        $admin->notify(new NewOrderNotification($order));
        
        $notification = $admin->notifications()->first();
        
        $this->assertNotNull($notification);
        $this->assertArrayHasKey('message_key', $notification->data);
        $this->assertEquals('new_order', $notification->data['message_key']);
        $this->assertArrayHasKey('message_params', $notification->data);
    }

    /**
     * Test message resolution in English
     */
    public function test_message_resolves_in_english()
    {
        $message = NotificationService::resolveMessage('new_order', [
            'order_id' => 123,
            'customer_name' => 'John Doe'
        ], 'en');
        
        $this->assertStringContainsString('New order', $message);
        $this->assertStringContainsString('123', $message);
        $this->assertStringContainsString('John Doe', $message);
    }

    /**
     * Test message resolution in Tagalog
     */
    public function test_message_resolves_in_tagalog()
    {
        $message = NotificationService::resolveMessage('new_order', [
            'order_id' => 123,
            'customer_name' => 'John Doe'
        ], 'tl');
        
        $this->assertStringContainsString('Bagong order', $message);
        $this->assertStringContainsString('123', $message);
        $this->assertStringContainsString('John Doe', $message);
    }

    /**
     * Test formatNotification returns correct structure
     */
    public function test_format_notification_returns_correct_structure()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $order = SalesAudit::factory()->create();
        
        $admin->notify(new NewOrderNotification($order));
        $notification = $admin->notifications()->first();
        
        $formatted = NotificationService::formatNotification($notification, 'en');
        
        $this->assertArrayHasKey('id', $formatted);
        $this->assertArrayHasKey('type', $formatted);
        $this->assertArrayHasKey('message', $formatted);
        $this->assertArrayHasKey('message_key', $formatted);
        $this->assertArrayHasKey('action_url', $formatted);
        $this->assertArrayHasKey('created_at', $formatted);
        $this->assertArrayHasKey('read_at', $formatted);
    }

    /**
     * Test language switching
     */
    public function test_language_switching_works()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        $order = SalesAudit::factory()->create();
        
        $admin->notify(new NewOrderNotification($order));
        $notification = $admin->notifications()->first();
        
        // Format in English
        $englishFormatted = NotificationService::formatNotification($notification, 'en');
        
        // Format in Tagalog
        $tagalogFormatted = NotificationService::formatNotification($notification, 'tl');
        
        // Messages should be different
        $this->assertNotEquals($englishFormatted['message'], $tagalogFormatted['message']);
        
        // English should contain "New order"
        $this->assertStringContainsString('New order', $englishFormatted['message']);
        
        // Tagalog should contain "Bagong order"
        $this->assertStringContainsString('Bagong order', $tagalogFormatted['message']);
    }

    /**
     * Test getNotificationTypesForUser returns correct types
     */
    public function test_get_notification_types_for_user()
    {
        $adminTypes = NotificationService::getNotificationTypesForUser('admin');
        $customerTypes = NotificationService::getNotificationTypesForUser('customer');
        $memberTypes = NotificationService::getNotificationTypesForUser('member');
        $logisticTypes = NotificationService::getNotificationTypesForUser('logistic');
        
        $this->assertIsArray($adminTypes);
        $this->assertIsArray($customerTypes);
        $this->assertIsArray($memberTypes);
        $this->assertIsArray($logisticTypes);
        
        $this->assertContains('App\\Notifications\\NewOrderNotification', $adminTypes);
        $this->assertContains('App\\Notifications\\OrderConfirmationNotification', $customerTypes);
        $this->assertContains('App\\Notifications\\ProductSaleNotification', $memberTypes);
        $this->assertContains('App\\Notifications\\DeliveryTaskNotification', $logisticTypes);
    }

    /**
     * Test notification with complex parameters
     */
    public function test_notification_with_complex_parameters()
    {
        $member = User::factory()->create(['type' => 'member']);
        $stock = Stock::factory()->create(['quantity' => 5]);
        
        $member->notify(new LowStockAlertNotification($stock, 10));
        
        $notification = $member->notifications()->first();
        
        $this->assertArrayHasKey('message_key', $notification->data);
        $this->assertEquals('low_stock_alert', $notification->data['message_key']);
        
        $formatted = NotificationService::formatNotification($notification, 'en');
        
        $this->assertStringContainsString('Low', $formatted['message']);
        $this->assertStringContainsString('stock alert', $formatted['message']);
        $this->assertStringContainsString('5', $formatted['message']);
    }

    /**
     * Test backward compatibility with old notifications
     */
    public function test_backward_compatibility_with_old_notifications()
    {
        $admin = User::factory()->create(['type' => 'admin']);
        
        // Create an old-style notification without message_key
        $admin->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\\Notifications\\NewOrderNotification',
            'data' => [
                'type' => 'new_order',
                'message' => 'Old style notification message',
                'action_url' => '/admin/orders/1'
            ],
            'read_at' => null,
        ]);
        
        $notification = $admin->notifications()->first();
        
        // Should still format correctly
        $formatted = NotificationService::formatNotification($notification, 'en');
        
        $this->assertEquals('Old style notification message', $formatted['message']);
    }

    /**
     * Test all notification message keys exist in language files
     */
    public function test_all_message_keys_exist_in_language_files()
    {
        $messageKeys = [
            'new_order',
            'order_confirmation',
            'low_stock_alert',
            'product_sale',
            'earnings_update',
            'delivery_task',
            'order_status_approved',
            'delivery_status_delivered',
        ];
        
        foreach ($messageKeys as $key) {
            // Test English
            $englishTranslation = __('notifications.' . $key, [], 'en');
            $this->assertNotEquals('notifications.' . $key, $englishTranslation, "Missing English translation for: {$key}");
            
            // Test Tagalog
            $tagalogTranslation = __('notifications.' . $key, [], 'tl');
            $this->assertNotEquals('notifications.' . $key, $tagalogTranslation, "Missing Tagalog translation for: {$key}");
        }
    }

    /**
     * Test notification controller returns formatted notifications
     */
    public function test_notification_controller_returns_formatted_notifications()
    {
        $customer = User::factory()->create([
            'type' => 'customer',
            'language' => 'en'
        ]);
        
        $order = SalesAudit::factory()->create(['customer_id' => $customer->id]);
        
        $customer->notify(new \App\Notifications\OrderConfirmationNotification($order));
        
        $response = $this->actingAs($customer)->getJson('/customer/notifications');
        
        $response->assertStatus(200);
        
        // Check that notifications are formatted
        $notifications = $response->json('notifications');
        
        if (!empty($notifications)) {
            $this->assertArrayHasKey('message', $notifications[0]);
            $this->assertArrayHasKey('message_key', $notifications[0]);
        }
    }
}
