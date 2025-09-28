<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert Email Template</title>
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
            background: linear-gradient(135deg, #FF5722, #D84315);
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
        .alert-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .alert-info h2 {
            color: #FF5722;
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
        .alert-section {
            background-color: #ffebee;
            border: 1px solid #ffcdd2;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .alert-section h3 {
            color: #c62828;
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
            <h1>⚠️ Low Stock Alert</h1>
            <p>Your product stock is running low.</p>
        </div>
        
        <div class="content">
            <div class="alert-info">
                <h2>📦 Stock Information</h2>
                <div class="info-row">
                    <span class="label">Product:</span>
                    <span class="value">{{ $testData['product']->name ?? 'Product' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Current Stock:</span>
                    <span class="value">{{ $testData['stock']->quantity ?? 0 }} units</span>
                </div>
                <div class="info-row">
                    <span class="label">Member:</span>
                    <span class="value">{{ $testData['member']->name ?? 'Member' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Alert Date:</span>
                    <span class="value">{{ now()->format('F j, Y g:i A') }}</span>
                </div>
            </div>

            <div class="alert-section">
                <h3>🚨 Stock Alert Details</h3>
                <p><strong>Your product stock is running low and needs attention.</strong></p>
                <p>• Current stock level: {{ $testData['stock']->quantity ?? 0 }} units</p>
                <p>• Recommended action: Restock your inventory</p>
                <p>• Consider adding more products to maintain availability</p>
                <p>• Update your stock levels in the member dashboard</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated stock alert from AgriCart Admin System.</p>
            <p>Please update your inventory to avoid stockouts.</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
