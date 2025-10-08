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
        // Add the foreign key constraints with unique names
        Schema::table('sales', function (Blueprint $table) {
            $table->foreign('customer_id', 'sales_customer_id_fk')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id', 'sales_admin_id_fk')->references('id')->on('users')->onDelete('set null');
            $table->foreign('logistic_id', 'sales_logistic_id_fk')->references('id')->on('users')->onDelete('set null');
            $table->foreign('sales_audit_id', 'sales_sales_audit_id_fk')->references('id')->on('sales_audit')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign('sales_customer_id_fk');
            $table->dropForeign('sales_admin_id_fk');
            $table->dropForeign('sales_logistic_id_fk');
            $table->dropForeign('sales_sales_audit_id_fk');
        });
    }
};
