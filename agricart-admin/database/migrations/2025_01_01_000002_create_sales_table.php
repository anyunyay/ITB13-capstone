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
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->decimal('subtotal', 10, 2)->default(0.00);
            $table->decimal('coop_share', 10, 2)->default(0.00);
            $table->decimal('member_share', 10, 2)->default(0.00);
            $table->text('delivery_address')->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('admin_notes')->nullable();
            $table->foreignId('logistic_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('sales_audit_id')->nullable()->constrained('sales_audit')->onDelete('set null');
            $table->timestamp('delivered_at')->nullable();
            $table->boolean('customer_received')->default(false);
            $table->string('customer_rate')->nullable();
            $table->text('customer_feedback')->nullable();
            $table->timestamp('customer_confirmed_at')->nullable();
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
