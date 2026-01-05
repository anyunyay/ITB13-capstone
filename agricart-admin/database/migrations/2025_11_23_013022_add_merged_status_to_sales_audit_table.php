<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use Laravel's Schema builder which handles PostgreSQL enums properly
        Schema::table('sales_audit', function (Blueprint $table) {
            // Drop the existing enum column and recreate it with the new values
            $table->dropColumn('status');
        });
        
        Schema::table('sales_audit', function (Blueprint $table) {
            // Add the column back with the new enum values
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired', 'delayed', 'cancelled', 'merged'])
                  ->default('pending')
                  ->after('member_share');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_audit', function (Blueprint $table) {
            // Drop the column and recreate with original values
            $table->dropColumn('status');
        });
        
        Schema::table('sales_audit', function (Blueprint $table) {
            // Add back the original enum values
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired', 'delayed', 'cancelled'])
                  ->default('pending')
                  ->after('member_share');
        });
    }
};
