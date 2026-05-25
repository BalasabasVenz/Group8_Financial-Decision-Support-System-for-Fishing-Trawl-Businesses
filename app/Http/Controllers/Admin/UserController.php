<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users', [
            'users' => User::query()
                ->select('id', 'fullname', 'username', 'role', 'is_locked', 'failed_login_attempts', 'created_at')
                ->orderBy('fullname')
                ->paginate(8)
                ->withQueryString(),
        ]);
    }

    public function store(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:users,username'],
            'password' => ['required', 'string', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/'],
            'role' => ['required', Rule::in(['admin', 'user'])],
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
        ]);

        $logger->log($request, "Created user {$user->username}", $request->user());

        return back()->with('success', 'User created.');
    }

    public function update(Request $request, User $user, ActivityLogger $logger): RedirectResponse
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('users', 'username')->ignore($user)],
            'password' => ['nullable', 'string', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/'],
            'role' => ['required', Rule::in(['admin', 'user'])],
            'is_locked' => ['required', 'boolean'],
        ]);

        $isAdmin = $validated['role'] === 'admin';
        $isLocked = $isAdmin ? false : $validated['is_locked'];

        $user->fill([
            'fullname' => $validated['fullname'],
            'username' => $validated['username'],
            'role' => $validated['role'],
            'is_locked' => $isLocked,
            'failed_login_attempts' => $isLocked ? $user->failed_login_attempts : 0,
            'locked_at' => $isLocked ? ($user->locked_at ?? now()) : null,
        ]);

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();
        $logger->log($request, "Updated user {$user->username}", $request->user());

        return back()->with('success', 'User updated.');
    }

    public function destroy(Request $request, User $user, ActivityLogger $logger): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'Administrators cannot delete their own account.');

        $username = $user->username;
        $user->delete();
        $logger->log($request, "Deleted user {$username}", $request->user());

        return back()->with('success', 'User deleted.');
    }
}
