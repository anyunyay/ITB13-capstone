<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Sales;
use App\Models\SalesAudit;
use App\Models\Stock;
use App\Models\Product;
use App\Models\PasswordChangeRequest;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderConfirmationNotification;
use App\Notifications\OrderStatusUpdate;
use App\Notifications\OrderRejectionNotification;
use App\Notifications\DeliveryStatusUpdate;
use App\Notifications\ProductSaleNotification;
use App\Notifications\EarningsUpdateNotification;
use App\Notifications\LowStockAlertNotification;
use App\Notifications\StockAddedNotification;
use App\Notifications\InventoryUpdateNotification;
use App\Notifications\MembershipUpdateNotification;
use App\Notifications\PasswordChangeRequestNotification;
use App\Notifications\DeliveryTaskNotification;
use App\Notifications\OrderReadyForPickupNotification;
use App\Notifications\OrderPickedUpNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder should run AFTER:
     * - RoleSeeder
     * - UserSeeder (creates admin, staff, customer, member, logistic users)
     * - ProductSeeder (creates products)
     * - StockSeeder (creates stocks for members)
     * - ComprehensiveSalesSeeder (creates sales/orders)
     * - MemberEarningsSeeder (creates earnings records)
     * 
     * This matches the real application flow where notifications are created
     * after the actual events (orders, stock changes, etc.) occur.
     */
    public function run(): void
    {
        $this->command->info('🔔 Starting Notification Seeder...');
        $this->command->info('📋 This seeder creates sample notifications for all user types');
        $this->command->info('');

        // Clear existing notifications
        DB::table('notifications')->delete();
        $this->command->info('✅ Cleared existing notifications');

        // Get users - matching the real application user types
        $admin = User::where('type', 'admin')->first();
        $staff = User::where('type', 'staff')->first();
        $customer = User::where('type', 'customer')->first();
        $members = User::where('type', 'member')->get();
        $logistics = User::where('type', 'logistic')->get();

        if (!$admin || !$customer || $members->isEmpty() || $logistics->isEmpty()) {
            $this->command->error('❌ Required users not found. Please run UserSeeder first.');
            $this->command->error('   Expected: admin, customer, member(s), logistic(s)');
            return;
        }

        $member = $members->first();
        $logistic = $logistics->first();

        // Get sample data from seeded records
        $orders = SalesAudit::with('customer')->limit(5)->get();
        $stocks = Stock::with('member', 'product')->limit(5)->get();
        $products = Product::limit(5)->get();

        if ($orders->isEmpty() || $stocks->isEmpty() || $products->isEmpty()) {
            $this->command->warn('⚠️  Sample data not found. Some notifications may not be created.');
            $this->command->warn('   Make sure to run: ProductSeeder, StockSeeder, ComprehensiveSalesSeeder first');
        }

        $order = $orders->first();
        $stock = $stocks->first();
        $product = $products->first();

        $notificationCount = 0;

        // ============================================
        // ADMIN/STAFF NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Admin/Staff notifications...');

        // New Order Notifications - Create for multiple orders to simulate real usage
        if (!$orders->isEmpty() && $admin) {
            foreach ($orders->take(3) as $orderItem) {
                $admin->notify(new NewOrderNotification($orderItem));
                $notificationCount++;
            }
            $this->command->info('  ✓ New Order notifications (3)');
            
            // Also notify staff if exists
            if ($staff) {
                $staff->notify(new NewOrderNotification($order));
                $notificationCount++;
                $this->command->info('  ✓ New Order notification (staff)');
            }
        }

        // Inventory Update Notifications - Use different stocks for variety
        if (!$stocks->isEmpty() && $admin) {
            foreach ($stocks->take(3) as $index => $stockItem) {
                $actions = ['added', 'updated', 'removed'];
                $action = $actions[$index % 3];
                $admin->notify(new InventoryUpdateNotification($stockItem, $action, $stockItem->member));
                $notificationCount++;
            }
            $this->command->info('  ✓ Inventory Update notifications (3)');
        }

        // Membership Update Notifications - Use different members
        if (!$members->isEmpty() && $admin) {
            $memberActions = ['added', 'updated', 'deactivated', 'reactivated'];
            foreach ($members->take(4) as $index => $memberItem) {
                $action = $memberActions[$index % 4];
                $admin->notify(new MembershipUpdateNotification($memberItem, $action));
                $notificationCount++;
            }
            $this->command->info('  ✓ Membership Update notifications (4)');
        }

        // Password Change Request Notification
        if ($admin && $member) {
            $passwordChangeRequest = PasswordChangeRequest::create([
                'member_id' => $member->id,
                'member_identifier' => $member->member_id ?? 'TEST001',
                'status' => 'pending',
                'token' => \Illuminate\Support\Str::random(60),
                'expires_at' => now()->addHours(24),
            ]);
            $admin->notify(new PasswordChangeRequestNotification($passwordChangeRequest));
            $notificationCount++;
            $this->command->info('  ✓ Password Change Request notification');
        }

        // ============================================
        // CUSTOMER NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Customer notifications...');

        if (!$orders->isEmpty() && $customer) {
            // Create notifications for the first order (full lifecycle)
            $firstOrder = $orders->first();
            
            // Order Confirmation
            $customer->notify(new OrderConfirmationNotification($firstOrder));
            $notificationCount++;
            
            // Order Status Updates
            $customer->notify(new OrderStatusUpdate($firstOrder->id, 'approved', 'Your order has been approved and is being processed.'));
            $notificationCount++;
            
            $customer->notify(new OrderStatusUpdate($firstOrder->id, 'processing', 'Your order is being prepared for delivery.'));
            $notificationCount++;
            
            // Order Ready for Pickup
            $customer->notify(new OrderReadyForPickupNotification($firstOrder));
            $notificationCount++;
            
            // Order Picked Up
            $customer->notify(new OrderPickedUpNotification($firstOrder));
            $notificationCount++;
            
            // Delivery Status Updates
            $customer->notify(new DeliveryStatusUpdate($firstOrder->id, 'out_for_delivery', 'Your order is out for delivery!'));
            $notificationCount++;
            
            $customer->notify(new DeliveryStatusUpdate($firstOrder->id, 'delivered', 'Your order has been delivered successfully!'));
            $notificationCount++;
            
            $this->command->info('  ✓ Order lifecycle notifications (7) for Order #' . $firstOrder->id);
            
            // Create rejection notification for second order if exists
            if ($orders->count() > 1) {
                $secondOrder = $orders->skip(1)->first();
                $customer->notify(new OrderRejectionNotification($secondOrder));
                $notificationCount++;
                $this->command->info('  ✓ Order Rejection notification for Order #' . $secondOrder->id);
            }
        }

        // ============================================
        // MEMBER NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Member notifications...');

        // Create notifications for each member to simulate real usage
        foreach ($members as $memberItem) {
            $memberStocks = Stock::where('member_id', $memberItem->id)->limit(2)->get();
            
            if ($memberStocks->isNotEmpty()) {
                $memberStock = $memberStocks->first();
                
                // Product Sale Notification - if order exists
                if (!$orders->isEmpty()) {
                    $saleOrder = $orders->first();
                    $memberItem->notify(new ProductSaleNotification($memberStock, $saleOrder, $customer));
                    $notificationCount++;
                }
                
                // Low Stock Alert Notification
                $memberItem->notify(new LowStockAlertNotification($memberStock, 10));
                $notificationCount++;
                
                // Stock Added Notification
                $memberItem->notify(new StockAddedNotification($memberStock, $admin));
                $notificationCount++;
            }
            
            // Earnings Update Notification - for all members
            $memberItem->notify(new EarningsUpdateNotification(1500.00, 'monthly', [
                'total_sales' => 15000.00,
                'commission_rate' => 0.10,
                'sales_count' => 25,
            ]));
            $notificationCount++;
        }
        
        $this->command->info('  ✓ Member notifications created for ' . $members->count() . ' member(s)');

        // ============================================
        // LOGISTIC NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Logistic notifications...');

        // Create notifications for each logistic user
        if (!$orders->isEmpty()) {
            foreach ($logistics as $logisticUser) {
                // Assign different orders to different logistics
                $assignedOrders = $orders->take(2);
                
                foreach ($assignedOrders as $assignedOrder) {
                    // Delivery Task Notification
                    $logisticUser->notify(new DeliveryTaskNotification($assignedOrder));
                    $notificationCount++;
                    
                    // Order Status Update for Logistic
                    $logisticUser->notify(new OrderStatusUpdate($assignedOrder->id, 'ready_for_pickup', 'Order is ready for pickup.'));
                    $notificationCount++;
                }
            }
            $this->command->info('  ✓ Logistic notifications created for ' . $logistics->count() . ' logistic user(s)');
        }

        // ============================================
        // CREATE SOME READ NOTIFICATIONS
        // ============================================
        $this->command->info('');
        $this->command->info('📧 Marking some notifications as read (simulating user activity)...');
        
        $allNotifications = DB::table('notifications')->get();
        $readCount = 0;
        
        if ($allNotifications->count() > 0) {
            // Mark approximately 40% of notifications as read (more realistic)
            $markCount = min(
                ceil($allNotifications->count() * 0.4),
                $allNotifications->count()
            );
            
            $notificationsToMark = $allNotifications->random($markCount);
            
            foreach ($notificationsToMark as $notification) {
                // Vary the read times to simulate realistic user behavior
                $hoursAgo = rand(1, 72); // Read between 1-72 hours ago
                DB::table('notifications')
                    ->where('id', $notification->id)
                    ->update(['read_at' => now()->subHours($hoursAgo)]);
                $readCount++;
            }
        }

        $this->command->info("  ✓ Marked {$readCount} notifications as read");

        // ============================================
        // SUMMARY
        // ============================================
        $this->command->info('');
        $this->command->info('✅ Notification Seeder completed successfully!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info("📊 Total notifications created: {$notificationCount}");
        $this->command->info("📖 Read notifications: {$readCount}");
        $this->command->info("📬 Unread notifications: " . ($notificationCount - $readCount));
        $this->command->info('');
        $this->command->info('📋 Notification breakdown:');
        $this->command->info('   • Admin/Staff: New orders, inventory updates, membership changes');
        $this->command->info('   • Customers: Order confirmations, status updates, delivery tracking');
        $this->command->info('   • Members: Product sales, earnings updates, stock alerts');
        $this->command->info('   • Logistics: Delivery tasks, pickup notifications');
        $this->command->info('');
        $this->command->info('💡 These notifications match the real application flow and can be');
        $this->command->info('   viewed by logging in as different user types.');
    }
}
