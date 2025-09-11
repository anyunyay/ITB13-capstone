<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #333;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #059669;
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .header p {
            color: #666;
            font-size: 14px;
            margin: 0;
        }
        .generated-info {
            text-align: right;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th {
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
            padding: 12px 8px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #dee2e6;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        tr:hover {
            background-color: #e9ecef;
        }
        .status-active {
            background-color: #d1f2eb;
            color: #0f5132;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }
        .status-pending {
            background-color: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }
        .permissions {
            max-width: 200px;
            word-wrap: break-word;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Staff Report</h1>
        <p>Comprehensive overview of staff members and their permissions</p>
    </div>

    <div class="generated-info">
        <p>Generated on: {{ $generated_at }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($staff as $member)
            <tr>
                <td>#{{ $member->id }}</td>
                <td>{{ $member->name }}</td>
                <td>{{ $member->email }}</td>
                <td class="permissions">
                    @if($member->permissions->count() > 0)
                        {{ $member->permissions->pluck('name')->join(', ') }}
                    @else
                        No permissions
                    @endif
                </td>
                <td>
                    @if($member->email_verified_at)
                        <span class="status-active">Active</span>
                    @else
                        <span class="status-pending">Pending</span>
                    @endif
                </td>
                <td>{{ $member->created_at->format('Y-m-d H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This staff report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>
</html>
