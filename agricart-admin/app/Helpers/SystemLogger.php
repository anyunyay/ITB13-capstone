<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class SystemLogger
{
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

        Log::channel('system')->info('Customer checkout completed', $context);
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

        Log::channel('system')->info('Order status changed', $context);
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

        Log::channel('system')->info('Stock quantity updated', $context);
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

        Log::channel('system')->info('User management action performed', $context);
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

        Log::channel('system')->info('Product management action performed', $context);
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

        Log::channel('system')->info('Delivery status changed', $context);
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

        Log::channel('system')->error('Critical system error occurred', $logContext);
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

        Log::channel('system')->warning('Security event detected', $context);
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

        Log::channel('system')->info('System maintenance performed', $context);
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

        Log::channel('system')->info('Member activity performed', $context);
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

        Log::channel('system')->info('Staff activity performed', $context);
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

        Log::channel('system')->info('Customer activity performed', $context);
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

        Log::channel('system')->info('Logistic activity performed', $context);
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

        Log::channel('system')->info('Admin activity performed', $context);
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

        Log::channel('system')->info('Report generated', $context);
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

        Log::channel('system')->info('Authentication event', $context);
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

        Log::channel('system')->info('Data export performed', $context);
    }
}
