<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Preview - AgriCart Admin</title>
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
            max-width: 1200px;
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
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        .preview-card {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border: 2px solid #e0e0e0;
            transition: all 0.3s ease;
        }
        .preview-card:hover {
            border-color: #4CAF50;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .preview-card h3 {
            color: #4CAF50;
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        .preview-card p {
            color: #666;
            margin: 0 0 20px 0;
            font-size: 14px;
        }
        .preview-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        .preview-btn:hover {
            background-color: #45a049;
            color: white;
        }
        .preview-btn.rejection {
            background-color: #e74c3c;
        }
        .preview-btn.rejection:hover {
            background-color: #c0392b;
        }
        .custom-preview {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .custom-preview h3 {
            color: #856404;
            margin-top: 0;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .form-group input:focus {
            outline: none;
            border-color: #4CAF50;
        }
        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
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
            <h1>📧 Email Preview System</h1>
            <p>Preview all email notifications in the AgriCart Admin System</p>
        </div>

        <div class="preview-grid">
            <!-- Order Management Emails -->
            <div class="preview-card">
                <h3>🎉 Order Approval Email</h3>
                <p>Preview the email sent to customers when their order is approved by admin/staff. Includes detailed receipt information and next steps.</p>
                <a href="{{ route('email.preview.approval') }}" class="preview-btn" target="_blank">
                    Preview Approval Email
                </a>
            </div>

            <div class="preview-card">
                <h3>📋 Order Rejection Email</h3>
                <p>Preview the email sent to customers when their order is declined by admin/staff. Includes reason and next steps.</p>
                <a href="{{ route('email.preview.rejection') }}" class="preview-btn rejection" target="_blank">
                    Preview Rejection Email
                </a>
            </div>

            <div class="preview-card">
                <h3>🛒 New Order Notification</h3>
                <p>Preview the email sent to admin/staff when a new order is placed by a customer.</p>
                <a href="{{ route('email.preview.type', 'new_order') }}" class="preview-btn" target="_blank">
                    Preview New Order Email
                </a>
            </div>

            <div class="preview-card">
                <h3>✅ Order Confirmation</h3>
                <p>Preview the email sent to customers when their order is confirmed and placed.</p>
                <a href="{{ route('email.preview.type', 'order_confirmation') }}" class="preview-btn" target="_blank">
                    Preview Confirmation Email
                </a>
            </div>

            <div class="preview-card">
                <h3>📊 Order Status Update</h3>
                <p>Preview the email sent to customers when their order status changes.</p>
                <a href="{{ route('email.preview.type', 'order_status_update') }}" class="preview-btn" target="_blank">
                    Preview Status Update
                </a>
            </div>

            <div class="preview-card">
                <h3>⏰ Order Delayed</h3>
                <p>Preview the email sent to customers when their order is delayed.</p>
                <a href="{{ route('email.preview.type', 'order_delayed') }}" class="preview-btn rejection" target="_blank">
                    Preview Delayed Email
                </a>
            </div>

            <!-- Delivery Emails -->
            <div class="preview-card">
                <h3>🚚 Delivery Status Update</h3>
                <p>Preview the email sent to customers about delivery status changes.</p>
                <a href="{{ route('email.preview.type', 'delivery_status_update') }}" class="preview-btn" target="_blank">
                    Preview Delivery Update
                </a>
            </div>

            <div class="preview-card">
                <h3>📦 Delivery Task Assignment</h3>
                <p>Preview the email sent to logistics when a delivery task is assigned.</p>
                <a href="{{ route('email.preview.type', 'delivery_task') }}" class="preview-btn" target="_blank">
                    Preview Task Assignment
                </a>
            </div>

            <!-- Member/Farmer Emails -->
            <div class="preview-card">
                <h3>💰 Product Sale Notification</h3>
                <p>Preview the email sent to members when their product is sold.</p>
                <a href="{{ route('email.preview.type', 'product_sale') }}" class="preview-btn" target="_blank">
                    Preview Sale Notification
                </a>
            </div>

            <div class="preview-card">
                <h3>💵 Earnings Update</h3>
                <p>Preview the email sent to members about their earnings updates.</p>
                <a href="{{ route('email.preview.type', 'earnings_update') }}" class="preview-btn" target="_blank">
                    Preview Earnings Update
                </a>
            </div>

            <div class="preview-card">
                <h3>⚠️ Low Stock Alert</h3>
                <p>Preview the email sent to members when their stock is running low.</p>
                <a href="{{ route('email.preview.type', 'low_stock_alert') }}" class="preview-btn rejection" target="_blank">
                    Preview Low Stock Alert
                </a>
            </div>

            <!-- Admin Emails -->
            <div class="preview-card">
                <h3>📦 Inventory Update</h3>
                <p>Preview the email sent to admin when inventory is updated.</p>
                <a href="{{ route('email.preview.type', 'inventory_update') }}" class="preview-btn" target="_blank">
                    Preview Inventory Update
                </a>
            </div>

            <div class="preview-card">
                <h3>👥 Membership Update</h3>
                <p>Preview the email sent to admin when membership is updated.</p>
                <a href="{{ route('email.preview.type', 'membership_update') }}" class="preview-btn" target="_blank">
                    Preview Membership Update
                </a>
            </div>

            <!-- System Emails -->
            <div class="preview-card">
                <h3>✉️ Email Verification</h3>
                <p>Preview the email sent to users for email verification.</p>
                <a href="{{ route('email.preview.type', 'verify_email') }}" class="preview-btn" target="_blank">
                    Preview Verification Email
                </a>
            </div>
        </div>

        <div class="custom-preview">
            <h3>🔍 Custom Order Preview</h3>
            <p>Preview emails with data from a specific order ID:</p>
            
            <form method="GET" action="{{ route('email.preview.approval.custom') }}" style="display: inline-block; margin-right: 20px;">
                <div class="form-group">
                    <label for="approval_order_id">Order ID for Approval Preview:</label>
                    <input type="number" id="approval_order_id" name="order_id" placeholder="Enter order ID" min="1">
                </div>
                <button type="submit" class="preview-btn">Preview Approval</button>
            </form>

            <form method="GET" action="{{ route('email.preview.rejection.custom') }}" style="display: inline-block;">
                <div class="form-group">
                    <label for="rejection_order_id">Order ID for Rejection Preview:</label>
                    <input type="number" id="rejection_order_id" name="order_id" placeholder="Enter order ID" min="1">
                </div>
                <button type="submit" class="preview-btn rejection">Preview Rejection</button>
            </form>
        </div>

        <div class="footer">
            <p><strong>AgriCart Admin System</strong> - Comprehensive Email Preview Tool</p>
            <p>Use this tool to preview how all email notifications will appear to users across the system.</p>
            <p>All previews use test data unless a specific order ID is provided.</p>
            <p><strong>Total Email Types:</strong> 14 different notification types covering all user roles and scenarios.</p>
        </div>
    </div>
</body>
</html>
