<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditTrailTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_trail_creation_with_comprehensive_data()
    {
        // Create test data
        $customer = User::factory()->create(['type' => 'customer']);
        $member = User::factory()->create(['type' => 'member']);
        
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price_kilo' => 100.00
        ]);

        $stock = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member->id,
            'quantity' => 10.0,
            'category' => 'Kilo'
        ]);

        // Create sales audit
        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create comprehensive audit trail entry
        $auditTrail = AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock->id,
            'member_id' => $member->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'Kilo',
            'quantity' => 5.0,
            'available_stock_after_sale' => 10.0, // Before deduction
            'price_kilo' => 100.00,
            'price_pc' => 50.00,
            'price_tali' => 25.00,
            'unit_price' => 100.00
        ]);

        // Verify audit trail data accuracy
        $this->assertEquals($member->id, $auditTrail->member_id);
        $this->assertEquals($product->name, $auditTrail->product_name);
        $this->assertEquals(5.0, $auditTrail->quantity);
        $this->assertEquals($salesAudit->id, $auditTrail->order_id);
        $this->assertNotNull($auditTrail->created_at);

        // Verify relationships
        $this->assertEquals($member->id, $auditTrail->member->id);
        $this->assertEquals($product->id, $auditTrail->product->id);
        $this->assertEquals($stock->id, $auditTrail->stock->id);
        $this->assertEquals($salesAudit->id, $auditTrail->order->id);
    }

    public function test_multiple_members_same_order_audit_trail()
    {
        // Create test data
        $customer = User::factory()->create(['type' => 'customer']);
        $member1 = User::factory()->create(['type' => 'member']);
        $member2 = User::factory()->create(['type' => 'member']);
        
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price_kilo' => 100.00
        ]);

        // Create stocks for different members
        $stock1 = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member1->id,
            'quantity' => 10.0,
            'category' => 'Kilo'
        ]);

        $stock2 = Stock::factory()->create([
            'product_id' => $product->id,
            'member_id' => $member2->id,
            'quantity' => 5.0,
            'category' => 'Kilo'
        ]);

        // Create sales audit
        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create audit trails for both members
        $auditTrail1 = AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock1->id,
            'member_id' => $member1->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'Kilo',
            'quantity' => 7.0,
            'available_stock_after_sale' => 10.0,
            'price_kilo' => 100.00,
            'unit_price' => 100.00
        ]);

        $auditTrail2 = AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock2->id,
            'member_id' => $member2->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'Kilo',
            'quantity' => 3.0,
            'available_stock_after_sale' => 5.0,
            'price_kilo' => 100.00,
            'unit_price' => 100.00
        ]);

        // Verify both audit trails are linked to the same order
        $this->assertEquals($salesAudit->id, $auditTrail1->order_id);
        $this->assertEquals($salesAudit->id, $auditTrail2->order_id);

        // Verify different members are tracked
        $this->assertEquals($member1->id, $auditTrail1->member_id);
        $this->assertEquals($member2->id, $auditTrail2->member_id);

        // Verify different stocks are tracked
        $this->assertEquals($stock1->id, $auditTrail1->stock_id);
        $this->assertEquals($stock2->id, $auditTrail2->stock_id);

        // Verify quantities are tracked separately
        $this->assertEquals(7.0, $auditTrail1->quantity);
        $this->assertEquals(3.0, $auditTrail2->quantity);

        // Verify both entries have timestamps
        $this->assertNotNull($auditTrail1->created_at);
        $this->assertNotNull($auditTrail2->created_at);
    }

}
