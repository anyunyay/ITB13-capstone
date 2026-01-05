<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SalesAudit;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use Carbon\Carbon;

class SuspiciousOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates multiple orders from the same customer within a 10-minute window
     * to simulate suspicious order patterns for testing the grouping functionality.
     * 
     * IMPORTANT: Only generates orders for products with available stock to ensure
     * all seeded orders can be approved without validation failures.
     */
    public function run(): void
    {
        $this->command->info('🚨 Creating suspicious order patterns for testing...');
        $this->command->info('');

        // Find customers
        $customers = User::where('type', 'customer')->take(3)->get();
        
        if ($customers->count() < 2) {
            $this->command->error('Not enough customers found. Please create at least 2 customers first.');
            return;
        }

        // Get admin
        $admin = User::where('type', 'admin')->first();

        // Find member with stocks - only members with available stock
        $member = User::where('type', 'member')->whereHas('stocks', function($query) {
            $query->where('quantity', '>', 0)->whereNull('removed_at');
        })->first();

        if (!$member) {
            $this->command->error('No member with available stock found. Please seed products and stocks first.');
            return;
        }

        // Get products with available stocks only
        // Filter products that have at least one stock entry with actual available quantity
        // (quantity - pending_order_qty > 0)
        $products = Product::with(['stocks' => function($query) use ($member) {
            $query->where('member_id', $member->id)
                  ->whereNull('removed_at')
                  ->whereRaw('quantity - pending_order_qty > 0');
        }])->whereHas('stocks', function($query) use ($member) {
            $query->where('member_id', $member->id)
                  ->whereNull('removed_at')
                  ->whereRaw('quantity - pending_order_qty > 0');
        })->take(20)->get();
        
        if ($products->isEmpty()) {
            $this->command->error('No products with available stock found. Please seed products and stocks first.');
            $this->command->info('');
            $this->command->info('⚠️  Skipping suspicious order generation to avoid creating un-approvable orders.');
            return;
        }

        $this->command->info('Found:');
        $this->command->info("  - {$customers->count()} customers");
        $this->command->info("  - {$products->count()} products with available stock");
        $this->command->info('');

        // Scenario 1: Customer 1 - 3 orders within 8 minutes (SUSPICIOUS)
        $this->command->info('📍 Scenario 1: Creating suspicious pattern - 3 orders in 8 minutes');
        $customer1 = $customers[0];
        $baseTime1 = Carbon::now()->subHours(2); // 2 hours ago
        
        $this->createOrder($customer1, $products, $member, $admin, $baseTime1, 'First order');
        $this->createOrder($customer1, $products, $member, $admin, $baseTime1->copy()->addMinutes(5), 'Second order (5 min later)');
        $this->createOrder($customer1, $products, $member, $admin, $baseTime1->copy()->addMinutes(8), 'Third order (8 min later)');
        
        $this->command->info('  ✅ Created 3 orders from ' . $customer1->name . ' within 8 minutes');
        $this->command->info('');

        // Scenario 2: Customer 2 - 4 orders within 9 minutes (SUSPICIOUS)
        if ($customers->count() >= 2) {
            $this->command->info('📍 Scenario 2: Creating suspicious pattern - 4 orders in 9 minutes');
            $customer2 = $customers[1];
            $baseTime2 = Carbon::now()->subHours(5); // 5 hours ago
            
            $this->createOrder($customer2, $products, $member, $admin, $baseTime2, 'First order');
            $this->createOrder($customer2, $products, $member, $admin, $baseTime2->copy()->addMinutes(3), 'Second order (3 min later)');
            $this->createOrder($customer2, $products, $member, $admin, $baseTime2->copy()->addMinutes(6), 'Third order (6 min later)');
            $this->createOrder($customer2, $products, $member, $admin, $baseTime2->copy()->addMinutes(9), 'Fourth order (9 min later)');
            
            $this->command->info('  ✅ Created 4 orders from ' . $customer2->name . ' within 9 minutes');
            $this->command->info('');
        }

        // Scenario 3: Customer 3 - 2 orders within 5 minutes (SUSPICIOUS)
        if ($customers->count() >= 3) {
            $this->command->info('📍 Scenario 3: Creating suspicious pattern - 2 orders in 5 minutes');
            $customer3 = $customers[2];
            $baseTime3 = Carbon::now()->subMinutes(30); // 30 minutes ago
            
            $this->createOrder($customer3, $products, $member, $admin, $baseTime3, 'First order');
            $this->createOrder($customer3, $products, $member, $admin, $baseTime3->copy()->addMinutes(5), 'Second order (5 min later)');
            
            $this->command->info('  ✅ Created 2 orders from ' . $customer3->name . ' within 5 minutes');
            $this->command->info('');
        }

        // Scenario 4: Customer 1 again - 2 orders within 7 minutes (SUSPICIOUS) - Different time period
        $this->command->info('📍 Scenario 4: Creating another suspicious pattern - 2 orders in 7 minutes');
        $baseTime4 = Carbon::now()->subHours(1); // 1 hour ago
        
        $this->createOrder($customer1, $products, $member, $admin, $baseTime4, 'First order (new session)');
        $this->createOrder($customer1, $products, $member, $admin, $baseTime4->copy()->addMinutes(7), 'Second order (7 min later)');
        
        $this->command->info('  ✅ Created 2 more orders from ' . $customer1->name . ' within 7 minutes');
        $this->command->info('');

        // Scenario 5: Normal orders (NOT SUSPICIOUS) - More than 10 minutes apart
        $this->command->info('📍 Scenario 5: Creating normal orders (NOT suspicious) - 15 minutes apart');
        $baseTime5 = Carbon::now()->subHours(3);
        
        $this->createOrder($customer1, $products, $member, $admin, $baseTime5, 'Normal order 1');
        $this->createOrder($customer1, $products, $member, $admin, $baseTime5->copy()->addMinutes(15), 'Normal order 2 (15 min later - NOT grouped)');
        
        $this->command->info('  ✅ Created 2 normal orders (will NOT be grouped as suspicious)');
        $this->command->info('');

        $this->command->info('✅ Suspicious order seeding complete!');
        $this->command->info('');
        $this->command->info('Summary:');
        $this->command->info('  - 4 suspicious order groups created');
        $this->command->info('  - 13 total orders created');
        $this->command->info('  - All orders use products with available stock');
        $this->command->info('  - Groups will be detected on frontend (10-minute window)');
        $this->command->info('');
        $this->command->info('To view:');
        $this->command->info('  - Main orders page: /admin/orders (will show alert)');
        $this->command->info('  - Suspicious orders page: /admin/orders/suspicious');
    }

    /**
     * Create a single order with random products
     * Only uses products with available stock to ensure orders can be approved
     */
    private function createOrder($customer, $products, $member, $admin, $createdAt, $description)
    {
        // Get customer's default address
        $defaultAddress = UserAddress::where('user_id', $customer->id)
            ->where('is_active', true)
            ->first();
        
        if (!$defaultAddress) {
            $this->command->warn("Customer {$customer->name} has no default address. Skipping order.");
            return null;
        }

        // Refresh products to get latest stock quantities (important as pending_order_qty changes)
        $products = $products->fresh(['stocks' => function($query) use ($member) {
            $query->where('member_id', $member->id)
                  ->whereNull('removed_at')
                  ->whereRaw('quantity - pending_order_qty > 0');
        }]);

        // Filter products to only those with actual available stock (considering pending orders)
        $availableProducts = $products->filter(function($product) use ($member) {
            $stock = $product->stocks->where('member_id', $member->id)
                                     ->whereNull('removed_at')
                                     ->first();
            
            if (!$stock) return false;
            
            // Check if there's actual available quantity after pending orders
            $availableQty = $stock->quantity - $stock->pending_order_qty;
            return $availableQty > 0;
        });

        if ($availableProducts->isEmpty()) {
            $this->command->warn("No products with available stock found for order: {$description}");
            return null;
        }

        // Select exactly 1 random product for this order from available products only
        $selectedProducts = $availableProducts->random(1);
        
        $subtotal = 0;
        $orderItems = [];

        // Create order with selected products
        foreach ($selectedProducts as $product) {
            // Refresh stock to get latest quantities
            $stock = Stock::where('product_id', $product->id)
                         ->where('member_id', $member->id)
                         ->whereNull('removed_at')
                         ->first();
            
            if (!$stock) {
                continue; // Skip if stock not found
            }
            
            // Calculate actual available quantity (considering pending orders)
            $availableQty = $stock->quantity - $stock->pending_order_qty;
            
            if ($availableQty <= 0) {
                $this->command->warn("  ⚠️  Product {$product->name} has no available stock (pending orders: {$stock->pending_order_qty})");
                continue; // Skip products without available stock
            }

            // Order exactly 1 unit
            $quantity = 1;
            
            // Determine price and category - use stock's category and match with product price
            $price = 0;
            $category = $stock->category;
            
            // Try to get price based on stock category
            if ($category === 'kilo' && $product->price_kilo > 0) {
                $price = $product->price_kilo;
            } elseif ($category === 'pc' && $product->price_pc > 0) {
                $price = $product->price_pc;
            } elseif ($category === 'tali' && $product->price_tali > 0) {
                $price = $product->price_tali;
            } else {
                // Fallback: use any available price
                if ($product->price_kilo > 0) {
                    $price = $product->price_kilo;
                    $category = 'kilo';
                } elseif ($product->price_pc > 0) {
                    $price = $product->price_pc;
                    $category = 'pc';
                } elseif ($product->price_tali > 0) {
                    $price = $product->price_tali;
                    $category = 'tali';
                }
            }

            if ($price <= 0) {
                $this->command->warn("  ⚠️  Product {$product->name} has no valid price for category {$category}");
                continue;
            }

            $itemTotal = $price * $quantity;
            $subtotal += $itemTotal;

            $orderItems[] = [
                'product' => $product,
                'stock' => $stock,
                'quantity' => $quantity,
                'price' => $price,
                'category' => $category,
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

        // Create the sales audit record
        $order = SalesAudit::create([
            'customer_id' => $customer->id,
            'total_amount' => $totalAmount,
            'subtotal' => $subtotal,
            'coop_share' => $coopShare,
            'member_share' => $memberShare,
            'status' => 'pending',
            'delivery_status' => 'pending',
            'address_id' => $defaultAddress->id,
            'admin_id' => $admin ? $admin->id : null,
            'logistic_id' => null,
            'is_urgent' => false,
            'is_suspicious' => false, // Will be detected on frontend
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);

        // Create audit trail entries
        foreach ($orderItems as $item) {
            AuditTrail::create([
                'sale_id' => $order->id,
                'product_id' => $item['product']->id,
                'stock_id' => $item['stock']->id,
                'member_id' => $item['stock']->member_id,
                'product_name' => $item['product']->name,
                'category' => $item['category'],
                'quantity' => $item['quantity'],
                'price_kilo' => $item['product']->price_kilo,
                'price_pc' => $item['product']->price_pc,
                'price_tali' => $item['product']->price_tali,
                'unit_price' => $item['price'],
                'available_stock_after_sale' => $item['stock']->quantity,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Reserve stock for pending order
            $item['stock']->increment('pending_order_qty', $item['quantity']);
        }

        $this->command->line("    Order #{$order->id}: {$description} - ₱{$totalAmount} - {$createdAt->format('H:i:s')}");
        
        return $order;
    }
}
