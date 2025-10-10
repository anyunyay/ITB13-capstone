# Unified Email Change Implementation

This document describes the implementation of a unified email change feature that works across all user types (admin, staff, customer, logistic, member) in the Agricart Admin application.

## Overview

The email change feature has been refactored from a customer-specific implementation to a unified, role-agnostic system that automatically detects the authenticated user's role and provides appropriate functionality.

## Key Changes

### 1. Unified Backend Controller

**File**: `app/Http/Controllers/EmailChangeController.php`

- Replaced the customer-specific `Customer\EmailChangeController` with a unified controller
- Automatically detects user type and returns appropriate profile routes
- Maintains all existing functionality (send OTP, verify OTP, resend OTP, cancel)
- Uses proper type hints and error handling

**Key Methods**:
- `sendOtp()` - Sends verification code to new email
- `verifyOtp()` - Verifies OTP and updates email
- `resendOtp()` - Resends verification code
- `cancel()` - Cancels email change request
- `showVerify()` - Legacy method for backward compatibility

### 2. Role-Agnostic Frontend Component

**File**: `resources/js/components/change-email-modal.tsx`

- Updated to work with any user type
- Dynamically constructs API endpoints based on current route
- Added `type` field to User interface
- Maintains all existing UI functionality and validation

**Key Features**:
- Email masking for security
- OTP verification with timer
- Resend functionality with cooldown
- Error handling and validation
- Success notifications

### 3. Updated Routing Configuration

**File**: `routes/web.php`

- Added email change routes for all user types:
  - Admin/Staff: `/admin/profile/email-change/*`
  - Customer: `/customer/profile/email-change/*`
  - Logistic: `/logistic/profile/email-change/*`
  - Member: `/member/profile/email-change/*`

**Route Structure**:
```php
// For each user type
Route::post('/profile/email-change/send-otp', [EmailChangeController::class, 'sendOtp']);
Route::get('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'showVerify']);
Route::post('/profile/email-change/verify/{requestId}', [EmailChangeController::class, 'verifyOtp']);
Route::post('/profile/email-change/resend/{requestId}', [EmailChangeController::class, 'resendOtp']);
Route::post('/profile/email-change/cancel/{requestId}', [EmailChangeController::class, 'cancel']);
```

## Usage

### Frontend Integration

The email change modal can now be used across all user types:

```tsx
import EmailChangeModal from '@/components/change-email-modal';

// In any profile page component
<EmailChangeModal
    isOpen={isEmailChangeModalOpen}
    onClose={() => setIsEmailChangeModalOpen(false)}
    user={user}
    emailChangeRequest={emailChangeRequest}
/>
```

### Backend API Endpoints

All endpoints follow the same pattern across user types:

- **Send OTP**: `POST /{user-type}/profile/email-change/send-otp`
- **Verify OTP**: `POST /{user-type}/profile/email-change/verify/{requestId}`
- **Resend OTP**: `POST /{user-type}/profile/email-change/resend/{requestId}`
- **Cancel**: `POST /{user-type}/profile/email-change/cancel/{requestId}`

Where `{user-type}` is one of: `admin`, `customer`, `logistic`, `member`

## Security Features

1. **Email Masking**: Sensitive email addresses are masked in the UI
2. **OTP Expiration**: Verification codes expire after 15 minutes
3. **Request Validation**: Each request is validated against the authenticated user
4. **Rate Limiting**: Built-in Laravel rate limiting for API endpoints
5. **CSRF Protection**: All requests include CSRF tokens

## Error Handling

The implementation includes comprehensive error handling:

- Network errors
- Validation errors
- Authentication errors
- Expired OTP handling
- Invalid request handling

## Testing

The implementation can be tested across different user types:

1. **Admin/Staff**: Login to admin portal and test email change
2. **Customer**: Login to customer portal and test email change
3. **Logistic**: Login to logistic portal and test email change
4. **Member**: Login to member portal and test email change

## Migration Notes

- The old `Customer\EmailChangeController` has been removed
- All existing customer email change functionality is preserved
- No database changes required
- No frontend breaking changes

## Future Enhancements

Potential improvements for the unified email change system:

1. **Audit Logging**: Track email changes across all user types
2. **Email Templates**: Role-specific email templates
3. **Notification Preferences**: User-configurable email change notifications
4. **Bulk Operations**: Admin ability to change emails for multiple users
5. **Email Verification**: Additional verification steps for sensitive accounts

## Dependencies

- Laravel Framework
- Inertia.js
- React/TypeScript
- Spatie Laravel Permission
- Tailwind CSS
- Lucide React Icons

## Files Modified

1. `app/Http/Controllers/EmailChangeController.php` (new)
2. `resources/js/components/change-email-modal.tsx` (updated)
3. `routes/web.php` (updated)
4. `app/Http/Controllers/Customer/EmailChangeController.php` (removed)

## Conclusion

The unified email change implementation provides a consistent, secure, and maintainable solution for email changes across all user types in the Agricart Admin application. The system automatically adapts to the authenticated user's role while maintaining all existing functionality and security features.
