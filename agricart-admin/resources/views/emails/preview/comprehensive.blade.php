<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Email Preview - AgriCart Admin</title>
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
            max-width: 1400px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 32px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .categories {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        .category {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            border: 2px solid #e0e0e0;
        }
        .category h3 {
            color: #4CAF50;
            margin-top: 0;
            font-size: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        .email-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .email-item {
            margin-bottom: 15px;
            padding: 12px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
        }
        .email-item:hover {
            border-color: #4CAF50;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .email-item h4 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 16px;
        }
        .email-item p {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
        }
        .preview-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        .preview-btn:hover {
            background-color: #45a049;
            color: white;
        }
        .preview-btn.warning {
            background-color: #ff9800;
        }
        .preview-btn.warning:hover {
            background-color: #f57c00;
        }
        .preview-btn.danger {
            background-color: #e74c3c;
        }
        .preview-btn.danger:hover {
            background-color: #c0392b;
        }
        .stats {
            background-color: #e8f5e8;
            border: 1px solid #4CAF50;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .stats h3 {
            color: #4CAF50;
            margin-top: 0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Comprehensive Email Preview System</h1>
            <p>Preview all email notifications in the AgriCart Admin System</p>
        </div>

        <div class="stats">
            <h3>📊 Email System Overview</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">14</div>
                    <div class="stat-label">Total Email Types</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">4</div>
                    <div class="stat-label">User Roles</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">6</div>
                    <div class="stat-label">Order Related</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">3</div>
                    <div class="stat-label">Member Related</div>
                </div>
            </div>
        </div>

        <div class="categories">
            <!-- Order Management Emails -->
            <div class="category">
                <h3>🛒 Order Management</h3>
                <ul class="email-list">
                    <li class="email-item">
                        <h4>New Order Notification</h4>
                        <p>Sent to admin/staff when customers place new orders</p>
                        <a href="{{ route('comprehensive.preview', 'new_order') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Order Confirmation</h4>
                        <p>Sent to customers when orders are confirmed</p>
                        <a href="{{ route('comprehensive.preview', 'order_confirmation') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Order Status Update</h4>
                        <p>Sent to customers when order status changes</p>
                        <a href="{{ route('comprehensive.preview', 'order_status_update') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Order Delayed</h4>
                        <p>Sent to customers when orders are delayed</p>
                        <a href="{{ route('comprehensive.preview', 'order_delayed') }}" class="preview-btn danger" target="_blank">Preview</a>
                    </li>
                </ul>
            </div>

            <!-- Delivery Emails -->
            <div class="category">
                <h3>🚚 Delivery & Logistics</h3>
                <ul class="email-list">
                    <li class="email-item">
                        <h4>Delivery Status Update</h4>
                        <p>Sent to customers about delivery progress</p>
                        <a href="{{ route('comprehensive.preview', 'delivery_status_update') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Delivery Task Assignment</h4>
                        <p>Sent to logistics when tasks are assigned</p>
                        <a href="{{ route('comprehensive.preview', 'delivery_task') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                </ul>
            </div>

            <!-- Member/Farmer Emails -->
            <div class="category">
                <h3>👨‍🌾 Member & Farmer</h3>
                <ul class="email-list">
                    <li class="email-item">
                        <h4>Product Sale Notification</h4>
                        <p>Sent to members when their products are sold</p>
                        <a href="{{ route('comprehensive.preview', 'product_sale') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Earnings Update</h4>
                        <p>Sent to members about earnings changes</p>
                        <a href="{{ route('comprehensive.preview', 'earnings_update') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Low Stock Alert</h4>
                        <p>Sent to members when stock is running low</p>
                        <a href="{{ route('comprehensive.preview', 'low_stock_alert') }}" class="preview-btn warning" target="_blank">Preview</a>
                    </li>
                </ul>
            </div>

            <!-- Admin & System Emails -->
            <div class="category">
                <h3>⚙️ Admin & System</h3>
                <ul class="email-list">
                    <li class="email-item">
                        <h4>Inventory Update</h4>
                        <p>Sent to admin when inventory changes</p>
                        <a href="{{ route('comprehensive.preview', 'inventory_update') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Membership Update</h4>
                        <p>Sent to admin when membership changes</p>
                        <a href="{{ route('comprehensive.preview', 'membership_update') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                    <li class="email-item">
                        <h4>Email Verification</h4>
                        <p>Sent to users for email verification</p>
                        <a href="{{ route('comprehensive.preview', 'verify_email') }}" class="preview-btn" target="_blank">Preview</a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>AgriCart Admin System</strong> - Comprehensive Email Preview Tool</p>
            <p>This system allows you to preview all email notifications across the entire platform.</p>
            <p>All previews use realistic test data to demonstrate how emails will appear to users.</p>
            <p><strong>Note:</strong> This is a development tool for testing and preview purposes.</p>
        </div>
    </div>
</body>
</html>
