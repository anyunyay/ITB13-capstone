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

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasRoles;

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
        'password_change_required',
        // Customer fields
        'address line',
        'barangay',
        'city',
        'province',
        'contact_number',
        // Logistic fields
        'address',
        'registration_date',
        // Member fields
        'document',
        // Type/role discriminator (optional, for user type distinction)
        'type',
        // Session management
        'current_session_id',
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
            'password_change_required' => 'boolean',
        ];
    }

    // Boot method to assign roles based on user type
    public static function booted()
    {
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

    // Customer relationships
    public function sales()
    {
        return $this->hasMany(Sales::class, 'customer_id');
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
        return $this->hasMany(Sales::class, 'logistic_id');
    }

    // Member earnings relationship
    public function memberEarnings()
    {
        return $this->hasOne(MemberEarnings::class, 'member_id');
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
     * Determine if the user has verified their email address.
     * Staff, member, and logistics are considered verified by default.
     *
     * @return bool
     */
    public function hasVerifiedEmail()
    {
        // Staff, member, and logistics don't need email verification
        if (in_array($this->type, ['staff', 'member', 'logistic'])) {
            return true;
        }
        
        return ! is_null($this->email_verified_at);
    }

    /**
     * Mark the given user's email as verified.
     * For staff, member, and logistics, this is a no-op.
     *
     * @return bool
     */
    public function markEmailAsVerified()
    {
        // Staff, member, and logistics don't need email verification
        if (in_array($this->type, ['staff', 'member', 'logistic'])) {
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
} 