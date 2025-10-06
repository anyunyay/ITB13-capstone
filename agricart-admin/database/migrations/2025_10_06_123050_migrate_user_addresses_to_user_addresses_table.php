<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserAddress;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing user addresses to the new user_addresses table
        $users = User::whereNotNull('address')
            ->whereNotNull('barangay')
            ->whereNotNull('city')
            ->whereNotNull('province')
            ->get();

        foreach ($users as $user) {
            // Check if user already has addresses in the user_addresses table
            $existingAddress = UserAddress::where('user_id', $user->id)->first();
            
            if (!$existingAddress) {
                UserAddress::create([
                    'user_id' => $user->id,
                    'street' => $user->address,
                    'barangay' => $user->barangay,
                    'city' => $user->city,
                    'province' => $user->province,
                    'is_default' => true,
                    'is_active' => true,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration doesn't need to be reversed as the data will be lost
        // when the columns are removed from the users table
    }
};