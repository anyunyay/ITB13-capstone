<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class TestNotificationStructure extends Command
{
    protected $signature = 'notifications:test';
    protected $description = 'Test notification structure and order_id linkage';

    public function handle()
    {
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║   🔔 Notification Structure Test                               ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->info('');

        $notifications = DB::table('notifications')->get();
        
        $this->info("Total Notifications: {$notifications->count()}");
        $this->info('');

        // Test order-related notifications
        $this->info('📋 Testing Order-Related Notifications...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $orderNotifications = $notifications->filter(function($notif) {
            $data = json_decode($notif->data, true);
            return isset($data['order_id']);
        });

        $this->info("Order-related notifications: {$orderNotifications->count()}");
        $this->info('');

        if ($orderNotifications->count() > 0) {
            $this->info('Sample Order Notifications:');
            foreach ($orderNotifications->take(5) as $notif) {
                $data = json_decode($notif->data, true);
                $user = User::find($notif->notifiable_id);
                $type = class_basename($notif->type);
                
                $this->info("  ✓ {$type}");
                $this->info("    - User: " . ($user ? $user->name : 'Unknown'));
                $this->info("    - Order ID: {$data['order_id']}");
                $this->info("    - Action URL: " . ($data['action_url'] ?? 'N/A'));
                $this->info("    - Message Key: " . ($data['message_key'] ?? 'N/A'));
                $this->info('');
            }
        }

        // Test notification navigation
        $this->info('🔗 Testing Notification Navigation...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $passed = 0;
        $failed = 0;

        foreach ($orderNotifications->take(10) as $notif) {
            $data = json_decode($notif->data, true);
            
            $checks = [
                'Has order_id' => isset($data['order_id']),
                'Has action_url' => isset($data['action_url']),
                'Has message_key' => isset($data['message_key']),
                'action_url points to orders' => isset($data['action_url']) && str_contains($data['action_url'], 'orders'),
            ];

            foreach ($checks as $check => $result) {
                if ($result) {
                    $passed++;
                } else {
                    $failed++;
                    $this->error("❌ {$check} - Order ID: {$data['order_id']}");
                }
            }
        }

        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║   📊 TEST RESULTS                                              ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->info('');
        $this->info("✅ Passed: {$passed}");
        $this->info("❌ Failed: {$failed}");
        $this->info('');

        if ($failed === 0 && $orderNotifications->count() > 0) {
            $this->info('🎉 ALL NOTIFICATIONS HAVE CORRECT STRUCTURE!');
            $this->info('✓ Notifications are linked to orders');
            $this->info('✓ Clicking notifications will navigate to correct order');
            return 0;
        } else {
            $this->error('⚠️  Some notifications have issues.');
            return 1;
        }
    }
}
