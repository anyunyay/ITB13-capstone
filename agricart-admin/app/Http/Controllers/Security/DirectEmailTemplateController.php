<?php

namespace App\Http\Controllers\Security;

use Illuminate\Http\Request;
use App\Models\Sales;
use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\MemberEarnings;
use App\Models\AuditTrail;

class DirectEmailTemplateController extends \App\Http\Controllers\Controller
{
    /**
     * Show all email templates in a direct view
     */
    public function index()
    {
        $testData = $this->createTestData();
        
        return view('emails.direct-templates.index', [
            'testData' => $testData
        ]);
    }

    /**
     * Show a specific email template directly
     */
    public function show($type)
    {
        $testData = $this->createTestData();
        
        return view("emails.direct-templates.{$type}", [
            'testData' => $testData
        ]);
    }

    /**
     * Create comprehensive test data for all templates
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
        $order = new Sales([
            'id' => 123,
            'customer_id' => 1,
            'admin_id' => 2,
            'total_amount' => 1850.00,
            'status' => 'approved',
            'admin_notes' => 'Order approved! Your fresh produce will be delivered within 48 hours.',
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
                'product' => $product,
                'stock' => $stock,
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

        // Set relationships
        $order->setRelation('auditTrail', $auditTrail);
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
