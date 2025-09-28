<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Direct Email Templates - AgriCart Admin</title>
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
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
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
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        .template-card {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .template-card:hover {
            transform: translateY(-5px);
        }
        .template-header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .template-header h3 {
            margin: 0;
            font-size: 18px;
        }
        .template-header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .template-content {
            padding: 20px;
            max-height: 300px;
            overflow-y: auto;
        }
        .template-preview {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            font-size: 14px;
        }
        .template-actions {
            padding: 15px 20px;
            background-color: #f9f9f9;
            border-top: 1px solid #e0e0e0;
            text-align: center;
        }
        .view-btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        .view-btn:hover {
            background-color: #45a049;
            color: white;
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
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Direct Email Templates</h1>
            <p>View all email templates directly with real data - no ID input required!</p>
        </div>

        <div class="stats">
            <h3>📊 Email Template Overview</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">14</div>
                    <div class="stat-label">Total Templates</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">4</div>
                    <div class="stat-label">User Roles</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Direct Access</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">Real</div>
                    <div class="stat-label">Test Data</div>
                </div>
            </div>
        </div>

        <div class="template-grid">
            <!-- Order Approval Email -->
            <div class="template-card">
                <div class="template-header">
                    <h3>🎉 Order Approval & Receipt</h3>
                    <p>Sent to customers when orders are approved</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> 🎉 Order Approved & Receipt - Order #123<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Professional receipt with order details, items, pricing, and next steps. Includes admin notes and delivery information.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'order-approval') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Order Rejection Email -->
            <div class="template-card">
                <div class="template-header">
                    <h3>📋 Order Rejection</h3>
                    <p>Sent to customers when orders are declined</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Order Update - Order #123 (Declined)<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Professional rejection notice with clear reason, refund information, and next steps for customers.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'order-rejection') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- New Order Notification -->
            <div class="template-card">
                <div class="template-header">
                    <h3>🛒 New Order Notification</h3>
                    <p>Sent to admin/staff when new orders are placed</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> New Order Received - Order #123<br>
                        <strong>To:</strong> {{ $testData['admin']->name }} ({{ $testData['admin']->email }})<br>
                        <strong>Content:</strong> Alert notification with customer details, order amount, and items requiring admin attention.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'new-order') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Order Confirmation -->
            <div class="template-card">
                <div class="template-header">
                    <h3>✅ Order Confirmation</h3>
                    <p>Sent to customers when orders are confirmed</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Order Confirmed - Order #123<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Confirmation message with order details and estimated approval time.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'order-confirmation') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Order Status Update -->
            <div class="template-card">
                <div class="template-header">
                    <h3>📊 Order Status Update</h3>
                    <p>Sent to customers when order status changes</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Order Status Update - Order #123<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Status change notification with new status and relevant information.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'order-status-update') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Delivery Status Update -->
            <div class="template-card">
                <div class="template-header">
                    <h3>🚚 Delivery Status Update</h3>
                    <p>Sent to customers about delivery progress</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Delivery Update - Order #123<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Delivery progress update with current status and estimated delivery time.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'delivery-status-update') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Delivery Task Assignment -->
            <div class="template-card">
                <div class="template-header">
                    <h3>📦 Delivery Task Assignment</h3>
                    <p>Sent to logistics when tasks are assigned</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> New Delivery Task - Order #123<br>
                        <strong>To:</strong> {{ $testData['logistic']->name }} ({{ $testData['logistic']->email }})<br>
                        <strong>Content:</strong> Task assignment with delivery details, customer information, and pickup instructions.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'delivery-task') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Product Sale Notification -->
            <div class="template-card">
                <div class="template-header">
                    <h3>💰 Product Sale Notification</h3>
                    <p>Sent to members when their products are sold</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Product Sale Notification<br>
                        <strong>To:</strong> {{ $testData['member']->name }} ({{ $testData['member']->email }})<br>
                        <strong>Content:</strong> Sale notification with product details, quantity sold, and earnings information.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'product-sale') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Earnings Update -->
            <div class="template-card">
                <div class="template-header">
                    <h3>💵 Earnings Update</h3>
                    <p>Sent to members about earnings changes</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Earnings Update<br>
                        <strong>To:</strong> {{ $testData['member']->name }} ({{ $testData['member']->email }})<br>
                        <strong>Content:</strong> Earnings summary with total, pending, and available earnings breakdown.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'earnings-update') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Low Stock Alert -->
            <div class="template-card">
                <div class="template-header">
                    <h3>⚠️ Low Stock Alert</h3>
                    <p>Sent to members when stock is running low</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Low Stock Alert<br>
                        <strong>To:</strong> {{ $testData['member']->name }} ({{ $testData['member']->email }})<br>
                        <strong>Content:</strong> Stock alert with product details, current quantity, and restocking recommendations.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'low-stock-alert') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Inventory Update -->
            <div class="template-card">
                <div class="template-header">
                    <h3>📦 Inventory Update</h3>
                    <p>Sent to admin when inventory changes</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Inventory Update<br>
                        <strong>To:</strong> {{ $testData['admin']->name }} ({{ $testData['admin']->email }})<br>
                        <strong>Content:</strong> Inventory change notification with product details and update type.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'inventory-update') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Membership Update -->
            <div class="template-card">
                <div class="template-header">
                    <h3>👥 Membership Update</h3>
                    <p>Sent to admin when membership changes</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Membership Update<br>
                        <strong>To:</strong> {{ $testData['admin']->name }} ({{ $testData['admin']->email }})<br>
                        <strong>Content:</strong> Membership change notification with member details and update type.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'membership-update') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Order Delayed -->
            <div class="template-card">
                <div class="template-header">
                    <h3>⏰ Order Delayed</h3>
                    <p>Sent to customers when orders are delayed</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Order Delayed - Order #123<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Delay notification with reason, new timeline, and apology message.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'order-delayed') }}" class="view-btn">View Full Template</a>
                </div>
            </div>

            <!-- Email Verification -->
            <div class="template-card">
                <div class="template-header">
                    <h3>✉️ Email Verification</h3>
                    <p>Sent to users for email verification</p>
                </div>
                <div class="template-content">
                    <div class="template-preview">
                        <strong>Subject:</strong> Verify Your Email Address<br>
                        <strong>To:</strong> {{ $testData['customer']->name }} ({{ $testData['customer']->email }})<br>
                        <strong>Content:</strong> Email verification with verification link and instructions.
                    </div>
                </div>
                <div class="template-actions">
                    <a href="{{ route('direct.template', 'verify-email') }}" class="view-btn">View Full Template</a>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>AgriCart Admin System</strong> - Direct Email Template Viewer</p>
            <p>All templates show real data and actual email content - no ID input required!</p>
            <p>Click any "View Full Template" button to see the complete email template.</p>
        </div>
    </div>
</body>
</html>
