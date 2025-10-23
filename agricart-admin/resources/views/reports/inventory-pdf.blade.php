<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventory Report</title>
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
        <h1>Inventory Report</h1>
        <p>Generated on: {{ $generated_at }}</p>
    </div>


    <table>
         <thead>
             <tr>
                 <th>Stock ID</th>
                 <th>Product Name</th>
                 <th>Quantity</th>
                 <th>Category</th>
                 <th>Member</th>
                 <th>Notes</th>
             </tr>
         </thead>
        <tbody>
            @foreach($stocks as $stock)
             <tr>
                 <td>#{{ $stock->id }}</td>
                 <td>{{ $stock->product->name ?? 'N/A' }}</td>
                 <td>{{ $stock->quantity }}</td>
                 <td>{{ $stock->category }}</td>
                 <td>{{ $stock->member->name ?? 'N/A' }}</td>
                 <td>{{ $stock->notes ?? 'N/A' }}</td>
             </tr>
            @endforeach
        </tbody>
    </table>


    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
    </div>
</body>
</html>
