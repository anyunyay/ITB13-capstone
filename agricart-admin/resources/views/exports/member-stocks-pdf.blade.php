<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Member Stock Overview Report</title>
    <style>
        @page {
            size: landscape;
            margin: 15mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        .header h1 {
            margin: 0;
            color: #333;
            font-size: 20px;
        }

        .header p {
            margin: 3px 0 0 0;
            color: #666;
            font-size: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background-color: #f8f9fa;
            font-weight: bold;
            font-size: 10px;
        }

        td {
            font-size: 9px;
        }

        .text-right {
            text-align: right;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Member Stock Overview Report</h1>
        <p>Generated on: {{ $date }}</p>
    </div>

    @if(count($stocks) > 0)
    <table>
        <thead>
            <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th class="text-right">Total Qty</th>
                <th class="text-right">Sold</th>
                <th class="text-right">Available</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Revenue</th>
                <th class="text-right">COGS</th>
                <th class="text-right">Profit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stocks as $stock)
            <tr>
                <td>{{ $stock['product_name'] }}</td>
                <td>{{ $stock['category'] }}</td>
                <td class="text-right">{{ number_format($stock['total_quantity']) }}</td>
                <td class="text-right">{{ number_format($stock['sold_quantity']) }}</td>
                <td class="text-right">{{ number_format($stock['balance_quantity']) }}</td>
                <td class="text-right">PHP {{ number_format($stock['unit_price'], 2, '.', ',') }}</td>
                <td class="text-right">PHP {{ number_format($stock['total_revenue'], 2, '.', ',') }}</td>
                <td class="text-right">PHP {{ number_format($stock['total_cogs'], 2, '.', ',') }}</td>
                <td class="text-right">PHP {{ number_format($stock['total_gross_profit'], 2, '.', ',') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-data">
        <p>No stock data found matching the selected filters.</p>
    </div>
    @endif

    <div class="footer">
        <p>This stock overview report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>

</html>