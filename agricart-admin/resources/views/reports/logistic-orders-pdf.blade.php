<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SMMC Logistic Orders Report</title>
    <style>
        @page {
            margin: 15mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            line-height: 1.4;
            color: #333;
            margin: 0;
        }

        .header {
            width: 100%;
            padding-bottom: 17px;
            margin-bottom: 26px;
            border-bottom: 5px solid #3CB371;
            overflow: hidden;
        }

        .logo {
            width: 85px;
            height: 85px;
            float: left;
            margin-right: 21px;
        }

        .header-content {
            overflow: hidden;
            padding-top: 10px;
        }

        .header h1 {
            margin: 0 0 5px 0;
            color: #3CB371;
            font-size: 30px;
            font-weight: bold;
        }

        .header p {
            margin: 0;
            color: #666;
            font-size: 16px;
        }

        .logistic-info {
            background: #e8f5e9;
            padding: 13px;
            margin-bottom: 20px;
            border-left: 5px solid #3CB371;
            font-size: 13px;
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
            margin-top: 13px;
            font-size: 12px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px 5px;
            text-align: left;
            word-wrap: break-word;
        }

        th {
            background-color: #3CB371;
            color: #ffffff;
            font-weight: bold;
            font-size: 12px;
        }

        td {
            font-size: 11px;
        }

        tbody tr:nth-child(even) {
            background-color: #f9fff9;
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
            margin-top: 26px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 3px solid #3CB371;
            padding-top: 10px;
        }

        /* Responsive adjustments for different paper sizes */
        @media print {
            body {
                font-size: 12px;
            }
            
            table {
                font-size: 11px;
            }
            
            th, td {
                padding: 7px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        @if(!empty($logo_base64))
        <img src="{{ $logo_base64 }}" alt="SMMC Logo" class="logo">
        @endif
        <div class="header-content">
            <h1>SMMC Logistic Orders Report</h1>
            <p>Generated on: {{ $generated_at }}</p>
        </div>
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
        <p>This report was generated automatically by the SMMC Admin System.</p>
        <p>For any questions, please contact the system administrator.</p>
    </div>
</body>
</html>
