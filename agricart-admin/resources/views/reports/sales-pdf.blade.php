<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Report</title>
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
        <h1>Sales Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
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
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            @php
                $cogs = ($sale->member_share / 1.3) * 0.7;
                $grossProfit = $sale->member_share - $cogs;
            @endphp
            <tr>
                <td>#{{ $sale->id }}</td>
                <td>PHP {{ number_format($sale->total_amount, 2, '.', ',') }}</td>
                <td>PHP {{ number_format($sale->member_share, 2, '.', ',') }}</td>
                <td>PHP {{ number_format($cogs, 2, '.', ',') }}</td>
                <td>PHP {{ number_format($grossProfit, 2, '.', ',') }}</td>
                <td>{{ $sale->admin->name ?? 'N/A' }}</td>
                <td>{{ $sale->logistic->name ?? 'N/A' }}</td>
                <td>
                    @if($sale->delivered_at)
                        {{ $sale->delivered_at->format('Y-m-d H:i') }}
                    @elseif($sale->created_at)
                        {{ $sale->created_at->format('Y-m-d H:i') }}
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
