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
        Schema::create('system_tracking', function (Blueprint $table) {
            $table->id();
            $table->enum('status', ['scheduled', 'active', 'completed', 'cancelled'])->default('scheduled');
            $table->enum('action', ['system_down', 'system_up', 'maintenance', 'price_update'])->default('system_down');
            $table->timestamp('scheduled_at');
            $table->timestamp('executed_at')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Store additional data like admin_user_id, etc.
            $table->timestamps();
            
            $table->index(['status', 'scheduled_at']);
            $table->index(['action', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_tracking');
    }
};
