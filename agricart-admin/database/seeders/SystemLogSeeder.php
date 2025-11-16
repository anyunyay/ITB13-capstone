<?php

namespace Database\Seeders;

use App\Models\SystemLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SystemLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get sample users for realistic data
        $admin = User::where('type', 'admin')->first();
        $staff = User::where('type', 'staff')->first();
        $member = User::where('type', 'member')->first();
        $customer = User::where('type', 'customer')->first();
        $logistic = User::where('type', 'logistic')->first();

        // Sample IP addresses
        $ipAddresses = [
            '192.168.1.100',
            '192.168.1.101',
            '192.168.1.102',
            '10.0.0.50',
            '172.16.0.25',
            '203.0.113.45',
        ];

        // Sample product names
        $products = [
            'Fresh Tomatoes',
            'Organic Carrots',
            'Green Lettuce',
            'Red Onions',
            'Sweet Potatoes',
            'Bell Peppers',
        ];

        $logs = [];

        // 1. Security Events - Password Changes (5 logs)
        for ($i = 0; $i < 5; $i++) {
            $user = collect([$admin, $staff, $customer, $member])->random();
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'password_changed',
                'event_type' => 'security_event',
                'details' => "{$user->email} changed their password on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'event' => 'password_changed',
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 2. Failed Login Attempts (8 logs)
        for ($i = 0; $i < 8; $i++) {
            $user = collect([$admin, $staff, $customer, $member])->random();
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $attemptsRemaining = rand(1, 4);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'login_failed',
                'event_type' => 'security_event',
                'details' => "Failed login attempt for {$user->email} with {$attemptsRemaining} attempts remaining on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'event' => 'login_failed',
                    'attempts_remaining' => $attemptsRemaining,
                    'is_locked' => false,
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 3. Wrong Portal Access Attempts (4 logs)
        for ($i = 0; $i < 4; $i++) {
            $user = collect([$admin, $customer])->random();
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $targetPortal = $user->type === 'admin' ? 'customer' : 'admin';
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'login_failed_wrong_portal',
                'event_type' => 'authentication',
                'details' => "{$user->email} performed authentication event: Login Failed Wrong Portal on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'event' => 'login_failed_wrong_portal',
                    'target_portal' => $targetPortal,
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 4. Product Management - Create (6 logs)
        for ($i = 0; $i < 6; $i++) {
            $user = $admin ?? $staff;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $productName = $products[array_rand($products)];
            $productId = rand(1, 100);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'create',
                'event_type' => 'product_management',
                'details' => "{$user->email} created product: {$productName} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'price_kilo' => rand(30, 100),
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 5. Product Management - Update (5 logs)
        for ($i = 0; $i < 5; $i++) {
            $user = $admin ?? $staff;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $productName = $products[array_rand($products)];
            $productId = rand(1, 100);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'update',
                'event_type' => 'product_management',
                'details' => "{$user->email} updated product: {$productName} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'price_changed' => true,
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 6. Product Management - Delete (3 logs)
        for ($i = 0; $i < 3; $i++) {
            $user = $admin ?? $staff;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $productName = $products[array_rand($products)];
            $productId = rand(1, 100);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'delete',
                'event_type' => 'product_management',
                'details' => "{$user->email} deleted product: {$productName} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'product_id' => $productId,
                    'product_name' => $productName,
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 7. Stock Updates (6 logs)
        for ($i = 0; $i < 6; $i++) {
            $user = $member ?? $admin;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $productName = $products[array_rand($products)];
            $oldQty = rand(10, 50);
            $newQty = rand(51, 100);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'stock_update',
                'event_type' => 'stock_update',
                'details' => "Stock was updated for {$productName} from {$oldQty} to {$newQty} items (Reason: Manual Update) by {$user->email} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'product_name' => $productName,
                    'old_quantity' => $oldQty,
                    'new_quantity' => $newQty,
                    'reason' => 'manual_update',
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 8. Order Status Changes (7 logs)
        for ($i = 0; $i < 7; $i++) {
            $user = $admin ?? $staff;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $orderId = rand(1, 200);
            $statuses = [
                ['pending', 'approved'],
                ['approved', 'out_for_delivery'],
                ['out_for_delivery', 'delivered'],
            ];
            $statusChange = $statuses[array_rand($statuses)];
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'order_status_change',
                'event_type' => 'order_status_change',
                'details' => "Order #{$orderId} status was changed from " . ucfirst($statusChange[0]) . " to " . ucfirst($statusChange[1]) . " by {$user->email} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'order_id' => $orderId,
                    'old_status' => $statusChange[0],
                    'new_status' => $statusChange[1],
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 9. Customer Checkout (5 logs)
        for ($i = 0; $i < 5; $i++) {
            $user = $customer;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $orderId = rand(1, 200);
            $totalAmount = rand(100, 500);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'checkout',
                'event_type' => 'checkout',
                'details' => "Customer {$user->email} completed checkout for Order #{$orderId} for a total of ₱" . number_format($totalAmount, 2) . " on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'order_id' => $orderId,
                    'total_amount' => $totalAmount,
                    'cart_items_count' => rand(2, 5),
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 10. Delivery Status Changes (4 logs)
        for ($i = 0; $i < 4; $i++) {
            $user = $logistic ?? $admin;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $orderId = rand(1, 200);
            $statuses = [
                ['pending', 'out_for_delivery'],
                ['out_for_delivery', 'delivered'],
            ];
            $statusChange = $statuses[array_rand($statuses)];
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'delivery_status_change',
                'event_type' => 'delivery_status_change',
                'details' => "Delivery status for Order #{$orderId} was changed from " . ucfirst($statusChange[0]) . " to " . ucfirst($statusChange[1]) . " on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'order_id' => $orderId,
                    'old_status' => $statusChange[0],
                    'new_status' => $statusChange[1],
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 11. User Management - Create Staff (3 logs)
        for ($i = 0; $i < 3; $i++) {
            $user = $admin;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $targetUserId = rand(1, 50);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'create_staff',
                'event_type' => 'user_management',
                'details' => "{$user->email} created staff user #{$targetUserId} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'target_user_id' => $targetUserId,
                    'action' => 'create_staff',
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 12. Data Export (3 logs)
        for ($i = 0; $i < 3; $i++) {
            $user = $admin ?? $staff;
            if (!$user) continue;
            
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $exportTypes = ['system_logs_export', 'orders_export', 'products_export'];
            $exportType = $exportTypes[array_rand($exportTypes)];
            $recordCount = rand(50, 500);
            
            $logs[] = [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_type' => $user->type,
                'action' => 'data_export',
                'event_type' => 'data_export',
                'details' => "{$user->email} exported " . ucwords(str_replace('_', ' ', $exportType)) . " containing {$recordCount} records on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'export_type' => $exportType,
                    'record_count' => $recordCount,
                    'export_format' => 'csv',
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // 13. Critical Errors (2 logs)
        for ($i = 0; $i < 2; $i++) {
            $performedAt = Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23));
            $ipAddress = $ipAddresses[array_rand($ipAddresses)];
            $errors = [
                'Database connection timeout',
                'Payment gateway error',
                'File upload failed',
            ];
            $error = $errors[array_rand($errors)];
            
            $logs[] = [
                'user_id' => null,
                'user_email' => null,
                'user_type' => null,
                'action' => 'critical_error',
                'event_type' => 'critical_error',
                'details' => "Critical system error occurred: {$error} on {$performedAt->format('F j, Y')} at {$performedAt->format('g:i A')} from IP address {$ipAddress}",
                'ip_address' => $ipAddress,
                'context' => json_encode([
                    'error' => $error,
                    'severity' => 'critical',
                ]),
                'performed_at' => $performedAt,
                'created_at' => $performedAt,
                'updated_at' => $performedAt,
            ];
        }

        // Insert all logs
        SystemLog::insert($logs);

        $this->command->info('System logs seeded successfully! Total logs: ' . count($logs));
    }
}
