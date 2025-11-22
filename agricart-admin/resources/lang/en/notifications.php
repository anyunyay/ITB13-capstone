<?php

return [
    // Admin/Staff Notifications
    'new_order' => 'New order #:order_id from :customer_name',
    'inventory_update_added' => 'Stock added: :product_name by :member_name',
    'inventory_update_updated' => 'Stock updated: :product_name by :member_name',
    'inventory_update_removed' => 'Stock removed: :product_name by :member_name',
    'membership_update_added' => 'New member added: :member_name',
    'membership_update_updated' => 'Member updated: :member_name',
    'membership_update_deactivated' => 'Member deactivated: :member_name',
    'membership_update_reactivated' => 'Member reactivated: :member_name',
    'password_change_request' => 'Password change request from member :member_identifier',

    // Customer Notifications
    'order_confirmation' => 'Order Confirmed',
    'order_confirmation_sub' => 'Estimated Approval Time: 24Hrs',
    'order_status_approved' => 'Your order has been approved and is being processed.',
    'order_status_processing' => 'Your order is being prepared for delivery.',
    'order_status_ready_for_pickup' => 'Order is ready for pickup.',
    'order_ready_for_pickup' => 'Your order #:order_id is ready for pickup',
    'order_picked_up' => 'Your order #:order_id has been picked up',
    'delivery_status_pending' => 'Your order is pending and waiting to be processed.',
    'delivery_status_ready_to_pickup' => 'Your order is ready for pickup. Please coordinate with the assigned logistic provider.',
    'delivery_status_out_for_delivery' => 'Your order is out for delivery!',
    'delivery_status_delivered' => 'Your order has been delivered successfully!',
    'order_rejection' => 'Order #:order_id has been rejected',
    'order_rejection_reason' => 'Reason: :reason',

    // Member Notifications
    'product_sale' => 'Your product :product_name was sold to :customer_name',
    'earnings_update' => 'New :period earnings: ₱:amount',
    'low_stock_alert' => 'Low :stock_type stock alert: :product_name has only :quantity units left',
    'stock_added' => 'Stock added for :product_name by :admin_name',

    // Logistic Notifications
    'delivery_task' => 'New delivery task for order #:order_id',
    'order_status_logistic' => 'Order #:order_id status: :status',
    'logistic_order_ready' => 'Order #:order_id is ready for pickup. Please collect it before proceeding to delivery.',
    'logistic_order_picked_up' => 'Order #:order_id pickup confirmed. Please proceed with delivery to :customer_name.',
    
    // Additional Notifications
    'order_delayed' => 'Your order #:order_id has been delayed',
    'order_delayed_sub' => 'Contact us at :contact_email if you have concerns',
    'order_receipt' => 'Order receipt sent for order #:order_id',
    'password_change_request_cancelled' => 'Password change request cancelled by :member_name (ID: :member_identifier)',
    'suspicious_order_detected' => '⚠️ Suspicious Order: :customer_name placed :order_count orders within 10 minutes (Order #:order_id)',
];
