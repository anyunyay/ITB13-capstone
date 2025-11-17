<?php

return [
    // Admin/Staff Notifications
    'new_order' => 'Bagong order #:order_id mula kay :customer_name',
    'inventory_update_added' => 'Idinagdag ang stock: :product_name ni :member_name',
    'inventory_update_updated' => 'Na-update ang stock: :product_name ni :member_name',
    'inventory_update_removed' => 'Inalis ang stock: :product_name ni :member_name',
    'membership_update_added' => 'Bagong miyembro: :member_name',
    'membership_update_updated' => 'Na-update ang miyembro: :member_name',
    'membership_update_deactivated' => 'Na-deactivate ang miyembro: :member_name',
    'membership_update_reactivated' => 'Na-activate muli ang miyembro: :member_name',
    'password_change_request' => 'Kahilingan sa pagpalit ng password mula sa miyembro :member_identifier',

    // Customer Notifications
    'order_confirmation' => 'Nakumpirma ang Order',
    'order_confirmation_sub' => 'Tinatayang Oras ng Pag-apruba: 24 Oras',
    'order_status_approved' => 'Ang iyong order ay naaprubahan na at pinoproseso.',
    'order_status_processing' => 'Ang iyong order ay inihahanda para sa paghahatid.',
    'order_status_ready_for_pickup' => 'Handa na ang order para sa pickup.',
    'order_ready_for_pickup' => 'Ang iyong order #:order_id ay handa na para sa pickup',
    'order_picked_up' => 'Ang iyong order #:order_id ay nakuha na',
    'delivery_status_out_for_delivery' => 'Ang iyong order ay nasa daan na para sa paghahatid!',
    'delivery_status_delivered' => 'Ang iyong order ay naihatid na!',
    'order_rejection' => 'Ang order #:order_id ay tinanggihan',
    'order_rejection_reason' => 'Dahilan: :reason',

    // Member Notifications
    'product_sale' => 'Ang iyong produkto :product_name ay nabili ni :customer_name',
    'earnings_update' => 'Bagong :period kita: ₱:amount',
    'low_stock_alert' => 'Babala sa mababang :stock_type stock: :product_name ay may :quantity units na lang',
    'stock_added' => 'Idinagdag ang stock para sa :product_name ni :admin_name',

    // Logistic Notifications
    'delivery_task' => 'Bagong delivery task para sa order #:order_id',
    'order_status_logistic' => 'Order #:order_id status: :status',
    'logistic_order_ready' => 'Ang order #:order_id ay handa na para sa pickup. Pakikuha ito bago magpatuloy sa delivery.',
    'logistic_order_picked_up' => 'Nakumpirma ang pickup ng order #:order_id. Magpatuloy sa delivery kay :customer_name.',
    
    // Additional Notifications
    'order_delayed' => 'Ang iyong order #:order_id ay naantala',
    'order_delayed_sub' => 'Makipag-ugnayan sa amin sa :contact_email kung mayroon kang mga alalahanin',
    'order_receipt' => 'Naipadala ang resibo ng order para sa order #:order_id',
    'password_change_request_cancelled' => 'Kinansela ang kahilingan sa pagpalit ng password ni :member_name (ID: :member_identifier)',
];
