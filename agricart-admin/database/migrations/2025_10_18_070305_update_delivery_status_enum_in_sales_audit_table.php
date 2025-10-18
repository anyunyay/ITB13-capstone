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
        // Update the delivery_status enum to include the new 'ready_to_pickup' value
        DB::statement("ALTER TABLE sales_audit MODIFY COLUMN delivery_status ENUM('pending', 'ready_to_pickup', 'out_for_delivery', 'delivered') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the delivery_status enum to the original values
        DB::statement("ALTER TABLE sales_audit MODIFY COLUMN delivery_status ENUM('pending', 'out_for_delivery', 'delivered') DEFAULT 'pending'");
    }
};
