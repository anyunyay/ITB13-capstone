<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Receipt - Order #{{ $order->id }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .content {
            padding: 30px;
        }
        .order-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .order-info h2 {
            color: #4CAF50;
            margin-top: 0;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #555;
        }
        .value {
            color: #333;
        }
        .items-section {
            margin-top: 25px;
        }
        .items-section h3 {
            color: #4CAF50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .item {
            background-color: #f9f9f9;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #4CAF50;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .product-name {
            font-weight: 600;
            color: #333;
        }
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #666;
        }
        .total-section {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 25px;
            text-align: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 600;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .status-approved {
            background-color: #4CAF50;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .admin-notes {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin-top: 15px;
        }
        .admin-notes h4 {
            color: #856404;
            margin-top: 0;
            font-size: 14px;
        }
        .next-steps {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .next-steps h3 {
            color: #0c5460;
            margin-top: 0;
            font-size: 18px;
        }
        .next-steps ul {
            margin: 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 8px;
            color: #0c5460;
        }
        .apology-section {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
            text-align: center;
        }
        .apology-section h3 {
            color: #155724;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Approved!</h1>
            <p>Your order has been successfully approved and is now being processed.</p>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h2>📋 Order Information</h2>
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">#{{ $order->id }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Order Date:</span>
                    <span class="value">{{ $order->created_at ? $order->created_at->format('F j, Y g:i A') : 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Approval Date:</span>
                    <span class="value">{{ $order->updated_at ? $order->updated_at->format('F j, Y g:i A') : 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status-approved">✓ Approved</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">Approved by:</span>
                    <span class="value">{{ $admin->name ?? 'System Admin' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Customer:</span>
                    <span class="value">{{ $customer->name ?? 'Customer' }}</span>
                </div>
                @if($customer->contact_number)
                <div class="info-row">
                    <span class="label">Contact Number:</span>
                    <span class="value">{{ $customer->contact_number }}</span>
                </div>
                @endif
                @if($customer->address)
                <div class="info-row">
                    <span class="label">Address:</span>
                    <span class="value">{{ $customer->address }}</span>
                </div>
                @endif
                @if($customer->barangay)
                <div class="info-row">
                    <span class="label">Barangay:</span>
                    <span class="value">{{ $customer->barangay }}</span>
                </div>
                @endif
                @if($customer->city)
                <div class="info-row">
                    <span class="label">City:</span>
                    <span class="value">{{ $customer->city }}</span>
                </div>
                @endif
                @if($customer->province)
                <div class="info-row">
                    <span class="label">Province:</span>
                    <span class="value">{{ $customer->province }}</span>
                </div>
                @endif
            </div>

            @if($order->admin_notes)
            <div class="admin-notes">
                <h4>📝 Admin Notes:</h4>
                <p>{{ $order->admin_notes }}</p>
            </div>
            @endif

            <div class="items-section">
                <h3>🛒 Order Items</h3>
                @foreach($order->auditTrail as $item)
                <div class="item">
                    <div class="item-header">
                        <span class="product-name">{{ $item->product->name }}</span>
                    </div>
                    <div class="item-details">
                        <span>Quantity: {{ $item->quantity }} {{ $item->category }}</span>
                        <span>Price: ₱{{ number_format($item->product->price_kilo ?? $item->product->price_pc ?? $item->product->price_tali, 2) }}</span>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="total-section">
                <div class="total-amount">
                    Total Amount: ₱{{ number_format($order->total_amount, 2) }}
                </div>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order!</p>
            </div>

            <div class="next-steps">
                <h3>📦 What happens next?</h3>
                <ul>
                    <li><strong>Order Preparation:</strong> Your order is being prepared for delivery</li>
                    <li><strong>Logistic Assignment:</strong> A delivery provider will be assigned soon</li>
                    <li><strong>Delivery Updates:</strong> You will receive email updates about delivery progress</li>
                    <li><strong>Estimated Delivery:</strong> Within 48 hours from approval</li>
                    <li><strong>Tracking:</strong> You can track your order in your account</li>
                </ul>
            </div>

            <div class="apology-section">
                <h3>🎉 Thank you for choosing AgriCart!</h3>
                <p>We're excited to deliver fresh, quality products to your doorstep. Our team is working hard to ensure your order arrives on time and in perfect condition.</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated receipt from AgriCart Admin System.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html> 