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
        // First, find and drop any foreign key constraints that might be using the unique index
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'user_addresses' 
            AND CONSTRAINT_NAME != 'PRIMARY'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");
        
        // Drop foreign key constraints
        foreach ($foreignKeys as $fk) {
            DB::statement("ALTER TABLE user_addresses DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
        }
        
        // Now drop the unique constraint and column
        DB::statement('ALTER TABLE user_addresses DROP INDEX unique_default_address');
        DB::statement('ALTER TABLE user_addresses DROP COLUMN is_default');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_addresses', function (Blueprint $table) {
            // Add back the is_default column
            $table->boolean('is_default')->default(false)->after('province');
            
            // Add back the unique constraint
            $table->unique(['user_id', 'is_default'], 'unique_default_address');
        });
    }
};