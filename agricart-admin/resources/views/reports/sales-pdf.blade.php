<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>SMMC Sales Report</title>
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

        .member-sales {
            margin-top: 30px;
            page-break-before: always;
        }

        .member-sales h2 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
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
            <h1>SMMC Sales Report</h1>
            <p>Generated on: {{ $generated_at }}</p>
        </div>
    </div>

    @if($sales->count() > 0)
    <table>
        <thead>
            <tr>
                <th>Sale ID</th>
                <th>Total Amount</th>
                <th>Revenue (100%)</th>
                <th>COGS</th>
                <th>Gross Profit</th>
                <th>Processed By</th>
                <th>Logistic</th>
                <th>Delivered Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            <tr>
                <td>#{{ $sale['id'] }}</td>
                <td>PHP {{ number_format($sale['total_amount'], 2, '.', ',') }}</td>
                <td>PHP {{ number_format($sale['member_share'], 2, '.', ',') }}</td>
                <td>PHP {{ number_format($sale['cogs'], 2, '.', ',') }}</td>
                <td>PHP {{ number_format($sale['gross_profit'], 2, '.', ',') }}</td>
                <td>{{ $sale['admin']['name'] ?? 'N/A' }}</td>
                <td>{{ $sale['logistic']['name'] ?? 'N/A' }}</td>
                <td>
                    @if(isset($sale['delivered_at']))
                    {{ $sale['delivered_at']->format('Y-m-d H:i') }}
                    @else
                    N/A
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div style="text-align: center; padding: 40px; color: #666; font-style: italic;">
        <p>No sales found matching the selected filters.</p>
    </div>
    @endif

    <div class="footer">
        <p>This sales report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>

</html>