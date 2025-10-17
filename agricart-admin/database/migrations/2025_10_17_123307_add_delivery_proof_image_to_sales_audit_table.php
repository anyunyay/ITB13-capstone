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
            $table->string('delivery_proof_image')->nullable()->after('picked_up_at');
            $table->boolean('delivery_confirmed')->default(false)->after('delivery_proof_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropColumn(['delivery_proof_image', 'delivery_confirmed']);
        });
    }
};
