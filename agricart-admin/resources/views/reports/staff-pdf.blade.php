<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMMC Staff Report</title>
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
            <h1>SMMC Staff Report</h1>
            <p>Generated on: {{ $generated_at }}</p>
        </div>
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
