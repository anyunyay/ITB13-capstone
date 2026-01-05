<?php

return [
    'title' => 'Appearance Settings',
    'description' => 'Customize your interface appearance and preferences',
    'theme' => [
        'title' => 'Theme Preferences',
        'description' => 'Choose how you want the application to look. Your preference will be saved and applied across all devices.',
        'preference' => 'Theme Preference',
        'light' => 'Light',
        'light_description' => 'Always use light mode',
        'dark' => 'Dark',
        'dark_description' => 'Always use dark mode',
        'system' => 'System',
        'system_description' => 'Use your system preference',
        'current_selection' => 'Current selection',
    ],
    'language' => [
        'title' => 'Language Preferences',
        'description' => 'Choose your preferred language. Your selection will be saved and applied across all devices.',
        'select_language' => 'Select Language',
        'english' => 'English',
        'tagalog' => 'Tagalog',
        'current_selection' => 'Current selection',
    ],
    'messages' => [
        'appearance_success' => 'Appearance settings updated successfully!',
        'appearance_error' => 'Failed to update appearance settings. Please try again.',
        'language_success' => 'Language preference updated successfully!',
        'language_error' => 'Failed to update language preference. Please try again.',
    ],
];

