<?php

namespace App\Helpers;

use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class SystemLogger
{
    /**
     * Determine if an action should be logged based on importance
     * Only log critical user activities: data changes, security events, and unauthorized access
     */
    private static function shouldLogAction($eventType, $action, $context = [])
    {
        // Always log security events (password changes, email changes, phone changes, etc.)
        if ($eventType === 'security_event') {
            return true;
        }
        
        // Only log authentication failures and wrong portal attempts (security concerns)
        if ($eventType === 'authentication') {
            $event = $context['event'] ?? '';
            // Log failed logins and wrong portal access (unauthorized access attempts)
            if (in_array($event, ['login_failed', 'login_failed_wrong_portal'])) {
                return true;
            }
            // Don't log successful logins or logouts (routine activities)
            return false;
        }
        
        // Always log critical errors
        if ($eventType === 'critical_error') {
            return true;
        }
        
        // Log important business transactions (data changes)
        if (in_array($eventType, ['checkout', 'order_status_change', 'stock_update'])) {
            return true;
        }
        
        // Log user management actions - only create, delete, and permission changes (data changes)
        if ($eventType === 'user_management') {
            $importantActions = ['create', 'delete', 'create_staff', 'delete_staff', 'update_staff', 'role_change', 'permission_change'];
            return in_array($action, $importantActions);
        }
        
        // Log product management actions - only create, delete, and updates (data changes)
        if ($eventType === 'product_management') {
            return true; // All product changes are important
        }
        
        // Log delivery status changes (data changes)
        if ($eventType === 'delivery_status_change') {
            return true;
        }
        
        // Log maintenance activities (system changes)
        if ($eventType === 'maintenance') {
            return true;
        }
        
        // Log data exports (sensitive data access)
        if ($eventType === 'data_export') {
            return true;
        }
        
        // Don't log report generation (routine activity)
        if ($eventType === 'report_generation') {
            return false;
        }
        
        // Don't log routine admin, member, staff, customer, or logistic activities
        // (dashboard access, page views, etc. are not important)
        if (in_array($eventType, ['admin_activity', 'member_activity', 'staff_activity', 'customer_activity', 'logistic_activity'])) {
            return false;
        }
        
        // Don't log anything else by default
        return false;
    }
    
    /**
     * Format log context into clear, human-friendly sentences
     */
    private static function formatLogContext($context, $message)
    {
        // Get user information for personalized messages
        $userType = $context['user_type'] ?? 'user';
        $userId = $context['user_id'] ?? $context['admin_id'] ?? $context['staff_id'] ?? $context['member_id'] ?? $context['customer_id'] ?? $context['logistic_id'] ?? null;
        $userEmail = $context['user_email'] ?? null;
        $ipAddress = $context['ip_address'] ?? 'unknown location';
        
        // Format timestamp as readable date and time
        $timestamp = isset($context['timestamp']) ? date('F j, Y', strtotime($context['timestamp'])) : 'unknown date';
        $time = isset($context['timestamp']) ? date('g:i A', strtotime($context['timestamp'])) : 'unknown time';
        
        // Create user-friendly identifier with proper capitalization
        $userIdentifier = $userEmail ?: ($userId ? "User #{$userId}" : 'Unknown user');
        
        // Event type descriptions
        $eventType = $context['event_type'] ?? '';
        $action = $context['action'] ?? '';
        
        // Build complete sentence based on event type
        $sentence = '';
        
        switch ($eventType) {
            case 'admin_activity':
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "Admin {$userIdentifier} {$actionText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'authentication':
                $event = $context['event'] ?? '';
                if ($event === 'login_success') {
                    $sentence = "{$userIdentifier} successfully logged in on {$timestamp} at {$time} from IP address {$ipAddress}";
                } elseif ($event === 'login_failed') {
                    $attemptsRemaining = $context['attempts_remaining'] ?? null;
                    $isLocked = $context['is_locked'] ?? false;
                    if ($isLocked) {
                        $sentence = "Account was locked for {$userIdentifier} due to multiple failed login attempts on {$timestamp} at {$time} from IP address {$ipAddress}";
                    } else {
                        $attemptsText = $attemptsRemaining ? " with {$attemptsRemaining} attempts remaining" : "";
                        $sentence = "Failed login attempt for {$userIdentifier}{$attemptsText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                    }
                } elseif ($event === 'logout') {
                    $sentence = "{$userIdentifier} logged out on {$timestamp} at {$time} from IP address {$ipAddress}";
                } else {
                    $eventText = ucwords(str_replace('_', ' ', $event));
                    $sentence = "{$userIdentifier} performed authentication event: {$eventText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                }
                break;
                
            case 'security_event':
                $event = $context['event'] ?? '';
                if ($event === 'password_changed') {
                    $sentence = "{$userIdentifier} changed their password on {$timestamp} at {$time} from IP address {$ipAddress}";
                } elseif ($event === 'login_failed') {
                    $attemptsRemaining = $context['attempts_remaining'] ?? null;
                    $isLocked = $context['is_locked'] ?? false;
                    if ($isLocked) {
                        $sentence = "Account was locked for {$userIdentifier} due to multiple failed login attempts on {$timestamp} at {$time} from IP address {$ipAddress}";
                    } else {
                        $attemptsText = $attemptsRemaining ? " with {$attemptsRemaining} attempts remaining" : "";
                        $sentence = "Failed login attempt for {$userIdentifier}{$attemptsText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                    }
                } else {
                    $eventText = ucwords(str_replace('_', ' ', $event));
                    $sentence = "Security event occurred: {$eventText} for {$userIdentifier} on {$timestamp} at {$time} from IP address {$ipAddress}";
                }
                break;
                
            case 'checkout':
                $orderId = $context['order_id'] ?? '';
                $amount = isset($context['total_amount']) ? "₱" . number_format($context['total_amount'], 2) : '';
                $amountText = $amount ? " for a total of {$amount}" : "";
                $sentence = "Customer {$userIdentifier} completed checkout for Order #{$orderId}{$amountText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'order_status_change':
                $orderId = $context['order_id'] ?? '';
                $oldStatus = ucfirst($context['old_status'] ?? '');
                $newStatus = ucfirst($context['new_status'] ?? '');
                $sentence = "Order #{$orderId} status was changed from {$oldStatus} to {$newStatus} by {$userIdentifier} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'stock_update':
                $productName = $context['product_name'] ?? "Product #" . ($context['product_id'] ?? '');
                $oldQty = $context['old_quantity'] ?? 0;
                $newQty = $context['new_quantity'] ?? 0;
                $reason = $context['reason'] ?? 'manual update';
                $reasonText = ucwords(str_replace('_', ' ', $reason));
                $sentence = "Stock was updated for {$productName} from {$oldQty} to {$newQty} items (Reason: {$reasonText}) by {$userIdentifier} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'user_management':
                $targetUserId = $context['target_user_id'] ?? '';
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "{$userIdentifier} {$actionText} user #{$targetUserId} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'product_management':
                $productName = $context['product_name'] ?? "Product #" . ($context['product_id'] ?? '');
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "{$userIdentifier} {$actionText} product: {$productName} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'delivery_status_change':
                $orderId = $context['order_id'] ?? '';
                $oldStatus = ucfirst($context['old_status'] ?? '');
                $newStatus = ucfirst($context['new_status'] ?? '');
                $sentence = "Delivery status for Order #{$orderId} was changed from {$oldStatus} to {$newStatus} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'critical_error':
                $error = $context['error'] ?? 'Unknown error';
                $sentence = "Critical system error occurred: {$error} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'maintenance':
                $sentence = "System maintenance was performed by {$userIdentifier} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'member_activity':
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "Member {$userIdentifier} performed: {$actionText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'staff_activity':
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "Staff member {$userIdentifier} performed: {$actionText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'customer_activity':
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "Customer {$userIdentifier} performed: {$actionText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'logistic_activity':
                $actionText = ucwords(str_replace('_', ' ', $action));
                $sentence = "Logistics staff {$userIdentifier} performed: {$actionText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'report_generation':
                $reportType = ucwords(str_replace('_', ' ', $context['report_type'] ?? 'report'));
                $sentence = "{$userIdentifier} generated a {$reportType} report on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            case 'data_export':
                $exportType = ucwords(str_replace('_', ' ', $context['export_type'] ?? 'data'));
                $recordCount = $context['record_count'] ?? '';
                $recordText = $recordCount ? " containing {$recordCount} records" : "";
                $sentence = "{$userIdentifier} exported {$exportType}{$recordText} on {$timestamp} at {$time} from IP address {$ipAddress}";
                break;
                
            default:
                $eventText = ucwords(str_replace('_', ' ', $eventType));
                $sentence = "System event occurred: {$eventText} for {$userIdentifier} on {$timestamp} at {$time} from IP address {$ipAddress}";
        }
        
        // Add additional context if relevant
        $additionalInfo = [];
        
        if (isset($context['admin_notes']) && $context['admin_notes']) {
            $additionalInfo[] = "Note: " . $context['admin_notes'];
        }
        
        if (isset($context['cart_items_count']) && $context['cart_items_count'] > 0) {
            $additionalInfo[] = "Cart contained {$context['cart_items_count']} items";
        }
        
        if (isset($context['filters_applied']) && !empty($context['filters_applied'])) {
            $filters = [];
            foreach ($context['filters_applied'] as $key => $value) {
                $filters[] = ucfirst($key) . ": " . $value;
            }
            $additionalInfo[] = "Applied filters: " . implode(', ', $filters);
        }
        
        if (isset($context['total_logs_viewed']) && $context['total_logs_viewed'] > 0) {
            $additionalInfo[] = "viewing {$context['total_logs_viewed']} logs";
        }
        
        // Combine sentence with additional information
        if (!empty($additionalInfo)) {
            $sentence .= ", " . implode(', ', $additionalInfo);
        }
        
        return [$sentence];
    }
    
    /**
     * Log with human-readable formatting and save to database (only if action is important)
     */
    private static function logFormatted($level, $message, $context = [])
    {
        $eventType = $context['event_type'] ?? '';
        $action = $context['action'] ?? $context['event'] ?? '';
        
        // Check if this action should be logged
        if (!self::shouldLogAction($eventType, $action, $context)) {
            return; // Skip logging for routine actions
        }
        
        // Format the human-readable details
        $formattedContext = self::formatLogContext($context, $message);
        $details = !empty($formattedContext) ? $formattedContext[0] : $message;
        
        // Extract user information
        $userId = $context['user_id'] ?? $context['admin_id'] ?? $context['staff_id'] ?? $context['member_id'] ?? $context['customer_id'] ?? $context['logistic_id'] ?? null;
        $userEmail = $context['user_email'] ?? null;
        
        // Get user email from database if not provided
        if ($userId && !$userEmail) {
            $user = User::find($userId);
            $userEmail = $user ? $user->email : null;
        }
        
        // Save to database
        try {
            SystemLog::create([
                'user_id' => $userId,
                'user_email' => $userEmail,
                'user_type' => $context['user_type'] ?? $context['performed_by_user_type'] ?? null,
                'action' => $action,
                'event_type' => $eventType,
                'details' => $details,
                'ip_address' => $context['ip_address'] ?? request()->ip(),
                'context' => $context,
                'performed_at' => isset($context['timestamp']) ? \Carbon\Carbon::parse($context['timestamp']) : now(),
            ]);
        } catch (\Exception $e) {
            // If database logging fails, fall back to file logging
            Log::channel('system')->error('Failed to save log to database: ' . $e->getMessage());
        }
        
        // Also log to file for backup
        $formattedMessage = $message;
        if (!empty($formattedContext)) {
            $formattedMessage .= " | " . implode(' | ', $formattedContext);
        }
        Log::channel('system')->$level($formattedMessage);
    }
    /**
     * Log customer checkout events
     */
    public static function logCheckout($userId, $orderId, $totalAmount, $status = 'success', $details = [])
    {
        $context = array_merge([
            'user_id' => $userId,
            'order_id' => $orderId,
            'total_amount' => $totalAmount,
            'event_type' => 'checkout',
            'status' => $status,
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Customer checkout completed', $context);
    }

    /**
     * Log order status changes
     */
    public static function logOrderStatusChange($orderId, $oldStatus, $newStatus, $userId, $userType, $details = [])
    {
        $context = array_merge([
            'order_id' => $orderId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'user_id' => $userId,
            'user_type' => $userType,
            'event_type' => 'order_status_change',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Order status changed', $context);
    }

    /**
     * Log stock updates
     */
    public static function logStockUpdate($stockId, $productId, $oldQuantity, $newQuantity, $userId, $userType, $reason = 'manual_update', $details = [])
    {
        $context = array_merge([
            'stock_id' => $stockId,
            'product_id' => $productId,
            'old_quantity' => $oldQuantity,
            'new_quantity' => $newQuantity,
            'quantity_change' => $newQuantity - $oldQuantity,
            'user_id' => $userId,
            'user_type' => $userType,
            'reason' => $reason,
            'event_type' => 'stock_update',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Stock quantity updated', $context);
    }

    /**
     * Log user management activities
     */
    public static function logUserManagement($action, $targetUserId, $performedByUserId, $userType, $details = [])
    {
        $context = array_merge([
            'action' => $action, // create, update, delete, role_change, etc.
            'target_user_id' => $targetUserId,
            'performed_by_user_id' => $performedByUserId,
            'performed_by_user_type' => $userType,
            'event_type' => 'user_management',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'User management action performed', $context);
    }

    /**
     * Log product management activities
     */
    public static function logProductManagement($action, $productId, $userId, $userType, $details = [])
    {
        $context = array_merge([
            'action' => $action, // create, update, delete, archive, unarchive
            'product_id' => $productId,
            'user_id' => $userId,
            'user_type' => $userType,
            'event_type' => 'product_management',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Product management action performed', $context);
    }

    /**
     * Log delivery status changes
     */
    public static function logDeliveryStatusChange($orderId, $oldStatus, $newStatus, $logisticId, $details = [])
    {
        $context = array_merge([
            'order_id' => $orderId,
            'old_delivery_status' => $oldStatus,
            'new_delivery_status' => $newStatus,
            'logistic_id' => $logisticId,
            'event_type' => 'delivery_status_change',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Delivery status changed', $context);
    }

    /**
     * Log critical system errors
     */
    public static function logCriticalError($error, $context = [])
    {
        $logContext = array_merge([
            'error' => $error,
            'event_type' => 'critical_error',
            'timestamp' => now()->toISOString(),
        ], $context);

        self::logFormatted('error', 'Critical system error occurred', $logContext);
    }

    /**
     * Log security events
     */
    public static function logSecurityEvent($event, $userId = null, $ipAddress = null, $details = [])
    {
        $context = array_merge([
            'event' => $event, // login_failed, unauthorized_access, etc.
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'event_type' => 'security_event',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('warning', 'Security event detected', $context);
    }

    /**
     * Log system maintenance activities
     */
    public static function logMaintenance($action, $userId, $details = [])
    {
        $context = array_merge([
            'action' => $action,
            'user_id' => $userId,
            'event_type' => 'maintenance',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'System maintenance performed', $context);
    }

    /**
     * Log member activities
     */
    public static function logMemberActivity($action, $memberId, $details = [])
    {
        $context = array_merge([
            'action' => $action,
            'member_id' => $memberId,
            'user_type' => 'member',
            'event_type' => 'member_activity',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Member activity performed', $context);
    }

    /**
     * Log staff activities
     */
    public static function logStaffActivity($action, $staffId, $userType, $details = [])
    {
        $context = array_merge([
            'action' => $action,
            'staff_id' => $staffId,
            'user_type' => $userType,
            'event_type' => 'staff_activity',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Staff activity performed', $context);
    }

    /**
     * Log customer activities
     */
    public static function logCustomerActivity($action, $customerId, $details = [])
    {
        $context = array_merge([
            'action' => $action,
            'customer_id' => $customerId,
            'user_type' => 'customer',
            'event_type' => 'customer_activity',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Customer activity performed', $context);
    }

    /**
     * Log logistic activities
     */
    public static function logLogisticActivity($action, $logisticId, $details = [])
    {
        $context = array_merge([
            'action' => $action,
            'logistic_id' => $logisticId,
            'user_type' => 'logistic',
            'event_type' => 'logistic_activity',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Logistic activity performed', $context);
    }

    /**
     * Log admin activities
     */
    public static function logAdminActivity($action, $adminId, $details = [])
    {
        $context = array_merge([
            'action' => $action,
            'admin_id' => $adminId,
            'user_type' => 'admin',
            'event_type' => 'admin_activity',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Admin activity performed', $context);
    }

    /**
     * Log report generation activities
     */
    public static function logReportGeneration($reportType, $userId, $userType, $details = [])
    {
        $context = array_merge([
            'report_type' => $reportType,
            'user_id' => $userId,
            'user_type' => $userType,
            'event_type' => 'report_generation',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Report generated', $context);
    }

    /**
     * Log authentication events
     */
    public static function logAuthentication($event, $userId = null, $userType = null, $details = [])
    {
        $context = array_merge([
            'event' => $event,
            'user_id' => $userId,
            'user_type' => $userType,
            'event_type' => 'authentication',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Authentication event', $context);
    }

    /**
     * Log data export activities
     */
    public static function logDataExport($exportType, $userId, $userType, $details = [])
    {
        $context = array_merge([
            'export_type' => $exportType,
            'user_id' => $userId,
            'user_type' => $userType,
            'event_type' => 'data_export',
            'timestamp' => now()->toISOString(),
        ], $details);

        self::logFormatted('info', 'Data export performed', $context);
    }
}
