<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    public function registerCreate(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Register');
    }

    public function store(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $key = $this->throttleKey($request);
        $user = User::where('username', $credentials['username'])->first();
        $adminCanRecoverFromThrottle = $user?->isAdmin() && Hash::check($credentials['password'], $user->password);

        if (RateLimiter::tooManyAttempts($key, 5) && ! $adminCanRecoverFromThrottle) {
            $seconds = RateLimiter::availableIn($key);
            $logger->log($request, "Rate limited login attempt; retry available in {$seconds} seconds", $user);

            throw ValidationException::withMessages([
                'username' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        if ($user?->is_locked && ! $user->isAdmin()) {
            $logger->log($request, 'Blocked login attempt for locked account', $user);
            throw ValidationException::withMessages([
                'username' => 'These credentials do not match our records.',
            ]);
        }

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($key, 60);
            $logger->log($request, 'Failed login attempt', $user);

            if ($user && ! $user->isAdmin()) {
                $attempts = $user->failed_login_attempts + 1;
                $user->forceFill([
                    'failed_login_attempts' => $attempts,
                    'is_locked' => $attempts >= 5,
                    'locked_at' => $attempts >= 5 ? now() : null,
                ])->save();
            }

            throw ValidationException::withMessages([
                'username' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);

        $request->user()->forceFill([
            'failed_login_attempts' => 0,
            'is_locked' => false,
            'locked_at' => null,
        ])->save();

        $logger->log($request, 'Successful login', $request->user());

        return redirect()->intended(route('dashboard'));
    }

    public function registerStore(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:users,username'],
            'password' => ['required', 'string', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/'],
        ]);

        $user = User::create([
            'fullname' => $validated['fullname'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        $logger->log($request, 'Registered account and logged in', $user);

        return redirect()->route('dashboard');
    }

    public function destroy(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $user = $request->user();
        $logger->log($request, 'Logout', $user);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function keepAlive(Request $request): HttpResponse
    {
        $request->session()->put('last_activity_ping', now()->toIso8601String());

        return response()->noContent();
    }

    public function timeout(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $user = $request->user();
        $logger->log($request, 'Session timed out due to inactivity', $user);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('error', 'Your session timed out due to inactivity. Please log in again.');
    }

    private function throttleKey(Request $request): string
    {
        return Str::transliterate(Str::lower($request->input('username')).'|'.$request->ip());
    }
}
