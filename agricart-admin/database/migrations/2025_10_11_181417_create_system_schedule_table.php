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
        Schema::create('system_schedule', function (Blueprint $table) {
            $table->id();
            $table->date('system_date')->unique(); // Current system date
            $table->boolean('is_locked')->default(false); // Whether customers are locked out
            $table->enum('admin_action', ['pending', 'keep_prices', 'price_change'])->default('pending'); // Admin decision
            $table->enum('price_change_status', ['pending', 'cancelled', 'approved'])->nullable(); // Status after price change decision
            $table->timestamp('lockout_time')->nullable(); // When lockout was initiated
            $table->timestamp('admin_action_time')->nullable(); // When admin made decision
            $table->timestamp('price_change_action_time')->nullable(); // When admin clicked cancel/good to go
            $table->unsignedBigInteger('admin_user_id')->nullable(); // Which admin made the decision
            $table->timestamps();
            
            $table->foreign('admin_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_schedule');
    }
};
