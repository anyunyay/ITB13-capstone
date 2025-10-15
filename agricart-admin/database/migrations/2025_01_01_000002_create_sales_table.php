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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->text('delivery_address')->nullable(); // Plain text address for delivered items
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('logistic_id')->nullable();
            $table->unsignedBigInteger('sales_audit_id')->nullable();
            $table->timestamp('delivered_at')->nullable(); // When the delivery was completed
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('customer_id');
            $table->index('delivered_at');
            $table->index('sales_audit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
