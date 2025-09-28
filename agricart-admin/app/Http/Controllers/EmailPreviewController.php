<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\OrderNotificationPreview;

class EmailPreviewController extends Controller
{
    /**
     * Show the email preview index page
     */
    public function index()
    {
        return view('emails.preview.index');
    }

    /**
     * Preview order approval email
     */
    public function approval()
    {
        $mailable = new OrderNotificationPreview('approval');
        return $mailable->render();
    }

    /**
     * Preview order rejection email
     */
    public function rejection()
    {
        $mailable = new OrderNotificationPreview('rejection');
        return $mailable->render();
    }

    /**
     * Preview order approval email with custom data
     */
    public function approvalCustom(Request $request)
    {
        $orderId = $request->get('order_id');
        
        if ($orderId) {
            // Try to get real order data
            $order = \App\Models\Sales::with(['customer', 'admin', 'auditTrail.product'])
                ->find($orderId);
            
            if ($order) {
                $mailable = new OrderNotificationPreview('approval');
                $mailable->order = $order;
                $mailable->customer = $order->customer;
                $mailable->admin = $order->admin;
                return $mailable->render();
            }
        }
        
        // Fallback to test data
        return $this->approval();
    }

    /**
     * Preview order rejection email with custom data
     */
    public function rejectionCustom(Request $request)
    {
        $orderId = $request->get('order_id');
        
        if ($orderId) {
            // Try to get real order data
            $order = \App\Models\Sales::with(['customer', 'admin', 'auditTrail.product'])
                ->find($orderId);
            
            if ($order) {
                $mailable = new OrderNotificationPreview('rejection');
                $mailable->order = $order;
                $mailable->customer = $order->customer;
                $mailable->admin = $order->admin;
                return $mailable->render();
            }
        }
        
        // Fallback to test data
        return $this->rejection();
    }

    /**
     * Preview any notification type
     */
    public function preview($type)
    {
        $mailable = new OrderNotificationPreview($type);
        return $mailable->render();
    }

    /**
     * Get all available notification types
     */
    public function types()
    {
        $types = [
            'approval' => 'Order Approval & Receipt',
            'rejection' => 'Order Rejection',
            'new_order' => 'New Order Notification',
            'order_confirmation' => 'Order Confirmation',
            'order_status_update' => 'Order Status Update',
            'delivery_status_update' => 'Delivery Status Update',
            'delivery_task' => 'Delivery Task Assignment',
            'product_sale' => 'Product Sale Notification',
            'earnings_update' => 'Earnings Update',
            'low_stock_alert' => 'Low Stock Alert',
            'inventory_update' => 'Inventory Update',
            'membership_update' => 'Membership Update',
            'order_delayed' => 'Order Delayed',
            'verify_email' => 'Email Verification',
        ];

        return response()->json($types);
    }
}
