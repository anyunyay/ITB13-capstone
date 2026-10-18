<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Note: Admin user is now created in RoleSeeder to ensure proper role assignment
        
        // Get roles for assignment
        $logisticRole = Role::where('name', 'logistic')->first();
        $customerRole = Role::where('name', 'customer')->first();
        
        // Cabuyao areas for assignment
        $cabuyaoAreas = [
            'Baclaran',
            'Banay-Banay',
            'Banlic',
            'Butong',
            'Bigaa',
            'Casile',
            'Gulod',
            'Mamatid',
            'Marinig',
            'Niugan',
            'Pittland',
            'Pulo',
            'Sala',
            'San Isidro',
            'Diezmo',
            'Barangay Uno (Poblacion)',
            'Barangay Dos (Poblacion)',
            'Barangay Tres (Poblacion)',
        ];

        // Create logistics users with assigned areas
        $logisticsData = [
            ['name' => 'Logistic 1', 'email' => 'logistic1@logistic.com', 'area' => 'Sala'],
            ['name' => 'Logistic 2', 'email' => 'logistic2@logistic.com', 'area' => 'Pulo'],
            ['name' => 'Logistic 3', 'email' => 'logistic3@logistic.com', 'area' => 'Baclaran'],
            ['name' => 'Logistic 4', 'email' => 'logistic4@logistic.com', 'area' => 'Banay-Banay'],
            ['name' => 'Logistic 5', 'email' => 'logistic5@logistic.com', 'area' => 'Banlic'],
            ['name' => 'Logistic 6', 'email' => 'logistic6@logistic.com', 'area' => 'Butong'],
            ['name' => 'Logistic 7', 'email' => 'logistic7@logistic.com', 'area' => 'Bigaa'],
            ['name' => 'Logistic 8', 'email' => 'logistic8@logistic.com', 'area' => 'Casile'],
            ['name' => 'Logistic 9', 'email' => 'logistic9@logistic.com', 'area' => 'Gulod'],
            ['name' => 'Logistic 10', 'email' => 'logistic10@logistic.com', 'area' => 'Mamatid'],
            ['name' => 'Logistic 11', 'email' => 'logistic11@logistic.com', 'area' => 'Marinig'],
            ['name' => 'Logistic 12', 'email' => 'logistic12@logistic.com', 'area' => 'Niugan'],
            ['name' => 'Logistic 13', 'email' => 'logistic13@logistic.com', 'area' => 'Pittland'],
            ['name' => 'Logistic 14', 'email' => 'logistic14@logistic.com', 'area' => 'San Isidro'],
            ['name' => 'Logistic 15', 'email' => 'logistic15@logistic.com', 'area' => 'Diezmo'],
            ['name' => 'Logistic 16', 'email' => 'logistic16@logistic.com', 'area' => 'Barangay Uno (Poblacion)'],
            ['name' => 'Logistic 17', 'email' => 'logistic17@logistic.com', 'area' => 'Barangay Dos (Poblacion)'],
            ['name' => 'Logistic 18', 'email' => 'logistic18@logistic.com', 'area' => 'Barangay Tres (Poblacion)'],
            ['name' => 'Logistic 19', 'email' => 'logistic19@logistic.com', 'area' => 'Sala'],
            ['name' => 'Logistic 20', 'email' => 'logistic20@logistic.com', 'area' => 'Pulo'],
            ['name' => 'Logistic 21', 'email' => 'logistic21@logistic.com', 'area' => 'Baclaran'],
            ['name' => 'Logistic 22', 'email' => 'logistic22@logistic.com', 'area' => 'Banlic'],
            ['name' => 'Logistic 23', 'email' => 'logistic23@logistic.com', 'area' => 'Bigaa'],
            ['name' => 'Logistic 24', 'email' => 'logistic24@logistic.com', 'area' => null], // No area assigned
            ['name' => 'Logistic 25', 'email' => 'logistic25@logistic.com', 'area' => 'Casile'],
            ['name' => 'Logistic 26', 'email' => 'logistic26@logistic.com', 'area' => null], // No area assigned
            ['name' => 'Logistic 27', 'email' => 'logistic27@logistic.com', 'area' => 'Marinig'],
        ];

        foreach ($logisticsData as $index => $logisticData) {
            $logistic = User::create([
                'type' => 'logistic',
                'name' => $logisticData['name'],
                'email' => $logisticData['email'],
                'contact_number' => '0912' . str_pad(3000 + $index, 7, '0', STR_PAD_LEFT),
                'registration_date' => now()->subDays(90 - $index * 2),
                'assigned_area' => $logisticData['area'],
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'active' => true,
            ]);

            // Assign logistic role
            if ($logisticRole) {
                $logistic->assignRole($logisticRole);
            }

            // Use the assigned area as barangay if available, otherwise use Sala
            $barangay = $logisticData['area'] ?? 'Sala';
            
            UserAddress::create([
                'user_id' => $logistic->id,
                'street' => ($index + 1) . ' Delivery Street',
                'barangay' => $barangay,
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'is_active' => true,
            ]);
        }

        // Create Farmer Users (Note: These will be recreated by MemberSeeder with proper member_id)
        // This creates initial farmer users that will be replaced by MemberSeeder
        $farmers = [
            ['name' => 'Farmer 1', 'email' => 'farmer1@farmer.com', 'member_id' => '2411000'],
            ['name' => 'Farmer 2', 'email' => 'farmer2@farmer.com', 'member_id' => '2411001'],
            ['name' => 'Farmer 3', 'email' => 'farmer3@farmer.com', 'member_id' => '2411002'],
            ['name' => 'Farmer 4', 'email' => 'farmer4@farmer.com', 'member_id' => '2411003'],
            ['name' => 'Farmer 5', 'email' => 'farmer5@farmer.com', 'member_id' => '2411004'],
            ['name' => 'Farmer 6', 'email' => 'farmer6@farmer.com', 'member_id' => '2411005'],
            ['name' => 'Farmer 7', 'email' => 'farmer7@farmer.com', 'member_id' => '2411006'],
            ['name' => 'Farmer 8', 'email' => 'farmer8@farmer.com', 'member_id' => '2411007'],
            ['name' => 'Farmer 9', 'email' => 'farmer9@farmer.com', 'member_id' => '2411008'],
            ['name' => 'Farmer 10', 'email' => 'farmer10@farmer.com', 'member_id' => '2411009'],
            ['name' => 'Farmer 11', 'email' => 'farmer11@farmer.com', 'member_id' => '2411010'],
            ['name' => 'Farmer 12', 'email' => 'farmer12@farmer.com', 'member_id' => '2411011'],
        ];

        foreach ($farmers as $index => $farmerData) {
            $farmer = User::create([
                'type' => 'member',
                'name' => $farmerData['name'],
                'email' => null, // Members use member_id for login, not email
                'member_id' => $farmerData['member_id'],
                'contact_number' => '0912' . str_pad($index + 1, 7, '0', STR_PAD_LEFT),
                'registration_date' => now()->subDays(60 - $index * 2),
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'active' => true,
            ]);

            UserAddress::create([
                'user_id' => $farmer->id,
                'street' => 'Farm ' . ($index + 1) . ', Agricultural Zone',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'is_active' => true,
            ]);
        }

        // Create customer users
        $customers = [
            [
                'name' => 'Customer 1',
                'email' => 'customer1@customer.com',
                'contact_number' => '09111222333',
                'street' => '321 Customer Avenue',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'Customer 2',
                'email' => 'customer2@customer.com',
                'contact_number' => '09123456789',
                'street' => '456 Main Street',
                'barangay' => 'Pulo',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'Customer 3',
                'email' => 'customer3@customer.com',
                'contact_number' => '09234567890',
                'street' => '789 Oak Avenue',
                'barangay' => 'Banlic',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'Customer 4',
                'email' => 'customer4@customer.com',
                'contact_number' => '09345678901',
                'street' => '101 Pine Road',
                'barangay' => 'Mamatid',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
        ];

        foreach ($customers as $index => $customerData) {
            $customer = User::create([
                'type' => 'customer',
                'name' => $customerData['name'],
                'email' => $customerData['email'],
                'contact_number' => $customerData['contact_number'],
                'registration_date' => now()->subDays(15 + $index * 5),
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'active' => true,
            ]);

            // Assign customer role
            if ($customerRole) {
                $customer->assignRole($customerRole);
            }

            UserAddress::create([
                'user_id' => $customer->id,
                'street' => $customerData['street'],
                'barangay' => $customerData['barangay'],
                'city' => $customerData['city'],
                'province' => $customerData['province'],
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Created users:');
        $this->command->info('   - ' . count($logisticsData) . ' Logistics personnel with assigned areas');
        $this->command->info('   - 12 Members (Farmers) - will be recreated by MemberSeeder with proper member_id');
        $this->command->info('   - 4 Customers');

        // Note: Members will be created in DatabaseSeeder with specific member ID 2411000
        // as requested to exclude member seeding from this seeder
    }
}
