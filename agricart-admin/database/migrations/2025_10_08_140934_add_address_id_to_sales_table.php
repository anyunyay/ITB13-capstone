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
            // Add foreign key to user_addresses table
            $table->foreignId('address_id')->nullable()->after('delivery_address')->constrained('user_addresses')->onDelete('set null');
            
            // Add index for better query performance
            $table->index('address_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['address_id']);
            $table->dropIndex(['address_id']);
            $table->dropColumn('address_id');
        });
    }
};
