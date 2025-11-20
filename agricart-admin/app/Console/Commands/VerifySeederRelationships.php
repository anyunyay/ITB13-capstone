<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\SalesAudit;
use App\Models\Sales;
use App\Models\AuditTrail;
use App\Models\MemberEarnings;
use App\Models\PriceTrend;
use App\Models\UserAddress;
use Illuminate\Support\Facades\DB;

class VerifySeederRelationships extends Command
{
    protected $signature = 'seeder:verify';
    protected $description = 'Verify that all seeded data has proper relationships';

    public function handle()
    {
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║   🔍 Seeder Relationship Verification                          ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->info('');

        // Test Order Relationships
        $this->info('🛒 Testing Order Relationships...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $order = SalesAudit::with(['customer', 'admin', 'logistic', 'address', 'auditTrail.product', 'auditTrail.stock', 'auditTrail.member'])->first();
        
        if (!$order) {
            $this->error('❌ No orders found!');
            return 1;
        }

        $this->info("✓ Order #{$order->id}");
        $this->info("  Customer: " . ($order->customer ? $order->customer->name : '❌ NULL'));
        $this->info("  Admin: " . ($order->admin ? $order->admin->name : '❌ NULL'));
        $this->info("  Logistic: " . ($order->logistic ? $order->logistic->name : 'Not assigned'));
        $this->info("  Address: " . ($order->address ? $order->address->city : '❌ NULL'));
        $this->info("  Order Items: " . $order->auditTrail->count());

        if ($order->auditTrail->count() > 0) {
            $item = $order->auditTrail->first();
            $this->info("  First Item:");
            $this->info("    - Product: " . ($item->product ? $item->product->name : '❌ NULL'));
            $this->info("    - Stock: " . ($item->stock ? "Stock #{$item->stock->id}" : '❌ NULL'));
            $this->info("    - Member: " . ($item->member ? $item->member->name : '❌ NULL'));
        }

        // Test Stock Relationships
        $this->info('');
        $this->info('📦 Testing Stock Relationships...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $stock = Stock::with(['member', 'product'])->first();
        if ($stock) {
            $this->info("✓ Stock #{$stock->id}");
            $this->info("  Product: " . ($stock->product ? $stock->product->name : '❌ NULL'));
            $this->info("  Member: " . ($stock->member ? $stock->member->name : '❌ NULL'));
            $this->info("  Quantity: {$stock->quantity}");
        }

        // Test Sales Relationships
        $this->info('');
        $this->info('✅ Testing Delivered Orders (Sales)...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $sales = Sales::with(['customer', 'admin', 'logistic', 'salesAudit'])->first();
        if ($sales) {
            $this->info("✓ Sales #{$sales->id}");
            $this->info("  Customer: " . ($sales->customer ? $sales->customer->name : '❌ NULL'));
            $this->info("  Admin: " . ($sales->admin ? $sales->admin->name : '❌ NULL'));
            $this->info("  Logistic: " . ($sales->logistic ? $sales->logistic->name : '❌ NULL'));
            $this->info("  Original Order: " . ($sales->salesAudit ? "Order #{$sales->salesAudit->id}" : '❌ NULL'));
        } else {
            $this->warn('  No delivered orders yet');
        }

        // Test Notifications
        $this->info('');
        $this->info('🔔 Testing Notifications...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $notificationCount = DB::table('notifications')->count();
        $this->info("✓ Total Notifications: {$notificationCount}");
        
        if ($notificationCount > 0) {
            $notification = DB::table('notifications')->first();
            $notifUser = User::find($notification->notifiable_id);
            $this->info("  First Notification:");
            $this->info("    - User: " . ($notifUser ? $notifUser->name : '❌ NULL'));
            $this->info("    - Type: " . class_basename($notification->type));
            $this->info("    - Read: " . ($notification->read_at ? 'Yes' : 'No'));
            
            // Count by user type
            $byUserType = DB::table('notifications')
                ->join('users', 'notifications.notifiable_id', '=', 'users.id')
                ->select('users.type', DB::raw('count(*) as count'))
                ->groupBy('users.type')
                ->get();
            
            $this->info("  Notifications by User Type:");
            foreach ($byUserType as $row) {
                $this->info("    - " . ucfirst($row->type) . ": {$row->count}");
            }
        }

        // Summary
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║   📊 VERIFICATION SUMMARY                                      ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->info('');

        $checks = [
            'Orders linked to customers' => SalesAudit::whereNotNull('customer_id')->count() > 0,
            'Orders linked to admins' => SalesAudit::whereNotNull('admin_id')->count() > 0,
            'Orders have items' => AuditTrail::count() > 0,
            'Order items linked to products' => AuditTrail::whereNotNull('product_id')->count() > 0,
            'Order items linked to stocks' => AuditTrail::whereNotNull('stock_id')->count() > 0,
            'Order items linked to members' => AuditTrail::whereNotNull('member_id')->count() > 0,
            'Stocks linked to members' => Stock::whereNotNull('member_id')->count() > 0,
            'Stocks linked to products' => Stock::whereNotNull('product_id')->count() > 0,
            'Sales linked to orders' => Sales::whereNotNull('sales_audit_id')->count() > 0,
            'Notifications exist' => DB::table('notifications')->count() > 0,
            'Notifications linked to users' => DB::table('notifications')->whereNotNull('notifiable_id')->count() > 0,
        ];

        $passed = 0;
        $failed = 0;

        foreach ($checks as $check => $result) {
            if ($result) {
                $this->info("✅ {$check}");
                $passed++;
            } else {
                $this->error("❌ {$check}");
                $failed++;
            }
        }

        $this->info('');
        $this->info("Results: {$passed} passed, {$failed} failed");
        $this->info('');

        if ($failed === 0) {
            $this->info('🎉 ALL RELATIONSHIPS ARE PROPERLY CONNECTED!');
            return 0;
        } else {
            $this->error('⚠️  Some relationships are missing. Please check the seeders.');
            return 1;
        }
    }
}
