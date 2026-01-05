<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Status Update Email Template</title>
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
            background: linear-gradient(135deg, #FF9800, #F57C00);
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
            color: #FF9800;
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
        .status-delivery {
            background-color: #FF9800;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .delivery-section {
            background-color: #fff3e0;
            border: 1px solid #ffcc02;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .delivery-section h3 {
            color: #e65100;
            margin-top: 0;
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
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="padding: 20px; text-align: center;">
            <a href="{{ route('direct.templates') }}" class="back-btn">← Back to All Templates</a>
        </div>
        
        <div class="header">
            <h1>🚚 Delivery Update</h1>
            <p>Your delivery status has been updated.</p>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h2>📋 Order Information</h2>
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">#{{ $testData['order']->id }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Delivery Status:</span>
                    <span class="value">
                        <span class="status-delivery">🚚 Out for Delivery</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">Update Date:</span>
                    <span class="value">{{ now()->format('F j, Y g:i A') }}</span>
                </div>
            </div>

            <div class="delivery-section">
                <h3>📦 Delivery Progress</h3>
                <p><strong>Your order is now out for delivery!</strong></p>
                <p>Our delivery team is on the way to your location.</p>
                <p>Expected delivery time: Within the next 2-4 hours</p>
                <p>Please ensure someone is available to receive the order.</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated delivery update from AgriCart Admin System.</p>
            <p>Thank you for choosing AgriCart!</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
