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
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable()->index();
            $table->string('user_email')->nullable();
            $table->string('user_type')->nullable()->index();
            $table->string('action')->index(); // e.g., 'created', 'updated', 'deleted', 'login_failed'
            $table->string('event_type')->index(); // e.g., 'product_management', 'security_event'
            $table->text('details')->nullable(); // Human-readable description
            $table->string('ip_address', 45)->nullable(); // IPv4 or IPv6
            $table->json('context')->nullable(); // Additional structured data
            $table->timestamp('performed_at')->index(); // When the action occurred
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
