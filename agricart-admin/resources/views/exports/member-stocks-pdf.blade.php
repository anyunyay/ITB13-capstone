<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>SMMC Member Stock Overview Report</title>
    <style>
        @page {
            size: landscape;
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
            <h1>SMMC Member Stock Overview Report</h1>
            <p>Generated on: {{ $date }}</p>
        </div>
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