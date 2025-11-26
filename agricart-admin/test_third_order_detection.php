<?php

/**
 * Test Script for Third Order Suspicious Detection
 * 
 * This script tests the detection of a third order placed within 10 minutes
 * of a merged & approved suspicious order.
 * 
 * Usage: php test_third_order_detection.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SalesAudit;
use App\Models\User;
use App\Services\SuspiciousOrderDetectionService;
use Carbon\Carbon;

echo "=== Third Order Suspicious Detection Test ===\n\n";

// Find a test customer
$customer = User::where('type', 'customer')->first();

if (!$customer) {
    echo "❌ No customer found. Please create a customer first.\n";
    exit(1);
}

echo "✓ Using customer: {$customer->name} (ID: {$customer->id})\n\n";

// Clean up any existing test orders
echo "Cleaning up existing test orders...\n";
SalesAudit::where('customer_id', $customer->id)
    ->where('admin_notes', 'like', '%TEST ORDER%')
    ->delete();
echo "✓ Cleanup complete\n\n";

// Test Case 1: Create two orders and merge them
echo "=== Test Case 1: Create and Merge Two Orders ===\n";

$order1 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 100.00,
    'subtotal' => 90.91,
    'coop_share' => 9.09,
    'member_share' => 90.91,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'admin_notes' => 'TEST ORDER 1',
    'created_at' => Carbon::now()->subMinutes(10),
]);

echo "✓ Created Order #1 (ID: {$order1->id}) at " . $order1->created_at->format('H:i:s') . "\n";

$order2 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 150.00,
    'subtotal' => 136.36,
    'coop_share' => 13.64,
    'member_share' => 136.36,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'admin_notes' => 'TEST ORDER 2',
    'created_at' => Carbon::now()->subMinutes(5),
]);

echo "✓ Created Order #2 (ID: {$order2->id}) at " . $order2->created_at->format('H:i:s') . "\n";

// Check if they're marked as suspicious
$suspiciousInfo = SuspiciousOrderDetectionService::checkForSuspiciousPattern($order2);

if ($suspiciousInfo) {
    echo "✓ Orders detected as suspicious\n";
    SuspiciousOrderDetectionService::markAsSuspicious($order2, $suspiciousInfo);
    echo "✓ Orders marked as suspicious\n";
} else {
    echo "❌ Orders NOT detected as suspicious (unexpected)\n";
}

// Simulate merge and approval
echo "\nSimulating merge and approval...\n";
$order1->update([
    'status' => 'approved',
    'is_suspicious' => false,
    'suspicious_reason' => null,
    'admin_notes' => 'Merged from orders: ' . $order1->id . ', ' . $order2->id,
    'total_amount' => 250.00,
    'subtotal' => 227.27,
    'coop_share' => 22.73,
    'member_share' => 227.27,
]);

$order2->update([
    'status' => 'merged',
    'admin_notes' => "Merged into order #{$order1->id}",
    'is_suspicious' => false,
]);

echo "✓ Orders merged: Order #1 is now approved, Order #2 is merged\n\n";

// Test Case 2: Create third order within 10 minutes
echo "=== Test Case 2: Create Third Order Within 10 Minutes ===\n";

$order3 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 200.00,
    'subtotal' => 181.82,
    'coop_share' => 18.18,
    'member_share' => 181.82,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'admin_notes' => 'TEST ORDER 3',
    'created_at' => Carbon::now()->subMinutes(2),
]);

echo "✓ Created Order #3 (ID: {$order3->id}) at " . $order3->created_at->format('H:i:s') . "\n";

// Check if it's detected as suspicious
$suspiciousInfo3 = SuspiciousOrderDetectionService::checkForSuspiciousPattern($order3);

if ($suspiciousInfo3) {
    echo "✓ Order #3 detected as suspicious\n";
    
    if (isset($suspiciousInfo3['is_single_suspicious']) && $suspiciousInfo3['is_single_suspicious']) {
        echo "✓ Detected as SINGLE suspicious order\n";
        echo "✓ Linked to merged order ID: {$suspiciousInfo3['linked_to_merged_order']}\n";
        echo "✓ Reason: {$suspiciousInfo3['reason']}\n";
        
        SuspiciousOrderDetectionService::markAsSuspicious($order3, $suspiciousInfo3);
        
        // Verify database
        $order3->refresh();
        
        echo "\n=== Verification ===\n";
        echo "Order #3 is_suspicious: " . ($order3->is_suspicious ? 'true' : 'false') . "\n";
        echo "Order #3 linked_merged_order_id: " . ($order3->linked_merged_order_id ?? 'null') . "\n";
        echo "Order #3 suspicious_reason: {$order3->suspicious_reason}\n";
        
        if ($order3->is_suspicious && $order3->linked_merged_order_id == $order1->id) {
            echo "\n✅ TEST PASSED: Third order correctly detected and linked!\n";
        } else {
            echo "\n❌ TEST FAILED: Third order not properly configured\n";
        }
    } else {
        echo "❌ Order #3 detected as suspicious but NOT as single suspicious order\n";
    }
} else {
    echo "❌ Order #3 NOT detected as suspicious (unexpected)\n";
}

// Test Case 3: Create fourth order after 10 minutes
echo "\n=== Test Case 3: Create Fourth Order After 10 Minutes ===\n";

$order4 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 300.00,
    'subtotal' => 272.73,
    'coop_share' => 27.27,
    'member_share' => 272.73,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'admin_notes' => 'TEST ORDER 4',
    'created_at' => Carbon::now()->addMinutes(2), // 12 minutes after order1
]);

echo "✓ Created Order #4 (ID: {$order4->id}) at " . $order4->created_at->format('H:i:s') . "\n";

$suspiciousInfo4 = SuspiciousOrderDetectionService::checkForSuspiciousPattern($order4);

if ($suspiciousInfo4) {
    echo "❌ Order #4 detected as suspicious (unexpected - should be outside 10-minute window)\n";
} else {
    echo "✓ Order #4 NOT detected as suspicious (expected - outside 10-minute window)\n";
    echo "✅ TEST PASSED: 10-minute window correctly enforced!\n";
}

// Summary
echo "\n=== Test Summary ===\n";
echo "Order #1: Merged & Approved (ID: {$order1->id})\n";
echo "Order #2: Merged into Order #1 (ID: {$order2->id})\n";
echo "Order #3: Single Suspicious (ID: {$order3->id}, Linked to: {$order3->linked_merged_order_id})\n";
echo "Order #4: Normal Order (ID: {$order4->id})\n";

echo "\n=== Cleanup ===\n";
echo "To clean up test orders, run:\n";
echo "DELETE FROM sales_audit WHERE admin_notes LIKE '%TEST ORDER%';\n";

echo "\n✅ All tests completed!\n";
