<?php

namespace App\Http\Requests\Auth;

use App\Services\LoginLockoutService;
use App\Helpers\SystemLogger;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminLoginRequest extends FormRequest
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
            'email' => ['required', 'string', 'email'],
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
        $email = $this->string('email');
        $ipAddress = $this->ip();

        // Check if account is locked for admin/staff
        LoginLockoutService::checkLoginAllowed($email, 'admin', $ipAddress);

        // Check if user exists and verify they are admin/staff before attempting authentication
        $user = \App\Models\User::where('email', $email)->first();
        
        if ($user && !$user->active) {
            // Log deactivated account login attempt
            SystemLogger::logSecurityEvent(
                'login_failed_deactivated',
                $user->id,
                $ipAddress,
                [
                    'email' => $email,
                    'user_type' => 'admin'
                ]
            );
            
            throw ValidationException::withMessages([
                'email' => __('auth.deactivated')
            ]);
        }

        if ($user && !in_array($user->type, ['admin', 'staff'])) {
            // Record failed attempt for wrong portal access
            $lockoutInfo = LoginLockoutService::recordFailedAttempt($email, 'admin', $ipAddress);
            
            // Log failed login attempt
            SystemLogger::logSecurityEvent(
                'login_failed_wrong_portal',
                $user->id,
                $ipAddress,
                [
                    'email' => $email,
                    'user_type' => $user->type,
                    'target_portal' => 'admin',
                    'is_locked' => $lockoutInfo['is_locked'],
                    'attempts_remaining' => $lockoutInfo['attempts_remaining'] ?? null
                ]
            );
            
            $messages = ['email' => __('auth.failed')];
            
            // Add lockout information if account is locked
            if ($lockoutInfo['is_locked']) {
                $messages['lockout'] = $lockoutInfo;
            }

            throw ValidationException::withMessages($messages);
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            // Record failed attempt
            $lockoutInfo = LoginLockoutService::recordFailedAttempt($email, 'admin', $ipAddress);
            
            // Log failed login attempt
            SystemLogger::logSecurityEvent(
                'login_failed',
                null,
                $ipAddress,
                [
                    'email' => $email,
                    'user_type' => 'admin',
                    'is_locked' => $lockoutInfo['is_locked'],
                    'attempts_remaining' => $lockoutInfo['attempts_remaining'] ?? null
                ]
            );
            
            $messages = ['email' => __('auth.failed')];
            
            // Add lockout information if account is locked
            if ($lockoutInfo['is_locked']) {
                $messages['lockout'] = $lockoutInfo;
            }

            throw ValidationException::withMessages($messages);
        }

        // Clear failed attempts on successful login
        LoginLockoutService::clearFailedAttempts($email, 'admin', $ipAddress);
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
            'email' => __('auth.throttle', [
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
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}