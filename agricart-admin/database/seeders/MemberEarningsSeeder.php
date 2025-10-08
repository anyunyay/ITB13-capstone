<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MemberEarnings;
use Illuminate\Database\Seeder;

class MemberEarningsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all members
        $members = User::where('type', 'member')->get();
        
        foreach ($members as $member) {
            // Create member earnings record if it doesn't exist
            MemberEarnings::firstOrCreate(
                ['member_id' => $member->id],
                [
                    'total_earnings' => 0,
                    'pending_earnings' => 0,
                    'available_earnings' => 0,
                ]
            );
        }
    }
}

