<?php

return [
    // Navigation
    'dashboard' => 'Dashboard',
    'orders' => 'Orders',
    'assigned_orders' => 'Assigned Orders',
    'delivery_status' => 'Delivery Status',
    'profile' => 'Profile',
    'notifications' => 'Notifications',
    'logout' => 'Logout',
    
    // Dashboard
    'welcome_back' => 'Welcome back!',
    'whats_happening_today' => 'Here\'s what\'s happening with your deliveries today',
    'total_orders' => 'Total Orders',
    'all_time_orders' => 'All time orders',
    'awaiting_preparation' => 'Awaiting preparation',
    'ready_for_collection' => 'Ready for collection',
    'in_transit' => 'In transit',
    'successfully_delivered' => 'Successfully delivered',
    'recent_orders' => 'Recent Orders',
    'latest_assigned_orders' => 'Your latest assigned orders',
    'generate_report' => 'Generate Report',
    'view_all_orders' => 'View All Orders',
    'no_orders_assigned' => 'No orders assigned',
    'orders_will_appear_here' => 'You\'ll see your assigned orders here once they\'re available.',
    'view_details' => 'View Details',
    'view_more_orders' => 'View :count more orders',
    
    // Order Status
    'pending' => 'Pending',
    'ready_to_pickup' => 'Ready to Pick Up',
    'out_for_delivery' => 'Out for Delivery',
    'delivered' => 'Delivered',
    'status' => 'Status',
    
    // Assigned Orders Page
    'manage_assigned_orders' => 'Manage your assigned orders and update delivery status',
    'back_to_dashboard' => 'Back to Dashboard',
    'all_orders' => 'All Orders',
    'no_orders_assigned_yet' => 'No orders assigned to you yet.',
    'no_pending_orders' => 'No pending orders.',
    'no_orders_ready_pickup' => 'No orders ready for pickup.',
    'no_orders_out_delivery' => 'No orders out for delivery.',
    'no_delivered_orders' => 'No delivered orders.',
    
    // Order Details
    'customer' => 'Customer',
    'email' => 'Email',
    'date' => 'Date',
    'total' => 'Total',
    'products_in_order' => 'Products in Order',
    'more_items' => '+:count more item(s)',
    
    // Order Card Information
    'order_number' => 'Order #:id',
    'placed_on' => 'Placed on :date',
    'customer_name' => 'Customer Name',
    'customer_email' => 'Customer Email',
    'order_date' => 'Order Date',
    'order_total' => 'Order Total',
    
    // Quantity Formatting
    'kg' => 'kg',
    'pc' => 'pc',
    'tali' => 'tali',
    'kilo' => 'kilo',
    'piece' => 'piece',
    
    // Report
    'logistics_report' => 'Logistics Report',
    'logistics_report_description' => 'Generate comprehensive logistics reports and analytics',
    'export_csv' => 'Export CSV',
    'export_pdf' => 'Export PDF',
    
    // Common Actions
    'view' => 'View',
    'edit' => 'Edit',
    'update' => 'Update',
    'save' => 'Save',
    'cancel' => 'Cancel',
    'back' => 'Back',
    'loading' => 'Loading...',
    
    // Time and Date
    'created_at' => 'Created At',
    'updated_at' => 'Updated At',
    'delivered_at' => 'Delivered At',
    
    // Statistics
    'statistics' => 'Statistics',
    'performance' => 'Performance',
    'delivery_performance' => 'Delivery Performance',
    'completion_rate' => 'Completion Rate',
    'average_delivery_time' => 'Average Delivery Time',
    
    // Order Details Page
    'order_details' => 'Order Details',
    'order_details_management' => 'Order details and delivery management',
    'back_to_orders' => 'Back to Orders',
    'order_information' => 'Order Information',
    'order_id' => 'Order ID',
    'order_date' => 'Order Date',
    'total_amount' => 'Total Amount',
    'delivery_status' => 'Delivery Status',
    'ready_at' => 'Ready At',
    'packed_at' => 'Packed At',
    'delivered_at' => 'Delivered At',
    'customer_information' => 'Customer Information',
    'customer_name' => 'Customer Name',
    'contact_number' => 'Contact Number',
    'delivery_address' => 'Delivery Address',
    
    // Delivery Progress
    'delivery_status_completed' => 'Delivery Status (Completed)',
    'delivery_progress' => 'Delivery Progress',
    'preparing' => 'Preparing',
    'ready' => 'Ready',
    'order_pending_preparation' => 'This order is pending preparation. You cannot change the delivery status until the admin marks it as ready.',
    'order_ready_pickup' => 'Order is ready for pickup. Please collect it before proceeding to delivery.',
    'order_out_delivery' => 'Order is out for delivery. You can now mark it as delivered when you complete the delivery.',
    'order_delivered_completed' => 'This order has been delivered and cannot be modified.',
    'waiting_for_preparation' => 'Waiting for Preparation',
    'waiting_pickup_confirmation' => 'Waiting for Pickup Confirmation',
    'mark_as_delivered' => 'Mark as Delivered',
    'order_ready_pickup_note' => 'Order is ready for pickup. Please confirm pickup before marking as delivered.',
    'order_out_delivery_note' => 'Order is out for delivery. You can now mark it as delivered.',
    'order_delivered_note' => 'This order has been successfully delivered to the customer.',
    'delivery_proof' => 'Delivery Proof',
    
    // Order Items
    'order_items' => 'Order Items',
    'category' => 'Category',
    'price_per' => 'Price per',
    'quantity' => 'Quantity',
    'subtotal' => 'Subtotal',
    
    // Delivery Confirmation Modal
    'confirm_delivery' => 'Confirm Delivery',
    'upload_photo_confirm' => 'Please upload a photo of the delivered package and confirm the delivery.',
    'delivery_proof_image' => 'Delivery Proof Image',
    'click_upload_proof' => 'Click to upload delivery proof',
    'file_size_limit' => 'PNG, JPG, GIF up to 2MB',
    'delivery_proof_preview' => 'Delivery proof preview',
    'type_confirm_finalize' => 'Type "I Confirm" to finalize delivery',
    'i_confirm' => 'I Confirm',
    'action_cannot_undone' => 'This action cannot be undone. The order will be marked as delivered and become read-only.',
    'cancel' => 'Cancel',
    'confirm_delivery_button' => 'Confirm Delivery',
    'confirming' => 'Confirming...',
    'upload_image_required' => 'Please upload a delivery proof image.',
    'type_confirm_exact' => 'Please type "I Confirm" exactly to confirm delivery.',
    
    // Logistics Management
    'logistics_directory' => 'Logistics Directory',
    'viewing_deactivated_logistics' => 'Viewing deactivated logistics',
    'manage_and_view_all_logistics' => 'Manage and view all logistics',
    'search_logistics_placeholder' => 'Search logistics by name, email, or contact...',
    'not_available' => 'Not available',
    'protected' => 'Protected',
    'no_logistics_found' => 'No logistics found',
    'no_logistics_available' => 'No logistics available',
    'no_logistics_match_search' => 'No logistics match your search for ":search"',
    'no_deactivated_logistics' => 'No deactivated logistics',
    'no_logistics_registered' => 'No logistics have been registered yet.',
    'view_deactivated' => 'View Deactivated',
    'hide_deactivated' => 'Hide Deactivated',
    'registration_date' => 'Registration Date',
    'deactivate' => 'Deactivate',
    'reactivate' => 'Reactivate',
    
    // Additional missing keys
    'select_status' => 'Select status',
    'all_status' => 'All Statuses',
    'delivered_orders' => 'Delivered Orders',
    'not_ready' => 'Not Ready',
    'picked_up' => 'Picked Up',
    'not_picked_up' => 'Not Picked Up',
    'order_summary' => 'Order Summary',
    'items' => 'Items',
    'no_items_found' => 'No items found',
    
    // Additional showOrder page keys
    'waiting_for_preparation' => 'Waiting for Preparation',
    'waiting_pickup_confirmation' => 'Waiting for Pickup Confirmation',
    'order_ready_pickup_note' => 'Order is ready for pickup. Please confirm pickup before marking as delivered.',
    'order_out_delivery_note' => 'Order is out for delivery. You can now mark it as delivered.',
];

