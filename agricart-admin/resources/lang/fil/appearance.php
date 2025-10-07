<?php

return [
    'title' => 'Mga Setting sa Hitsura',
    'description' => 'I-customize ang hitsura ng inyong interface at mga kagustuhan',
    
    'theme' => [
        'title' => 'Tema at Display',
        'description' => 'I-customize ang hitsura ng inyong interface',
        'preference' => 'Kagustuhan sa Tema',
        'light' => 'Maliwanag',
        'dark' => 'Madilim',
        'system' => 'Sistema',
        'system_description' => 'Kasalukuyang gumagamit ng :theme na tema batay sa inyong kagustuhan sa sistema',
    ],
    
    'language' => [
        'title' => 'Wika',
        'description' => 'Piliin ang inyong gustong wika',
        'english' => 'English',
        'tagalog' => 'Tagalog',
    ],
    
    'notifications' => [
        'title' => 'Mga Kagustuhan sa Notification',
        'description' => 'Piliin kung paano ninyo gustong makatanggap ng mga notification',
        'email' => [
            'title' => 'Mga Email Notification',
            'description' => 'Makatanggap ng mga update sa order at mga promosyon sa pamamagitan ng email',
        ],
        'push' => [
            'title' => 'Mga Push Notification',
            'description' => 'Makatanggap ng instant na mga notification sa inyong browser',
        ],
        'sms' => [
            'title' => 'Mga SMS Notification',
            'description' => 'Makatanggap ng mga mahahalagang update sa pamamagitan ng text message',
        ],
    ],
    
    'actions' => [
        'save' => 'I-save ang mga Kagustuhan',
        'saving' => 'Nagsa-save...',
    ],
    
    'messages' => [
        'success' => 'Matagumpay na na-save ang mga setting sa hitsura!',
        'error' => 'Nabigo na i-save ang mga setting sa hitsura. Pakisubukan ulit.',
    ],
];
