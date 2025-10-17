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
            $table->decimal('subtotal', 10, 2)->default(0.00)->after('total_amount');
            $table->decimal('coop_share', 10, 2)->default(0.00)->after('subtotal');
            $table->decimal('member_share', 10, 2)->default(0.00)->after('coop_share');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'coop_share', 'member_share']);
        });
    }
};
