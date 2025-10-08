<?php

namespace Tests\Unit;

use App\Models\SalesAudit;
use Tests\TestCase;

class SalesAuditModelTest extends TestCase
{
    public function test_sales_audit_model_can_be_instantiated()
    {
        $salesAudit = new SalesAudit();
        $this->assertInstanceOf(SalesAudit::class, $salesAudit);
    }

    public function test_sales_audit_model_has_correct_table()
    {
        $salesAudit = new SalesAudit();
        $this->assertEquals('sales_audit', $salesAudit->getTable());
    }

    public function test_sales_audit_model_has_fillable_attributes()
    {
        $salesAudit = new SalesAudit();
        $expectedFillable = [
            'customer_id',
            'total_amount',
            'status',
            'delivery_status',
            'address_id',
            'admin_id',
            'admin_notes',
            'logistic_id',
            'is_urgent',
        ];
        
        $this->assertEquals($expectedFillable, $salesAudit->getFillable());
    }
}
