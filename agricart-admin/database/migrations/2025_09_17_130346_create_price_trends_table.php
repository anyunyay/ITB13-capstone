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
        Schema::create('price_trends', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->date('date');
            $table->decimal('price_per_kg', 10, 2)->nullable();
            $table->decimal('price_per_tali', 10, 2)->nullable();
            $table->decimal('price_per_pc', 10, 2)->nullable();
            $table->string('unit_type'); // 'kg','tali' or 'pc'
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index(['product_name', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_trends');
    }
};
