<?php

/**
 * Notification Message Key System - Complete Example
 * 
 * This file demonstrates how to use the new message_key system
 * for creating and fetching multilingual notifications.
 */

namespace Examples;

use App\Models\User;
use App\Models\SalesAudit;
use App\Notifications\NewOrderNotification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\App;

class NotificationMessageKeyExample
{
    /**
     * Example 1: Creating a notification with message_key
     * 
     * When you create a notification, the toArray() method should return
     * a message_key and message_params instead of a hardcoded message.
     */
    public function createNotificationExample()
    {
        // Get admin user and an order
        $admin = User::where('type', 'admin')->first();
        $order = SalesAudit::first();
        
        // Send notification - the notification class handles message_key
        $admin->notify(new NewOrderNotification($order));
        
        // What gets stored in the database:
        // {
        //     "type": "new_order",
        //     "message_key": "new_order",
        //     "message_params": {
        //         "order_id": 123,
        //         "customer_name": "John Doe"
        //     },
        //     "order_id": 123,
        //     "customer_name": "John Doe",
        //     "total_amount": 1500.00,
        //     "action_url": "/admin/orders/123"
        // }
        
        echo "✅ Notification created with message_key\n";
    }
    
    /**
     * Example 2: Fetching notifications in user's preferred language
     * 
     * When fetching notifications, use NotificationService to resolve
     * the message_key to the user's language.
     */
    public function fetchNotificationsInUserLanguage()
    {
        $user = User::where('type', 'admin')->first();
        
        // Get user's preferred language (from user profile or app locale)
        $locale = $user->language ?? App::getLocale(); // 'en' or 'tl'
        
        // Fetch notifications
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) use ($locale) {
                // Use NotificationService to format with resolved message
                return NotificationService::formatNotification($notification, $locale);
            });
        
        // Result for English user:
        // [
        //     {
        //         "id": "uuid-here",
        //         "type": "new_order",
        //         "message": "New order #123 from John Doe",
        //         "message_key": "new_order",
        //         "action_url": "/admin/orders/123",
        //         "created_at": "2024-11-18T10:30:00.000000Z",
        //         "read_at": null,
        //         "data": {...}
        //     }
        // ]
        
        // Result for Tagalog user:
        // [
        //     {
        //         "id": "uuid-here",
        //         "type": "new_order",
        //         "message": "Bagong order #123 mula kay John Doe",
        //         "message_key": "new_order",
        //         "action_url": "/admin/orders/123",
        //         "created_at": "2024-11-18T10:30:00.000000Z",
        //         "read_at": null,
        //         "data": {...}
        //     }
        // ]
        
        foreach ($notifications as $notification) {
            echo "📧 {$notification['message']}\n";
        }
    }
    
    /**
     * Example 3: Manually resolving a message key
     * 
     * You can manually resolve a message key to any language
     * using the NotificationService.
     */
    public function manuallyResolveMessage()
    {
        // Resolve to English
        $englishMessage = NotificationService::resolveMessage('new_order', [
            'order_id' => 123,
            'customer_name' => 'John Doe'
        ], 'en');
        
        echo "English: {$englishMessage}\n";
        // Output: "New order #123 from John Doe"
        
        // Resolve to Tagalog
        $tagalogMessage = NotificationService::resolveMessage('new_order', [
            'order_id' => 123,
            'customer_name' => 'John Doe'
        ], 'tl');
        
        echo "Tagalog: {$tagalogMessage}\n";
        // Output: "Bagong order #123 mula kay John Doe"
        
        // Complex example with multiple parameters
        $stockAlert = NotificationService::resolveMessage('low_stock_alert', [
            'stock_type' => 'available',
            'product_name' => 'Rice 25kg',
            'quantity' => 5
        ], 'en');
        
        echo "Stock Alert: {$stockAlert}\n";
        // Output: "Low available stock alert: Rice 25kg has only 5 units left"
    }
    
    /**
     * Example 4: Creating a custom notification with message_key
     * 
     * This shows how to create a new notification class that uses message_key.
     */
    public function customNotificationExample()
    {
        // Step 1: Add translation keys to language files
        
        // resources/lang/en/notifications.php
        // 'payment_received' => 'Payment of ₱:amount received from :customer_name',
        
        // resources/lang/tl/notifications.php
        // 'payment_received' => 'Natanggap ang bayad na ₱:amount mula kay :customer_name',
        
        // Step 2: Create notification class
        /*
        class PaymentReceivedNotification extends Notification
        {
            public $payment;
            
            public function __construct($payment)
            {
                $this->payment = $payment;
            }
            
            public function toArray($notifiable)
            {
                return [
                    'payment_id' => $this->payment->id,
                    'type' => 'payment_received',
                    'message_key' => 'payment_received',
                    'message_params' => [
                        'amount' => number_format($this->payment->amount, 2),
                        'customer_name' => $this->payment->customer->name,
                    ],
                    'action_url' => '/admin/payments/' . $this->payment->id,
                ];
            }
        }
        */
        
        // Step 3: Send notification
        // $admin->notify(new PaymentReceivedNotification($payment));
        
        // Step 4: Fetch and display
        // The message will automatically resolve to:
        // English: "Payment of ₱1,500.00 received from John Doe"
        // Tagalog: "Natanggap ang bayad na ₱1,500.00 mula kay John Doe"
        
        echo "✅ Custom notification example complete\n";
    }
    
    /**
     * Example 5: Controller implementation
     * 
     * This shows how to implement the message_key system in a controller.
     */
    public function controllerImplementationExample()
    {
        /*
        // In your controller (e.g., NotificationController.php)
        
        use App\Services\NotificationService;
        
        public function index(Request $request)
        {
            $user = $request->user();
            $locale = $user->language ?? app()->getLocale();
            
            // Get notification types for this user role
            $notificationTypes = NotificationService::getNotificationTypesForUser($user->type);
            
            // Fetch and format notifications
            $notifications = $user->notifications()
                ->whereIn('type', $notificationTypes)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) use ($locale) {
                    return NotificationService::formatNotification($notification, $locale);
                });
            
            return response()->json(['notifications' => $notifications]);
        }
        */
        
        echo "✅ Controller implementation example complete\n";
    }
    
    /**
     * Example 6: Dynamic language switching
     * 
     * This demonstrates how notifications automatically update when
     * a user switches their language preference.
     */
    public function dynamicLanguageSwitchingExample()
    {
        $user = User::where('type', 'customer')->first();
        
        // User views notifications in English
        $user->language = 'en';
        $user->save();
        
        $notification = $user->notifications()->first();
        $formatted = NotificationService::formatNotification($notification, 'en');
        echo "English: {$formatted['message']}\n";
        // Output: "Order Confirmed"
        
        // User switches to Tagalog
        $user->language = 'tl';
        $user->save();
        
        // Same notification, different language
        $formatted = NotificationService::formatNotification($notification, 'tl');
        echo "Tagalog: {$formatted['message']}\n";
        // Output: "Nakumpirma ang Order"
        
        // No database changes needed! The notification data stays the same,
        // only the resolved message changes based on the user's language.
        
        echo "✅ Language switching works seamlessly\n";
    }
    
    /**
     * Example 7: Handling notifications with sub-messages
     * 
     * Some notifications have both a main message and a sub-message.
     */
    public function subMessageExample()
    {
        // Order confirmation has both message and sub_message
        $notification = [
            'message_key' => 'order_confirmation',
            'message_params' => [],
            'sub_message_key' => 'order_confirmation_sub',
            'sub_message_params' => [],
        ];
        
        // Resolve main message
        $mainMessage = NotificationService::resolveMessage(
            $notification['message_key'],
            $notification['message_params'],
            'en'
        );
        echo "Main: {$mainMessage}\n";
        // Output: "Order Confirmed"
        
        // Resolve sub-message
        $subMessage = NotificationService::resolveMessage(
            $notification['sub_message_key'],
            $notification['sub_message_params'],
            'en'
        );
        echo "Sub: {$subMessage}\n";
        // Output: "Estimated Approval Time: 24Hrs"
        
        // In Tagalog
        $mainMessage = NotificationService::resolveMessage(
            $notification['message_key'],
            $notification['message_params'],
            'tl'
        );
        $subMessage = NotificationService::resolveMessage(
            $notification['sub_message_key'],
            $notification['sub_message_params'],
            'tl'
        );
        echo "Tagalog Main: {$mainMessage}\n";
        // Output: "Nakumpirma ang Order"
        echo "Tagalog Sub: {$subMessage}\n";
        // Output: "Tinatayang Oras ng Pag-apruba: 24 Oras"
    }
    
    /**
     * Example 8: Testing the system
     * 
     * How to test that the message_key system is working correctly.
     */
    public function testingExample()
    {
        // Test 1: Verify notification has message_key
        $user = User::where('type', 'admin')->first();
        $notification = $user->notifications()->first();
        
        if (isset($notification->data['message_key'])) {
            echo "✅ Notification has message_key\n";
        } else {
            echo "❌ Notification missing message_key\n";
        }
        
        // Test 2: Verify message resolves correctly
        $formatted = NotificationService::formatNotification($notification, 'en');
        if (!empty($formatted['message'])) {
            echo "✅ Message resolved successfully: {$formatted['message']}\n";
        } else {
            echo "❌ Message resolution failed\n";
        }
        
        // Test 3: Verify language switching
        $englishMessage = NotificationService::formatNotification($notification, 'en')['message'];
        $tagalogMessage = NotificationService::formatNotification($notification, 'tl')['message'];
        
        if ($englishMessage !== $tagalogMessage) {
            echo "✅ Language switching works\n";
            echo "   EN: {$englishMessage}\n";
            echo "   TL: {$tagalogMessage}\n";
        } else {
            echo "❌ Language switching not working\n";
        }
        
        // Test 4: Verify all notification types have translations
        $missingKeys = [];
        $notificationTypes = [
            'new_order', 'order_confirmation', 'low_stock_alert',
            'product_sale', 'earnings_update', 'delivery_task'
        ];
        
        foreach ($notificationTypes as $key) {
            $translation = __('notifications.' . $key, [], 'en');
            if (str_starts_with($translation, 'notifications.')) {
                $missingKeys[] = $key;
            }
        }
        
        if (empty($missingKeys)) {
            echo "✅ All notification types have translations\n";
        } else {
            echo "❌ Missing translations for: " . implode(', ', $missingKeys) . "\n";
        }
    }
    
    /**
     * Run all examples
     */
    public function runAllExamples()
    {
        echo "=== Notification Message Key System Examples ===\n\n";
        
        echo "Example 1: Creating a notification\n";
        $this->createNotificationExample();
        echo "\n";
        
        echo "Example 2: Fetching notifications in user's language\n";
        $this->fetchNotificationsInUserLanguage();
        echo "\n";
        
        echo "Example 3: Manually resolving messages\n";
        $this->manuallyResolveMessage();
        echo "\n";
        
        echo "Example 4: Custom notification\n";
        $this->customNotificationExample();
        echo "\n";
        
        echo "Example 5: Controller implementation\n";
        $this->controllerImplementationExample();
        echo "\n";
        
        echo "Example 6: Dynamic language switching\n";
        $this->dynamicLanguageSwitchingExample();
        echo "\n";
        
        echo "Example 7: Sub-messages\n";
        $this->subMessageExample();
        echo "\n";
        
        echo "Example 8: Testing\n";
        $this->testingExample();
        echo "\n";
        
        echo "=== All examples complete! ===\n";
    }
}

// To run these examples:
// php artisan tinker
// $example = new Examples\NotificationMessageKeyExample();
// $example->runAllExamples();
