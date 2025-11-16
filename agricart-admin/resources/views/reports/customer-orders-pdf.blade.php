<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>My Orders Report</title>
    <style>
        @page {
            size: landscape;
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
            vertical-align: top;
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

        .col-id {
            width: 6%;
        }

        .col-amount {
            width: 10%;
            text-align: right;
        }

        .col-status {
            width: 10%;
        }

        .col-delivery {
            width: 10%;
        }

        .col-date {
            width: 12%;
        }

        .col-items {
            width: 32%;
        }

        .col-notes {
            width: 12%;
        }

        .col-logistic {
            width: 8%;
        }

        .status-pending {
            color: #d97706;
            font-weight: bold;
        }

        .status-approved {
            color: #059669;
            font-weight: bold;
        }

        .status-rejected {
            color: #dc2626;
            font-weight: bold;
        }

        .status-delivered {
            color: #2563eb;
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

        .items-list {
            font-size: 11px;
            line-height: 1.4;
        }

        .item-entry {
            margin-bottom: 2px;
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
            <h1>My Orders Report</h1>
            <p>Generated on: {{ $generated_at }}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="col-id">Order ID</th>
                <th class="col-date">Date</th>
                <th class="col-items">Items</th>
                <th class="col-amount">Amount</th>
                <th class="col-status">Status</th>
                <th class="col-delivery">Delivery</th>
                <th class="col-logistic">Logistic</th>
                <th class="col-notes">Notes</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
            @php
            // Handle both array and object formats
            $orderId = is_array($order) ? $order['id'] : $order->id;
            $createdAt = is_array($order) ? \Carbon\Carbon::parse($order['created_at']) : $order->created_at;
            $totalAmount = is_array($order) ? $order['total_amount'] : $order->total_amount;
            $status = is_array($order) ? $order['status'] : $order->status;
            $deliveryStatus = is_array($order) ? ($order['delivery_status'] ?? 'pending') : ($order->delivery_status ?? 'pending');
            $adminNotes = is_array($order) ? ($order['admin_notes'] ?? '-') : ($order->admin_notes ?? '-');
            $logistic = is_array($order) ? ($order['logistic'] ?? null) : ($order->logistic ?? null);
            @endphp
            <tr>
                <td class="col-id">#{{ $orderId }}</td>
                <td class="col-date">{{ $createdAt->format('M d, Y') }}<br><small>{{ $createdAt->format('H:i') }}</small></td>
                <td class="col-items">
                    <div class="items-list">
                        @php
                        // Handle both array and object formats
                        if (is_array($order)) {
                        $auditTrail = $order['audit_trail'] ?? [];
                        } else {
                        $auditTrail = $order->audit_trail ?? [];
                        }
                        @endphp
                        @if(is_array($auditTrail) && count($auditTrail) > 0)
                        @foreach($auditTrail as $item)
                        @php
                        $product = is_array($item) ? $item['product'] : (isset($item->product) ? $item->product : null);
                        $productName = is_array($product) ? $product['name'] : (isset($product->name) ? $product->name : 'Unknown');
                        $quantity = is_array($item) ? $item['quantity'] : (isset($item->quantity) ? $item->quantity : 0);
                        $category = is_array($item) ? $item['category'] : (isset($item->category) ? $item->category : '');
                        @endphp
                        <div class="item-entry">• {{ $productName }} ({{ $quantity }} {{ $category }})</div>
                        @endforeach
                        @else
                        <div class="item-entry">No items</div>
                        @endif
                    </div>
                </td>
                <td class="col-amount"><strong>PHP {{ number_format($totalAmount, 2) }}</strong></td>
                <td class="col-status status-{{ $status }}">{{ ucfirst($status) }}</td>
                <td class="col-delivery status-{{ $deliveryStatus }}">{{ ucfirst(str_replace('_', ' ', $deliveryStatus == 'pending' ? 'N/A' : $deliveryStatus)) }}</td>
                <td class="col-logistic">
                    @if($logistic)
                    @php
                    $logisticName = is_array($logistic) ? ($logistic['name'] ?? 'N/A') : ($logistic->name ?? 'N/A');
                    $logisticContact = is_array($logistic) ? ($logistic['contact_number'] ?? null) : ($logistic->contact_number ?? null);
                    @endphp
                    {{ $logisticName }}
                    @if($logisticContact)
                    <br><small>{{ $logisticContact }}</small>
                    @endif
                    @else
                    N/A
                    @endif
                </td>
                <td class="col-notes">{{ $adminNotes }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Agricart Admin System.</p>
        <p>For any questions, please contact the administrator.</p>
    </div>
</body>

</html>