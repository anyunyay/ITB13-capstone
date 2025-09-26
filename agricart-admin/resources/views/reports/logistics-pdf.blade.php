<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Logistics Report</title>
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
        <h1>Logistics Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
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
            @foreach($logistics as $logistic)
            <tr>
                <td>{{ $logistic->id }}</td>
                <td>{{ $logistic->name }}</td>
                <td>{{ $logistic->email }}</td>
                <td>{{ $logistic->contact_number ?? 'N/A' }}</td>
                <td>{{ $logistic->address ?? 'N/A' }}</td>
                <td>{{ $logistic->registration_date ? $logistic->registration_date->format('Y-m-d') : 'N/A' }}</td>
                <td class="{{ $logistic->email_verified_at ? 'status-verified' : 'status-pending' }}">
                    {{ $logistic->email_verified_at ? 'Yes' : 'No' }}
                </td>
                <td>{{ $logistic->created_at->format('Y-m-d H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
    </div>
</body>
</html> 