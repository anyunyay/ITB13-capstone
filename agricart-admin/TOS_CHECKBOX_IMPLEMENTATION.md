# Terms of Service Checkbox Implementation

## Overview
Added a mandatory Terms of Service (TOS) checkbox to the customer registration form. Users must agree to the TOS before they can create an account.

## Changes Made

### 1. Frontend - Registration Form (`resources/js/pages/auth/register.tsx`)

**Added:**
- TOS checkbox field with proper validation
- Link to view Terms of Service in a new window
- Submit button is disabled until TOS is accepted
- Clear error message display if validation fails

**Key Features:**
- Checkbox must be checked to enable the "Create account" button
- Clicking "Terms of Service" opens the TOS page in a new window
- Validation error displays below the checkbox if submission fails
- Proper tab indexing for keyboard navigation

### 2. Backend - Registration Controller (`app/Http/Controllers/Auth/RegisteredUserController.php`)

**Added:**
- Server-side validation for `terms_accepted` field
- Uses Laravel's `accepted` validation rule (must be true, "yes", "on", or 1)

**Validation Rule:**
```php
'terms_accepted' => 'required|accepted',
```

### 3. Terms of Service Page (`resources/js/pages/terms-of-service.tsx`)

**Created a new page displaying:**
- Complete SMMC Terms of Service
- Professional layout with sections:
  - Use of the Platform
  - Consumer Account Responsibilities
  - Ordering Products
  - Payments and Delivery
  - Prohibited Activities
  - Privacy
  - Limitation of Liability
  - Cancellations and Refunds
  - Changes to the Terms

### 4. Route Configuration (`routes/web.php`)

**Added:**
- Public route for Terms of Service page: `/terms-of-service`
- Accessible to all users (no authentication required)

## User Experience

1. **Registration Flow:**
   - User fills out registration form
   - Submit button is disabled by default
   - Button remains disabled until ALL required fields are valid
   - User can click "Terms of Service" link to view full terms in new window
   - Once all fields are valid and TOS is checked, submit button becomes enabled
   - Form submits with TOS acceptance

2. **Validation:**
   - Frontend: Real-time validation of all required fields
   - Button only enables when all conditions are met:
     - Name: At least 2 characters
     - Email: Valid email format
     - Password: Min 8 chars, uppercase, lowercase, number, symbol, no spaces
     - Password Confirmation: Matches password
     - Contact Number: Exactly 10 digits starting with 9
     - Address: At least 5 characters
     - Barangay: Must be "Sala"
     - City: Must be "Cabuyao"
     - Province: Must be "Laguna"
     - Terms Accepted: Must be checked
   - Backend: Server validates all fields including terms acceptance
   - Error messages display if validation fails

3. **Terms of Service Page:**
   - Opens in new window/tab
   - Clean, readable layout
   - User can close window after reading

## Technical Details

### Form Data Structure
```typescript
type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    contact_number: string;
    address: string;
    barangay: string;
    city: string;
    province: string;
    terms_accepted: boolean; // New field
};
```

### Validation Messages
- If checkbox is not checked: "The terms accepted field must be accepted."
- Displayed using the existing `InputError` component

## Testing Checklist

### Field Validation
- [ ] Submit button is disabled on page load
- [ ] Button remains disabled with empty name field
- [ ] Button remains disabled with name less than 2 characters
- [ ] Button remains disabled with invalid email format
- [ ] Button remains disabled with password less than 8 characters
- [ ] Button remains disabled without uppercase letter in password
- [ ] Button remains disabled without lowercase letter in password
- [ ] Button remains disabled without number in password
- [ ] Button remains disabled without symbol in password
- [ ] Button remains disabled with spaces in password
- [ ] Button remains disabled when passwords don't match
- [ ] Button remains disabled with invalid contact number format
- [ ] Button remains disabled with contact number not starting with 9
- [ ] Button remains disabled with contact number not exactly 10 digits
- [ ] Button remains disabled with address less than 5 characters
- [ ] Button remains disabled when TOS checkbox is unchecked

### TOS Functionality
- [ ] TOS checkbox appears on registration form
- [ ] Clicking "Terms of Service" link opens TOS page in new window
- [ ] TOS page displays all content correctly
- [ ] Error message displays correctly below checkbox if validation fails

### Form Submission
- [ ] Submit button enables only when ALL fields are valid
- [ ] Form submission works when all fields are valid
- [ ] Form submission fails with error when checkbox is unchecked (if JS is disabled)
- [ ] Keyboard navigation works (Tab key)
- [ ] Mobile responsive layout works correctly
- [ ] Button shows loading state during submission

## Files Modified

1. `resources/js/pages/auth/register.tsx` - Added TOS checkbox
2. `app/Http/Controllers/Auth/RegisteredUserController.php` - Added validation
3. `resources/js/pages/terms-of-service.tsx` - Created new page
4. `routes/web.php` - Added TOS route

## Compliance

This implementation ensures:
- Users cannot register without explicitly agreeing to TOS
- Terms are clearly displayed and accessible
- Agreement is recorded in the registration process
- Both frontend and backend validation prevent bypass
