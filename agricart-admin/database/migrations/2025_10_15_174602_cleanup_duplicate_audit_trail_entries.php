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
        // Remove audit trail entries that are duplicates of removed stocks
        // These are entries with negative quantities and no sale_id
        DB::table('audit_trails')
            ->whereNull('sale_id')
            ->where('quantity', '<', 0)
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration removes data, so we can't reverse it
        // The removed audit trail entries would need to be recreated manually if needed
    }
};