<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Membership Report</title>
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
        .status-verified {
            color: #059669;
            font-weight: bold;
        }
        .status-pending {
            color: #d97706;
            font-weight: bold;
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
        <h1>Membership Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
    </div>

    <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">{{ $summary['total_members'] }}</div>
                <div class="summary-label">Total Members</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $summary['active_members'] }}</div>
                <div class="summary-label">Active Members</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $summary['pending_verification'] }}</div>
                <div class="summary-label">Pending Verification</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ $summary['recent_registrations'] }}</div>
                <div class="summary-label">Recent (30 days)</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Address</th>
                <th>Registration Date</th>
                <th>Email Verified</th>
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($members as $member)
            <tr>
                <td>{{ $member->id }}</td>
                <td>{{ $member->name }}</td>
                <td>{{ $member->email }}</td>
                <td>{{ $member->contact_number ?? 'N/A' }}</td>
                <td>{{ $member->address ?? 'N/A' }}</td>
                <td>{{ $member->registration_date ? $member->registration_date->format('Y-m-d') : 'N/A' }}</td>
                <td class="{{ $member->email_verified_at ? 'status-verified' : 'status-pending' }}">
                    {{ $member->email_verified_at ? 'Yes' : 'No' }}
                </td>
                <td>{{ $member->created_at->format('Y-m-d H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
    </div>
</body>
</html> 