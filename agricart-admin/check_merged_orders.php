<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$customerId = 41;

echo "=== Checking Merged Orders for Customer $customerId ===\n\n";

// Check all approved orders
$approvedOrders = DB::table('sales_audit')
    ->where('customer_id', $customerId)
    ->where('status', 'approved')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get(['id', 'status', 'created_at', 'admin_notes']);

echo "Approved Orders:\n";
foreach ($approvedOrders as $order) {
    $isMerged = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false;
    $mergedFlag = $isMerged ? ' [MERGED]' : '';
    echo "  Order #{$order->id} - {$order->created_at}{$mergedFlag}\n";
    if ($order->admin_notes) {
        echo "    Notes: " . substr($order->admin_notes, 0, 100) . "\n";
    }
}

echo "\n";

// Check the specific order that was just created
$latestOrder = DB::table('sales_audit')
    ->where('customer_id', $customerId)
    ->orderBy('created_at', 'desc')
    ->first(['id', 'status', 'created_at', 'is_suspicious', 'linked_merged_order_id']);

if ($latestOrder) {
    echo "Latest Order:\n";
    echo "  Order #{$latestOrder->id}\n";
    echo "  Status: {$latestOrder->status}\n";
    echo "  Created: {$latestOrder->created_at}\n";
    echo "  Is Suspicious: " . ($latestOrder->is_suspicious ? 'YES' : 'NO') . "\n";
    echo "  Linked to: " . ($latestOrder->linked_merged_order_id ?? 'NULL') . "\n";
    
    // Check if there are merged orders within 10 minutes before this order
    $tenMinutesBefore = date('Y-m-d H:i:s', strtotime($latestOrder->created_at) - 600);
    
    echo "\n  Looking for merged orders between {$tenMinutesBefore} and {$latestOrder->created_at}...\n";
    
    $mergedInWindow = DB::table('sales_audit')
        ->where('customer_id', $customerId)
        ->where('id', '!=', $latestOrder->id)
        ->whereIn('status', ['pending', 'approved']) // Check both pending and approved
        ->where('created_at', '>=', $tenMinutesBefore)
        ->where('created_at', '<=', $latestOrder->created_at)
        ->whereRaw("admin_notes LIKE '%Merged from orders:%'")
        ->get(['id', 'status', 'created_at', 'admin_notes']);
    
    if ($mergedInWindow->isEmpty()) {
        echo "  ❌ No merged orders found in 10-minute window\n";
        echo "\n  Possible reasons:\n";
        echo "  1. The merged order was created more than 10 minutes ago\n";
        echo "  2. The merged order doesn't have 'Merged from orders:' in admin_notes\n";
        echo "  3. The merged order status is not 'pending' or 'approved'\n";
    } else {
        echo "  ✓ Found " . $mergedInWindow->count() . " merged order(s) in window:\n";
        foreach ($mergedInWindow as $merged) {
            $minutesDiff = round((strtotime($latestOrder->created_at) - strtotime($merged->created_at)) / 60, 2);
            echo "    Order #{$merged->id} (Status: {$merged->status}) - {$minutesDiff} minutes before\n";
            echo "      Notes: " . substr($merged->admin_notes, 0, 60) . "\n";
        }
    }
}
