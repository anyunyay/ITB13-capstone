<?php

namespace App\Services;

use Illuminate\Support\Facades\App;

class NotificationService
{
    /**
     * Resolve a notification message key to the user's preferred language
     * 
     * @param string $messageKey The message key from the notifications language file
     * @param array $params Parameters to replace in the message
     * @param string|null $locale The locale to use (defaults to app locale)
     * @return string The translated message
     */
    public static function resolveMessage(string $messageKey, array $params = [], ?string $locale = null): string
    {
        $locale = $locale ?? App::getLocale();
        
        return __('notifications.' . $messageKey, $params, $locale);
    }

    /**
     * Format notification data for API response with resolved messages
     * 
     * @param \Illuminate\Notifications\DatabaseNotification $notification
     * @param string|null $locale
     * @return array
     */
    public static function formatNotification($notification, ?string $locale = null): array
    {
        $data = $notification->data;
        $messageKey = $notification->message_key ?? $data['message_key'] ?? null;
        $messageParams = $notification->message_params ?? $data['message_params'] ?? [];

        // Decode JSON if stored as string
        if (is_string($messageParams)) {
            $messageParams = json_decode($messageParams, true) ?? [];
        }

        // Resolve the message using the message key
        $resolvedMessage = $messageKey 
            ? self::resolveMessage($messageKey, $messageParams, $locale)
            : ($data['message'] ?? '');

        // Resolve sub_message if it exists
        $subMessageKey = $data['sub_message_key'] ?? null;
        $subMessageParams = $data['sub_message_params'] ?? [];
        
        if (is_string($subMessageParams)) {
            $subMessageParams = json_decode($subMessageParams, true) ?? [];
        }
        
        $resolvedSubMessage = $subMessageKey 
            ? self::resolveMessage($subMessageKey, $subMessageParams, $locale)
            : ($data['sub_message'] ?? null);

        // Update data with resolved sub_message
        if ($resolvedSubMessage) {
            $data['sub_message'] = $resolvedSubMessage;
        }

        return [
            'id' => $notification->id,
            'type' => $data['type'] ?? 'unknown',
            'message' => $resolvedMessage,
            'message_key' => $messageKey,
            'action_url' => $data['action_url'] ?? null,
            'created_at' => $notification->created_at->toISOString(),
            'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
            'data' => $data,
        ];
    }

    /**
     * Get notification types for a specific user type
     * 
     * @param string $userType
     * @return array
     */
    public static function getNotificationTypesForUser(string $userType): array
    {
        $types = [
            'admin' => [
                'App\\Notifications\\NewOrderNotification',
                'App\\Notifications\\InventoryUpdateNotification',
                'App\\Notifications\\MembershipUpdateNotification',
                'App\\Notifications\\PasswordChangeRequestNotification',
            ],
            'staff' => [
                'App\\Notifications\\NewOrderNotification',
                'App\\Notifications\\InventoryUpdateNotification',
                'App\\Notifications\\MembershipUpdateNotification',
            ],
            'customer' => [
                'App\\Notifications\\OrderConfirmationNotification',
                'App\\Notifications\\OrderStatusUpdate',
                'App\\Notifications\\DeliveryStatusUpdate',
                'App\\Notifications\\OrderRejectionNotification',
                'App\\Notifications\\OrderReadyForPickupNotification',
                'App\\Notifications\\OrderPickedUpNotification',
            ],
            'member' => [
                'App\\Notifications\\ProductSaleNotification',
                'App\\Notifications\\EarningsUpdateNotification',
                'App\\Notifications\\LowStockAlertNotification',
                'App\\Notifications\\StockAddedNotification',
            ],
            'logistic' => [
                'App\\Notifications\\DeliveryTaskNotification',
                'App\\Notifications\\OrderStatusUpdate',
                'App\\Notifications\\LogisticOrderReadyNotification',
                'App\\Notifications\\LogisticOrderPickedUpNotification',
            ],
        ];

        return $types[$userType] ?? [];
    }
}
