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
            width: 25%;
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
        .member-sales {
            margin-top: 30px;
            page-break-before: always;
        }
        .member-sales h2 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .performance-bar {
            background: #e5e7eb;
            height: 8px;
            border-radius: 4px;
            margin-top: 5px;
        }
        .performance-fill {
            background: #3b82f6;
            height: 100%;
            border-radius: 4px;
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
        @if(isset($filters['start_date']) && isset($filters['end_date']))
        <p>Period: {{ $filters['start_date'] }} to {{ $filters['end_date'] }}</p>
        @endif
    </div>

    <div class="summary">
        <h2>Revenue Summary</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value revenue">PHP {{ number_format($summary['total_revenue'], 2) }}</div>
                <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $summary['total_orders'] }}</div>
                <div class="summary-label">Total Orders</div>
            </div>
            <div class="summary-item">
                <div class="summary-value revenue">PHP {{ number_format($summary['average_order_value'], 2) }}</div>
                <div class="summary-label">Average Order Value</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $summary['total_customers'] }}</div>
                <div class="summary-label">Total Customers</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Sale ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Created Date</th>
                <th>Processed By</th>
                <th>Logistic</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            <tr>
                <td>#{{ $sale->id }}</td>
                <td>
                    <strong>{{ $sale->customer->name }}</strong><br>
                    <small>{{ $sale->customer->email }}</small>
                </td>
                <td class="revenue">PHP {{ number_format($sale->total_amount, 2) }}</td>
                <td>{{ $sale->created_at->format('M d, Y H:i') }}</td>
                <td>{{ $sale->admin->name ?? 'N/A' }}</td>
                <td>{{ $sale->logistic->name ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($memberSales->count() > 0)
    <div class="member-sales">
        <h2>Member Sales Performance</h2>
        
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Member</th>
                    <th>Total Orders</th>
                    <th>Total Revenue</th>
                    <th>Quantity Sold</th>
                    <th>Average Revenue</th>
                    <th>Performance %</th>
                </tr>
            </thead>
            <tbody>
                @foreach($memberSales as $index => $member)
                @php
                    $averageRevenue = $member->total_orders > 0 ? $member->total_revenue / $member->total_orders : 0;
                    $performancePercentage = $summary['total_revenue'] > 0 ? ($member->total_revenue / $summary['total_revenue']) * 100 : 0;
                @endphp
                <tr>
                    <td><strong>#{{ $index + 1 }}</strong></td>
                    <td>
                        <strong>{{ $member->member_name }}</strong><br>
                        <small>{{ $member->member_email }}</small>
                    </td>
                    <td>{{ $member->total_orders }}</td>
                    <td class="revenue">PHP {{ number_format($member->total_revenue, 2) }}</td>
                    <td>{{ $member->total_quantity_sold }}</td>
                    <td>PHP {{ number_format($averageRevenue, 2) }}</td>
                    <td>
                        {{ number_format($performancePercentage, 1) }}%
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: {{ min($performancePercentage, 100) }}%"></div>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="margin-top: 30px;">
            <h3>Top Performers</h3>
            @foreach($memberSales->take(3) as $index => $member)
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-left: 4px solid {{ $index === 0 ? '#059669' : ($index === 1 ? '#2563eb' : '#d97706') }};">
                <strong>#{{ $index + 1 }} - {{ $member->member_name }}</strong><br>
                <span class="revenue">PHP {{ number_format($member->total_revenue, 2) }}</span> from {{ $member->total_orders }} orders
            </div>
            @endforeach
        </div>

        <div style="margin-top: 30px;">
            <h3>Revenue Distribution</h3>
            @foreach($memberSales->take(5) as $member)
            @php
                $percentage = $summary['total_revenue'] > 0 ? ($member->total_revenue / $summary['total_revenue']) * 100 : 0;
            @endphp
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span><strong>{{ $member->member_name }}</strong></span>
                    <span>{{ number_format($percentage, 1) }}%</span>
                </div>
                <div class="performance-bar">
                    <div class="performance-fill" style="width: {{ $percentage }}%"></div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <div class="footer">
        <p>This sales report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>
</html>
