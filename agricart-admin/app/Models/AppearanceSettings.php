<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppearanceSettings extends Model
{
    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'notifications',
    ];

    protected $casts = [
        'notifications' => 'array',
    ];

    /**
     * Get the user that owns the appearance settings.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the default notification settings.
     */
    public static function getDefaultNotifications(): array
    {
        return [
            'email' => true,
            'push' => true,
            'sms' => false,
        ];
    }

    /**
     * Get or create appearance settings for a user.
     */
    public static function getForUser(int $userId): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId],
            [
                'theme' => 'system',
                'language' => 'en',
                'notifications' => static::getDefaultNotifications(),
            ]
        );
    }
}
