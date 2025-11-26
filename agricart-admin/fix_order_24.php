<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Fixing Order #24...\n";

$result = DB::table('sales_audit')
    ->where('id', 24)
    ->update(['admin_notes' => 'Merged from orders: 24, 25']);

if ($result) {
    echo "✅ Order #24 admin_notes updated successfully\n";
    
    $order = DB::table('sales_audit')->where('id', 24)->first(['id', 'status', 'admin_notes']);
    echo "\nOrder #24:\n";
    echo "Status: {$order->status}\n";
    echo "Admin Notes: {$order->admin_notes}\n";
} else {
    echo "❌ Failed to update Order #24\n";
}
