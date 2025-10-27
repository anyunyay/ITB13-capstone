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
        Schema::create('stock_trails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('member_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null'); // Admin/staff who performed the action
            $table->string('action_type'); // 'created', 'updated', 'removed', 'restored'
            $table->decimal('old_quantity', 10, 2)->nullable();
            $table->decimal('new_quantity', 10, 2)->nullable();
            $table->string('category')->nullable();
            $table->text('notes')->nullable(); // For removal reasons or other notes
            $table->string('performed_by_type')->nullable(); // 'admin', 'staff', 'system'
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index('stock_id');
            $table->index('product_id');
            $table->index('action_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_trails');
    }
};
