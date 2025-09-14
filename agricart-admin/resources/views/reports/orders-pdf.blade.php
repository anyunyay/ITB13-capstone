<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Report</title>
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
        .status-approved {
            color: #059669;
            font-weight: bold;
        }
        .status-rejected {
            color: #dc2626;
            font-weight: bold;
        }
        .status-delivered {
            color: #2563eb;
            font-weight: bold;
        }
        .order-details {
            margin-top: 15px;
            page-break-inside: avoid;
        }
        .order-header {
            background: #f8f9fa;
            padding: 10px;
            border: 1px solid #ddd;
            margin-bottom: 10px;
        }
        .order-items {
            margin-left: 20px;
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
        <h1>Order Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
    </div>


    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Delivery Status</th>
                <th>Created Date</th>
                <th>Processed By</th>
                <th>Logistic</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
            <tr>
                <td>#{{ $order->id }}</td>
                <td>
                    {{ $order->customer->name ?? 'N/A' }}<br>
                    <small>{{ $order->customer->email ?? 'N/A' }}</small>
                </td>
                <td>PHP {{ number_format($order->total_amount, 2, '.', ',') }}</td>
                <td class="status-{{ $order->status }}">{{ ucfirst($order->status) }}</td>
                <td class="status-{{ $order->delivery_status ?? 'pending' }}">{{ ucfirst($order->delivery_status ?? 'pending') }}</td>
                <td>{{ $order->created_at->format('Y-m-d H:i') }}</td>
                <td>{{ $order->admin->name ?? 'N/A' }}</td>
                <td>{{ $order->logistic->name ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="order-details">
        <h3>Order Details</h3>
        @foreach($orders as $order)
        <div class="order-header">
            <strong>Order #{{ $order->id }}</strong> - {{ $order->customer->name ?? 'N/A' }} - PHP {{ number_format($order->total_amount, 2, '.', ',') }}
            <br>
            <small>Status: {{ ucfirst($order->status) }} | Delivery: {{ ucfirst($order->delivery_status ?? 'pending') }}</small>
        </div>
        
        @if($order->auditTrail && $order->auditTrail->count() > 0)
        <div class="order-items">
            <strong>Items:</strong>
            <ul>
                @foreach($order->auditTrail as $item)
                <li>{{ $item->product->name ?? 'N/A' }} ({{ $item->category }}) - {{ $item->quantity }} {{ $item->category }}</li>
                @endforeach
            </ul>
        </div>
        @endif
        
        @if($order->admin_notes)
        <div class="order-items">
            <strong>Admin Notes:</strong> {{ $order->admin_notes }}
        </div>
        @endif
        @endforeach
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
    </div>
</body>
</html> 