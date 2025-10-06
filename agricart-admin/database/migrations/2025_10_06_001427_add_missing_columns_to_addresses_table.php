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
        Schema::table('addresses', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('addresses', 'type')) {
                $table->enum('type', ['home', 'work', 'other'])->default('home');
            }
            if (!Schema::hasColumn('addresses', 'label')) {
                $table->string('label')->nullable();
            }
            if (!Schema::hasColumn('addresses', 'street')) {
                $table->string('street');
            }
            if (!Schema::hasColumn('addresses', 'barangay')) {
                $table->string('barangay');
            }
            if (!Schema::hasColumn('addresses', 'city')) {
                $table->string('city');
            }
            if (!Schema::hasColumn('addresses', 'province')) {
                $table->string('province');
            }
            if (!Schema::hasColumn('addresses', 'postal_code')) {
                $table->string('postal_code');
            }
            if (!Schema::hasColumn('addresses', 'is_default')) {
                $table->boolean('is_default')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'label', 
                'street',
                'barangay',
                'city',
                'province',
                'postal_code',
                'is_default'
            ]);
        });
    }
};
