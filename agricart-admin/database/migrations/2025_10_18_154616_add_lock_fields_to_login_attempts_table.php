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
        Schema::table('login_attempts', function (Blueprint $table) {
            $table->integer('lock_level')->default(0)->after('failed_attempts');
            $table->timestamp('lock_expires_at')->nullable()->after('lock_level');
            
            // Update the locked_until column to be nullable since we'll use lock_expires_at
            $table->timestamp('locked_until')->nullable()->change();
            
            // Add index for efficient lock queries
            $table->index(['lock_expires_at']);
            $table->index(['lock_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('login_attempts', function (Blueprint $table) {
            $table->dropIndex(['lock_expires_at']);
            $table->dropIndex(['lock_level']);
            $table->dropColumn(['lock_level', 'lock_expires_at']);
        });
    }
};