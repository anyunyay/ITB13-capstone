<?php

namespace Tests\Unit;

use App\Models\SalesAudit;
use App\Models\Sales;
use Tests\TestCase;

class FactoryTest extends TestCase
{
    public function test_sales_audit_factory_works()
    {
        $salesAudit = SalesAudit::factory()->create();
        
        $this->assertInstanceOf(SalesAudit::class, $salesAudit);
        $this->assertNotNull($salesAudit->customer_id);
        $this->assertNotNull($salesAudit->address_id);
        $this->assertNotNull($salesAudit->total_amount);
        $this->assertNotNull($salesAudit->status);
    }

    public function test_delivered_sales_factory_works()
    {
        $sales = Sales::factory()->create();
        
        $this->assertInstanceOf(Sales::class, $sales);
        $this->assertNotNull($sales->customer_id);
        $this->assertNotNull($sales->delivery_address);
        $this->assertNotNull($sales->total_amount);
        $this->assertNotNull($sales->delivered_at);
    }
}
