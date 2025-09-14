<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Logistic Orders Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .logistic-info {
            background: #f0f8ff;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            border-left: 4px solid #2563eb;
        }
        .summary {
            background: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .summary h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
        }
        .summary-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        .summary-item {
            display: table-cell;
            width: 16.66%;
            text-align: center;
            padding: 10px;
        }
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
        }
        .summary-label {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
        .revenue {
            color: #059669 !important;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            font-size: 11px;
        }
        td {
            font-size: 10px;
        }
        .status-pending {
            color: #d97706;
            font-weight: bold;
        }
        .status-out_for_delivery {
            color: #2563eb;
            font-weight: bold;
        }
        .status-delivered {
            color: #059669;
            font-weight: bold;
        }
        .order-details {
            margin-top: 15px;
            page-break-inside: avoid;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Logistic Orders Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
    </div>

    <div class="logistic-info">
        <strong>Logistic Provider:</strong> {{ $logistic->name }}<br>
        <strong>Email:</strong> {{ $logistic->email }}<br>
        <strong>Contact:</strong> {{ $logistic->contact_number }}
    </div>


    @if($orders->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Total Amount</th>
                    <th>Delivery Status</th>
                    <th>Created Date</th>
                    <th>Items</th>
                </tr>
            </thead>
            <tbody>
                @foreach($orders as $order)
                    <tr>
                        <td>{{ $order->id }}</td>
                        <td>{{ $order->customer->name }}</td>
                        <td>{{ $order->customer->email }}</td>
                        <td>PHP {{ number_format($order->total_amount, 2, '.', ',') }}</td>
                        <td class="status-{{ $order->delivery_status }}">
                            {{ ucfirst(str_replace('_', ' ', $order->delivery_status)) }}
                        </td>
                        <td>{{ $order->created_at->format('Y-m-d H:i') }}</td>
                        <td>
                            @foreach($order->auditTrail as $trail)
                                <div>{{ $trail->product->name }} ({{ $trail->category }}) - {{ $trail->quantity }}</div>
                            @endforeach
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="text-align: center; color: #666; margin-top: 20px;">No orders found for the selected criteria.</p>
    @endif

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the system administrator.</p>
    </div>
</body>
</html>
