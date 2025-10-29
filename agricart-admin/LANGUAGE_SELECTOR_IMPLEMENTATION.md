# Language Selector Implementation

This document describes the implementation of the language selector dropdown on the Profile > Appearance page.

## Features

- **Language Options**: English and Tagalog (Filipino)
- **Default Behavior**: English is the default language for non-members
- **Persistent Storage**: Language preference is stored in the user's profile for authenticated users
- **Session Storage**: Language preference is stored in session for non-authenticated users
- **Consistent Design**: The dropdown matches the existing design system with green theme colors
- **Real-time Updates**: Language changes are applied immediately with page reload

## Implementation Details

### Backend Components

1. **Migration**: `2025_10_29_091901_add_language_to_users_table.php`
   - Adds `language` column to users table
   - Default value: 'en' (English)

2. **Controller**: `app/Http/Controllers/LanguageController.php`
   - `switch()`: Handles language switching
   - `current()`: Returns current language preference

3. **Middleware**: `app/Http/Middleware/SetLocale.php`
   - Sets application locale based on user preference or session
   - Defaults to English for non-members

4. **Model Updates**: `app/Models/User.php`
   - Added `language` to fillable fields

5. **Language Files**:
   - `resources/lang/en/appearance.php`: English translations
   - `resources/lang/fil/appearance.php`: Tagalog translations

### Frontend Components

1. **Hook**: `resources/js/hooks/use-language.ts`
   - Manages language state and updates
   - Integrates with Inertia.js shared data

2. **Translation Helper**: `resources/js/lib/translations.ts`
   - Simple translation function for frontend
   - Contains translations for the appearance page

3. **UI Component**: Updated `resources/js/pages/Profile/appearance.tsx`
   - Added language selector dropdown
   - Uses existing Select component from UI library
   - Consistent styling with theme preferences

### Routes

- `POST /language/switch`: Switch language preference
- `GET /language/current`: Get current language preference

## Usage

### For Users

1. Navigate to Profile > Appearance
2. Find the "Language Preferences" section
3. Select desired language from dropdown (English/Tagalog)
4. Language is applied immediately with page reload

### For Developers

To add new languages:

1. Add language files in `resources/lang/{locale}/`
2. Update the language options in the Select component
3. Add translations to `resources/js/lib/translations.ts`
4. Update validation in `LanguageController.php`

## Technical Notes

- Language preference is stored per user in the database
- Non-authenticated users use session storage
- Members default to English unless they change preference
- Page reloads after language change to apply translations
- Uses Laravel's built-in localization system
- Frontend translations use a simple helper function

## Styling

The language selector follows the existing design system:
- Green color scheme matching theme preferences
- Consistent card layout and spacing
- Proper hover and focus states
- Flag emojis for visual language identification
- Responsive design

## Future Enhancements

- Add more languages as needed
- Implement real-time translation without page reload
- Add language detection based on browser settings
- Integrate with a full i18n library for complex translations