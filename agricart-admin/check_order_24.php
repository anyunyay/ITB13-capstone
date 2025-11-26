<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$order = DB::table('sales_audit')->where('id', 24)->first();

echo "Order #24:\n";
echo "Status: {$order->status}\n";
echo "Created: {$order->created_at}\n";
echo "Admin Notes: " . ($order->admin_notes ?? 'NULL') . "\n";
echo "Is Suspicious: " . ($order->is_suspicious ? 'YES' : 'NO') . "\n";

$hasMergedText = strpos($order->admin_notes ?? '', 'Merged from orders:') !== false;
echo "\nHas 'Merged from orders:' text: " . ($hasMergedText ? 'YES' : 'NO') . "\n";

if ($hasMergedText) {
    echo "\n✅ This order WAS merged!\n";
    echo "Status: {$order->status}\n";
    
    if ($order->status === 'approved') {
        echo "✅ And it's approved - third order detection should work\n";
    } else if ($order->status === 'pending') {
        echo "⚠️  It's still pending - but third order detection should now work with the updated code\n";
    }
}
