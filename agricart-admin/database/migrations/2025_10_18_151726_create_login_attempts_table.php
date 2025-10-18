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
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('identifier'); // email or member_id
            $table->string('user_type'); // customer, admin, staff, member, logistic
            $table->string('ip_address');
            $table->integer('failed_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();

            // Index for efficient lookups
            $table->index(['identifier', 'user_type']);
            $table->index(['ip_address']);
            $table->index(['locked_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};