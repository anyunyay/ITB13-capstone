<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Notifications\VerifyEmailNotification;
use App\Models\UserAddress;
use App\Traits\HasFileUploads;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasRoles, HasFileUploads;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        // Admin fields
        'name',
        'email',
        'password',
        'avatar',
        // Customer fields
        'contact_number',
        // Logistic fields
        'registration_date',
        // Member fields
        'member_id',
        'document',
        'document_marked_for_deletion',
        // Type/role discriminator (optional, for user type distinction)
        'type',
        // Account status
        'active',
        // Default account flag
        'is_default',
        // Session management
        'current_session_id',
        // Email verification
        'email_verified_at',
        // Appearance settings
        'appearance',
        // Language preference
        'language',
        // Language preference
        'language',
        // Delivery proof viewing permission
        'can_view_delivery_proofs',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['avatar_url', 'document_url'];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'registration_date' => 'datetime',
            'is_default' => 'boolean',
            'document_marked_for_deletion' => 'boolean',
            'active' => 'boolean',
            'can_view_delivery_proofs' => 'boolean',
        ];
    }

    // Boot method to assign roles based on user type and generate member IDs
    public static function booted()
    {
        static::creating(function ($user) {
            // Auto-generate member_id for new members
            if ($user->type === 'member' && empty($user->member_id)) {
                $user->member_id = static::generateMemberId();
            }
        });

        static::created(function ($user) {
            if ($user->type && !$user->hasRole($user->type)) {
                // Only assign if a role with this name exists
                try {
                    $user->assignRole($user->type);
                    
                    // Ensure customer users get the access customer features permission
                    if ($user->type === 'customer') {
                        $user->givePermissionTo('access customer features');
                    }
                } catch (\Exception $e) {
                    // Log the error if the role does not exist
                    Log::error("Role {$user->type} does not exist for user ID {$user->id}");
                }
            }
        });
    }

    /**
     * Generate a unique member ID starting from 2411001
     */
    public static function generateMemberId(): string
    {
        $lastMember = static::where('type', 'member')
            ->whereNotNull('member_id')
            ->orderBy('member_id', 'desc')
            ->first();

        if ($lastMember && is_numeric($lastMember->member_id)) {
            return (string)((int)$lastMember->member_id + 1);
        }

        return '2411001';
    }

    // Customer relationships
    public function sales()
    {
        return $this->hasMany(Sales::class, 'customer_id');
    }

    public function salesAudit()
    {
        return $this->hasMany(SalesAudit::class, 'customer_id');
    }

    // Legacy method - kept for backward compatibility but now points to user_addresses
    public function addresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    public function userAddresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    public function defaultAddress(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserAddress::class)->where('is_active', true);
    }

    public function activeAddresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserAddress::class)->where('is_active', true);
    }

    // Member relationships
    public function stocks()
    {
        return $this->hasMany(Stock::class, 'member_id');
    }

    public function removedStocks()
    {
        return $this->hasMany(Stock::class, 'member_id')->removed();
    }

    // Logistic relationships
    public function assignedOrders()
    {
        return $this->hasMany(SalesAudit::class, 'logistic_id');
    }

    // Member earnings relationship
    public function memberEarnings()
    {
        return $this->hasOne(MemberEarnings::class, 'member_id');
    }

    // Cart relationship
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Send the email verification notification.
     * Only send for customers - staff, member, and logistics don't need email verification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        // Only send verification email for customers
        if ($this->type === 'customer') {
            $this->notify(new VerifyEmailNotification);
        }
    }

    /**
     * Send the email verification notification for credential updates.
     * Send for all non-member users when they update their credentials.
     *
     * @return void
     */
    public function sendEmailVerificationNotificationForCredentialUpdate()
    {
        // Send verification email for all non-member users
        if ($this->type !== 'member') {
            $this->notify(new VerifyEmailNotification);
        }
    }

    /**
     * Determine if the user has verified their email address.
     * Members are considered verified by default, but other users need verification.
     *
     * @return bool
     */
    public function hasVerifiedEmail()
    {
        // Members don't need email verification
        if ($this->type === 'member') {
            return true;
        }
        
        return ! is_null($this->email_verified_at);
    }

    /**
     * Mark the given user's email as verified.
     * For members, this is a no-op.
     *
     * @return bool
     */
    public function markEmailAsVerified()
    {
        // Members don't need email verification
        if ($this->type === 'member') {
            return true;
        }
        
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    /**
     * Ensure the user has the proper permissions for their type
     */
    public function ensurePermissions()
    {
        if ($this->type === 'customer' && !$this->can('access customer features')) {
            $this->givePermissionTo('access customer features');
        } elseif ($this->type === 'logistic' && !$this->can('access logistic features')) {
            $this->givePermissionTo('access logistic features');
        } elseif ($this->type === 'member' && !$this->can('access member features')) {
            $this->givePermissionTo('access member features');
        }
    }

    /**
     * Invalidate all other sessions for this user except the current one
     */
    public function invalidateOtherSessions($currentSessionId)
    {
        // Update the user's current session ID
        $this->update(['current_session_id' => $currentSessionId]);

        // Delete all other sessions for this user from the sessions table
        DB::table('sessions')
            ->where('user_id', $this->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();
    }

    /**
     * Check if the current session is valid for this user
     */
    public function isCurrentSession($sessionId)
    {
        return $this->current_session_id === $sessionId;
    }

    /**
     * Clear the current session ID when user logs out
     */
    public function clearCurrentSession()
    {
        $this->update(['current_session_id' => null]);
    }

    /**
     * Check if user has an active session
     */
    public function hasActiveSession()
    {
        return !is_null($this->current_session_id);
    }

    /**
     * Get the email change requests for this user.
     */
    public function emailChangeRequests()
    {
        return $this->hasMany(EmailChangeRequest::class);
    }

    /**
     * Get the appearance settings for this user.
     */
    public function appearanceSettings()
    {
        return $this->hasOne(AppearanceSettings::class);
    }

    /**
     * Check if the current session is still valid (exists in sessions table)
     */
    public function isSessionValid()
    {
        if (!$this->hasActiveSession()) {
            return false;
        }

        return DB::table('sessions')
            ->where('id', $this->current_session_id)
            ->where('user_id', $this->id)
            ->exists();
    }

    /**
     * Get the avatar URL with proper path handling
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }

        // Ensure path starts with /
        if (!str_starts_with($this->avatar, '/')) {
            return '/' . $this->avatar;
        }

        return $this->avatar;
    }

    /**
     * Get the document URL with proper path handling
     */
    public function getDocumentUrlAttribute()
    {
        if (!$this->document) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($this->document, FILTER_VALIDATE_URL)) {
            return $this->document;
        }

        // Ensure path starts with /
        if (!str_starts_with($this->document, '/')) {
            return '/' . $this->document;
        }

        return $this->document;
    }

    /**
     * Get the file fields that should be cleaned up
     * Returns array with field => category mapping
     */
    protected function getFileFields(): array
    {
        return [
            'avatar' => 'avatars',
            'document' => 'documents'
        ];
    }

    /**
     * Get file category for a specific field
     */
    protected function getFileCategoryForField(string $field): string
    {
        return match($field) {
            'avatar' => 'avatars',
            'document' => 'documents',
            default => parent::getFileCategoryForField($field)
        };
    }

    /**
     * Delete the user's avatar file
     */
    public function deleteAvatarFile(): bool
    {
        return $this->deleteFile('avatar', 'avatars');
    }

    /**
     * Delete the user's document file
     */
    public function deleteDocumentFile(): bool
    {
        return $this->deleteFile('document', 'documents');
    }

    /**
     * Get the main address as a formatted string
     */
    public function getMainAddressAttribute(): ?string
    {
        $defaultAddress = $this->defaultAddress;
        if (!$defaultAddress) {
            return null;
        }

        return "{$defaultAddress->street}, {$defaultAddress->barangay}, {$defaultAddress->city}, {$defaultAddress->province}";
    }

    /**
     * Check if the user has a complete main address
     */
    public function hasMainAddress(): bool
    {
        $defaultAddress = $this->defaultAddress;
        return $defaultAddress && !empty($defaultAddress->street) && !empty($defaultAddress->barangay) && !empty($defaultAddress->city) && !empty($defaultAddress->province);
    }

    /**
     * Get the main address as an object for easy access
     */
    public function getMainAddressObject(): ?object
    {
        $defaultAddress = $this->defaultAddress;
        if (!$this->hasMainAddress()) {
            return null;
        }

        return (object) [
            'street' => $defaultAddress->street,
            'barangay' => $defaultAddress->barangay,
            'city' => $defaultAddress->city,
            'province' => $defaultAddress->province,
        ];
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope for inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('active', false);
    }

    /**
     * Check if user has active stocks (for members)
     */
    public function hasActiveStocks(): bool
    {
        if ($this->type !== 'member') {
            return false;
        }

        return $this->stocks()->active()->exists();
    }

    /**
     * Check if logistic has pending assigned orders
     */
    public function hasPendingOrders(): bool
    {
        if ($this->type !== 'logistic') {
            return false;
        }

        return $this->assignedOrders()
            ->whereIn('delivery_status', ['pending', 'out_for_delivery'])
            ->exists();
    }
} 