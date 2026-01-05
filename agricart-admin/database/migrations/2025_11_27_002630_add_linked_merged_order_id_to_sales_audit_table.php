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
            $table->unsignedBigInteger('linked_merged_order_id')->nullable()->after('suspicious_reason');
            $table->foreign('linked_merged_order_id')->references('id')->on('sales_audit')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropForeign(['linked_merged_order_id']);
            $table->dropColumn('linked_merged_order_id');
        });
    }
};
