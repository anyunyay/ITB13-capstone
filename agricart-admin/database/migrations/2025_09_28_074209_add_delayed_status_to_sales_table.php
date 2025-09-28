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
        Schema::table('sales', function (Blueprint $table) {
            // Modify the status enum to include 'delayed'
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired', 'delayed'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Revert the status enum to exclude 'delayed'
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending')->change();
        });
    }
};