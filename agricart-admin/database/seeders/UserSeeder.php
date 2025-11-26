<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing users to avoid conflicts
        User::query()->delete();
        UserAddress::query()->delete();

        // Create specific admin user as requested
        $adminUser = User::create([
            'type' => 'admin',
            'name' => 'Samuel Salazar',
            'email' => 'admin@admin.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'is_default' => false,
            'active' => true,
        ]);

        // Create default address for admin
        UserAddress::create([
            'user_id' => $adminUser->id,
            'street' => 'Admin Office, 123 Business Plaza',
            'barangay' => 'Sala',
            'city' => 'Cabuyao',
            'province' => 'Laguna',
            'is_active' => true,
        ]);

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
            ['name' => 'Judel Macasinag', 'email' => 'judel@logistic.com', 'area' => 'Sala'],
            ['name' => 'Elmo V. Republica', 'email' => 'elmo@logistic.com', 'area' => 'Pulo'],
            ['name' => 'Maria Santos', 'email' => 'maria.santos@logistic.com', 'area' => 'Baclaran'],
            ['name' => 'Juan Dela Cruz', 'email' => 'juan.delacruz@logistic.com', 'area' => 'Banay-Banay'],
            ['name' => 'Pedro Reyes', 'email' => 'pedro.reyes@logistic.com', 'area' => 'Banlic'],
            ['name' => 'Ana Garcia', 'email' => 'ana.garcia@logistic.com', 'area' => 'Butong'],
            ['name' => 'Carlos Mendoza', 'email' => 'carlos.mendoza@logistic.com', 'area' => 'Bigaa'],
            ['name' => 'Rosa Fernandez', 'email' => 'rosa.fernandez@logistic.com', 'area' => 'Casile'],
            ['name' => 'Miguel Torres', 'email' => 'miguel.torres@logistic.com', 'area' => 'Gulod'],
            ['name' => 'Sofia Ramirez', 'email' => 'sofia.ramirez@logistic.com', 'area' => 'Mamatid'],
            ['name' => 'Diego Lopez', 'email' => 'diego.lopez@logistic.com', 'area' => 'Marinig'],
            ['name' => 'Carmen Gonzales', 'email' => 'carmen.gonzales@logistic.com', 'area' => 'Niugan'],
            ['name' => 'Ricardo Flores', 'email' => 'ricardo.flores@logistic.com', 'area' => 'Pittland'],
            ['name' => 'Elena Cruz', 'email' => 'elena.cruz@logistic.com', 'area' => 'San Isidro'],
            ['name' => 'Fernando Diaz', 'email' => 'fernando.diaz@logistic.com', 'area' => 'Diezmo'],
            ['name' => 'Isabel Morales', 'email' => 'isabel.morales@logistic.com', 'area' => 'Barangay Uno (Poblacion)'],
            ['name' => 'Antonio Ramos', 'email' => 'antonio.ramos@logistic.com', 'area' => 'Barangay Dos (Poblacion)'],
            ['name' => 'Lucia Herrera', 'email' => 'lucia.herrera@logistic.com', 'area' => 'Barangay Tres (Poblacion)'],
            ['name' => 'Roberto Silva', 'email' => 'roberto.silva@logistic.com', 'area' => 'Sala'],
            ['name' => 'Patricia Vargas', 'email' => 'patricia.vargas@logistic.com', 'area' => 'Pulo'],
            ['name' => 'Manuel Castro', 'email' => 'manuel.castro@logistic.com', 'area' => 'Baclaran'],
            ['name' => 'Gloria Ortiz', 'email' => 'gloria.ortiz@logistic.com', 'area' => 'Banlic'],
            ['name' => 'Alejandro Ruiz', 'email' => 'alejandro.ruiz@logistic.com', 'area' => 'Bigaa'],
            ['name' => 'Teresa Jimenez', 'email' => 'teresa.jimenez@logistic.com', 'area' => null], // No area assigned
            ['name' => 'Francisco Navarro', 'email' => 'francisco.navarro@logistic.com', 'area' => 'Casile'],
            ['name' => 'Beatriz Romero', 'email' => 'beatriz.romero@logistic.com', 'area' => null], // No area assigned
            ['name' => 'Javier Gutierrez', 'email' => 'javier.gutierrez@logistic.com', 'area' => 'Marinig'],
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

        // Create Farmer Users
        $farmers = [
            ['name' => 'Sonia Canceran', 'email' => 'sonia.canceran@farmer.com'],
            ['name' => 'Aurora P. Cervantes', 'email' => 'aurora.cervantes@farmer.com'],
            ['name' => 'Roger Dubos', 'email' => 'roger.dubos@farmer.com'],
            ['name' => 'Jouie P. Asido', 'email' => 'jouie.asido@farmer.com'],
            ['name' => 'Ronnie Asido', 'email' => 'ronnie.asido@farmer.com'],
            ['name' => 'Ronaldo L. Comite', 'email' => 'ronaldo.comite@farmer.com'],
            ['name' => 'Sotelia B. Cariod', 'email' => 'sotelia.cariod@farmer.com'],
            ['name' => 'Jell O. Federis', 'email' => 'jell.federis@farmer.com'],
            ['name' => 'Gregorio L. Bando', 'email' => 'gregorio.bando@farmer.com'],
            ['name' => 'Noel L. Villare', 'email' => 'noel.villare@farmer.com'],
            ['name' => 'Jimmy F. Santiago', 'email' => 'jimmy.santiago@farmer.com'],
            ['name' => 'Cristina R. Rogel', 'email' => 'cristina.rogel@farmer.com'],
        ];

        foreach ($farmers as $index => $farmerData) {
            $farmer = User::create([
                'type' => 'member',
                'name' => $farmerData['name'],
                'email' => $farmerData['email'],
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
                'name' => 'Test Customer',
                'email' => 'customer@customer.com',
                'contact_number' => '09111222333',
                'street' => '321 Customer Avenue',
                'barangay' => 'Sala',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'John Doe',
                'email' => 'customer2@customer.com',
                'contact_number' => '09123456789',
                'street' => '456 Main Street',
                'barangay' => 'Pulo',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'customer3@customer.com',
                'contact_number' => '09234567890',
                'street' => '789 Oak Avenue',
                'barangay' => 'Banlic',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
            ],
            [
                'name' => 'Bob Johnson',
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
        $this->command->info('   - 1 Admin (Samuel Salazar)');
        $this->command->info('   - ' . count($logisticsData) . ' Logistics personnel with assigned areas');
        $this->command->info('   - 12 Members (Farmers)');
        $this->command->info('   - 4 Customers (Test Customer, John Doe, Jane Smith, Bob Johnson)');

        // Note: Members will be created in DatabaseSeeder with specific member ID 2411000
        // as requested to exclude member seeding from this seeder
    }
}
