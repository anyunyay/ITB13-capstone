<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>SMMC Logistics Report</title>
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

        .status-verified {
            color: #059669;
            font-weight: bold;
        }

        .status-pending {
            color: #d97706;
            font-weight: bold;
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

            th,
            td {
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
            <h1>SMMC Logistics Report</h1>
            <p>Generated on: {{ $generated_at }}</p>
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