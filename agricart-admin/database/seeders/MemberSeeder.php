<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates member (farmer) users with sequential member IDs starting from 2411000
     */
    public function run(): void
    {
        // Clear existing member users to avoid conflicts
        User::where('type', 'member')->delete();

        // Define member (farmer) data with sequential member IDs starting from 2411000
        $members = [
            [
                'member_id' => '2411000',
                'name' => 'Sonia Canceran',
                'contact_number' => '09120000001',
                'registration_date' => now()->subDays(60),
                'street' => 'Farm 1, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411001',
                'name' => 'Aurora P. Cervantes',
                'contact_number' => '09120000002',
                'registration_date' => now()->subDays(58),
                'street' => 'Farm 2, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411002',
                'name' => 'Roger Dubos',
                'contact_number' => '09120000003',
                'registration_date' => now()->subDays(56),
                'street' => 'Farm 3, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411003',
                'name' => 'Jouie P. Asido',
                'contact_number' => '09120000004',
                'registration_date' => now()->subDays(54),
                'street' => 'Farm 4, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411004',
                'name' => 'Ronnie Asido',
                'contact_number' => '09120000005',
                'registration_date' => now()->subDays(52),
                'street' => 'Farm 5, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411005',
                'name' => 'Ronaldo L. Comite',
                'contact_number' => '09120000006',
                'registration_date' => now()->subDays(50),
                'street' => 'Farm 6, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411006',
                'name' => 'Sotelia B. Cariod',
                'contact_number' => '09120000007',
                'registration_date' => now()->subDays(48),
                'street' => 'Farm 7, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411007',
                'name' => 'Jell O. Federis',
                'contact_number' => '09120000008',
                'registration_date' => now()->subDays(46),
                'street' => 'Farm 8, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411008',
                'name' => 'Gregorio L. Bando',
                'contact_number' => '09120000009',
                'registration_date' => now()->subDays(44),
                'street' => 'Farm 9, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411009',
                'name' => 'Noel L. Villare',
                'contact_number' => '09120000010',
                'registration_date' => now()->subDays(42),
                'street' => 'Farm 10, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411010',
                'name' => 'Jimmy F. Santiago',
                'contact_number' => '09120000011',
                'registration_date' => now()->subDays(40),
                'street' => 'Farm 11, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'member_id' => '2411011',
                'name' => 'Cristina R. Rogel',
                'contact_number' => '09120000012',
                'registration_date' => now()->subDays(38),
                'street' => 'Farm 12, Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
        ];

        // Create each member
        foreach ($members as $memberData) {
            $member = User::create([
                'type' => 'member',
                'name' => $memberData['name'],
                'email' => null, // No email for members - they use member_id for login
                'member_id' => $memberData['member_id'],
                'contact_number' => $memberData['contact_number'],
                'registration_date' => $memberData['registration_date'],
                'document' => 'https://via.placeholder.com/640x480.png?text=member',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(), // Members are considered verified by default
                'active' => true,
                'is_default' => false,
            ]);

            // Create address for member
            UserAddress::create([
                'user_id' => $member->id,
                'street' => $memberData['street'],
                'barangay' => $memberData['barangay'],
                'city' => $memberData['city'],
                'province' => $memberData['province'],
                'is_active' => true,
            ]);
        }
    }
}
