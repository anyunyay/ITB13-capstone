# Generalized OTP Verification System

This document describes the implementation of a generalized OTP (One-Time Password) verification system that can be reused for different verification types (email, phone, etc.) in the Agricart Admin application.

## Overview

The OTP verification system has been refactored from a single-purpose email change implementation to a flexible, reusable architecture that supports multiple verification types while maintaining consistency across all user types.

## Architecture

### 1. Base OTP Model (`BaseOtpRequest`)

**File**: `app/Models/BaseOtpRequest.php`

The base model provides common functionality for all OTP verification types:

- **Common Fields**: `user_id`, `otp`, `expires_at`, `is_used`
- **Core Methods**:
  - `isExpired()` - Check if OTP has expired
  - `isValid()` - Check if OTP is valid (not used and not expired)
  - `markAsUsed()` - Mark OTP as used
  - `generateOtp()` - Generate 6-digit OTP
  - `findValidOtp()` - Find valid OTP for user
  - `invalidateExistingRequests()` - Cancel existing requests
  - `createOtpRequest()` - Create new OTP request

- **Abstract Methods** (must be implemented by subclasses):
  - `getVerificationTarget()` - Return the target being verified
  - `getVerificationType()` - Return human-readable type name

### 2. Specific OTP Models

#### EmailChangeRequest (`app/Models/EmailChangeRequest.php`)
- Extends `BaseOtpRequest`
- Additional field: `new_email`
- Implements email-specific verification logic

#### PhoneChangeRequest (`app/Models/PhoneChangeRequest.php`)
- Extends `BaseOtpRequest`
- Additional field: `new_phone`
- Implements phone-specific verification logic

### 3. Base OTP Controller (`BaseOtpController`)

**File**: `app/Http/Controllers/BaseOtpController.php`

The base controller provides common OTP verification logic:

- **Common Methods**:
  - `sendOtp()` - Send OTP for verification
  - `verifyOtp()` - Verify OTP and update user field
  - `resendOtp()` - Resend OTP
  - `cancel()` - Cancel verification request
  - `getProfileRoute()` - Get appropriate profile route based on user type

- **Abstract Methods** (must be implemented by subclasses):
  - `getOtpRequestModel()` - Return OTP request model class
  - `getOtpNotificationClass()` - Return notification class
  - `getVerificationType()` - Return verification type name
  - `getNewValueFieldName()` - Return field name for new value
  - `getUserFieldName()` - Return user field to update
  - `validateNewValue()` - Validate the new value input

### 4. Specific OTP Controllers

#### EmailChangeController (`app/Http/Controllers/EmailChangeController.php`)
- Extends `BaseOtpController`
- Implements email-specific validation and logic
- Uses `EmailChangeRequest` model and `EmailChangeOtpNotification`

#### PhoneChangeController (`app/Http/Controllers/PhoneChangeController.php`)
- Extends `BaseOtpController`
- Implements phone-specific validation and logic
- Uses `PhoneChangeRequest` model and `PhoneChangeOtpNotification`

### 5. Generalized Frontend Component

#### OtpVerificationModal (`resources/js/components/otp-verification-modal.tsx`)

A reusable React component that handles OTP verification for any verification type:

- **Props**:
  - `verificationType`: 'email' | 'phone'
  - `currentValue`: Current value to be changed
  - `newValueFieldName`: Field name for the new value
  - `apiEndpoint`: Base API endpoint

- **Features**:
  - Dynamic form fields based on verification type
  - Email/phone number masking for security
  - OTP verification with countdown timer
  - Resend functionality with cooldown
  - Error handling and validation
  - Success notifications

#### Specific Modal Components

- **EmailChangeModal** (`resources/js/components/change-email-modal.tsx`)
  - Wrapper around `OtpVerificationModal` for email changes
  - Configures email-specific settings

- **PhoneChangeModal** (`resources/js/components/change-phone-modal.tsx`)
  - Wrapper around `OtpVerificationModal` for phone changes
  - Configures phone-specific settings

### 6. Notifications

#### EmailChangeOtpNotification (`app/Notifications/EmailChangeOtpNotification.php`)
- Sends OTP via email for email verification

#### PhoneChangeOtpNotification (`app/Notifications/PhoneChangeOtpNotification.php`)
- Sends OTP via email for phone verification (can be extended for SMS)

## Database Schema

### email_change_requests Table
```sql
CREATE TABLE email_change_requests (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    new_email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### phone_change_requests Table
```sql
CREATE TABLE phone_change_requests (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    new_phone VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Email Change Routes
For each user type (admin, customer, logistic, member):
- `POST /{userType}/profile/email-change/send-otp`
- `GET /{userType}/profile/email-change/verify/{requestId}`
- `POST /{userType}/profile/email-change/verify/{requestId}`
- `POST /{userType}/profile/email-change/resend/{requestId}`
- `POST /{userType}/profile/email-change/cancel/{requestId}`

### Phone Change Routes
For each user type (admin, customer, logistic, member):
- `POST /{userType}/profile/phone-change/send-otp`
- `GET /{userType}/profile/phone-change/verify/{requestId}`
- `POST /{userType}/profile/phone-change/verify/{requestId}`
- `POST /{userType}/profile/phone-change/resend/{requestId}`
- `POST /{userType}/profile/phone-change/cancel/{requestId}`

## Usage Examples

### Adding a New Verification Type

1. **Create the OTP Request Model**:
```php
class PasswordChangeRequest extends BaseOtpRequest
{
    protected $fillable = [
        'user_id',
        'new_password',
        'otp',
        'expires_at',
        'is_used',
    ];

    public function getVerificationTarget(): string
    {
        return $this->new_password;
    }

    public static function getVerificationType(): string
    {
        return 'password';
    }
}
```

2. **Create the Controller**:
```php
class PasswordChangeController extends BaseOtpController
{
    protected function getOtpRequestModel(): string
    {
        return PasswordChangeRequest::class;
    }

    protected function getVerificationType(): string
    {
        return 'password';
    }

    // ... implement other abstract methods
}
```

3. **Create the Notification**:
```php
class PasswordChangeOtpNotification extends Notification
{
    // ... implement notification logic
}
```

4. **Add Routes**:
```php
Route::post('/profile/password-change/send-otp', [PasswordChangeController::class, 'sendOtp']);
// ... other routes
```

5. **Create Frontend Modal**:
```tsx
export default function PasswordChangeModal({ isOpen, onClose, user }) {
    return (
        <OtpVerificationModal
            isOpen={isOpen}
            onClose={onClose}
            user={user}
            verificationType="password"
            currentValue="***"
            newValueFieldName="new_password"
            apiEndpoint="/profile/password-change"
        />
    );
}
```

## Benefits

1. **Code Reusability**: Common OTP logic is centralized and reusable
2. **Consistency**: All verification types follow the same patterns
3. **Maintainability**: Changes to core logic affect all verification types
4. **Extensibility**: Easy to add new verification types
5. **Type Safety**: Strong typing with abstract methods ensures proper implementation
6. **User Experience**: Consistent UI/UX across all verification flows

## Security Features

1. **OTP Expiration**: 15-minute expiry for all OTPs
2. **Single Use**: OTPs are marked as used after verification
3. **User Isolation**: Users can only access their own OTP requests
4. **Input Validation**: Comprehensive validation for all inputs
5. **CSRF Protection**: All requests include CSRF tokens
6. **Rate Limiting**: Built-in resend cooldown (30 seconds)

## Future Enhancements

1. **SMS Integration**: Extend phone notifications to use SMS instead of email
2. **Multiple OTP Types**: Support for different OTP formats (4-digit, 8-digit)
3. **Custom Expiry Times**: Configurable expiry times per verification type
4. **Audit Logging**: Track all OTP verification attempts
5. **Advanced Security**: Add CAPTCHA, IP restrictions, or device fingerprinting
6. **Analytics**: Track verification success rates and user behavior

