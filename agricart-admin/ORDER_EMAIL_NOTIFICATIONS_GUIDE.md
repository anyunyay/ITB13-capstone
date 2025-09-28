# Order Email Notifications Guide

## Overview

The AgriCart Admin system now includes comprehensive email notifications for order approval and rejection. When admin/staff approve or decline orders, customers automatically receive detailed email notifications with receipt information and clear next steps.

## Features

### Order Approval Notifications
- **Automatic Email Sending**: Emails are sent automatically when an admin approves an order
- **Detailed Receipt**: Professional email template with complete order information
- **Next Steps Information**: Clear guidance on what happens after approval
- **Admin Notes**: Includes any notes the admin added during approval
- **Professional Design**: Beautiful, responsive email template with AgriCart branding

### Order Rejection Notifications
- **Clear Communication**: Professional email explaining the rejection
- **Reason Provided**: Includes the admin's reason for declining the order
- **Next Steps**: Guidance on refunds, new orders, and support
- **Apology Section**: Professional apology and explanation
- **Professional Design**: Consistent branding with approval emails

## Implementation Details

### Files Created/Modified

1. **`app/Notifications/OrderRejectionNotification.php`** - New notification class for order rejections
2. **`resources/views/emails/order-rejection.blade.php`** - Professional email template for rejections
3. **`app/Http/Controllers/Admin/OrderController.php`** - Updated to use new rejection notification
4. **`app/Notifications/OrderReceipt.php`** - Enhanced with better messaging and next steps
5. **`resources/views/emails/order-receipt.blade.php`** - Enhanced with next steps section
6. **`app/Console/Commands/TestOrderNotifications.php`** - Test command for manual testing
7. **`tests/Feature/OrderNotificationTest.php`** - Comprehensive test suite

### Email Templates

#### Order Approval Email Template
- **Header**: Celebratory message with green gradient
- **Order Information**: Complete order details in structured format
- **Admin Notes**: Special section for admin comments (if provided)
- **Order Items**: List of all items with quantities and prices
- **Total Section**: Prominent display of total amount
- **Next Steps**: Clear guidance on delivery process
- **Thank You Section**: Professional closing message

#### Order Rejection Email Template
- **Header**: Professional update message with red gradient
- **Order Information**: Complete order details
- **Reason Section**: Clear explanation of why order was declined
- **Order Items**: List of declined items
- **Total Section**: Display of declined order amount
- **Next Steps**: Guidance on refunds and future orders
- **Apology Section**: Professional apology and explanation

### Notification Classes

#### OrderReceipt Notification
- **Subject**: "🎉 Order Approved & Receipt - Order #[ID]"
- **Channels**: Email, Database
- **Features**: 
  - Detailed order information
  - Admin approval details
  - Next steps guidance
  - Professional email template
  - Call-to-action button

#### OrderRejectionNotification
- **Subject**: "Order Update - Order #[ID] (Declined)"
- **Channels**: Email, Database
- **Features**:
  - Clear rejection explanation
  - Admin reason for decline
  - Refund information
  - Next steps guidance
  - Professional apology

## Usage

### Automatic Sending

#### Order Approval
When an admin approves an order through the admin interface:
1. Order status is updated to "approved"
2. Stock quantities are processed
3. `OrderReceipt` notification is sent to customer
4. `OrderStatusUpdate` notification is also sent
5. Member notifications are sent for product sales

#### Order Rejection
When an admin rejects an order through the admin interface:
1. Order status is updated to "rejected"
2. Stock changes are reversed (if previously approved)
3. `OrderRejectionNotification` is sent to customer
4. Admin notes are required for rejection

### Manual Testing

Use the test command to manually test email notifications:

```bash
# Test both approval and rejection notifications
php artisan test:order-notifications

# Test with specific order ID
php artisan test:order-notifications 123

# Test only approval notifications
php artisan test:order-notifications --type=approval

# Test only rejection notifications
php artisan test:order-notifications --type=rejection
```

### Automated Testing

Run the comprehensive test suite:

```bash
# Run all order notification tests
php artisan test --filter=OrderNotificationTest

# Run specific test
php artisan test --filter=test_order_approval_sends_receipt_notification
```

## Email Configuration

The system uses the existing email configuration from `.env`:
- **Mailer**: SMTP (Gmail)
- **From Address**: smmcsalaofficial@gmail.com
- **From Name**: AgriCart

## Database Storage

Both notification types are stored in the `notifications` table with:
- `order_id`: The ID of the order
- `type`: 'order_receipt' or 'order_rejection'
- `message`: Description of the notification
- `data`: Additional notification data

## Email Template Features

### Responsive Design
- Works on desktop and mobile devices
- Professional styling with AgriCart branding
- Clean, modern design

### Order Information
- Order ID and dates
- Customer and admin information
- Order status and approval/rejection details
- Individual items with quantities and prices
- Total amount
- Admin notes (if provided)

### User Experience
- Clear messaging and next steps
- Professional tone and branding
- Call-to-action buttons where appropriate
- Consistent design across all emails

## Troubleshooting

### Email Not Sending
1. Check email configuration in `.env`
2. Verify SMTP credentials are correct
3. Check mail logs: `storage/logs/laravel.log`
4. Test with manual command: `php artisan test:order-notifications`

### Template Issues
1. Clear view cache: `php artisan view:clear`
2. Check template syntax in email template files
3. Verify all required variables are passed to templates

### Testing Issues
1. Run tests with verbose output: `php artisan test --filter=OrderNotificationTest -v`
2. Check test database configuration
3. Ensure all required models and relationships exist

## Security Considerations

- Email addresses are validated before sending
- Admin notes are sanitized to prevent XSS
- Order data is properly escaped in templates
- Notifications are queued to prevent blocking the approval/rejection process
- Sensitive information is not exposed in email templates

## Future Enhancements

Potential improvements for the email notification system:

1. **PDF Attachments**: Add PDF receipts as email attachments
2. **Custom Templates**: Allow admin to customize email templates
3. **Multiple Recipients**: Send to additional email addresses
4. **SMS Notifications**: Add SMS notifications for order updates
5. **Email Preferences**: Allow customers to manage email preferences
6. **Order Tracking**: Include delivery tracking information in emails
7. **Payment Details**: Add payment method and transaction details
8. **Return Policy**: Include return policy information in emails
9. **Multi-language Support**: Support for multiple languages
10. **Email Analytics**: Track email open rates and engagement

## Integration with Existing System

The email notification system integrates seamlessly with the existing AgriCart Admin system:

- **Order Management**: Works with existing order approval/rejection workflow
- **User Management**: Uses existing user roles and permissions
- **Notification System**: Extends existing notification infrastructure
- **Email System**: Uses existing email configuration and queue system
- **Database**: Stores notifications in existing notifications table
- **Testing**: Integrates with existing test suite and testing infrastructure

## Support

For technical support or questions about the email notification system:
1. Check the troubleshooting section above
2. Review the test suite for examples
3. Use the manual test command to verify functionality
4. Check Laravel logs for detailed error information
