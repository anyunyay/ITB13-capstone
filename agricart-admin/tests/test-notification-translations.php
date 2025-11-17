<?php

/**
 * Quick Test Script for Notification Translations
 * 
 * Run this in tinker: php artisan tinker
 * Then: include 'tests/test-notification-translations.php';
 */

use App\Services\NotificationService;

echo "=== Testing Notification Translation System ===\n\n";

// Test all message keys
$messageKeys = [
    // Admin/Staff
    'new_order' => ['order_id' => 123, 'customer_name' => 'Juan Dela Cruz'],
    'inventory_update_added' => ['product_name' => 'Rice 25kg', 'member_name' => 'Maria Santos'],
    'membership_update_added' => ['member_name' => 'Pedro Garcia'],
    'password_change_request' => ['member_identifier' => 'MEM001'],
    'password_change_request_cancelled' => ['member_name' => 'Maria Santos', 'member_identifier' => 'MEM001'],
    
    // Customer
    'order_confirmation' => [],
    'order_confirmation_sub' => [],
    'order_status_approved' => [],
    'order_ready_for_pickup' => ['order_id' => 123],
    'order_picked_up' => ['order_id' => 123],
    'delivery_status_out_for_delivery' => [],
    'delivery_status_delivered' => [],
    'order_rejection' => ['order_id' => 123],
    'order_delayed' => ['order_id' => 123],
    'order_delayed_sub' => ['contact_email' => 'support@agricart.com'],
    'order_receipt' => ['order_id' => 123],
    
    // Member
    'product_sale' => ['product_name' => 'Rice 25kg', 'customer_name' => 'Juan Dela Cruz'],
    'earnings_update' => ['period' => 'monthly', 'amount' => '1,500.00'],
    'low_stock_alert' => ['stock_type' => 'available', 'product_name' => 'Rice 25kg', 'quantity' => 5],
    'stock_added' => ['product_name' => 'Rice 25kg', 'admin_name' => 'Admin User'],
    
    // Logistic
    'delivery_task' => ['order_id' => 123],
    'logistic_order_ready' => ['order_id' => 123],
    'logistic_order_picked_up' => ['order_id' => 123, 'customer_name' => 'Juan Dela Cruz'],
];

$passed = 0;
$failed = 0;
$errors = [];

foreach ($messageKeys as $key => $params) {
    echo "Testing: {$key}\n";
    
    try {
        // Test English
        $en = NotificationService::resolveMessage($key, $params, 'en');
        if (str_starts_with($en, 'notifications.')) {
            $failed++;
            $errors[] = "❌ {$key} - Missing English translation";
            echo "  ❌ EN: Missing translation\n";
        } else {
            echo "  ✅ EN: {$en}\n";
        }
        
        // Test Tagalog
        $tl = NotificationService::resolveMessage($key, $params, 'tl');
        if (str_starts_with($tl, 'notifications.')) {
            $failed++;
            $errors[] = "❌ {$key} - Missing Tagalog translation";
            echo "  ❌ TL: Missing translation\n";
        } else {
            echo "  ✅ TL: {$tl}\n";
        }
        
        // Check if translations are different
        if ($en === $tl && !empty($params)) {
            echo "  ⚠️  WARNING: English and Tagalog translations are identical\n";
        }
        
        $passed++;
        
    } catch (\Exception $e) {
        $failed++;
        $errors[] = "❌ {$key} - Error: " . $e->getMessage();
        echo "  ❌ ERROR: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "=== Test Summary ===\n";
echo "Total Keys Tested: " . count($messageKeys) . "\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\n=== Errors ===\n";
    foreach ($errors as $error) {
        echo "{$error}\n";
    }
} else {
    echo "\n✅ All translations working correctly!\n";
}

echo "\n=== Testing NotificationService::formatNotification() ===\n";

// Test with a real notification if available
$user = \App\Models\User::first();
if ($user) {
    $notification = $user->notifications()->first();
    if ($notification) {
        echo "Testing with real notification...\n";
        
        $formattedEn = NotificationService::formatNotification($notification, 'en');
        echo "English: " . $formattedEn['message'] . "\n";
        
        $formattedTl = NotificationService::formatNotification($notification, 'tl');
        echo "Tagalog: " . $formattedTl['message'] . "\n";
        
        if (isset($formattedEn['data']['sub_message'])) {
            echo "Sub-message EN: " . $formattedEn['data']['sub_message'] . "\n";
        }
        if (isset($formattedTl['data']['sub_message'])) {
            echo "Sub-message TL: " . $formattedTl['data']['sub_message'] . "\n";
        }
    } else {
        echo "No notifications found. Run NotificationSeeder first.\n";
    }
} else {
    echo "No users found. Run seeders first.\n";
}

echo "\n=== Test Complete ===\n";
