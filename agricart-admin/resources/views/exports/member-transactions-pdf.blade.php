<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #16a34a;
            font-size: 20px;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #666;
        }
        .summary {
            background-color: #f0fdf4;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            border: 1px solid #16a34a;
        }
        .summary h2 {
            margin: 0 0 10px 0;
            color: #16a34a;
            font-size: 14px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        .summary-item {
            padding: 8px;
            background: white;
            border-radius: 3px;
        }
        .summary-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 3px;
        }
        .summary-value {
            font-size: 12px;
            font-weight: bold;
            color: #16a34a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #16a34a;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }
        td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on {{ $date }}</p>
        @if(isset($date_range))
        <p style="font-size: 10px; margin-top: 3px; font-weight: bold; color: #16a34a;">
            Date Range: {{ $date_range['start'] }} - {{ $date_range['end'] }}
        </p>
        @else
        <p style="font-size: 10px; margin-top: 3px; font-weight: bold; color: #16a34a;">
            Date Range: All Transactions
        </p>
        @endif
        @if(isset($total_records))
        <p style="font-size: 9px; margin-top: 3px;">Total Records: {{ number_format($total_records) }}</p>
        @endif
    </div>

    <div class="summary">
        <h2>Summary Statistics</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Transactions</div>
                <div class="summary-value">{{ number_format($summary['total_transactions']) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Quantity</div>
                <div class="summary-value">{{ number_format($summary['total_quantity']) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Revenue</div>
                <div class="summary-value">₱{{ number_format($summary['total_revenue'], 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total COGS</div>
                <div class="summary-value">₱{{ number_format($summary['total_cogs'], 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Gross Profit</div>
                <div class="summary-value">₱{{ number_format($summary['total_gross_profit'], 2) }}</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Category</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Revenue</th>
                <th>Customer</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            @php
                $price = 0;
                switch ($transaction->category) {
                    case 'Kilo':
                        $price = $transaction->price_kilo ?? 0;
                        break;
                    case 'Pc':
                        $price = $transaction->price_pc ?? 0;
                        break;
                    case 'Tali':
                        $price = $transaction->price_tali ?? 0;
                        break;
                    default:
                        $price = $transaction->unit_price ?? 0;
                }
                $revenue = $transaction->quantity * $price;
            @endphp
            <tr>
                <td>{{ date('M d, Y H:i', strtotime($transaction->created_at)) }}</td>
                <td>{{ $transaction->product->name ?? 'N/A' }}</td>
                <td>{{ $transaction->category }}</td>
                <td class="text-right">{{ number_format($transaction->quantity) }}</td>
                <td class="text-right">₱{{ number_format($price, 2) }}</td>
                <td class="text-right">₱{{ number_format($revenue, 2) }}</td>
                <td>{{ $transaction->sale->customer->name ?? 'N/A' }}</td>
                <td>{{ $transaction->sale->delivery_status ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This is a computer-generated document. No signature is required.</p>
    </div>
</body>
</html>
