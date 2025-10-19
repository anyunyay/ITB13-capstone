<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Stock;
use App\Models\SalesAudit;
use App\Models\AuditTrail;
use App\Services\AuditTrailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Log;

class MultiMemberAuditTrailTest extends TestCase
{
    use RefreshDatabase;

    public function test_multi_member_order_audit_trail_creation()
    {
        // Create test data with multiple members
        $customer = User::factory()->create(['type' => 'customer']);
        $member1 = User::factory()->create(['type' => 'member', 'name' => 'Member One']);
        $member2 = User::factory()->create(['type' => 'member', 'name' => 'Member Two']);
        $member3 = User::factory()->create(['type' => 'member', 'name' => 'Member Three']);
        
        $product1 = Product::factory()->create([
            'name' => 'Product One',
            'price_kilo' => 100.00
        ]);

        $product2 = Product::factory()->create([
            'name' => 'Product Two',
            'price_kilo' => 150.00
        ]);

        // Create stocks for different members
        $stock1 = Stock::factory()->create([
            'product_id' => $product1->id,
            'member_id' => $member1->id,
            'quantity' => 10.0,
            'category' => 'Kilo'
        ]);

        $stock2 = Stock::factory()->create([
            'product_id' => $product1->id,
            'member_id' => $member2->id,
            'quantity' => 5.0,
            'category' => 'Kilo'
        ]);

        $stock3 = Stock::factory()->create([
            'product_id' => $product2->id,
            'member_id' => $member3->id,
            'quantity' => 8.0,
            'category' => 'Kilo'
        ]);

        // Create sales audit
        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create stock transactions for multi-member order
        $stockTransactions = collect([
            [
                'stock' => $stock1,
                'product' => $product1,
                'quantity_sold' => 7.0,
                'available_stock_after_sale' => 10.0
            ],
            [
                'stock' => $stock2,
                'product' => $product1,
                'quantity_sold' => 3.0,
                'available_stock_after_sale' => 5.0
            ],
            [
                'stock' => $stock3,
                'product' => $product2,
                'quantity_sold' => 5.0,
                'available_stock_after_sale' => 8.0
            ]
        ]);

        // Create audit trails using the service
        $auditTrails = AuditTrailService::createMultiMemberAuditTrails($salesAudit, $stockTransactions);

        // Verify all audit trails were created
        $this->assertCount(3, $auditTrails);

        // Verify each member has separate audit trail entries
        $member1Trails = $auditTrails->where('member_id', $member1->id);
        $member2Trails = $auditTrails->where('member_id', $member2->id);
        $member3Trails = $auditTrails->where('member_id', $member3->id);

        $this->assertCount(1, $member1Trails);
        $this->assertCount(1, $member2Trails);
        $this->assertCount(1, $member3Trails);

        // Verify all entries are linked to the same order
        foreach ($auditTrails as $trail) {
            $this->assertEquals($salesAudit->id, $trail->sale_id);
            $this->assertEquals($salesAudit->id, $trail->order_id);
        }

        // Verify no duplication
        $memberStockCombinations = $auditTrails->map(function ($trail) {
            return $trail->member_id . '_' . $trail->stock_id;
        });
        $this->assertEquals($memberStockCombinations->count(), $memberStockCombinations->unique()->count());
    }

    public function test_multi_member_audit_trail_validation()
    {
        // Create test data
        $customer = User::factory()->create(['type' => 'customer']);
        $member1 = User::factory()->create(['type' => 'member']);
        $member2 = User::factory()->create(['type' => 'member']);
        
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price_kilo' => 100.00
        ]);

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

        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create audit trails for both members
        AuditTrail::create([
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

        AuditTrail::create([
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

        // Test validation with correct members
        $expectedMembers = collect([$member1->id, $member2->id]);
        $validation = AuditTrailService::validateMultiMemberAuditTrails($salesAudit, $expectedMembers);

        $this->assertTrue($validation['is_complete']);
        $this->assertEmpty($validation['missing_members']);
        $this->assertEmpty($validation['duplicate_entries']);
        $this->assertEquals(2, $validation['total_entries']);
        $this->assertCount(2, $validation['member_breakdown']);

        // Test validation with missing member
        $incompleteMembers = collect([$member1->id, $member2->id, 999]); // 999 doesn't exist
        $incompleteValidation = AuditTrailService::validateMultiMemberAuditTrails($salesAudit, $incompleteMembers);

        $this->assertFalse($incompleteValidation['is_complete']);
        $this->assertContains(999, $incompleteValidation['missing_members']);
    }

    public function test_multi_member_order_summary()
    {
        // Create test data
        $customer = User::factory()->create(['type' => 'customer']);
        $member1 = User::factory()->create(['type' => 'member', 'name' => 'Member One']);
        $member2 = User::factory()->create(['type' => 'member', 'name' => 'Member Two']);
        
        $product1 = Product::factory()->create([
            'name' => 'Product One',
            'price_kilo' => 100.00
        ]);

        $product2 = Product::factory()->create([
            'name' => 'Product Two',
            'price_kilo' => 200.00
        ]);

        $stock1 = Stock::factory()->create([
            'product_id' => $product1->id,
            'member_id' => $member1->id,
            'quantity' => 10.0,
            'category' => 'Kilo'
        ]);

        $stock2 = Stock::factory()->create([
            'product_id' => $product2->id,
            'member_id' => $member2->id,
            'quantity' => 5.0,
            'category' => 'Kilo'
        ]);

        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create audit trails
        AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock1->id,
            'member_id' => $member1->id,
            'product_id' => $product1->id,
            'product_name' => $product1->name,
            'category' => 'Kilo',
            'quantity' => 7.0,
            'available_stock_after_sale' => 10.0,
            'price_kilo' => 100.00,
            'unit_price' => 100.00
        ]);

        AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock2->id,
            'member_id' => $member2->id,
            'product_id' => $product2->id,
            'product_name' => $product2->name,
            'category' => 'Kilo',
            'quantity' => 3.0,
            'available_stock_after_sale' => 5.0,
            'price_kilo' => 200.00,
            'unit_price' => 200.00
        ]);

        // Get summary
        $summary = AuditTrailService::getMultiMemberOrderSummary($salesAudit);

        // Verify summary data
        $this->assertEquals($salesAudit->id, $summary['order_id']);
        $this->assertEquals(2, $summary['total_members_involved']);
        $this->assertEquals(2, $summary['total_stock_entries']);
        $this->assertEquals(10.0, $summary['total_quantity_sold']); // 7 + 3
        $this->assertEquals(1300.0, $summary['total_revenue']); // (7 * 100) + (3 * 200)

        // Verify member breakdown
        $this->assertCount(2, $summary['members']);
        $this->assertArrayHasKey($member1->id, $summary['members']);
        $this->assertArrayHasKey($member2->id, $summary['members']);

        // Verify member 1 data
        $member1Data = $summary['members'][$member1->id];
        $this->assertEquals($member1->id, $member1Data['member_id']);
        $this->assertEquals('Member One', $member1Data['member_name']);
        $this->assertEquals(7.0, $member1Data['quantity_sold']);
        $this->assertEquals(700.0, $member1Data['revenue']); // 7 * 100

        // Verify member 2 data
        $member2Data = $summary['members'][$member2->id];
        $this->assertEquals($member2->id, $member2Data['member_id']);
        $this->assertEquals('Member Two', $member2Data['member_name']);
        $this->assertEquals(3.0, $member2Data['quantity_sold']);
        $this->assertEquals(600.0, $member2Data['revenue']); // 3 * 200
    }

    public function test_duplicate_prevention_in_multi_member_orders()
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

        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create first audit trail
        $auditTrail1 = AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock->id,
            'member_id' => $member->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'Kilo',
            'quantity' => 5.0,
            'available_stock_after_sale' => 10.0,
            'price_kilo' => 100.00,
            'unit_price' => 100.00
        ]);

        // Attempt to create duplicate audit trail (same member + stock)
        $auditTrail2 = AuditTrail::create([
            'sale_id' => $salesAudit->id,
            'order_id' => $salesAudit->id,
            'stock_id' => $stock->id,
            'member_id' => $member->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'Kilo',
            'quantity' => 3.0,
            'available_stock_after_sale' => 5.0,
            'price_kilo' => 100.00,
            'unit_price' => 100.00
        ]);

        // Validate - should detect duplicates
        $expectedMembers = collect([$member->id]);
        $validation = AuditTrailService::validateMultiMemberAuditTrails($salesAudit, $expectedMembers);

        $this->assertFalse($validation['is_complete']);
        $this->assertNotEmpty($validation['duplicate_entries']);
    }

    public function test_mixed_member_transaction_completeness()
    {
        // Create a complex multi-member scenario
        $customer = User::factory()->create(['type' => 'customer']);
        $member1 = User::factory()->create(['type' => 'member', 'name' => 'Member One']);
        $member2 = User::factory()->create(['type' => 'member', 'name' => 'Member Two']);
        $member3 = User::factory()->create(['type' => 'member', 'name' => 'Member Three']);
        
        $product1 = Product::factory()->create(['name' => 'Product One', 'price_kilo' => 100.00]);
        $product2 = Product::factory()->create(['name' => 'Product Two', 'price_kilo' => 150.00]);

        // Create multiple stocks for same product from different members
        $stock1 = Stock::factory()->create([
            'product_id' => $product1->id,
            'member_id' => $member1->id,
            'quantity' => 10.0,
            'category' => 'Kilo'
        ]);

        $stock2 = Stock::factory()->create([
            'product_id' => $product1->id,
            'member_id' => $member2->id,
            'quantity' => 5.0,
            'category' => 'Kilo'
        ]);

        $stock3 = Stock::factory()->create([
            'product_id' => $product2->id,
            'member_id' => $member3->id,
            'quantity' => 8.0,
            'category' => 'Kilo'
        ]);

        $salesAudit = SalesAudit::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending'
        ]);

        // Create comprehensive audit trails
        $stockTransactions = collect([
            [
                'stock' => $stock1,
                'product' => $product1,
                'quantity_sold' => 7.0,
                'available_stock_after_sale' => 10.0
            ],
            [
                'stock' => $stock2,
                'product' => $product1,
                'quantity_sold' => 3.0,
                'available_stock_after_sale' => 5.0
            ],
            [
                'stock' => $stock3,
                'product' => $product2,
                'quantity_sold' => 5.0,
                'available_stock_after_sale' => 8.0
            ]
        ]);

        $auditTrails = AuditTrailService::createMultiMemberAuditTrails($salesAudit, $stockTransactions);

        // Verify completeness
        $expectedMembers = collect([$member1->id, $member2->id, $member3->id]);
        $validation = AuditTrailService::validateMultiMemberAuditTrails($salesAudit, $expectedMembers);

        $this->assertTrue($validation['is_complete']);
        $this->assertEquals(3, $validation['total_entries']);
        $this->assertCount(3, $validation['member_breakdown']);

        // Verify all members are accounted for
        $auditedMembers = $auditTrails->pluck('member_id')->unique();
        $this->assertEquals($expectedMembers->sort(), $auditedMembers->sort());

        // Verify all stocks are accounted for
        $auditedStocks = $auditTrails->pluck('stock_id')->unique();
        $expectedStocks = collect([$stock1->id, $stock2->id, $stock3->id]);
        $this->assertEquals($expectedStocks->sort(), $auditedStocks->sort());

        // Verify traceability
        foreach ($auditTrails as $trail) {
            $this->assertEquals($salesAudit->id, $trail->sale_id);
            $this->assertEquals($salesAudit->id, $trail->order_id);
            $this->assertNotNull($trail->member_id);
            $this->assertNotNull($trail->stock_id);
            $this->assertNotNull($trail->product_name);
            $this->assertNotNull($trail->quantity);
            $this->assertNotNull($trail->available_stock_after_sale);
            $this->assertNotNull($trail->created_at);
        }
    }
}
