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
        Schema::table('audit_trails', function (Blueprint $table) {
            // Add member tracking fields
            $table->foreignId('member_id')->nullable()->constrained('users')->onDelete('cascade')->after('stock_id');
            $table->string('product_name')->nullable()->after('member_id');
            $table->decimal('available_stock_after_sale', 10, 2)->nullable()->after('quantity');
            $table->foreignId('order_id')->nullable()->constrained('sales_audit')->onDelete('cascade')->after('sale_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_trails', function (Blueprint $table) {
            $table->dropForeign(['member_id']);
            $table->dropForeign(['order_id']);
            $table->dropColumn(['member_id', 'product_name', 'available_stock_after_sale', 'order_id']);
        });
    }
};