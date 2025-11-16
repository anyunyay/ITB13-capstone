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
     */
    public function run(): void
    {
        $this->command->info('🔔 Starting Notification Seeder...');

        // Clear existing notifications
        DB::table('notifications')->delete();
        $this->command->info('✅ Cleared existing notifications');

        // Get users
        $admin = User::where('type', 'admin')->first();
        $staff = User::where('type', 'staff')->first();
        $customer = User::where('type', 'customer')->first();
        $member = User::where('type', 'member')->first();
        $logistic = User::where('type', 'logistic')->first();

        if (!$admin || !$customer || !$member || !$logistic) {
            $this->command->error('❌ Required users not found. Please run UserSeeder first.');
            return;
        }

        // Get sample data
        $order = SalesAudit::first();
        $stock = Stock::first();
        $product = Product::first();

        if (!$order || !$stock || !$product) {
            $this->command->warn('⚠️  Sample order, stock, or product not found. Some notifications may not be created.');
        }

        $notificationCount = 0;

        // ============================================
        // ADMIN/STAFF NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Admin/Staff notifications...');

        if ($order && $admin) {
            // New Order Notification
            $admin->notify(new NewOrderNotification($order));
            $notificationCount++;
            $this->command->info('  ✓ New Order notification');
        }

        if ($stock && $admin && $member) {
            // Inventory Update Notifications
            $admin->notify(new InventoryUpdateNotification($stock, 'added', $member));
            $notificationCount++;
            $this->command->info('  ✓ Inventory Update (added) notification');

            $admin->notify(new InventoryUpdateNotification($stock, 'updated', $member));
            $notificationCount++;
            $this->command->info('  ✓ Inventory Update (updated) notification');

            $admin->notify(new InventoryUpdateNotification($stock, 'removed', $member));
            $notificationCount++;
            $this->command->info('  ✓ Inventory Update (removed) notification');
        }

        if ($member && $admin) {
            // Membership Update Notifications
            $admin->notify(new MembershipUpdateNotification($member, 'added'));
            $notificationCount++;
            $this->command->info('  ✓ Membership Update (added) notification');

            $admin->notify(new MembershipUpdateNotification($member, 'updated'));
            $notificationCount++;
            $this->command->info('  ✓ Membership Update (updated) notification');

            $admin->notify(new MembershipUpdateNotification($member, 'deactivated'));
            $notificationCount++;
            $this->command->info('  ✓ Membership Update (deactivated) notification');

            $admin->notify(new MembershipUpdateNotification($member, 'reactivated'));
            $notificationCount++;
            $this->command->info('  ✓ Membership Update (reactivated) notification');
        }

        if ($admin && $member) {
            // Password Change Request Notification
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

        if ($order && $customer) {
            // Order Confirmation
            $customer->notify(new OrderConfirmationNotification($order));
            $notificationCount++;
            $this->command->info('  ✓ Order Confirmation notification');

            // Order Status Updates
            $customer->notify(new OrderStatusUpdate($order->id, 'approved', 'Your order has been approved and is being processed.'));
            $notificationCount++;
            $this->command->info('  ✓ Order Status Update (approved) notification');

            $customer->notify(new OrderStatusUpdate($order->id, 'processing', 'Your order is being prepared for delivery.'));
            $notificationCount++;
            $this->command->info('  ✓ Order Status Update (processing) notification');

            // Order Ready for Pickup
            $customer->notify(new OrderReadyForPickupNotification($order));
            $notificationCount++;
            $this->command->info('  ✓ Order Ready for Pickup notification');

            // Order Picked Up
            $customer->notify(new OrderPickedUpNotification($order));
            $notificationCount++;
            $this->command->info('  ✓ Order Picked Up notification');

            // Delivery Status Updates
            $customer->notify(new DeliveryStatusUpdate($order->id, 'out_for_delivery', 'Your order is out for delivery!'));
            $notificationCount++;
            $this->command->info('  ✓ Delivery Status Update (out for delivery) notification');

            $customer->notify(new DeliveryStatusUpdate($order->id, 'delivered', 'Your order has been delivered successfully!'));
            $notificationCount++;
            $this->command->info('  ✓ Delivery Status Update (delivered) notification');

            // Order Rejection
            $customer->notify(new OrderRejectionNotification($order));
            $notificationCount++;
            $this->command->info('  ✓ Order Rejection notification');
        }

        // ============================================
        // MEMBER NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Member notifications...');

        if ($stock && $member && $order && $customer) {
            // Product Sale Notification
            $member->notify(new ProductSaleNotification($stock, $order, $customer));
            $notificationCount++;
            $this->command->info('  ✓ Product Sale notification');
        }

        if ($member) {
            // Earnings Update Notification
            $member->notify(new EarningsUpdateNotification(1500.00, 'monthly', [
                'total_sales' => 15000.00,
                'commission_rate' => 0.10,
                'sales_count' => 25,
            ]));
            $notificationCount++;
            $this->command->info('  ✓ Earnings Update notification');
        }

        if ($stock && $member) {
            // Low Stock Alert Notification
            $member->notify(new LowStockAlertNotification($stock, 10));
            $notificationCount++;
            $this->command->info('  ✓ Low Stock Alert notification');

            // Stock Added Notification
            $member->notify(new StockAddedNotification($stock, $admin));
            $notificationCount++;
            $this->command->info('  ✓ Stock Added notification');
        }

        // ============================================
        // LOGISTIC NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Creating Logistic notifications...');

        if ($order && $logistic) {
            // Delivery Task Notification
            $logistic->notify(new DeliveryTaskNotification($order));
            $notificationCount++;
            $this->command->info('  ✓ Delivery Task notification');

            // Order Status Update for Logistic
            $logistic->notify(new OrderStatusUpdate($order->id, 'ready_for_pickup', 'Order is ready for pickup.'));
            $notificationCount++;
            $this->command->info('  ✓ Order Status Update (ready for pickup) notification');
        }

        // ============================================
        // CREATE SOME READ NOTIFICATIONS
        // ============================================
        $this->command->info('📧 Marking some notifications as read...');
        
        $allNotifications = DB::table('notifications')->get();
        $readCount = 0;
        
        if ($allNotifications->count() > 0) {
            $notificationsToMark = $allNotifications->take(ceil($allNotifications->count() / 3));
            
            foreach ($notificationsToMark as $notification) {
                DB::table('notifications')
                    ->where('id', $notification->id)
                    ->update(['read_at' => now()->subHours(rand(1, 48))]);
                $readCount++;
            }
        }

        $this->command->info("  ✓ Marked {$readCount} notifications as read");

        // ============================================
        // SUMMARY
        // ============================================
        $this->command->info('');
        $this->command->info('✅ Notification Seeder completed!');
        $this->command->info("📊 Total notifications created: {$notificationCount}");
        $this->command->info("📖 Read notifications: {$readCount}");
        $this->command->info("📬 Unread notifications: " . ($notificationCount - $readCount));
    }
}
