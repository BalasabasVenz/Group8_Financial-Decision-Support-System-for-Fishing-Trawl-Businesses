<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $avatarUrl = $user->avatar_path && Storage::disk('public')->exists($user->avatar_path)
            ? Storage::url($user->avatar_path)
            : null;

        return Inertia::render('Profile/Edit', [
            'profile' => [
                'fullname' => $user->fullname,
                'username' => $user->username,
                'role' => $user->role,
                'avatar_url' => $avatarUrl,
                'contact_number' => $user->contact_number,
                'boat_name' => $user->boat_name,
                'position' => $user->position,
                'address' => $user->address,
                'bio' => $user->bio,
            ],
        ]);
    }

    public function update(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'boat_name' => ['nullable', 'string', 'max:120'],
            'position' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $validated['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        unset($validated['avatar']);

        $user->fill($validated)->save();
        $logger->log($request, 'Updated own profile', $user);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        $logger->log($request, 'Changed own password', $user);

        return back()->with('success', 'Password changed.');
    }
}
