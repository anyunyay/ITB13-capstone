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
            if (!Schema::hasColumn('sales', 'customer_received')) {
                $table->boolean('customer_received')->default(false)->after('delivered_at');
            }
            if (!Schema::hasColumn('sales', 'customer_rate')) {
                $table->string('customer_rate')->nullable()->after('customer_received');
            }
            if (!Schema::hasColumn('sales', 'customer_confirmed_at')) {
                $table->timestamp('customer_confirmed_at')->nullable()->after('customer_rate');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['customer_received', 'customer_rate', 'customer_confirmed_at']);
        });
    }
};
