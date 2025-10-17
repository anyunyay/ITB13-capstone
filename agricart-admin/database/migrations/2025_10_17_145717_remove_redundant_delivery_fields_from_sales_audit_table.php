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
            $table->dropColumn([
                'ready_for_pickup',
                'ready_for_pickup_at',
                'picked_up',
                'picked_up_at'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->boolean('ready_for_pickup')->default(false);
            $table->timestamp('ready_for_pickup_at')->nullable();
            $table->boolean('picked_up')->default(false);
            $table->timestamp('picked_up_at')->nullable();
        });
    }
};
