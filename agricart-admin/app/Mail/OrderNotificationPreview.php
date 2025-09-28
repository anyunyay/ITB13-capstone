<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Sales;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\AuditTrail;
use App\Models\MemberEarnings;

class OrderNotificationPreview extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $customer;
    public $admin;
    public $member;
    public $logistic;
    public $product;
    public $stock;
    public $earnings;
    public $type;

    /**
     * Create a new message instance.
     */
    public function __construct($type = 'approval')
    {
        $this->type = $type;
        $this->createTestData();
    }

    /**
     * Build the message.
     */
    public function build()
    {
        switch ($this->type) {
            case 'rejection':
                return $this->buildRejectionEmail();
            case 'new_order':
                return $this->buildNewOrderEmail();
            case 'order_confirmation':
                return $this->buildOrderConfirmationEmail();
            case 'order_status_update':
                return $this->buildOrderStatusUpdateEmail();
            case 'delivery_status_update':
                return $this->buildDeliveryStatusUpdateEmail();
            case 'delivery_task':
                return $this->buildDeliveryTaskEmail();
            case 'product_sale':
                return $this->buildProductSaleEmail();
            case 'earnings_update':
                return $this->buildEarningsUpdateEmail();
            case 'low_stock_alert':
                return $this->buildLowStockAlertEmail();
            case 'inventory_update':
                return $this->buildInventoryUpdateEmail();
            case 'membership_update':
                return $this->buildMembershipUpdateEmail();
            case 'order_delayed':
                return $this->buildOrderDelayedEmail();
            case 'verify_email':
                return $this->buildVerifyEmail();
            default:
                return $this->buildApprovalEmail();
        }
    }

    private function buildApprovalEmail()
    {
        return $this->subject('🎉 Order Approved & Receipt - Order #' . $this->order->id)
            ->view('emails.order-receipt', [
                'order' => $this->order,
                'customer' => $this->customer,
                'admin' => $this->admin,
            ]);
    }

    private function buildRejectionEmail()
    {
        return $this->subject('Order Update - Order #' . $this->order->id . ' (Declined)')
            ->view('emails.order-rejection', [
                'order' => $this->order,
                'customer' => $this->customer,
                'admin' => $this->admin,
            ]);
    }

    private function buildNewOrderEmail()
    {
        $notification = new \App\Notifications\NewOrderNotification($this->order);
        return $notification->toMail($this->admin);
    }

    private function buildOrderConfirmationEmail()
    {
        $notification = new \App\Notifications\OrderConfirmationNotification($this->order);
        return $notification->toMail($this->customer);
    }

    private function buildOrderStatusUpdateEmail()
    {
        $notification = new \App\Notifications\OrderStatusUpdate($this->order->id, 'approved', 'Your order has been approved and is being processed.');
        return $notification->toMail($this->customer);
    }

    private function buildDeliveryStatusUpdateEmail()
    {
        $notification = new \App\Notifications\DeliveryStatusUpdate($this->order, 'out_for_delivery');
        return $notification->toMail($this->customer);
    }

    private function buildDeliveryTaskEmail()
    {
        $notification = new \App\Notifications\DeliveryTaskNotification($this->order);
        return $notification->toMail($this->logistic);
    }

    private function buildProductSaleEmail()
    {
        $notification = new \App\Notifications\ProductSaleNotification($this->stock, $this->order, $this->customer);
        return $notification->toMail($this->member);
    }

    private function buildEarningsUpdateEmail()
    {
        $notification = new \App\Notifications\EarningsUpdateNotification($this->member, $this->earnings);
        return $notification->toMail($this->member);
    }

    private function buildLowStockAlertEmail()
    {
        $notification = new \App\Notifications\LowStockAlertNotification($this->stock);
        return $notification->toMail($this->member);
    }

    private function buildInventoryUpdateEmail()
    {
        $notification = new \App\Notifications\InventoryUpdateNotification($this->product, 'added');
        return $notification->toMail($this->admin);
    }

    private function buildMembershipUpdateEmail()
    {
        $notification = new \App\Notifications\MembershipUpdateNotification($this->member, 'created');
        return $notification->toMail($this->admin);
    }

    private function buildOrderDelayedEmail()
    {
        $notification = new \App\Notifications\OrderDelayedNotification($this->order);
        return $notification->toMail($this->customer);
    }

    private function buildVerifyEmail()
    {
        $notification = new \App\Notifications\VerifyEmailNotification();
        return $notification->toMail($this->customer);
    }

    private function createTestData()
    {
        // Create test customer
        $this->customer = new User([
            'id' => 1,
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'type' => 'customer',
        ]);

        // Create test admin
        $this->admin = new User([
            'id' => 2,
            'name' => 'Admin User',
            'email' => 'admin@agricart.com',
            'type' => 'admin',
        ]);

        // Create test member
        $this->member = new User([
            'id' => 3,
            'name' => 'Jane Farmer',
            'email' => 'jane.farmer@example.com',
            'type' => 'member',
        ]);

        // Create test logistic
        $this->logistic = new User([
            'id' => 4,
            'name' => 'Mike Delivery',
            'email' => 'mike.delivery@example.com',
            'type' => 'logistic',
        ]);

        // Create test product
        $this->product = new Product([
            'id' => 1,
            'name' => 'Fresh Tomatoes',
            'price_kilo' => 120.00,
            'price_pc' => 15.00,
            'price_tali' => 50.00,
        ]);

        // Create test stock
        $this->stock = new Stock([
            'id' => 1,
            'product_id' => 1,
            'member_id' => 3,
            'quantity' => 10,
            'status' => 'available',
        ]);

        // Create test earnings
        $this->earnings = new MemberEarnings([
            'id' => 1,
            'member_id' => 3,
            'total_earnings' => 2500.00,
            'pending_earnings' => 500.00,
            'available_earnings' => 2000.00,
        ]);

        // Create test order
        $this->order = new Sales([
            'id' => 123,
            'customer_id' => 1,
            'admin_id' => 2,
            'total_amount' => 1850.00,
            'status' => $this->type === 'rejection' ? 'rejected' : 'approved',
            'admin_notes' => $this->type === 'rejection' 
                ? 'Unfortunately, we do not have sufficient stock of the requested items at this time. We apologize for any inconvenience caused.' 
                : 'Order approved! Your fresh produce will be delivered within 48 hours. Thank you for choosing AgriCart!',
            'created_at' => now()->subHours(3),
            'updated_at' => now(),
        ]);

        // Create test audit trail
        $auditTrail = collect([
            new AuditTrail([
                'id' => 1,
                'sale_id' => 123,
                'product_id' => 1,
                'stock_id' => 1,
                'quantity' => 5,
                'category' => 'kilo',
                'product' => $this->product,
                'stock' => $this->stock,
            ]),
            new AuditTrail([
                'id' => 2,
                'sale_id' => 123,
                'product_id' => 2,
                'stock_id' => 2,
                'quantity' => 10,
                'category' => 'pc',
                'product' => new Product([
                    'id' => 2,
                    'name' => 'Organic Carrots',
                    'price_kilo' => 80.00,
                    'price_pc' => 8.00,
                    'price_tali' => 30.00,
                ]),
                'stock' => new Stock([
                    'id' => 2,
                    'product_id' => 2,
                    'member_id' => 4,
                    'quantity' => 20,
                    'status' => 'available',
                ]),
            ]),
        ]);

        // Mock the auditTrail relationship
        $this->order->setRelation('auditTrail', $auditTrail);
        $this->order->setRelation('customer', $this->customer);
        $this->order->setRelation('admin', $this->admin);
        
        // Ensure the order has the necessary attributes
        $this->order->id = 123;
        $this->order->total_amount = 1850.00;
        $this->order->status = $this->type === 'rejection' ? 'rejected' : 'approved';
        $this->order->admin_notes = $this->type === 'rejection' 
            ? 'Unfortunately, we do not have sufficient stock of the requested items at this time. We apologize for any inconvenience caused.' 
            : 'Order approved! Your fresh produce will be delivered within 48 hours. Thank you for choosing AgriCart!';
        $this->order->created_at = now()->subHours(3);
        $this->order->updated_at = now();
    }
}
