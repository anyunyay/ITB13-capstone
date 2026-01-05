<?php

/**
 * Simple Test for Third Order Detection
 * Run this to manually test the feature
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SalesAudit;
use App\Models\User;
use App\Services\SuspiciousOrderDetectionService;
use Carbon\Carbon;

echo "=== Simple Third Order Test ===\n\n";

// Find or create a test customer
$customer = User::where('type', 'customer')->first();

if (!$customer) {
    echo "❌ No customer found\n";
    exit(1);
}

echo "Using customer: {$customer->name} (ID: {$customer->id})\n\n";

// STEP 1: Create first order
echo "STEP 1: Creating first order...\n";
$order1 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 100.00,
    'subtotal' => 90.91,
    'coop_share' => 9.09,
    'member_share' => 90.91,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'created_at' => now(),
]);
echo "✓ Created Order #{$order1->id}\n\n";

// STEP 2: Create second order (should trigger suspicious detection)
echo "STEP 2: Creating second order (5 minutes later)...\n";
$order2 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 150.00,
    'subtotal' => 136.36,
    'coop_share' => 13.64,
    'member_share' => 136.36,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'created_at' => now()->addMinutes(5),
]);
echo "✓ Created Order #{$order2->id}\n";

// Check if suspicious
$suspiciousInfo = SuspiciousOrderDetectionService::checkForSuspiciousPattern($order2);
if ($suspiciousInfo) {
    echo "✓ Orders detected as suspicious\n";
    SuspiciousOrderDetectionService::markAsSuspicious($order2, $suspiciousInfo);
    echo "✓ Orders marked as suspicious\n\n";
} else {
    echo "❌ Orders NOT detected as suspicious\n\n";
}

// STEP 3: Simulate merge and approval
echo "STEP 3: Merging and approving orders...\n";
$order1->update([
    'status' => 'approved',
    'is_suspicious' => false,
    'suspicious_reason' => null,
    'admin_notes' => "Merged from orders: {$order1->id}, {$order2->id}",
    'total_amount' => 250.00,
]);
$order2->update([
    'status' => 'merged',
    'admin_notes' => "Merged into order #{$order1->id}",
]);
echo "✓ Orders merged and approved\n";
echo "  Order #{$order1->id}: Status = approved, Notes = '{$order1->admin_notes}'\n";
echo "  Order #{$order2->id}: Status = merged\n\n";

// STEP 4: Create third order within 10 minutes
echo "STEP 4: Creating third order (7 minutes after merge)...\n";
$order3 = SalesAudit::create([
    'customer_id' => $customer->id,
    'total_amount' => 200.00,
    'subtotal' => 181.82,
    'coop_share' => 18.18,
    'member_share' => 181.82,
    'status' => 'pending',
    'delivery_status' => 'pending',
    'created_at' => now()->addMinutes(7),
]);
echo "✓ Created Order #{$order3->id}\n";

// Check if detected as third order suspicious
$suspiciousInfo3 = SuspiciousOrderDetectionService::checkForSuspiciousPattern($order3);

if ($suspiciousInfo3) {
    echo "✓ Order detected as suspicious\n";
    
    if (isset($suspiciousInfo3['is_single_suspicious']) && $suspiciousInfo3['is_single_suspicious']) {
        echo "✓ Detected as SINGLE suspicious order\n";
        echo "✓ Linked to merged order: #{$suspiciousInfo3['linked_to_merged_order']}\n";
        
        SuspiciousOrderDetectionService::markAsSuspicious($order3, $suspiciousInfo3);
        
        // Verify
        $order3->refresh();
        echo "\n=== VERIFICATION ===\n";
        echo "Order #{$order3->id}:\n";
        echo "  is_suspicious: " . ($order3->is_suspicious ? 'YES' : 'NO') . "\n";
        echo "  linked_merged_order_id: " . ($order3->linked_merged_order_id ?? 'NULL') . "\n";
        echo "  suspicious_reason: {$order3->suspicious_reason}\n";
        
        if ($order3->is_suspicious && $order3->linked_merged_order_id == $order1->id) {
            echo "\n✅ SUCCESS! Third order correctly detected and linked!\n";
        } else {
            echo "\n❌ FAILED! Something went wrong\n";
        }
    } else {
        echo "❌ Detected as suspicious but NOT as single order\n";
    }
} else {
    echo "❌ Order NOT detected as suspicious\n";
    echo "\nDEBUG INFO:\n";
    echo "Order #3 created at: " . $order3->created_at->format('Y-m-d H:i:s') . "\n";
    echo "Order #1 (merged) created at: " . $order1->created_at->format('Y-m-d H:i:s') . "\n";
    echo "Time difference: " . $order1->created_at->diffInMinutes($order3->created_at) . " minutes\n";
    echo "Order #1 status: {$order1->status}\n";
    echo "Order #1 admin_notes: {$order1->admin_notes}\n";
}

echo "\n=== CLEANUP ===\n";
echo "To remove test orders, run:\n";
echo "DELETE FROM sales_audit WHERE id IN ({$order1->id}, {$order2->id}, {$order3->id});\n";
