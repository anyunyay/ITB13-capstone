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
            $table->decimal('price_kilo', 10, 2)->nullable()->after('quantity');
            $table->decimal('price_pc', 10, 2)->nullable()->after('price_kilo');
            $table->decimal('price_tali', 10, 2)->nullable()->after('price_pc');
            $table->decimal('unit_price', 10, 2)->nullable()->after('price_tali');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_trails', function (Blueprint $table) {
            $table->dropColumn(['price_kilo', 'price_pc', 'price_tali', 'unit_price']);
        });
    }
};
