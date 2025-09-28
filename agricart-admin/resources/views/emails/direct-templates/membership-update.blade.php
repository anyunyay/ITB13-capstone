<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Membership Update Email Template</title>
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
            background: linear-gradient(135deg, #3F51B5, #303F9F);
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
        .membership-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .membership-info h2 {
            color: #3F51B5;
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
            background-color: #e8eaf6;
            border: 1px solid #9fa8da;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .update-section h3 {
            color: #303f9f;
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
            <h1>👥 Membership Update</h1>
            <p>Your membership status has been updated.</p>
        </div>
        
        <div class="content">
            <div class="membership-info">
                <h2>📋 Membership Information</h2>
                <div class="info-row">
                    <span class="label">Member:</span>
                    <span class="value">{{ $testData['member']->name ?? 'Member' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">Active</span>
                </div>
                <div class="info-row">
                    <span class="label">Updated by:</span>
                    <span class="value">{{ $testData['admin']->name ?? 'System Admin' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Update Date:</span>
                    <span class="value">{{ now()->format('F j, Y g:i A') }}</span>
                </div>
            </div>

            <div class="update-section">
                <h3>🎉 Membership Status Update</h3>
                <p><strong>Your membership status has been updated.</strong></p>
                <p>• Member: {{ $testData['member']->name ?? 'Member' }}</p>
                <p>• New Status: Active</p>
                <p>• Updated by: {{ $testData['admin']->name ?? 'System Admin' }}</p>
                <p>• You now have access to all member benefits</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated membership update from AgriCart Admin System.</p>
            <p>Welcome to AgriCart membership!</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
