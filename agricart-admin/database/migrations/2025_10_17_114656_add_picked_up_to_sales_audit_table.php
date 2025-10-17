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
            $table->boolean('picked_up')->default(false)->after('ready_for_pickup_at');
            $table->timestamp('picked_up_at')->nullable()->after('picked_up');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropColumn(['picked_up', 'picked_up_at']);
        });
    }
};
