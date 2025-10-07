<?php

return [
    'title' => 'Appearance Settings',
    'description' => 'Customize your interface appearance and preferences',
    
    'theme' => [
        'title' => 'Theme & Display',
        'description' => 'Customize the appearance of your interface',
        'preference' => 'Theme Preference',
        'light' => 'Light',
        'dark' => 'Dark',
        'system' => 'System',
        'system_description' => 'Currently using :theme theme based on your system preference',
    ],
    
    'language' => [
        'title' => 'Language',
        'description' => 'Choose your preferred language',
        'english' => 'English',
        'tagalog' => 'Tagalog',
    ],
    
    'notifications' => [
        'title' => 'Notification Preferences',
        'description' => 'Choose how you want to receive notifications',
        'email' => [
            'title' => 'Email Notifications',
            'description' => 'Receive order updates and promotions via email',
        ],
        'push' => [
            'title' => 'Push Notifications',
            'description' => 'Get instant notifications in your browser',
        ],
        'sms' => [
            'title' => 'SMS Notifications',
            'description' => 'Receive important updates via text message',
        ],
    ],
    
    'actions' => [
        'save' => 'Save Preferences',
        'saving' => 'Saving...',
    ],
    
    'messages' => [
        'success' => 'Appearance settings saved successfully!',
        'error' => 'Failed to save appearance settings. Please try again.',
    ],
];
