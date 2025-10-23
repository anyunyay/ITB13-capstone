<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Member Revenue Report</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0.5in;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 10px;
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            font-size: 9px;
        }
        td {
            font-size: 8px;
        }
        .currency {
            text-align: right;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Member Revenue Report</h1>
        <p>Generated for: {{ $member->name }} ({{ $member->email }})</p>
        <p>Generated on: {{ date('F j, Y \a\t g:i A') }}</p>
        @if($summary['date_range']['start'] || $summary['date_range']['end'])
            <p>Date Range: 
                {{ $summary['date_range']['start'] ? date('M j, Y', strtotime($summary['date_range']['start'])) : 'Start' }} - 
                {{ $summary['date_range']['end'] ? date('M j, Y', strtotime($summary['date_range']['end'])) : 'End' }}
            </p>
        @endif
    </div>


    @if(count($salesData['orderDetails']) > 0)
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price/Unit</th>
                    <th>Product Total</th>
                    <th>COGS</th>
                    <th>Gross Profit</th>
                    <th>Order Total</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($salesData['orderDetails'] as $order)
                    @foreach($order['products'] as $product)
                        <tr>
                            <td>#{{ $order['order_id'] }}</td>
                            <td>{{ $order['customer_name'] }}</td>
                            <td>{{ $order['customer_email'] }}</td>
                            <td>{{ $product['product_name'] }}</td>
                            <td>{{ $product['category'] }}</td>
                            <td class="currency">{{ $product['quantity'] }}</td>
                            <td class="currency">PHP {{ number_format($product['price_per_unit'], 2) }}</td>
                            <td class="currency">PHP {{ number_format($product['total_price'], 2) }}</td>
                            <td class="currency">PHP {{ number_format($product['cogs'], 2) }}</td>
                            <td class="currency">PHP {{ number_format($product['gross_profit'], 2) }}</td>
                            <td class="currency">PHP {{ number_format($order['total_amount'], 2) }}</td>
                            <td>{{ date('Y-m-d H:i', strtotime($order['created_at'])) }}</td>
                        </tr>
                    @endforeach
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            No sales data found for the selected period.
        </div>
    @endif

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
    </div>
</body>
</html>
