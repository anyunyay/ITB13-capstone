<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Task Assignment Email Template</title>
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
            background: linear-gradient(135deg, #9C27B0, #7B1FA2);
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
        .task-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .task-info h2 {
            color: #9C27B0;
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
        .task-section {
            background-color: #f3e5f5;
            border: 1px solid #ce93d8;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .task-section h3 {
            color: #7b1fa2;
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
            <h1>📦 New Delivery Task</h1>
            <p>A new delivery task has been assigned to you.</p>
        </div>
        
        <div class="content">
            <div class="task-info">
                <h2>📋 Task Information</h2>
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">#{{ $testData['order']->id }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Customer:</span>
                    <span class="value">{{ $testData['customer']->name ?? 'Customer' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Total Amount:</span>
                    <span class="value">₱{{ number_format($testData['order']->total_amount, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Assignment Date:</span>
                    <span class="value">{{ now()->format('F j, Y g:i A') }}</span>
                </div>
            </div>

            <div class="task-section">
                <h3>🚚 Delivery Instructions</h3>
                <p><strong>Please proceed with the delivery of this order.</strong></p>
                <p>• Contact the customer before delivery</p>
                <p>• Ensure all items are included</p>
                <p>• Collect payment if required</p>
                <p>• Update delivery status upon completion</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated task assignment from AgriCart Admin System.</p>
            <p>Please complete this delivery task as soon as possible.</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
