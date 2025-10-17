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
            $table->timestamp('delivery_packed_time')->nullable()->after('delivery_status');
            $table->timestamp('delivered_time')->nullable()->after('delivery_packed_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropColumn(['delivery_packed_time', 'delivered_time']);
        });
    }
};