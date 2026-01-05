<?php

namespace App\Http\Controllers\Security;

use Illuminate\Http\Request;
use App\Models\SalesAudit;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\MemberEarnings;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderConfirmationNotification;
use App\Notifications\OrderStatusUpdate;
use App\Notifications\DeliveryStatusUpdate;
use App\Notifications\DeliveryTaskNotification;
use App\Notifications\ProductSaleNotification;
use App\Notifications\EarningsUpdateNotification;
use App\Notifications\LowStockAlertNotification;
use App\Notifications\InventoryUpdateNotification;
use App\Notifications\MembershipUpdateNotification;
use App\Notifications\OrderDelayedNotification;
use App\Notifications\VerifyEmailNotification;

class ComprehensiveEmailPreviewController extends \App\Http\Controllers\Controller
{
    /**
     * Show the comprehensive email preview index page
     */
    public function index()
    {
        return view('emails.preview.comprehensive');
    }

    /**
     * Preview any notification type using actual notification classes
     */
    public function preview($type)
    {
        $testData = $this->createTestData();
        
        try {
            switch ($type) {
                case 'new_order':
                    $notification = new NewOrderNotification($testData['order']);
                    return $notification->toMail($testData['admin'])->render();
                    
                case 'order_confirmation':
                    $notification = new OrderConfirmationNotification($testData['order']);
                    return $notification->toMail($testData['customer'])->render();
                    
                case 'order_status_update':
                    $notification = new OrderStatusUpdate($testData['order']->id, 'approved', 'Your order has been approved and is being processed.');
                    return $notification->toMail($testData['customer'])->render();
                    
                case 'delivery_status_update':
                    $notification = new DeliveryStatusUpdate($testData['order']->id, 'out_for_delivery', 'Your order is now out for delivery.');
                    return $notification->toMail($testData['customer'])->render();
                    
                case 'delivery_task':
                    $notification = new DeliveryTaskNotification($testData['order']);
                    return $notification->toMail($testData['logistic'])->render();
                    
                case 'product_sale':
                    $notification = new ProductSaleNotification($testData['stock'], $testData['order'], $testData['customer']);
                    return $notification->toMail($testData['member'])->render();
                    
                case 'earnings_update':
                    $notification = new EarningsUpdateNotification($testData['member'], $testData['earnings']);
                    return $notification->toMail($testData['member'])->render();
                    
                case 'low_stock_alert':
                    $notification = new LowStockAlertNotification($testData['stock']);
                    return $notification->toMail($testData['member'])->render();
                    
                case 'inventory_update':
                    $notification = new InventoryUpdateNotification($testData['stock'], 'added');
                    return $notification->toMail($testData['admin'])->render();
                    
                case 'membership_update':
                    $notification = new MembershipUpdateNotification($testData['member'], 'created');
                    return $notification->toMail($testData['admin'])->render();
                    
                case 'order_delayed':
                    $notification = new OrderDelayedNotification($testData['order']);
                    return $notification->toMail($testData['customer'])->render();
                    
                case 'verify_email':
                    $notification = new VerifyEmailNotification();
                    return $notification->toMail($testData['customer'])->render();
                    
                default:
                    return response()->view('emails.error', ['message' => 'Email type not found'], 404);
            }
        } catch (\Exception $e) {
            return response()->view('emails.error', [
                'message' => 'Error generating email preview: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all available notification types
     */
    public function types()
    {
        $types = [
            'new_order' => 'New Order Notification',
            'order_confirmation' => 'Order Confirmation',
            'order_status_update' => 'Order Status Update',
            'delivery_status_update' => 'Delivery Status Update',
            'delivery_task' => 'Delivery Task Assignment',
            'product_sale' => 'Product Sale Notification',
            'earnings_update' => 'Earnings Update',
            'low_stock_alert' => 'Low Stock Alert',
            'inventory_update' => 'Inventory Update',
            'membership_update' => 'Membership Update',
            'order_delayed' => 'Order Delayed',
            'verify_email' => 'Email Verification',
        ];

        return response()->json($types);
    }

    /**
     * Create test data for email previews
     */
    private function createTestData()
    {
        // Create test customer
        $customer = new User([
            'id' => 1,
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'type' => 'customer',
        ]);

        // Create test admin
        $admin = new User([
            'id' => 2,
            'name' => 'Admin User',
            'email' => 'admin@agricart.com',
            'type' => 'admin',
        ]);

        // Create test member
        $member = new User([
            'id' => 3,
            'name' => 'Jane Farmer',
            'email' => 'jane.farmer@example.com',
            'type' => 'member',
        ]);

        // Create test logistic
        $logistic = new User([
            'id' => 4,
            'name' => 'Mike Delivery',
            'email' => 'mike.delivery@example.com',
            'type' => 'logistic',
        ]);

        // Create test product
        $product = new Product([
            'id' => 1,
            'name' => 'Fresh Tomatoes',
            'price_kilo' => 120.00,
            'price_pc' => 15.00,
            'price_tali' => 50.00,
        ]);

        // Create test stock
        $stock = new Stock([
            'id' => 1,
            'product_id' => 1,
            'member_id' => 3,
            'quantity' => 10,
            'status' => 'available',
        ]);

        // Create test earnings
        $earnings = new MemberEarnings([
            'id' => 1,
            'member_id' => 3,
            'total_earnings' => 2500.00,
            'pending_earnings' => 500.00,
            'available_earnings' => 2000.00,
        ]);

        // Create test order
        $order = new SalesAudit([
            'id' => 123,
            'customer_id' => 1,
            'admin_id' => 2,
            'total_amount' => 1850.00,
            'status' => 'approved',
            'admin_notes' => 'Order approved! Your fresh produce will be delivered within 48 hours.',
            'created_at' => now()->subHours(3),
            'updated_at' => now(),
        ]);

        // Set relationships
        $order->setRelation('customer', $customer);
        $order->setRelation('admin', $admin);
        $stock->setRelation('product', $product);
        $stock->setRelation('member', $member);

        return [
            'customer' => $customer,
            'admin' => $admin,
            'member' => $member,
            'logistic' => $logistic,
            'product' => $product,
            'stock' => $stock,
            'earnings' => $earnings,
            'order' => $order,
        ];
    }
}
