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
        Schema::create('sales_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->decimal('subtotal', 10, 2)->default(0.00);
            $table->decimal('coop_share', 10, 2)->default(0.00);
            $table->decimal('member_share', 10, 2)->default(0.00);
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired', 'delayed', 'cancelled'])->default('pending');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('admin_notes')->nullable();
            $table->boolean('is_urgent')->default(false);
            $table->foreignId('logistic_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('delivery_status', ['pending', 'ready_to_pickup', 'out_for_delivery', 'delivered'])->nullable();
            $table->timestamp('delivery_ready_time')->nullable();
            $table->timestamp('delivery_packed_time')->nullable();
            $table->timestamp('delivered_time')->nullable();
            $table->string('delivery_proof_image')->nullable();
            $table->boolean('delivery_confirmed')->default(false);
            $table->unsignedBigInteger('address_id')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('address_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_audit');
    }
};
