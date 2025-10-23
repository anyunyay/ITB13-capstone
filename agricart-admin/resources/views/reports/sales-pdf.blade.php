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
        <h1>{{ isset($exportType) && $exportType === 'members' ? 'Member Sales Report' : 'Sales Report' }}</h1>
        <p>Generated on: {{ $generated_at }}</p>
        @if(isset($filters['start_date']) && isset($filters['end_date']))
        <p>Period: {{ $filters['start_date'] }} to {{ $filters['end_date'] }}</p>
        @endif
    </div>


    @if(!isset($exportType) || $exportType === 'sales')
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
                <td>{{ $sale->created_at->format('Y-m-d H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(isset($exportType) && $exportType === 'members' && $memberSales->count() > 0)
    <table>
        <thead>
            <tr>
                <th>Rank</th>
                <th>Member Name</th>
                <th>Member Email</th>
                <th>Total Orders</th>
                <th>Total Revenue</th>
                <th>Quantity Sold</th>
                <th>Average Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach($memberSales as $index => $member)
            @php
                $averageRevenue = $member->total_orders > 0 ? $member->total_revenue / $member->total_orders : 0;
            @endphp
            <tr>
                <td>#{{ $index + 1 }}</td>
                <td>{{ $member->member_name }}</td>
                <td>{{ $member->member_email }}</td>
                <td>{{ $member->total_orders }}</td>
                <td>PHP {{ number_format($member->total_revenue, 2, '.', ',') }}</td>
                <td>{{ $member->total_quantity_sold }}</td>
                <td>PHP {{ number_format($averageRevenue, 2, '.', ',') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <p>This sales report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>
</html>
