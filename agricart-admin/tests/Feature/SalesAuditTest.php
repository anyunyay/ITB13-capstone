<?php

namespace Tests\Feature;

use App\Models\SalesAudit;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_audit_model_works()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        
        // Create an address
        $address = UserAddress::create([
            'user_id' => $customer->id,
            'street' => '123 Test Street',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);
        
        // Create a sales audit record
        $salesAudit = SalesAudit::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
            'address_id' => $address->id,
        ]);
        
        // Test the relationship
        $this->assertNotNull($salesAudit->address);
        $this->assertEquals($address->id, $salesAudit->address->id);
        $this->assertEquals($address->street, $salesAudit->address->street);
        
        // Test reverse relationship
        $this->assertTrue($address->salesAudit->contains($salesAudit));
        
        // Verify database has correct data
        $this->assertDatabaseHas('sales_audit', [
            'id' => $salesAudit->id,
            'customer_id' => $customer->id,
            'address_id' => $address->id,
            'status' => 'pending',
        ]);
    }

    public function test_sales_audit_to_sales_relationship()
    {
        // Create a customer
        $customer = User::factory()->customer()->create();
        
        // Create an address
        $address = UserAddress::create([
            'user_id' => $customer->id,
            'street' => '123 Test Street',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);
        
        // Create a sales audit record
        $salesAudit = SalesAudit::create([
            'customer_id' => $customer->id,
            'status' => 'pending',
            'total_amount' => 100,
            'address_id' => $address->id,
        ]);
        
        // Test that the sales audit can have sales records
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $salesAudit->sales);
        $this->assertEquals(0, $salesAudit->sales->count());
        
        // Verify the relationship works
        $this->assertTrue($salesAudit->sales->isEmpty());
    }
}