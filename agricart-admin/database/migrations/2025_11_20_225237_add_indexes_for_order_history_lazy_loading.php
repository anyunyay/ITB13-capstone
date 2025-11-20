<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            // Add composite index for customer orders sorted by creation date
            $table->index(['customer_id', 'created_at'], 'idx_sales_audit_customer_created');
            
            // Add index for filtering by customer and status
            $table->index(['customer_id', 'status'], 'idx_sales_audit_customer_status');
            
            // Add index for filtering by customer and delivery status
            $table->index(['customer_id', 'delivery_status'], 'idx_sales_audit_customer_delivery');
        });

        Schema::table('sales', function (Blueprint $table) {
            // Add composite index for customer orders sorted by creation date
            $table->index(['customer_id', 'created_at'], 'idx_sales_customer_created');
            
            // Add composite index for customer orders sorted by delivery date
            $table->index(['customer_id', 'delivered_at'], 'idx_sales_customer_delivered');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropIndex('idx_sales_audit_customer_created');
            $table->dropIndex('idx_sales_audit_customer_status');
            $table->dropIndex('idx_sales_audit_customer_delivery');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('idx_sales_customer_created');
            $table->dropIndex('idx_sales_customer_delivered');
        });
    }
};
