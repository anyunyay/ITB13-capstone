<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My Orders Report</title>
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
        .spent {
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
            border-bottom: none;
        }
        .order-items {
            border: 1px solid #ddd;
            border-top: none;
        }
        .order-item {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        .order-item:last-child {
            border-bottom: none;
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
        <h1>My Orders Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
    </div>


    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Delivery Status</th>
                <th>Created Date</th>
                <th>Admin Notes</th>
                <th>Logistic</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
            <tr>
                <td>#{{ $order->id }}</td>
                <td>PHP {{ number_format($order->total_amount, 2, '.', ',') }}</td>
                <td class="status-{{ $order->status }}">{{ ucfirst($order->status) }}</td>
                <td class="status-{{ $order->delivery_status ?? 'pending' }}">{{ ucfirst($order->delivery_status ?? 'N/A') }}</td>
                <td>{{ $order->created_at->format('M d, Y H:i') }}</td>
                <td>{{ $order->admin_notes ?? 'N/A' }}</td>
                <td>{{ $order->logistic->name ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($orders->count() > 0)
    <div style="margin-top: 30px;">
        <h3>Order Details</h3>
        @foreach($orders as $order)
        <div class="order-details">
            <div class="order-header">
                <strong>Order #{{ $order->id }}</strong> - {{ $order->created_at->format('M d, Y H:i') }}
                <br>
                <span class="status-{{ $order->status }}">Status: {{ ucfirst($order->status) }}</span>
                @if($order->delivery_status)
                <span class="status-{{ $order->delivery_status }}"> | Delivery: {{ ucfirst($order->delivery_status) }}</span>
                @endif
                <span style="float: right;">Total: PHP {{ number_format($order->total_amount, 2, '.', ',') }}</span>
            </div>
            <div class="order-items">
                @foreach($order->auditTrail as $item)
                <div class="order-item">
                    <strong>{{ $item->product->name }}</strong>
                    <br>
                    Quantity: {{ $item->quantity }} {{ $item->category }}
                    @if($item->product->price_kilo && $item->category === 'Kilo')
                        <br>Price: PHP {{ number_format($item->product->price_kilo, 2, '.', ',') }} per kilo
                    @elseif($item->product->price_pc && $item->category === 'Pc')
                        <br>Price: PHP {{ number_format($item->product->price_pc, 2, '.', ',') }} per piece
                    @elseif($item->product->price_tali && $item->category === 'Tali')
                        <br>Price: PHP {{ number_format($item->product->price_tali, 2, '.', ',') }} per tali
                    @endif
                </div>
                @endforeach
            </div>
            @if($order->admin_notes)
            <div style="background: #fff3cd; padding: 10px; margin-top: 10px; border-left: 4px solid #ffc107;">
                <strong>Admin Notes:</strong> {{ $order->admin_notes }}
            </div>
            @endif
            @if($order->logistic)
            <div style="background: #d1ecf1; padding: 10px; margin-top: 10px; border-left: 4px solid #17a2b8;">
                <strong>Delivery:</strong> {{ $order->logistic->name }}
                @if($order->logistic->contact_number)
                ({{ $order->logistic->contact_number }})
                @endif
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>
</html> 