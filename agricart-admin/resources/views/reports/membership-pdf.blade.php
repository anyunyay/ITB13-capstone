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


    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Member ID</th>
                <th>Name</th>
                <th>Contact Number</th>
                <th>Address</th>
                <th>Registration Date</th>
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($members as $member)
            <tr>
                <td>{{ $member['id'] }}</td>
                <td>{{ $member['member_id'] ?? 'N/A' }}</td>
                <td>{{ $member['name'] }}</td>
                <td>{{ $member['contact_number'] ?? 'N/A' }}</td>
                <td>{{ $member['address'] ?? 'N/A' }}</td>
                <td>{{ $member['registration_date'] ? \Carbon\Carbon::parse($member['registration_date'])->format('Y-m-d') : 'N/A' }}</td>
                <td>{{ \Carbon\Carbon::parse($member['created_at'])->format('Y-m-d H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
    </div>
</body>
</html> 