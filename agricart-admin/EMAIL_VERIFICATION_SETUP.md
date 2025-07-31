# Email Verification Setup

## Overview

Email verification is now fully implemented in the AgriCart application. Users must verify their email address before accessing protected routes.

## Features Implemented

1. **Custom Email Verification Notification** - `app/Notifications/VerifyEmailNotification.php`
2. **Updated User Model** - Implements `MustVerifyEmail` interface and custom notification
3. **Updated Controllers** - All verification controllers now redirect to appropriate dashboards based on user role
4. **Updated UserFactory** - Added `unverified()` method for testing
5. **Test Command** - `TestEmailVerification` command for testing verification emails

## Configuration

### Mail Configuration

Update your `.env` file with the following mail settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@agricart.com"
MAIL_FROM_NAME="AgriCart"
```

### For Development/Testing

If you want to use the log driver for development (emails will be logged instead of sent):

```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@agricart.com"
MAIL_FROM_NAME="AgriCart"
```

## How It Works

1. **Registration**: When a user registers, they are automatically sent a verification email
2. **Verification**: Users click the link in the email to verify their address
3. **Access Control**: Unverified users are redirected to the verification notice page
4. **Role-Based Redirects**: After verification, users are redirected to their appropriate dashboard

## Routes

- `GET /verify-email` - Email verification notice page
- `GET /verify-email/{id}/{hash}` - Email verification link
- `POST /email/verification-notification` - Resend verification email

## Testing

### Run Tests
```bash
php artisan test tests/Feature/Auth/EmailVerificationTest.php
```

### Test Command
```bash
php artisan test:email-verification user@example.com
```

## User Roles and Redirects

- **Admin/Staff**: Redirected to `/admin/dashboard`
- **Customer**: Redirected to `/` (home)
- **Member**: Redirected to `/member/dashboard`
- **Logistic**: Redirected to `/logistic/dashboard`

## Troubleshooting

1. **Emails not sending**: Check mail configuration in `.env`
2. **Verification links not working**: Ensure `APP_URL` is set correctly
3. **Users stuck on verification page**: Check if user has proper role assignment

## Security Features

- Signed URLs for verification links
- Throttling on verification endpoints
- Proper hash verification
- Role-based access control 