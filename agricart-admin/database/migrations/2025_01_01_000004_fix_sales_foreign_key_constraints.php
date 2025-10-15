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
        Schema::table('sales', function (Blueprint $table) {
            // Add foreign key constraints
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('logistic_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('sales_audit_id')->references('id')->on('sales_audit')->onDelete('set null');
        });

        Schema::table('sales_audit', function (Blueprint $table) {
            // Add foreign key constraint for address_id
            $table->foreign('address_id')->references('id')->on('user_addresses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['logistic_id']);
            $table->dropForeign(['sales_audit_id']);
        });

        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropForeign(['address_id']);
        });
    }
};
