<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\SalesAudit;

echo "=== Notification Data Integrity Check ===\n\n";

// Count orders
$orderCount = SalesAudit::count();
echo "✓ Total Orders (SalesAudit): {$orderCount}\n";

// Count notifications
$notificationCount = DB::table('notifications')->count();
echo "✓ Total Notifications: {$notificationCount}\n\n";

// Check notifications with order_id
$notifications = DB::table('notifications')->get();
$withOrderId = 0;
$validOrderIds = [];
$invalidOrderIds = [];

foreach ($notifications as $notification) {
    $data = json_decode($notification->data, true);
    
    if (isset($data['order_id'])) {
        $withOrderId++;
        $orderId = $data['order_id'];
        
        // Check if order exists
        $orderExists = SalesAudit::where('id', $orderId)->exists();
        
        if ($orderExists) {
            $validOrderIds[] = $orderId;
        } else {
            $invalidOrderIds[] = $orderId;
        }
    }
}

echo "Notifications with order_id: {$withOrderId}\n";
echo "  ✓ Valid order references: " . count($validOrderIds) . "\n";
echo "  ✗ Invalid order references: " . count($invalidOrderIds) . "\n\n";

if (count($invalidOrderIds) > 0) {
    echo "❌ FAILED: Found notifications with invalid order IDs:\n";
    foreach ($invalidOrderIds as $id) {
        echo "   - Order ID: {$id}\n";
    }
    exit(1);
} else {
    echo "✅ SUCCESS: All notifications have valid order references!\n";
    echo "\nSample valid order IDs: " . implode(', ', array_slice(array_unique($validOrderIds), 0, 5)) . "\n";
    exit(0);
}
