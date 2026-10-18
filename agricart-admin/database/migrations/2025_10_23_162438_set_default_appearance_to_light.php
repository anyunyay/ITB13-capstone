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
        // Update existing users with null appearance to 'light'
        DB::table('users')
            ->whereNull('appearance')
            ->update(['appearance' => 'light']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to null (which would default to 'system' in the old behavior)
        DB::table('users')
            ->where('appearance', 'light')
            ->update(['appearance' => null]);
    }
};