<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Update Email Template</title>
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
            background: linear-gradient(135deg, #607D8B, #455A64);
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
        .inventory-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .inventory-info h2 {
            color: #607D8B;
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
        .update-section {
            background-color: #eceff1;
            border: 1px solid #b0bec5;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .update-section h3 {
            color: #455a64;
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
            <h1>📦 Inventory Update</h1>
            <p>Inventory has been updated in the system.</p>
        </div>
        
        <div class="content">
            <div class="inventory-info">
                <h2>📋 Update Information</h2>
                <div class="info-row">
                    <span class="label">Product:</span>
                    <span class="value">{{ $testData['product']->name ?? 'Product' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Update Type:</span>
                    <span class="value">Added</span>
                </div>
                <div class="info-row">
                    <span class="label">Admin:</span>
                    <span class="value">{{ $testData['admin']->name ?? 'System Admin' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Update Date:</span>
                    <span class="value">{{ now()->format('F j, Y g:i A') }}</span>
                </div>
            </div>

            <div class="update-section">
                <h3>📊 Inventory Change Details</h3>
                <p><strong>Inventory has been updated in the system.</strong></p>
                <p>• Product: {{ $testData['product']->name ?? 'Product' }}</p>
                <p>• Action: Added to inventory</p>
                <p>• Updated by: {{ $testData['admin']->name ?? 'System Admin' }}</p>
                <p>• Please review the changes in the admin panel</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated inventory update from AgriCart Admin System.</p>
            <p>Please review the changes in the admin panel.</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
