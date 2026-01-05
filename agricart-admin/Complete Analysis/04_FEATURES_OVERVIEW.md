# Core and Additional Features

## Admin & Staff Features

### Dashboard
- **Overview Statistics**:
  - Total products, active stocks, pending orders
  - Revenue metrics (daily, weekly, monthly)
  - Member count and active logistics
  - Urgent order alerts
- **Quick Actions**: Direct access to common tasks
- **Recent Activity**: Latest system events
- **Charts & Graphs**: Visual data representation

### Inventory Management

#### Product Management
- **CRUD Operations**:
  - Create new products with images
  - Edit product details and pricing
  - Delete products (with restrictions)
  - Duplicate name checking
- **Product Fields**:
  - Name, description, image
  - Price per Kilo, Piece, Tali
  - Produce type categorization
- **Archive System**:
  - Archive inactive products
  - View archived products
  - Restore archived products
  - Permanent deletion of archived items

#### Stock Management
- **Add Stock**:
  - Assign stock to members
  - Set quantity and category
  - Initial quantity tracking
- **Edit Stock**:
  - Update quantity and details
  - Locked when fully sold
- **Remove Stock**:
  - Mark perished/damaged stock
  - Add removal notes
  - Restore removed stock
- **Stock Tracking**:
  - Available quantity
  - Sold quantity
  - Pending order quantity
  - Stock trails (history)

#### Stock Views
- **Current Stocks**: Active inventory
- **Sold Stock**: Completely sold items
- **Removed Stock**: Perished/damaged items
- **Stock Trails**: Complete stock history

### Order Management

#### Order Processing
- **Order Statuses**:
  - Pending: Awaiting approval
  - Approved: Confirmed by admin
  - Rejected: Declined with reason
  - Processing: Being prepared
  - Ready for Pickup: Available for logistics
  - Out for Delivery: In transit
  - Delivered: Completed

- **Order Actions**:
  - Approve orders (stock validation)
  - Reject orders (with notes)
  - Assign logistics personnel
  - Mark as urgent
  - Mark ready for pickup
  - Mark as picked up
  - View order details
  - Generate receipts

#### Order Features
- **Urgent Order System**:
  - Manual urgent marking
  - Auto-urgent after 16 hours
  - Visual indicators
  - Priority notifications
- **Stock Preview**: Real-time stock availability check
- **Insufficient Stock Handling**: Prevent approval if stock unavailable
- **Order Timeline**: Track order progress
- **Admin Notes**: Internal order comments

### Sales Management

#### Sales Views
- **All Sales**: Complete sales history
- **Member Sales**: Sales by member/farmer
- **Audit Trail**: Detailed transaction logs

#### Sales Analytics
- **Revenue Tracking**:
  - Total sales amount
  - Co-op share (10%)
  - Member share (100% of product price)
  - Subtotal calculations
- **Date Range Filtering**
- **Export Capabilities**: PDF and Excel reports
- **Member Performance**: Individual member sales data

### Membership Management

#### Member Operations
- **Add Members**:
  - Auto-generated member ID (starting 2411001)
  - Name, contact, email
  - Document upload
  - Avatar upload
- **Edit Members**:
  - Update member information
  - Change documents
  - Update contact details
- **Member Status**:
  - Active members
  - Deactivated members
  - Reactivation capability
  - Hard delete (with restrictions)

#### Member Features
- **Earnings Tracking**: Automatic calculation
- **Stock Assignment**: Link products to members
- **Password Change Requests**: Admin approval system
- **Document Management**: Secure file storage

### Logistics Management

#### Logistic Personnel
- **CRUD Operations**:
  - Add logistics staff
  - Edit logistic details
  - Deactivate/reactivate
  - Hard delete (with restrictions)
- **Assignment System**: Assign orders to logistics
- **Performance Tracking**: Delivery statistics

### Staff Management (Admin Only)

#### Staff Operations
- **Add Staff**: Create staff accounts with default passwords
- **Edit Staff**: Update staff information
- **Deactivate/Reactivate**: Manage staff status
- **Delete Staff**: Remove staff accounts
- **Permission Management**: Assign staff permissions

### Trend Analysis

#### Price Trend Tracking
- **Product Price History**: Track price changes over time
- **Trend Visualization**: Charts and graphs
- **Price Categories**: Analyze by Kilo, Piece, Tali
- **Latest Data**: Real-time price information
- **Historical Comparison**: Compare price trends

### System Logs

#### Activity Logging
- **User Actions**: All CRUD operations
- **System Events**: Important system activities
- **Error Tracking**: System errors and exceptions
- **Audit Trail**: Complete activity history
- **Export Logs**: Download log reports
- **Filtering**: By date, user, action type

### Notification System

#### Admin/Staff Notifications
- **New Orders**: Alert on new customer orders
- **Inventory Updates**: Stock changes
- **Membership Updates**: New members, changes
- **Password Change Requests**: Member password requests
- **Urgent Orders**: Priority order alerts

#### Notification Features
- **Bell Icon**: Header notification dropdown
- **Unread Count**: Visual indicator
- **Mark as Read**: Individual or bulk
- **Hide from Header**: Dismiss notifications
- **Notification Page**: View all notifications
- **Auto-mark**: Mark read on navigation

### Report Generation

#### Available Reports
- **Inventory Report**: Product and stock data
- **Order Report**: Order history and details
- **Sales Report**: Revenue and transaction data
- **Membership Report**: Member list and details
- **Logistics Report**: Delivery performance
- **Staff Report**: Staff list and activities
- **Audit Trail Export**: Complete transaction logs

#### Report Formats
- **PDF**: Formatted documents
- **Excel**: Spreadsheet data
- **Date Range**: Custom period selection
- **Filtering**: By status, member, product, etc.

## Customer Features

### Shopping Experience

#### Product Browsing
- **Home Page**: Featured products and carousel
- **Product Catalog**: All available products
- **Search Functionality**: Find products quickly
- **Product Details**: Images, prices, descriptions
- **Category Filtering**: By produce type
- **Real-time Stock**: Available quantity display

#### Shopping Cart
- **Add to Cart**: Select products and quantities
- **Cart Management**:
  - Update quantities
  - Remove items
  - View subtotal and total
- **Stock Validation**: Prevent over-ordering
- **Category Selection**: Kilo, Piece, Tali
- **Checkout Process**: Complete order placement

### Order Management

#### Order History
- **View Orders**: All past and current orders
- **Order Status**: Track order progress
- **Order Details**: View items and amounts
- **Cancel Orders**: Cancel pending orders
- **Confirm Receipt**: Mark orders as received
- **Rate & Review**: Provide feedback
- **Auto-confirmation**: After 3 days of delivery

#### Order Features
- **Order Timeline**: Track delivery progress
- **Delivery Proof**: View delivery images
- **Receipt Download**: PDF order receipts
- **Order Notifications**: Status updates

### Profile Management

#### Account Settings
- **Personal Information**:
  - Name, email, contact number
  - Avatar upload
  - Email change (OTP verification)
  - Phone change (OTP verification)
- **Password Management**: Change password
- **Address Management**:
  - Multiple addresses
  - Set default address
  - Edit/delete addresses
  - Main delivery address
- **Appearance**: Theme selection (light/dark/system)
- **Language**: English or Tagalog
- **Notifications**: View notification history

### Customer Notifications
- **Order Confirmation**: Order placed successfully
- **Order Status Updates**: Approval, processing, delivery
- **Delivery Status**: Out for delivery, delivered
- **Order Rejection**: With reason

## Logistic Features

### Dashboard
- **Assigned Orders**: View all assigned deliveries
- **Delivery Statistics**: Performance metrics
- **Pending Deliveries**: Orders awaiting pickup
- **Completed Deliveries**: Delivery history

### Order Management

#### Delivery Operations
- **View Assigned Orders**: All orders assigned to logistic
- **Order Details**: Customer info, items, address
- **Update Delivery Status**:
  - Out for Delivery
  - Delivered
- **Upload Delivery Proof**: Photo evidence
- **Delivery Timeline**: Track delivery progress

#### Delivery Features
- **Customer Information**: Contact details and address
- **Order Items**: Product list and quantities
- **Delivery Notes**: Admin instructions
- **Receipt Preview**: Order receipt view

### Profile Management
- **Personal Information**: Name, email, contact
- **Avatar Upload**: Profile picture
- **Password Change**: Update password
- **Appearance Settings**: Theme selection
- **Language Preference**: English or Tagalog

### Logistic Notifications
- **Delivery Tasks**: New order assignments
- **Order Ready**: Orders ready for pickup
- **Order Picked Up**: Confirmation notifications
- **Order Status Updates**: Changes in order status

## Member Features

### Dashboard
- **Earnings Overview**: Total and recent earnings
- **Stock Summary**: Available and sold stocks
- **Transaction History**: Sales records
- **Performance Metrics**: Sales statistics

### Stock Management

#### Stock Overview
- **All Stocks**: View all assigned stocks
- **Available Stocks**: Current inventory
- **Sold Stocks**: Completed sales
- **Stock Details**: Quantity, category, product info

#### Stock Features
- **Real-time Updates**: Automatic stock adjustments
- **Sales Tracking**: Monitor product sales
- **Earnings Calculation**: Automatic revenue tracking
- **Stock Alerts**: Low stock notifications

### Earnings Management

#### Earnings Tracking
- **Total Earnings**: Cumulative revenue
- **Recent Transactions**: Latest sales
- **Earnings Breakdown**: By product and period
- **Export Reports**: Download earnings data

### Transaction History
- **Sales Records**: All completed sales
- **Transaction Details**: Product, quantity, amount
- **Date Filtering**: View by period
- **Export Capability**: Download transaction history

### Profile Management
- **Personal Information**: Name, contact, email
- **Document Upload**: Membership documents
- **Avatar Upload**: Profile picture
- **Password Change Request**: Submit to admin
- **Appearance Settings**: Theme selection
- **Language Preference**: English or Tagalog

### Member Notifications
- **Product Sales**: When products are sold
- **Stock Added**: New stock assignments
- **Earnings Updates**: Revenue changes
- **Low Stock Alerts**: Inventory warnings
- **Password Request Status**: Approval/rejection

## Additional System Features

### Multi-language Support
- **Languages**: English (en), Tagalog (tl)
- **User Preference**: Per-user language setting
- **Dynamic Translation**: Real-time language switching
- **Translation Service**: Centralized translation management
- **Coverage**: All UI elements and notifications

### Theme System
- **Themes**: Light, Dark, System
- **User Preference**: Per-user theme setting
- **Persistent**: Saved in database
- **Smooth Transitions**: Animated theme changes
- **System Sync**: Follow OS theme preference

### File Management
- **Upload System**:
  - Product images
  - User avatars
  - Member documents
  - Delivery proofs
- **File Security**: Private file access control
- **File Validation**: Type and size restrictions
- **Automatic Cleanup**: Remove unused files
- **Secure URLs**: Temporary access links

### Search Functionality
- **Global Search**: Search across products
- **Admin Search**: Search orders, members, logistics
- **Real-time Results**: Instant search feedback
- **Fuzzy Matching**: Flexible search terms

### Pagination
- **Configurable**: Items per page selection
- **Responsive**: Mobile-friendly pagination
- **Performance**: Efficient data loading
- **Consistent**: Uniform across all tables

### Export Capabilities
- **PDF Reports**: Formatted documents
- **Excel Exports**: Spreadsheet data
- **Date Range**: Custom period selection
- **Bulk Export**: Multiple records at once

### Email System
- **Order Receipts**: Automatic email delivery
- **Notifications**: Email alerts for important events
- **OTP Delivery**: Email-based verification
- **Password Reset**: Email reset links
- **Email Verification**: Account verification emails

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts
- **Desktop**: Full-featured interface
- **Touch-Friendly**: Mobile gesture support

### Performance Optimization
- **Lazy Loading**: Load data on demand
- **Caching**: Permission and route caching
- **Database Indexing**: Optimized queries
- **Asset Optimization**: Minified CSS/JS
- **Image Optimization**: Compressed images

### Error Handling
- **User-Friendly Messages**: Clear error descriptions
- **Validation Feedback**: Real-time form validation
- **Error Logging**: System error tracking
- **Graceful Degradation**: Fallback mechanisms
