<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Preview Error</title>
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 30px;
            text-align: center;
        }
        .error-icon {
            font-size: 48px;
            color: #e74c3c;
            margin-bottom: 20px;
        }
        .error-title {
            color: #e74c3c;
            font-size: 24px;
            margin-bottom: 15px;
        }
        .error-message {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .back-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
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
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">Email Preview Error</h1>
        <p class="error-message">{{ $message ?? 'An error occurred while generating the email preview.' }}</p>
        <a href="{{ url('/comprehensive-email-preview') }}" class="back-btn">Back to Email Preview</a>
    </div>
</body>
</html>
