<?php

namespace App\Http\Requests\Auth;

use App\Services\LoginLockoutService;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
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
        $userType = 'customer'; // Default for customer login
        $ipAddress = $this->ip();

        // Check if account is locked
        LoginLockoutService::checkLoginAllowed($email, $userType, $ipAddress);

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            // Record failed attempt
            $lockoutInfo = LoginLockoutService::recordFailedAttempt($email, $userType, $ipAddress);
            
            $messages = ['email' => __('auth.failed')];
            
            // Add lockout information if account is locked
            if ($lockoutInfo['is_locked']) {
                $messages['lockout'] = $lockoutInfo;
            }

            throw ValidationException::withMessages($messages);
        }

        // Clear failed attempts on successful login
        LoginLockoutService::clearFailedAttempts($email, $userType, $ipAddress);
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
