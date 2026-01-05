<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Template</title>
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
            background: linear-gradient(135deg, #E91E63, #C2185B);
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
        .verification-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .verification-info h2 {
            color: #E91E63;
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
        .verification-section {
            background-color: #fce4ec;
            border: 1px solid #f8bbd9;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
        }
        .verification-section h3 {
            color: #c2185b;
            margin-top: 0;
        }
        .verify-btn {
            display: inline-block;
            background-color: #E91E63;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 15px 0;
            transition: background-color 0.3s ease;
        }
        .verify-btn:hover {
            background-color: #C2185B;
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
            <h1>📧 Verify Your Email</h1>
            <p>Please verify your email address to complete your registration.</p>
        </div>
        
        <div class="content">
            <div class="verification-info">
                <h2>📋 Account Information</h2>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">{{ $testData['user']->name ?? 'User' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">{{ $testData['user']->email ?? 'user@example.com' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Registration Date:</span>
                    <span class="value">{{ now()->format('F j, Y g:i A') }}</span>
                </div>
            </div>

            <div class="verification-section">
                <h3>🔐 Email Verification Required</h3>
                <p><strong>Please click the button below to verify your email address.</strong></p>
                <p>This step is required to activate your account and access all features.</p>
                <div style="text-align: center;">
                    <a href="#" class="verify-btn">Verify Email Address</a>
                </div>
                <p><small>If the button doesn't work, copy and paste this link into your browser:</small></p>
                <p><small style="word-break: break-all;">https://example.com/verify-email?token=abc123</small></p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated email verification from AgriCart Admin System.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>&copy; {{ date('Y') }} AgriCart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
