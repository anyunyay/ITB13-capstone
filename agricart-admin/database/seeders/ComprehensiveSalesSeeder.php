<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\Product;
use App\Models\Stock;
use Carbon\Carbon;

class ComprehensiveSalesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to avoid conflicts
        Sales::query()->delete();
        SalesAudit::query()->delete();
        AuditTrail::query()->delete();

        // Get all necessary entities
        $admin = User::where('type', 'admin')->first();
        $logistics = User::where('type', 'logistic')->get();
        $customer = User::where('type', 'customer')->first();
        $members = User::where('type', 'member')->get();

        if (!$admin || !$customer || $members->isEmpty() || $logistics->isEmpty()) {
            $this->command->error('Required users not found. Please seed users first.');
            return;
        }

        $customerAddress = UserAddress::where('user_id', $customer->id)->where('is_active', true)->first();
        if (!$customerAddress) {
            $this->command->error('Customer address not found.');
            return;
        }

        // Get products with available stock from any member
        $products = Product::with(['stocks' => function($query) {
            $query->where('quantity', '>', 0);
        }])->whereHas('stocks', function($query) {
            $query->where('quantity', '>', 0);
        })->get();

        if ($products->isEmpty()) {
            $this->command->error('No products with available stock found.');
            return;
        }

        $this->command->info("Creating comprehensive sales data for {$members->count()} members with proper relationships...");

        // Create realistic sales scenarios with different statuses and delivery states
        $this->createCompletedOrdersWithDelivery($customer, $customerAddress, $products, $admin, $logistics, $members, 5);
        $this->createApprovedOrdersReadyForDelivery($customer, $customerAddress, $products, $admin, $logistics, $members, 3);
        $this->createPendingOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 4);
        $this->createHistoricalOrders($customer, $customerAddress, $products, $admin, $logistics, $members, 8);

        $this->command->info('✅ Created comprehensive sales data with proper table relationships!');
    }

    /**
     * Create completed orders with delivery confirmations
     */
    private function createCompletedOrdersWithDelivery($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subDays(rand(1, 10));
            $deliveredAt = $createdAt->copy()->addHours(rand(12, 36));
            $confirmedAt = $deliveredAt->copy()->addHours(rand(2, 24));

            $order = $this->createSalesAudit($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'approved',
                'delivery_status' => 'delivered',
                'delivered_time' => $deliveredAt,
                'delivery_confirmed' => true,
            ]);

            if ($order) {
                // Create corresponding Sales record
                $sales = $this->createSalesRecord($order, $deliveredAt, $confirmedAt);
                
                $this->command->info("Created completed order #{$order->id} - Delivered: {$deliveredAt->format('M j, Y')} - Total: ₱{$order->total_amount}");
            }
        }
    }

    /**
     * Create approved orders ready for delivery
     */
    private function createApprovedOrdersReadyForDelivery($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subHours(rand(2, 24));
            $readyAt = $createdAt->copy()->addHours(rand(2, 8));

            $order = $this->createSalesAudit($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'approved',
                'delivery_status' => 'ready_to_pickup',
                'delivery_ready_time' => $readyAt,
            ]);

            if ($order) {
                $this->command->info("Created ready order #{$order->id} - Ready: {$readyAt->format('M j, H:i')} - Total: ₱{$order->total_amount}");
            }
        }
    }

    /**
     * Create pending orders awaiting approval
     */
    private function createPendingOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subHours(rand(1, 12));

            $order = $this->createSalesAudit($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'pending',
                'delivery_status' => 'pending',
                'admin_id' => null, // No admin assigned yet
            ]);

            if ($order) {
                $this->command->info("Created pending order #{$order->id} - Created: {$createdAt->format('M j, H:i')} - Total: ₱{$order->total_amount}");
            }
        }
    }

    /**
     * Create historical orders from previous weeks/months
     */
    private function createHistoricalOrders($customer, $customerAddress, $products, $admin, $logistics, $members, $count)
    {
        for ($i = 0; $i < $count; $i++) {
            $createdAt = Carbon::now()->subWeeks(rand(1, 8))->subHours(rand(0, 23));
            $deliveredAt = $createdAt->copy()->addDays(rand(1, 3));
            $confirmedAt = $deliveredAt->copy()->addHours(rand(1, 48));

            $order = $this->createSalesAudit($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, [
                'status' => 'approved',
                'delivery_status' => 'delivered',
                'delivered_time' => $deliveredAt,
                'delivery_confirmed' => true,
            ]);

            if ($order) {
                // Create corresponding Sales record
                $sales = $this->createSalesRecord($order, $deliveredAt, $confirmedAt, [
                    'customer_rate' => rand(4, 5),
                    'customer_feedback' => $this->getRandomFeedback(),
                ]);
                
                $this->command->info("Created historical order #{$order->id} - Delivered: {$deliveredAt->format('M j, Y')} - Total: ₱{$order->total_amount}");
            }
        }
    }

    /**
     * Create a SalesAudit record with proper financial calculations
     */
    private function createSalesAudit($customer, $customerAddress, $products, $admin, $logistics, $members, $createdAt, $overrides = [])
    {
        // Select 1-4 random products for realistic order sizes
        $selectedProducts = $products->random(rand(1, 4));
        
        $subtotal = 0;
        $orderItems = [];

        // Calculate order items and totals from available stocks across all members
        foreach ($selectedProducts as $product) {
            $availableStocks = $product->stocks->where('quantity', '>', 0);
            
            if ($availableStocks->isEmpty()) continue;

            // Randomly select a stock from available ones (could be from any member)
            $stock = $availableStocks->random();
            
            $maxQuantity = min(5, (int)$stock->quantity); // Don't order more than available
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
        $coopShare = $subtotal * 0.10; // 10% co-op share
        $memberShare = $subtotal; // Member gets 100% of subtotal
        $totalAmount = $subtotal + $coopShare; // Customer pays subtotal + co-op share

        // Default values
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
            'is_urgent' => false,
            'delivery_confirmed' => false,
        ];

        $orderData = array_merge($defaults, $overrides);
        $orderData['created_at'] = $createdAt;
        $orderData['updated_at'] = $createdAt;

        // Create the sales audit record
        $order = SalesAudit::create($orderData);

        // Create audit trail entries with proper stock tracking
        foreach ($orderItems as $item) {
            $availableStockAfter = $item['stock']->quantity - $item['quantity'];
            
            AuditTrail::create([
                'sale_id' => $order->id,
                'order_id' => $order->id,
                'product_id' => $item['product']->id,
                'stock_id' => $item['stock']->id,
                'member_id' => $item['stock']->member_id,
                'product_name' => $item['product']->name,
                'category' => $item['stock']->category,
                'quantity' => $item['quantity'],
                'available_stock_after_sale' => max(0, $availableStockAfter),
                'price_kilo' => $item['product']->price_kilo,
                'price_pc' => $item['product']->price_pc,
                'price_tali' => $item['product']->price_tali,
                'unit_price' => $item['price'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Update stock quantities to reflect the sale
            if ($order->status === 'approved') {
                $item['stock']->decrement('quantity', $item['quantity']);
                $item['stock']->increment('sold_quantity', $item['quantity']);
            }
        }

        return $order;
    }

    /**
     * Create a Sales record linked to the SalesAudit
     */
    private function createSalesRecord($salesAudit, $deliveredAt, $confirmedAt = null, $overrides = [])
    {
        // Get the full address string
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
     * Get the appropriate price for a product based on category
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
