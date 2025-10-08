<?php

namespace Tests\Unit;

use App\Models\Sales;
use Tests\TestCase;

class SalesModelTest extends TestCase
{
    public function test_sales_model_can_be_instantiated()
    {
        $sales = new Sales();
        $this->assertInstanceOf(Sales::class, $sales);
    }

    public function test_sales_model_has_correct_table()
    {
        $sales = new Sales();
        $this->assertEquals('sales', $sales->getTable());
    }

    public function test_sales_model_has_fillable_attributes()
    {
        $sales = new Sales();
        $expectedFillable = [
            'customer_id',
            'total_amount',
            'delivery_address',
            'admin_id',
            'admin_notes',
            'logistic_id',
            'sales_audit_id',
            'delivered_at',
        ];
        
        $this->assertEquals($expectedFillable, $sales->getFillable());
    }
}
