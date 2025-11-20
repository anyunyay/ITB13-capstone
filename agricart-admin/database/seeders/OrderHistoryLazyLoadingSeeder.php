<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\Product;
use App\Models\Stock;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderHistoryLazyLoadingSeeder extends Seeder
{
    /**
     * Seed orders specifically for testing the lazy loading Order History system.
     * 
     * Creates at least 20 orders per customer with:
     * - Realistic timestamps (created_at & updated_at)
     * - Various statuses (pending, approved, rejected, delayed, cancelled, delivered)
     * - Proper sorting (latest updated_at first)
     * - Recent modifications to simulate admin updates
     * - Related audit trails, stock updates, and notifications
     */
    public function run(): void
    {
        $this->command->info('🚀 Seeding Order History for Lazy Loading System...');

        // Disable notification events during seeding
        \Illuminate\Support\Facades\Event::fake([
            \Illuminate\Notifications\Events\NotificationSending::class,
            \Illuminate\Notifications\Events\NotificationSent::class,
        ]);

        // Get required entities
        $admin = User::where('type', 'admin')->first();
        $logistics = User::where('type', 'logistic')->get();
        $customer = User::where('type', 'customer')->first();
        $members = User::where('type', 'member')->get();

        if (!$admin || !$customer || $members->isEmpty() || $logistics->isEmpty()) {
            $this->command->error('❌ Required users not found. Please run UserSeeder first.');
            return;
        }

        $customerAddress = UserAddress::where('user_id', $customer->id)->where('is_active', true)->first();
        if (!$customerAddress) {
            $this->command->error('❌ Customer address not found.');
            return;
        }

        // Get products with available stock
        $products = Product::with(['stocks' => function($query) {
            $query->where('quantity', '>', 0)->whereNull('removed_at');
        }])->whereHas('stocks', function($query) {
            $query->where('quantity', '>', 0)->whereNull('removed_at');
        })->get();

        if ($products->isEmpty()) {
            $this->command->error('❌ No products with available stock found. Please run ProductSeeder and StockSeeder first.');
            return;
        }

        $this->command->info("📦 Found {$products->count()} products with available stock");
        $this->command->info("👤 Creating orders for customer: {$customer->name}");

        // Create orders with different scenarios
        $totalOrders = 0;

        // 1. Recently Updated Orders (3-5 orders) - These appear at the top
        $this->command->info("\n📝 Creating recently updated orders...");
        $totalOrders += $this->createRecentlyUpdatedOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 5);

        // 2. Pending Orders (4-6 orders) - Awaiting approval
        $this->command->info("\n⏳ Creating pending orders...");
        $totalOrders += $this->createPendingOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 5);

        // 3. Out for Delivery Orders (3-4 orders) - Ready or in transit
        $this->command->info("\n🚚 Creating out for delivery orders...");
        $totalOrders += $this->createOutForDeliveryOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 4);

        // 4. Delivered Orders (5-7 orders) - Completed recently
        $this->command->info("\n✅ Creating delivered orders...");
        $totalOrders += $this->createDeliveredOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 6);

        // 5. Historical Orders (5-10 orders) - Older completed orders
        $this->command->info("\n📚 Creating historical orders...");
        $totalOrders += $this->createHistoricalOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 8);

        // 6. Rejected/Cancelled Orders (2-3 orders) - Failed orders
        $this->command->info("\n❌ Creating rejected/cancelled orders...");
        $totalOrders += $this->createRejectedOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 3);

        $this->command->info("\n✨ Successfully created {$totalOrders} orders for lazy loading testing!");
        $this->command->info("📊 Orders are sorted by updated_at DESC for proper lazy loading behavior");
        $this->command->info("🔄 First 4 orders will appear on initial page load");
    }

    /**
     * Create recently updated orders (simulate admin modifications)
     * These will appear at the top of the list
     */
    private function createRecentlyUpdatedOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        $created = 0;
        
        for ($i = 0; $i < $count; $i++) {
            // Created a few days ago, but updated very recently
            $createdAt = Carbon::now()->subDays(rand(2, 7))->subHours(rand(0, 23));
            $updatedAt = Carbon::now()->subMinutes(rand(5, 120)); // Updated within last 2 hours

            $statuses = [
                ['status' => 'approved', 'delivery_status' => 'ready_to_pickup'],
                ['status' => 'approved', 'delivery_status' => 'out_for_delivery'],
                ['status' => 'approved', 'delivery_status' => 'delivered'],
                ['status' => 'pending', 'delivery_status' => 'pending'],
            ];

            $statusData = $statuses[array_rand($statuses)];

            $order = $this->createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, array_merge($statusData, [
                'admin_notes' => 'Recently updated by admin',
            ]));

            if ($order) {
                // Manually update the updated_at timestamp
                DB::table('sales_audit')
                    ->where('id', $order->id)
                    ->update(['updated_at' => $updatedAt]);

                $created++;
                $this->command->info("  ✓ Order #{$order->id} - Updated {$updatedAt->diffForHumans()} - Status: {$statusData['status']}");
            }
        }

        return $created;
    }

    /**
     * Create pending orders awaiting approval
     */
    private function createPendingOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        $created = 0;

        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subHours(rand(1, 48));

            // Some orders might be delayed (over 24 hours)
            $isDelayed = $createdAt->diffInHours(now()) > 24;

            $order = $this->createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => $isDelayed ? 'delayed' : 'pending',
                'delivery_status' => 'pending',
                'admin_id' => null, // Not assigned yet
                'logistic_id' => null,
            ]);

            if ($order) {
                $created++;
                $status = $isDelayed ? 'delayed' : 'pending';
                $this->command->info("  ✓ Order #{$order->id} - Created {$createdAt->diffForHumans()} - Status: {$status}");
            }
        }

        return $created;
    }

    /**
     * Create orders that are out for delivery
     */
    private function createOutForDeliveryOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        $created = 0;

        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subHours(rand(6, 36));
            $readyAt = $createdAt->copy()->addHours(rand(2, 8));

            $deliveryStatuses = ['ready_to_pickup', 'out_for_delivery'];
            $deliveryStatus = $deliveryStatuses[array_rand($deliveryStatuses)];

            $order = $this->createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'approved',
                'delivery_status' => $deliveryStatus,
                'delivery_ready_time' => $readyAt,
                'delivery_packed_time' => $deliveryStatus === 'out_for_delivery' ? $readyAt->copy()->addMinutes(30) : null,
            ]);

            if ($order) {
                $created++;
                $this->command->info("  ✓ Order #{$order->id} - Created {$createdAt->diffForHumans()} - Status: {$deliveryStatus}");
            }
        }

        return $created;
    }

    /**
     * Create recently delivered orders
     */
    private function createDeliveredOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        $created = 0;

        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subDays(rand(1, 7))->subHours(rand(0, 23));
            $deliveredAt = $createdAt->copy()->addHours(rand(12, 48));
            $confirmedAt = rand(0, 1) ? $deliveredAt->copy()->addHours(rand(1, 24)) : null;

            $order = $this->createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'approved',
                'delivery_status' => 'delivered',
                'delivered_time' => $deliveredAt,
                'delivery_confirmed' => $confirmedAt ? true : false,
            ]);

            if ($order && $confirmedAt) {
                // Create Sales record for confirmed deliveries
                $this->createSalesRecord($order, $deliveredAt, $confirmedAt);
                $this->command->info("  ✓ Order #{$order->id} - Delivered {$deliveredAt->diffForHumans()} - Confirmed: Yes");
            } elseif ($order) {
                $this->command->info("  ✓ Order #{$order->id} - Delivered {$deliveredAt->diffForHumans()} - Confirmed: No");
            }

            if ($order) $created++;
        }

        return $created;
    }

    /**
     * Create historical orders from previous weeks/months
     */
    private function createHistoricalOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        $created = 0;

        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subWeeks(rand(2, 12))->subDays(rand(0, 6));
            $deliveredAt = $createdAt->copy()->addDays(rand(1, 3));
            $confirmedAt = $deliveredAt->copy()->addHours(rand(2, 72));

            $order = $this->createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'approved',
                'delivery_status' => 'delivered',
                'delivered_time' => $deliveredAt,
                'delivery_confirmed' => true,
            ]);

            if ($order) {
                // Create Sales record
                $this->createSalesRecord($order, $deliveredAt, $confirmedAt, [
                    'customer_rate' => rand(3, 5),
                    'customer_feedback' => $this->getRandomFeedback(),
                ]);

                $created++;
                $rating = isset($order->customer_rate) ? $order->customer_rate : 'N/A';
                $this->command->info("  ✓ Order #{$order->id} - Delivered {$deliveredAt->format('M j, Y')} - Rating: {$rating}");
            }
        }

        return $created;
    }

    /**
     * Create rejected or cancelled orders
     */
    private function createRejectedOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        $created = 0;

        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subDays(rand(1, 14))->subHours(rand(0, 23));
            $rejectedAt = $createdAt->copy()->addHours(rand(2, 24));

            $statuses = ['rejected', 'cancelled'];
            $status = $statuses[array_rand($statuses)];

            $order = $this->createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => $status,
                'delivery_status' => null,
                'admin_notes' => $status === 'rejected' ? 'Insufficient stock available' : 'Cancelled by customer request',
            ]);

            if ($order) {
                // Update the updated_at to reflect when it was rejected/cancelled
                DB::table('sales_audit')
                    ->where('id', $order->id)
                    ->update(['updated_at' => $rejectedAt]);

                $created++;
                $this->command->info("  ✓ Order #{$order->id} - {$status} {$rejectedAt->diffForHumans()}");
            }
        }

        return $created;
    }

    /**
     * Create a single order with audit trails
     */
    private function createOrder($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, $overrides = [])
    {
        // Select 1-4 random products
        $selectedProducts = $products->random(rand(1, min(4, $products->count())));
        
        $subtotal = 0;
        $orderItems = [];

        foreach ($selectedProducts as $product) {
            $availableStocks = $product->stocks->filter(function($stock) {
                return $stock->quantity > 0 && is_null($stock->removed_at);
            });
            
            if ($availableStocks->isEmpty()) continue;

            $stock = $availableStocks->random();
            $maxQuantity = min(5, max(1, (int)$stock->quantity - 1));
            if ($maxQuantity < 1) continue;
            
            $quantity = rand(1, $maxQuantity);
            $price = $this->getProductPrice($product, $stock->category);
            $itemTotal = $price * $quantity;
            $subtotal += $itemTotal;

            $orderItems[] = [
                'product' => $product,
                'stock' => $stock,
                'quantity' => $quantity,
                'price' => $price,
                'total' => $itemTotal,
            ];
        }

        if (empty($orderItems)) {
            return null;
        }

        // Calculate financial breakdown
        $coopShare = $subtotal * 0.10;
        $memberShare = $subtotal;
        $totalAmount = $subtotal + $coopShare;

        $defaults = [
            'customer_id' => $customer->id,
            'total_amount' => $totalAmount,
            'subtotal' => $subtotal,
            'coop_share' => $coopShare,
            'member_share' => $memberShare,
            'status' => 'pending',
            'delivery_status' => 'pending',
            'address_id' => $customerAddress->id,
            'admin_id' => $admin->id,
            'logistic_id' => $logistics->random()->id ?? null,
            'is_urgent' => rand(0, 10) > 8, // 20% chance of urgent
            'delivery_confirmed' => false,
        ];

        $orderData = array_merge($defaults, $overrides);
        $orderData['created_at'] = $createdAt;
        $orderData['updated_at'] = $createdAt;

        $order = SalesAudit::create($orderData);

        // Create audit trail entries
        foreach ($orderItems as $item) {
            AuditTrail::create([
                'sale_id' => $order->id,
                'order_id' => $order->id,
                'product_id' => $item['product']->id,
                'stock_id' => $item['stock']->id,
                'member_id' => $item['stock']->member_id,
                'product_name' => $item['product']->name,
                'category' => $item['stock']->category,
                'quantity' => $item['quantity'],
                'available_stock_after_sale' => max(0, $item['stock']->quantity - $item['quantity']),
                'price_kilo' => $item['product']->price_kilo,
                'price_pc' => $item['product']->price_pc,
                'price_tali' => $item['product']->price_tali,
                'unit_price' => $item['price'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Update stock for approved orders only
            if ($order->status === 'approved' && !$item['stock']->isLocked()) {
                $item['stock']->decrement('quantity', $item['quantity']);
                $item['stock']->increment('sold_quantity', $item['quantity']);
            }
        }

        return $order;
    }

    /**
     * Create a Sales record for delivered orders
     */
    private function createSalesRecord($salesAudit, $deliveredAt, $confirmedAt = null, $overrides = [])
    {
        $deliveryAddress = null;
        if ($salesAudit->address) {
            $address = $salesAudit->address;
            $deliveryAddress = sprintf(
                '%s, %s, %s, %s',
                $address->street ?? '',
                $address->barangay ?? '',
                $address->city ?? '',
                $address->province ?? ''
            );
        }

        $defaults = [
            'customer_id' => $salesAudit->customer_id,
            'total_amount' => $salesAudit->total_amount,
            'subtotal' => $salesAudit->subtotal,
            'coop_share' => $salesAudit->coop_share,
            'member_share' => $salesAudit->member_share,
            'delivery_address' => $deliveryAddress,
            'admin_id' => $salesAudit->admin_id,
            'logistic_id' => $salesAudit->logistic_id,
            'sales_audit_id' => $salesAudit->id,
            'delivered_at' => $deliveredAt,
            'customer_received' => $confirmedAt ? true : false,
            'customer_confirmed_at' => $confirmedAt,
        ];

        $salesData = array_merge($defaults, $overrides);
        $salesData['created_at'] = $salesAudit->created_at;
        $salesData['updated_at'] = $confirmedAt ?? $deliveredAt;

        return Sales::create($salesData);
    }

    /**
     * Get product price by category
     */
    private function getProductPrice($product, $category)
    {
        return match($category) {
            'Kilo' => $product->price_kilo ?? 0,
            'Pc' => $product->price_pc ?? 0,
            'Tali' => $product->price_tali ?? 0,
            default => 0,
        };
    }

    /**
     * Get random customer feedback
     */
    private function getRandomFeedback()
    {
        $feedbacks = [
            'Excellent quality! Will definitely order again.',
            'Fresh vegetables, arrived quickly.',
            'Good packaging and timing.',
            'Very satisfied with the produce.',
            'Great service and quality products.',
            'Products were fresh and delivered on time.',
            'Happy with the order, thank you!',
            'Good quality items, will recommend.',
            'Fast delivery and fresh produce.',
            'Excellent customer service and quality.',
        ];

        return $feedbacks[array_rand($feedbacks)];
    }
}
