<?php

/**
 * Debug Script for Third Order Detection
 * 
 * This script helps diagnose issues with third order detection
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SalesAudit;
use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "=== Third Order Detection Debug ===\n\n";

// Get a customer with recent orders
$customerWithOrders = DB::table('sales_audit')
    ->select('customer_id')
    ->groupBy('customer_id')
    ->orderBy('customer_id', 'desc')
    ->first();

if (!$customerWithOrders) {
    echo "❌ No orders found in database\n";
    exit(1);
}

$customer = User::find($customerWithOrders->customer_id);

if (!$customer) {
    echo "❌ Customer not found\n";
    exit(1);
}

echo "Customer: {$customer->name} (ID: {$customer->id})\n\n";

// Get recent orders from this customer
$recentOrders = SalesAudit::where('customer_id', $customer->id)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

echo "=== Recent Orders ===\n";
foreach ($recentOrders as $order) {
    $mergedNote = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false ? ' [MERGED]' : '';
    $suspiciousNote = $order->is_suspicious ? ' [SUSPICIOUS]' : '';
    $linkedNote = $order->linked_merged_order_id ? " [LINKED TO #{$order->linked_merged_order_id}]" : '';
    
    echo sprintf(
        "Order #%d - Status: %s - Created: %s%s%s%s\n",
        $order->id,
        $order->status,
        $order->created_at->format('Y-m-d H:i:s'),
        $mergedNote,
        $suspiciousNote,
        $linkedNote
    );
    
    if ($order->is_suspicious) {
        echo "  Reason: {$order->suspicious_reason}\n";
    }
    if ($order->admin_notes) {
        echo "  Notes: " . substr($order->admin_notes, 0, 100) . "\n";
    }
}

echo "\n=== Checking for Merged Orders ===\n";
$mergedOrders = SalesAudit::where('customer_id', $customer->id)
    ->where('status', 'approved')
    ->where('admin_notes', 'like', '%Merged from orders:%')
    ->orderBy('created_at', 'desc')
    ->get();

if ($mergedOrders->isEmpty()) {
    echo "No merged orders found for this customer\n";
} else {
    foreach ($mergedOrders as $order) {
        echo sprintf(
            "Merged Order #%d - Created: %s\n",
            $order->id,
            $order->created_at->format('Y-m-d H:i:s')
        );
        echo "  Notes: {$order->admin_notes}\n";
        
        // Check for orders within 10 minutes after this merged order
        $timeWindowEnd = $order->created_at->copy()->addMinutes(10);
        $ordersAfter = SalesAudit::where('customer_id', $customer->id)
            ->where('id', '!=', $order->id)
            ->where('created_at', '>', $order->created_at)
            ->where('created_at', '<=', $timeWindowEnd)
            ->get();
        
        if ($ordersAfter->isNotEmpty()) {
            echo "  Orders within 10 minutes after:\n";
            foreach ($ordersAfter as $afterOrder) {
                $minutesAfter = $order->created_at->diffInMinutes($afterOrder->created_at);
                $linkedNote = $afterOrder->linked_merged_order_id == $order->id ? ' ✓ LINKED' : ' ✗ NOT LINKED';
                $suspiciousNote = $afterOrder->is_suspicious ? ' ✓ SUSPICIOUS' : ' ✗ NOT SUSPICIOUS';
                
                echo sprintf(
                    "    Order #%d - %d min after%s%s\n",
                    $afterOrder->id,
                    $minutesAfter,
                    $linkedNote,
                    $suspiciousNote
                );
            }
        } else {
            echo "  No orders within 10 minutes after this merged order\n";
        }
    }
}

echo "\n=== Checking Database Schema ===\n";
$columns = DB::select("DESCRIBE sales_audit");
$hasLinkedColumn = false;
foreach ($columns as $column) {
    if ($column->Field === 'linked_merged_order_id') {
        $hasLinkedColumn = true;
        echo "✓ Column 'linked_merged_order_id' exists\n";
        echo "  Type: {$column->Type}\n";
        echo "  Null: {$column->Null}\n";
        echo "  Key: {$column->Key}\n";
        break;
    }
}

if (!$hasLinkedColumn) {
    echo "❌ Column 'linked_merged_order_id' NOT FOUND!\n";
    echo "   Run: php artisan migrate\n";
}

echo "\n=== Checking Orders with linked_merged_order_id ===\n";
$linkedOrders = SalesAudit::whereNotNull('linked_merged_order_id')->get();

if ($linkedOrders->isEmpty()) {
    echo "No orders with linked_merged_order_id found\n";
    echo "This is expected if no third orders have been created yet\n";
} else {
    echo "Found {$linkedOrders->count()} order(s) with linked_merged_order_id:\n";
    foreach ($linkedOrders as $order) {
        echo sprintf(
            "  Order #%d linked to Order #%d\n",
            $order->id,
            $order->linked_merged_order_id
        );
        echo "    Reason: {$order->suspicious_reason}\n";
    }
}

echo "\n=== Test Scenario Suggestion ===\n";
echo "To test the feature:\n";
echo "1. Create two orders from the same customer within 5 minutes\n";
echo "2. Go to Suspicious Orders page and merge them\n";
echo "3. Approve the merged order\n";
echo "4. Create a third order from the same customer within 10 minutes\n";
echo "5. The third order should be automatically marked as suspicious\n";
echo "6. Run this script again to verify\n";

echo "\n✅ Debug complete\n";
