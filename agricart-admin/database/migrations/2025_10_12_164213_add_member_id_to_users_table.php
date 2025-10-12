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
        // Check if member_id column already exists
        if (!Schema::hasColumn('users', 'member_id')) {
            Schema::table('users', function (Blueprint $table) {
                // Add member_id column for members only
                $table->string('member_id')->nullable()->unique()->after('id');
            });
        }

        // Generate member IDs for existing members starting from 2411001
        $existingMembers = \App\Models\User::where('type', 'member')->whereNull('member_id')->get();
        $memberIdCounter = 2411001;
        
        foreach ($existingMembers as $member) {
            $member->update(['member_id' => (string)$memberIdCounter]);
            $memberIdCounter++;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('member_id');
        });
    }
};
