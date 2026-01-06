<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleLocale;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\CheckSingleSession;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\CheckPasswordChangeRequired;
use App\Http\Middleware\LoginRateLimit;
use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsureUserIsActive::class,
        ]);


        $middleware->alias([
            'guest' => RedirectIfAuthenticated::class,
            'verified' => EnsureEmailIsVerified::class,
            'password.change.required' => CheckPasswordChangeRequired::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'login.rate.limit' => LoginRateLimit::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle Spatie and Laravel authorization exceptions with role-aware responses
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($e instanceof \Spatie\Permission\Exceptions\UnauthorizedException || $e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                $user = $request->user();

                if ($user) {
                    $type = $user->type ?? null;
                    if (in_array($type, ['admin', 'staff'])) {
                        return redirect()->route('admin.dashboard');
                    }
                    if ($type === 'logistic') {
                        return redirect()->route('logistic.dashboard');
                    }
                    if ($type === 'member') {
                        return redirect()->route('member.dashboard');
                    }

                    // Customers: show a simple back button page
                    if ($type === 'customer') {
                        return Inertia::render('errors/unauthorized', [
                            'message' => 'You are not authorized to access this page.',
                        ])->toResponse($request)->setStatusCode(403);
                    }
                }

                // Guests or unknown types: send to login
                return redirect()->guest(route('login'));
            }
        });
    })->create();
