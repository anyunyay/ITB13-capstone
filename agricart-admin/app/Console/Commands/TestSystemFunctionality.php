<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\SalesAudit;
use App\Models\Sales;
use App\Models\Stock;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class TestSystemFunctionality extends Command
{
    protected $signature = 'system:test';
    protected $description = 'Test if seeded data works correctly in the system';

    public function handle()
    {
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║   🧪 System Functionality Test                                 ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->info('');

        $passed = 0;
        $failed = 0;

        // Test 1: Customer Login & Order History
        $this->info('1️⃣  Testing Customer Order History (Lazy Loading)...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $customer = User::where('type', 'customer')->first();
        if (!$customer) {
            $this->error('❌ No customer found');
            $failed++;
        } else {
            $this->info("✓ Customer: {$customer->name} (ID: {$customer->id})");
            
            // Test lazy loading query (first 4 orders)
            $orders = SalesAudit::where('customer_id', $customer->id)
                ->orderBy('updated_at', 'desc')
                ->offset(0)
                ->limit(4)
                ->get();
            
            if ($orders->count() === 0) {
                $this->error('❌ No orders found for customer');
                $failed++;
            } else {
                $this->info("✓ Found {$orders->count()} orders (first batch)");
                
                foreach ($orders as $order) {
                    $itemCount = $order->auditTrail()->count();
                    $this->info("  - Order #{$order->id}: {$order->status}, {$itemCount} items");
                    
                    if ($itemCount === 0) {
                        $this->error("    ❌ Order has no items!");
                        $failed++;
                    } else {
                        $passed++;
                    }
                }
            }
        }

        // Test 2: Order Details with Relationships
        $this->info('');
        $this->info('2️⃣  Testing Order Details & Relationships...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $order = SalesAudit::with(['customer', 'admin', 'logistic', 'address', 'auditTrail.product', 'auditTrail.stock', 'auditTrail.member'])
            ->first();
        
        if (!$order) {
            $this->error('❌ No orders found');
            $failed++;
        } else {
            $checks = [
                'Customer exists' => $order->customer !== null,
                'Admin exists' => $order->admin !== null,
                'Address exists' => $order->address !== null,
                'Has order items' => $order->auditTrail->count() > 0,
            ];
            
            foreach ($checks as $check => $result) {
                if ($result) {
                    $this->info("✓ {$check}");
                    $passed++;
                } else {
                    $this->error("❌ {$check}");
                    $failed++;
                }
            }
            
            // Check first order item
            if ($order->auditTrail->count() > 0) {
                $item = $order->auditTrail->first();
                $itemChecks = [
                    'Item has product' => $item->product !== null,
                    'Item has stock' => $item->stock !== null,
                    'Item has member' => $item->member !== null,
                    'Item has quantity' => $item->quantity > 0,
                    'Item has price' => $item->unit_price > 0,
                ];
                
                foreach ($itemChecks as $check => $result) {
                    if ($result) {
                        $this->info("✓ {$check}");
                        $passed++;
                    } else {
                        $this->error("❌ {$check}");
                        $failed++;
                    }
                }
            }
        }

        // Test 3: Stock Management
        $this->info('');
        $this->info('3️⃣  Testing Stock Management...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $stock = Stock::with(['member', 'product'])->where('quantity', '>', 0)->first();
        if (!$stock) {
            $this->error('❌ No available stock found');
            $failed++;
        } else {
            $stockChecks = [
                'Stock has member' => $stock->member !== null,
                'Stock has product' => $stock->product !== null,
                'Stock has quantity' => $stock->quantity > 0,
                'Member is valid' => $stock->member && $stock->member->type === 'member',
                'Product is valid' => $stock->product && $stock->product->name !== null,
            ];
            
            foreach ($stockChecks as $check => $result) {
                if ($result) {
                    $this->info("✓ {$check}");
                    $passed++;
                } else {
                    $this->error("❌ {$check}");
                    $failed++;
                }
            }
            
            $this->info("  Stock: {$stock->product->name} - {$stock->quantity} {$stock->category}");
            $this->info("  Owner: {$stock->member->name}");
        }

        // Test 4: Delivered Orders (Sales)
        $this->info('');
        $this->info('4️⃣  Testing Delivered Orders (Sales)...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $sales = Sales::with(['customer', 'admin', 'logistic', 'salesAudit'])->first();
        if (!$sales) {
            $this->warn('⚠️  No delivered orders yet (this is OK for new system)');
        } else {
            $salesChecks = [
                'Sales has customer' => $sales->customer !== null,
                'Sales has admin' => $sales->admin !== null,
                'Sales linked to order' => $sales->salesAudit !== null,
                'Sales has delivery date' => $sales->delivered_at !== null,
            ];
            
            foreach ($salesChecks as $check => $result) {
                if ($result) {
                    $this->info("✓ {$check}");
                    $passed++;
                } else {
                    $this->error("❌ {$check}");
                    $failed++;
                }
            }
        }

        // Test 5: Notifications
        $this->info('');
        $this->info('5️⃣  Testing Notifications...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $notificationCount = DB::table('notifications')->count();
        if ($notificationCount === 0) {
            $this->error('❌ No notifications found');
            $failed++;
        } else {
            $this->info("✓ Found {$notificationCount} notifications");
            $passed++;
            
            $notification = DB::table('notifications')->first();
            $user = User::find($notification->notifiable_id);
            
            if ($user) {
                $this->info("✓ Notifications linked to users");
                $this->info("  Example: {$user->name} ({$user->type})");
                $passed++;
            } else {
                $this->error("❌ Notification user not found");
                $failed++;
            }
        }

        // Test 6: Financial Calculations
        $this->info('');
        $this->info('6️⃣  Testing Financial Calculations...');
        $this->info('─────────────────────────────────────────────────────────────────');
        
        $order = SalesAudit::with('auditTrail')->first();
        if ($order) {
            $calculatedSubtotal = 0;
            foreach ($order->auditTrail as $item) {
                $calculatedSubtotal += $item->quantity * $item->unit_price;
            }
            
            $calculatedCoopShare = $calculatedSubtotal * 0.10;
            $calculatedTotal = $calculatedSubtotal + $calculatedCoopShare;
            
            $subtotalMatch = abs($order->subtotal - $calculatedSubtotal) < 0.01;
            $coopShareMatch = abs($order->coop_share - $calculatedCoopShare) < 0.01;
            $totalMatch = abs($order->total_amount - $calculatedTotal) < 0.01;
            
            if ($subtotalMatch && $coopShareMatch && $totalMatch) {
                $this->info("✓ Financial calculations correct");
                $this->info("  Subtotal: ₱" . number_format($order->subtotal, 2));
                $this->info("  Co-op Share (10%): ₱" . number_format($order->coop_share, 2));
                $this->info("  Total: ₱" . number_format($order->total_amount, 2));
                $passed++;
            } else {
                $this->error("❌ Financial calculations incorrect");
                $this->error("  Expected Subtotal: ₱" . number_format($calculatedSubtotal, 2));
                $this->error("  Actual Subtotal: ₱" . number_format($order->subtotal, 2));
                $failed++;
            }
        }

        // Summary
        $this->info('');
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║   📊 TEST RESULTS                                              ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');
        $this->info('');
        $this->info("✅ Passed: {$passed}");
        $this->info("❌ Failed: {$failed}");
        $this->info('');

        if ($failed === 0) {
            $this->info('🎉 ALL TESTS PASSED! System is working correctly.');
            return 0;
        } else {
            $this->error('⚠️  Some tests failed. Please check the issues above.');
            return 1;
        }
    }
}
