<?php

/**
 * Verify Seeder Relationships Script
 * 
 * This script verifies that all seeded data is properly connected
 * with correct foreign key relationships.
 * 
 * Usage: php artisan tinker < scripts/verify-seeder-relationships.php
 */

use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\SalesAudit;
use App\Models\Sales;
use App\Models\AuditTrail;
use App\Models\MemberEarnings;
use App\Models\PriceTrend;
use App\Models\UserAddress;

echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║   🔍 Seeder Relationship Verification                          ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n";
echo "\n";

// ============================================================
// 1. VERIFY USERS
// ============================================================
echo "📋 1. USERS & ADDRESSES\n";
echo "─────────────────────────────────────────────────────────────────\n";

$admin = User::where('type', 'admin')->first();
$customer = User::where('type', 'customer')->first();
$member = User::where('type', 'member')->first();
$logistic = User::where('type', 'logistic')->first();

echo "✓ Admin: " . ($admin ? $admin->name : 'NOT FOUND') . "\n";
echo "  - Has Address: " . ($admin && $admin->addresses()->count() > 0 ? 'YES' : 'NO') . "\n";

echo "✓ Customer: " . ($customer ? $customer->name : 'NOT FOUND') . "\n";
echo "  - Has Address: " . ($customer && $customer->addresses()->count() > 0 ? 'YES' : 'NO') . "\n";

echo "✓ Member: " . ($member ? $member->name : 'NOT FOUND') . "\n";
echo "  - Has Address: " . ($member && $member->addresses()->count() > 0 ? 'YES' : 'NO') . "\n";
echo "  - Has Stocks: " . ($member ? $member->stocks()->count() : 0) . "\n";

echo "✓ Logistic: " . ($logistic ? $logistic->name : 'NOT FOUND') . "\n";
echo "  - Has Address: " . ($logistic && $logistic->addresses()->count() > 0 ? 'YES' : 'NO') . "\n";

// ============================================================
// 2. VERIFY PRODUCTS & STOCKS
// ============================================================
echo "\n📦 2. PRODUCTS & STOCKS\n";
echo "─────────────────────────────────────────────────────────────────\n";

$product = Product::first();
if ($product) {
    echo "✓ Product: " . $product->name . "\n";
    echo "  - Has Stocks: " . $product->stocks()->count() . "\n";
    echo "  - Available Stock: " . $product->stocks()->where('quantity', '>', 0)->count() . "\n";
    echo "  - Has Price Trends: " . $product->priceTrends()->count() . "\n";
    
    $stock = $product->stocks()->first();
    if ($stock) {
        echo "  - Stock Owner (Member): " . ($stock->member ? $stock->member->name : 'NULL') . "\n";
        echo "  - Stock Product: " . ($stock->product ? $stock->product->name : 'NULL') . "\n";
    }
}

// ============================================================
// 3. VERIFY ORDERS & RELATIONSHIPS
// ============================================================
echo "\n🛒 3. ORDERS & RELATIONSHIPS\n";
echo "─────────────────────────────────────────────────────────────────\n";

$order = SalesAudit::first();
if ($order) {
    echo "✓ Order #" . $order->id . "\n";
    echo "  - Customer: " . ($order->customer ? $order->customer->name : 'NULL ❌') . "\n";
    echo "  - Admin: " . ($order->admin ? $order->admin->name : 'NULL ❌') . "\n";
    echo "  - Logistic: " . ($order->logistic ? $order->logistic->name : 'NULL') . "\n";
    echo "  - Address: " . ($order->address ? $order->address->city : 'NULL ❌') . "\n";
    echo "  - Order Items (AuditTrail): " . $order->auditTrail()->count() . "\n";
    
    $auditTrail = $order->auditTrail()->first();
    if ($auditTrail) {
        echo "  - First Item Product: " . ($auditTrail->product ? $auditTrail->product->name : 'NULL ❌') . "\n";
        echo "  - First Item Stock: " . ($auditTrail->stock ? 'Stock #' . $auditTrail->stock->id : 'NULL ❌') . "\n";
        echo "  - First Item Member: " . ($auditTrail->member ? $auditTrail->member->name : 'NULL ❌') . "\n";
    }
    
    // Check if order has corresponding Sales record
    $sales = Sales::where('sales_audit_id', $order->id)->first();
    if ($sales) {
        echo "  - Has Sales Record: YES (Delivered)\n";
        echo "  - Sales Customer: " . ($sales->customer ? $sales->customer->name : 'NULL ❌') . "\n";
    } else {
        echo "  - Has Sales Record: NO (Not delivered yet)\n";
    }
}

// ============================================================
// 4. VERIFY DELIVERED ORDERS
// ============================================================
echo "\n✅ 4. DELIVERED ORDERS (SALES)\n";
echo "─────────────────────────────────────────────────────────────────\n";

$sales = Sales::first();
if ($sales) {
    echo "✓ Sales Record #" . $sales->id . "\n";
    echo "  - Customer: " . ($sales->customer ? $sales->customer->name : 'NULL ❌') . "\n";
    echo "  - Admin: " . ($sales->admin ? $sales->admin->name : 'NULL ❌') . "\n";
    echo "  - Logistic: " . ($sales->logistic ? $sales->logistic->name : 'NULL ❌') . "\n";
    echo "  - Original Order (SalesAudit): " . ($sales->salesAudit ? 'Order #' . $sales->salesAudit->id : 'NULL ❌') . "\n";
    echo "  - Order Items: " . $sales->auditTrail()->count() . "\n";
}

// ============================================================
// 5. VERIFY MEMBER EARNINGS
// ============================================================
echo "\n💰 5. MEMBER EARNINGS\n";
echo "─────────────────────────────────────────────────────────────────\n";

$earnings = MemberEarnings::first();
if ($earnings) {
    echo "✓ Earnings Record #" . $earnings->id . "\n";
    echo "  - Member: " . ($earnings->member ? $earnings->member->name : 'NULL ❌') . "\n";
    echo "  - Total Earnings: ₱" . number_format($earnings->total_earnings, 2) . "\n";
}

// ============================================================
// 6. VERIFY NOTIFICATIONS
// ============================================================
echo "\n🔔 6. NOTIFICATIONS\n";
echo "─────────────────────────────────────────────────────────────────\n";

$notificationCount = DB::table('notifications')->count();
echo "✓ Total Notifications: " . $notificationCount . "\n";

if ($notificationCount > 0) {
    $notification = DB::table('notifications')->first();
    $notifiable = User::find($notification->notifiable_id);
    echo "  - First Notification User: " . ($notifiable ? $notifiable->name : 'NULL ❌') . "\n";
    echo "  - Notification Type: " . $notification->type . "\n";
}

// ============================================================
// 7. SUMMARY
// ============================================================
echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║   📊 RELATIONSHIP VERIFICATION SUMMARY                         ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n";
echo "\n";

$checks = [
    'Users exist' => User::count() > 0,
    'Users have addresses' => UserAddress::count() > 0,
    'Products exist' => Product::count() > 0,
    'Stocks exist' => Stock::count() > 0,
    'Stocks linked to members' => Stock::whereNotNull('member_id')->count() > 0,
    'Stocks linked to products' => Stock::whereNotNull('product_id')->count() > 0,
    'Orders exist' => SalesAudit::count() > 0,
    'Orders linked to customers' => SalesAudit::whereNotNull('customer_id')->count() > 0,
    'Orders linked to admins' => SalesAudit::whereNotNull('admin_id')->count() > 0,
    'Orders have items' => AuditTrail::count() > 0,
    'Order items linked to products' => AuditTrail::whereNotNull('product_id')->count() > 0,
    'Order items linked to stocks' => AuditTrail::whereNotNull('stock_id')->count() > 0,
    'Order items linked to members' => AuditTrail::whereNotNull('member_id')->count() > 0,
    'Delivered orders exist' => Sales::count() > 0,
    'Sales linked to orders' => Sales::whereNotNull('sales_audit_id')->count() > 0,
    'Member earnings exist' => MemberEarnings::count() > 0,
    'Price trends exist' => PriceTrend::count() > 0,
    'Notifications exist' => DB::table('notifications')->count() > 0,
];

$passed = 0;
$failed = 0;

foreach ($checks as $check => $result) {
    if ($result) {
        echo "✅ " . $check . "\n";
        $passed++;
    } else {
        echo "❌ " . $check . "\n";
        $failed++;
    }
}

echo "\n";
echo "Results: " . $passed . " passed, " . $failed . " failed\n";
echo "\n";

if ($failed === 0) {
    echo "🎉 ALL RELATIONSHIPS ARE PROPERLY CONNECTED!\n";
} else {
    echo "⚠️  Some relationships are missing. Please check the seeders.\n";
}

echo "\n";
