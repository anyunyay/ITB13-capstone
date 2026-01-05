<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification Email Template</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: hidden;
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
        .status-pending {
            background-color: #ff9800;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .action-section {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
            text-align: center;
        }
        .action-section h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .action-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 15px;
            transition: background-color 0.3s ease;
        }
        .action-btn:hover {
            background-color: #45a049;
            color: white;
        }
        .back-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-bottom: 20px;
            transition: background-color 0.3s ease;
        }
        .back-btn:hover {
            background-color: #45a049;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="padding: 20px; text-align: center;">
            <a href="{{ route('direct.templates') }}" class="back-btn">← Back to All Templates</a>
        </div>
        
        <div class="header">
            <h1>🛒 New Order Received</h1>
            <p>A new order has been placed and requires your attention.</p>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h2>📋 Order Information</h2>
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">#{{ $testData['order']->id }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Customer:</span>
                    <span class="value">{{ $testData['customer']->name ?? 'Customer' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Customer Email:</span>
                    <span class="value">{{ $testData['customer']->email ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Total Amount:</span>
                    <span class="value">₱{{ number_format($testData['order']->total_amount, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status-pending">⏳ Pending</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">Order Date:</span>
                    <span class="value">{{ $testData['order']->created_at ? $testData['order']->created_at->format('F j, Y g:i A') : 'N/A' }}</span>
                </div>
            </div>

            <div class="items-section">
                <h3>🛒 Order Items</h3>
                @foreach($testData['order']->auditTrail as $item)
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
                    Total Amount: ₱{{ number_format($testData['order']->total_amount, 2) }}
                </div>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">New order awaiting approval</p>
            </div>

            <div class="action-section">
                <h3>⚡ Action Required</h3>
                <p>This order requires your review and approval within 24 hours.</p>
                <p>Please check the order details and approve or reject accordingly.</p>
                <a href="#" class="action-btn">Review Order in Admin Panel</a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from AgriCart Admin System.</p>
            <p>Please review and process this order as soon as possible.</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
