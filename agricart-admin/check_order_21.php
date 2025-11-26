<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$orderId = 24; // Change this to check different orders
$order = DB::table('sales_audit')->where('id', $orderId)->first();

echo "Order #$orderId:\n";
echo "Status: {$order->status}\n";
echo "Created: {$order->created_at}\n";
echo "Admin Notes: " . ($order->admin_notes ?? 'NULL') . "\n";
echo "Is Suspicious: " . ($order->is_suspicious ? 'YES' : 'NO') . "\n";

$hasMergedText = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false;
echo "\nHas 'Merged from orders:' text: " . ($hasMergedText ? 'YES' : 'NO') . "\n";

if (!$hasMergedText) {
    echo "\n❌ This order was NOT merged. It was approved individually.\n";
    echo "To test the third order feature, you need to:\n";
    echo "1. Create two orders within 5 minutes\n";
    echo "2. Use the MERGE button on the Suspicious Orders page\n";
    echo "3. Then approve the merged order\n";
    echo "4. Then create a third order\n";
}
