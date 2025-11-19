<?php

namespace App\Http\Requests\Auth;

use App\Services\LoginLockoutService;
use App\Helpers\SystemLogger;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MemberLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'member_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $memberId = $this->string('member_id');
        $userType = 'member';
        $ipAddress = $this->ip();

        // Check if account is locked
        LoginLockoutService::checkLoginAllowed($memberId, $userType, $ipAddress);

        // Find user by member_id and type
        $user = \App\Models\User::where('member_id', $this->input('member_id'))
            ->where('type', 'member')
            ->first();

        // Check if account is deactivated before checking password
        if ($user && !$user->active) {
            // Log deactivated account login attempt
            SystemLogger::logSecurityEvent(
                'login_failed_deactivated',
                $user->id,
                $ipAddress,
                [
                    'member_id' => $memberId,
                    'user_type' => $userType
                ]
            );
            
            throw ValidationException::withMessages([
                'member_id' => __('auth.deactivated')
            ]);
        }

        if ($user && $user->type !== 'member') {
            // Record failed attempt for wrong portal access
            $lockoutInfo = LoginLockoutService::recordFailedAttempt($memberId, $userType, $ipAddress);
            
            // Log failed login attempt
            SystemLogger::logSecurityEvent(
                'login_failed_wrong_portal',
                $user->id,
                $ipAddress,
                [
                    'member_id' => $memberId,
                    'user_type' => $user->type,
                    'target_portal' => 'member',
                    'is_locked' => $lockoutInfo['is_locked'],
                    'attempts_remaining' => $lockoutInfo['attempts_remaining'] ?? null
                ]
            );
            
            $messages = ['member_id' => __('auth.failed')];
            
            // Add lockout information if account is locked
            if ($lockoutInfo['is_locked']) {
                $messages['lockout'] = $lockoutInfo;
            }

            throw ValidationException::withMessages($messages);
        }

        if (!$user || !Hash::check($this->input('password'), $user->password)) {
            // Record failed attempt
            $lockoutInfo = LoginLockoutService::recordFailedAttempt($memberId, $userType, $ipAddress);
            
            // Log failed login attempt
            SystemLogger::logSecurityEvent(
                'login_failed',
                null,
                $ipAddress,
                [
                    'member_id' => $memberId,
                    'user_type' => $userType,
                    'is_locked' => $lockoutInfo['is_locked'],
                    'attempts_remaining' => $lockoutInfo['attempts_remaining'] ?? null
                ]
            );
            
            $messages = ['member_id' => __('auth.failed')];
            
            // Add lockout information if account is locked
            if ($lockoutInfo['is_locked']) {
                $messages['lockout'] = $lockoutInfo;
            }

            throw ValidationException::withMessages($messages);
        }

        // Log in the user
        Auth::login($user, $this->boolean('remember'));
        
        // Clear failed attempts on successful login
        LoginLockoutService::clearFailedAttempts($memberId, $userType, $ipAddress);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'member_id' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('member_id')).'|'.$this->ip());
    }
}
