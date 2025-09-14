<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Member Earnings Report</title>
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
        .member-info {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            border-left: 4px solid #28a745;
        }
        .member-info h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
        }
        .member-details {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        .member-detail {
            display: table-cell;
            width: 50%;
            padding: 5px 0;
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
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
        }
        .summary-label {
            font-size: 10px;
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
            padding: 6px;
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
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            margin: 15px 0;
            border-radius: 4px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Member Earnings Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
        <p>Member: {{ $user->name }} ({{ $user->email }})</p>
    </div>

    <div class="member-info">
        <h2>Member Information</h2>
        <div class="member-details">
            <div class="member-detail">
                <strong>Name:</strong> {{ $user->name }}
            </div>
            <div class="member-detail">
                <strong>Email:</strong> {{ $user->email }}
            </div>
            <div class="member-detail">
                <strong>Member Since:</strong> {{ $user->created_at->format('M d, Y') }}
            </div>
            <div class="member-detail">
                <strong>Report Period:</strong> All Time
            </div>
        </div>
    </div>


    <div class="note">
        <strong>Note:</strong> Member earnings represent 90% of the total sales value. The remaining 10% is retained by the platform for operational expenses.
    </div>

    <table>
        <thead>
            <tr>
                <th>Earning ID</th>
                <th>Sale ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse($earnings as $earning)
            <tr>
                <td>#{{ $earning->id }}</td>
                <td>#{{ $earning->sale_id }}</td>
                <td>{{ $earning->stock->product->name }}</td>
                <td>{{ $earning->category }}</td>
                <td>{{ $earning->quantity }}</td>
                <td>PHP {{ number_format($earning->amount, 2, '.', ',') }}</td>
                <td>{{ $earning->sale->customer->name ?? 'N/A' }}</td>
                <td>{{ $earning->sale->customer->email ?? 'N/A' }}</td>
                <td>{{ $earning->created_at->format('Y-m-d H:i') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px; color: #666;">
                    No earnings recorded for this period.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>


    <div class="footer">
        <p>This earnings report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions about your earnings, please contact the administrator.</p>
    </div>
</body>
</html>
