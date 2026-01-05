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
        Schema::table('stocks', function (Blueprint $table) {
            // Add sold_quantity field to track total quantity sold from this stock
            $table->decimal('sold_quantity', 10, 2)->default(0)->after('quantity');
            
            // Add initial_quantity field to track the original quantity when stock was created
            $table->decimal('initial_quantity', 10, 2)->nullable()->after('sold_quantity');
        });
        
        // Populate initial_quantity for existing stocks
        DB::statement('UPDATE stocks SET initial_quantity = quantity WHERE initial_quantity IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['sold_quantity', 'initial_quantity']);
        });
    }
};