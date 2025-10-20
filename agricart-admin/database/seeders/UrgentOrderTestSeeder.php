<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use Carbon\Carbon;

class UrgentOrderTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing sales and audit trail data to avoid conflicts
        SalesAudit::query()->delete();
        Sales::query()->delete();
        AuditTrail::query()->delete();

        // Find the test customer (created by factory)
        $customer = User::where('type', 'customer')->first();
        
        if (!$customer) {
            $this->command->error('No customer found. Please create a customer first.');
            return;
        }

        // Find the customer's default address
        $defaultAddress = UserAddress::where('user_id', $customer->id)->where('is_active', true)->first();
        
        if (!$defaultAddress) {
            $this->command->error('Customer does not have a default address. Please create an address first.');
            return;
        }

        // Get admin and logistics for assignment
        $admin = User::where('type', 'admin')->first();
        $logistics = User::where('type', 'logistic')->get();

        // Find products with available stocks from our member (ID 2411000)
        $member = User::where('member_id', '2411000')->first();
        if (!$member) {
            $this->command->error('Member with ID 2411000 not found.');
            return;
        }

        $products = Product::with(['stocks' => function($query) use ($member) {
            $query->where('member_id', $member->id)->where('quantity', '>', 0);
        }])->whereHas('stocks', function($query) use ($member) {
            $query->where('member_id', $member->id)->where('quantity', '>', 0);
        })->take(8)->get();
        
        if ($products->isEmpty()) {
            $this->command->error('No products with available stock found. Please seed products and stocks first.');
            return;
        }

        $this->command->info('Creating test orders with proper status logic...');
        $this->command->info('Logic: >24hrs = delayed, 16-24hrs = urgent, <16hrs = recent');

        // Create orders with different ages to test the logic
        
        // 1. DELAYED ORDER (25 hours old - should be delayed)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(25), 'Delayed Order (25hrs old)');
        
        // 2. DELAYED ORDER (30 hours old - should be delayed)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(30), 'Very Delayed Order (30hrs old)');
        
        // 3. URGENT ORDER (22 hours old - 2 hours left - should be urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(22), 'Critical Urgent Order (2hrs left)');
        
        // 4. URGENT ORDER (20 hours old - 4 hours left - should be urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(20), 'High Urgent Order (4hrs left)');
        
        // 5. URGENT ORDER (18 hours old - 6 hours left - should be urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(18), 'Medium Urgent Order (6hrs left)');
        
        // 6. URGENT ORDER (16 hours old - 8 hours left - should be urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(16), 'Just Urgent Order (8hrs left)');
        
        // 7. RECENT ORDER (10 hours old - should be recent, not urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(10), 'Recent Order (10hrs old)');
        
        // 8. RECENT ORDER (5 hours old - should be recent, not urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(5), 'Fresh Order (5hrs old)');
        
        // 9. RECENT ORDER (2 hours old - should be recent, not urgent)
        $this->createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, Carbon::now()->subHours(2), 'Very Fresh Order (2hrs old)');
        

        $this->command->info('✅ Created 9 test orders with proper status logic:');
        $this->command->info('   - 2 Delayed orders (>24hrs old)');
        $this->command->info('   - 4 Urgent orders (16-24hrs old, 8hrs or less remaining)');
        $this->command->info('   - 3 Recent orders (<16hrs old, not urgent)');
        $this->command->info('');
        
        // Test Carbon calculations
        $this->testCarbonCalculations();
        
        $this->command->info('You can now test the urgent order popup functionality!');
    }

    private function createTestOrder($customer, $defaultAddress, $products, $admin, $logistics, $createdAt, $description)
    {
        // Select 1-3 random products for this order
        $selectedProducts = $products->random(rand(1, 3));
        
        $subtotal = 0;
        $orderItems = [];

        // Create order with selected products
        foreach ($selectedProducts as $product) {
            $stock = $product->stocks->where('member_id', User::where('member_id', '2411000')->first()->id)->first();
            if (!$stock || $stock->quantity <= 0) continue;

            $quantity = rand(1, min(3, (int)$stock->quantity)); // Don't order more than available
            $price = $product->price_kilo ?? $product->price_pc ?? $product->price_tali ?? 0;
            $itemTotal = $price * $quantity;
            $subtotal += $itemTotal;

            $orderItems[] = [
                'product' => $product,
                'stock' => $stock,
                'quantity' => $quantity,
                'price' => $price,
                'total' => $itemTotal
            ];
        }

        if (empty($orderItems)) {
            $this->command->warn("No valid products found for order: {$description}");
            return null;
        }

        // Calculate financial breakdown
        $coopShare = $subtotal * 0.10; // 10% co-op share
        $memberShare = $subtotal; // Member gets 100% of subtotal
        $totalAmount = $subtotal + $coopShare; // Customer pays subtotal + co-op share

        // Apply the proper logic: >24hrs = delayed, 16-24hrs = urgent, <16hrs = recent
        $orderAge = $createdAt->diffInHours(now());
        $hoursLeft = 24 - $orderAge;
        
        // Determine status based on order age
        if ($orderAge > 24) {
            $status = 'delayed';
            $urgencyLevel = 'DELAYED';
            $deliveryStatus = 'pending';
        } else {
            $status = 'pending';
            if ($orderAge >= 16) {
                $urgencyLevel = 'URGENT';
                $deliveryStatus = 'pending';
            } else {
                $urgencyLevel = 'RECENT';
                $deliveryStatus = 'pending';
            }
        }

        // Randomly assign a logistic for some orders
        $assignedLogistic = $logistics->isNotEmpty() ? $logistics->random() : null;

        // Create the sales audit record with proper financial data
        $order = SalesAudit::create([
            'customer_id' => $customer->id,
            'total_amount' => $totalAmount,
            'subtotal' => $subtotal,
            'coop_share' => $coopShare,
            'member_share' => $memberShare,
            'status' => $status,
            'delivery_status' => $deliveryStatus,
            'address_id' => $defaultAddress->id,
            'admin_id' => $admin ? $admin->id : null,
            'logistic_id' => $assignedLogistic ? $assignedLogistic->id : null,
            'is_urgent' => $urgencyLevel === 'URGENT',
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);

        // Create audit trail entries with proper pricing data
        foreach ($orderItems as $item) {
            AuditTrail::create([
                'sale_id' => $order->id,
                'product_id' => $item['product']->id,
                'stock_id' => $item['stock']->id,
                'member_id' => $item['stock']->member_id,
                'product_name' => $item['product']->name,
                'category' => $item['stock']->category,
                'quantity' => $item['quantity'],
                'price_kilo' => $item['product']->price_kilo,
                'price_pc' => $item['product']->price_pc,
                'price_tali' => $item['product']->price_tali,
                'unit_price' => $item['price'],
                'available_stock_after_sale' => $item['stock']->quantity - $item['quantity'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Update stock quantities to reflect the sale
            $item['stock']->decrement('quantity', $item['quantity']);
            $item['stock']->increment('sold_quantity', $item['quantity']);
        }

        // Format hours left for display
        if ($urgencyLevel === 'DELAYED') {
            $timeInfo = "OVERDUE by " . ($orderAge - 24) . "hrs";
        } elseif ($urgencyLevel === 'URGENT') {
            $timeInfo = "{$hoursLeft}hrs left";
        } else {
            $timeInfo = "{$orderAge}hrs old";
        }
        
        $logisticInfo = $assignedLogistic ? " - Logistic: {$assignedLogistic->name}" : "";
        $this->command->info("Created order #{$order->id}: {$description} - ₱{$totalAmount} - Status: {$status} ({$urgencyLevel}) - {$timeInfo}{$logisticInfo} - {$createdAt->diffForHumans()}");
        
        return $order;
    }

    private function testCarbonCalculations()
    {
        $this->command->info('🧪 Testing Carbon date calculations:');
        
        $testCases = [
            ['hours' => 25, 'expected' => 'DELAYED'],
            ['hours' => 30, 'expected' => 'DELAYED'],
            ['hours' => 22, 'expected' => 'URGENT'],
            ['hours' => 20, 'expected' => 'URGENT'],
            ['hours' => 18, 'expected' => 'URGENT'],
            ['hours' => 16, 'expected' => 'URGENT'],
            ['hours' => 10, 'expected' => 'RECENT'],
            ['hours' => 5, 'expected' => 'RECENT'],
            ['hours' => 2, 'expected' => 'RECENT'],
        ];
        
        foreach ($testCases as $testCase) {
            $createdAt = Carbon::now()->subHours($testCase['hours']);
            $orderAge = $createdAt->diffInHours(now());
            $hoursLeft = 24 - $orderAge;
            
            if ($orderAge > 24) {
                $actual = 'DELAYED';
                $timeInfo = "OVERDUE by " . ($orderAge - 24) . "hrs";
            } else {
                if ($orderAge >= 16) {
                    $actual = 'URGENT';
                    $timeInfo = "{$hoursLeft}hrs left";
                } else {
                    $actual = 'RECENT';
                    $timeInfo = "{$orderAge}hrs old";
                }
            }
            
            $status = $actual === 'DELAYED' ? 'delayed' : 'pending';
            $result = $actual === $testCase['expected'] ? '✅' : '❌';
            
            $this->command->line("  {$result} {$testCase['hours']}hrs old → {$actual} ({$status}) - {$timeInfo}");
        }
        
        $this->command->info('');
    }
}