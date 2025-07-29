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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->decimal('price_kilo', 10, 2)->nullable();
            $table->decimal('price_pc', 10, 2)->nullable();
            $table->decimal('price_tali', 10, 2)->nullable();
            $table->enum('produce_type', ['fruit', 'vegetable']);
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
