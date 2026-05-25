<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SecurityModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_admin_login_succeeds_and_creates_log(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'password' => Hash::make('Admin@12345'),
            'role' => 'admin',
        ]);

        $this->post('/login', [
            'username' => 'admin',
            'password' => 'Admin@12345',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($admin);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $admin->id,
            'activity' => 'Successful login',
        ]);
    }

    public function test_invalid_login_and_sql_injection_do_not_authenticate(): void
    {
        User::factory()->create([
            'username' => 'admin',
            'password' => Hash::make('Admin@12345'),
        ]);

        $this->from('/login')->post('/login', [
            'username' => "' OR '1'='1",
            'password' => "' OR '1'='1",
        ])->assertSessionHasErrors('username');

        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'activity' => 'Failed login attempt',
        ]);
    }

    public function test_user_can_register_and_is_logged_in_as_standard_user(): void
    {
        $this->post('/register', [
            'fullname' => 'New Fisher',
            'username' => 'newfisher',
            'password' => 'Register123!',
            'password_confirmation' => 'Register123!',
        ])->assertRedirect('/dashboard');

        $user = User::where('username', 'newfisher')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('user', $user->role);
        $this->assertTrue(Hash::check('Register123!', $user->password));
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'activity' => 'Registered account and logged in',
        ]);
    }

    public function test_passwords_are_hashed(): void
    {
        $user = User::factory()->create(['password' => 'PlainPass123!']);

        $this->assertNotSame('PlainPass123!', $user->fresh()->password);
        $this->assertTrue(Hash::check('PlainPass123!', $user->fresh()->password));
    }

    public function test_normal_user_cannot_access_admin_pages(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)->get('/admin/users')->assertForbidden();
    }

    public function test_normal_user_dashboard_only_shows_user_workspace_placeholders(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        ActivityLog::factory()->create(['user_id' => $user->id, 'activity' => 'Successful login']);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('mode', 'user')
                ->has('userModules', 4)
                ->has('recentLogs', 1)
            );
    }

    public function test_admin_dashboard_shows_security_overview(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('mode', 'admin')
                ->has('stats')
                ->has('recentLogs')
            );
    }

    public function test_user_can_update_profile_details_and_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['fullname' => 'Original Name']);
        $avatarPath = tempnam(sys_get_temp_dir(), 'avatar');
        file_put_contents($avatarPath, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='));

        $this->actingAs($user)
            ->post('/profile', [
                'fullname' => 'Updated Name',
                'contact_number' => '09170000000',
                'boat_name' => 'FV Cantil 1',
                'position' => 'Captain',
                'address' => 'Barangay Cantil',
                'bio' => 'Handles trip expense records.',
                'avatar' => new UploadedFile($avatarPath, 'avatar.png', 'image/png', null, true),
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('Updated Name', $user->fullname);
        $this->assertSame('FV Cantil 1', $user->boat_name);
        $this->assertNotNull($user->avatar_path);
        Storage::disk('public')->assertExists($user->avatar_path);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'activity' => 'Updated own profile',
        ]);
    }

    public function test_user_can_change_own_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPass123!'),
        ]);

        $this->actingAs($user)
            ->put('/profile/password', [
                'current_password' => 'OldPass123!',
                'password' => 'NewPass123!',
                'password_confirmation' => 'NewPass123!',
            ])
            ->assertRedirect();

        $this->assertTrue(Hash::check('NewPass123!', $user->fresh()->password));
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'activity' => 'Changed own password',
        ]);
    }

    public function test_admin_can_create_update_and_delete_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/users', [
            'fullname' => 'Boat Captain',
            'username' => 'captain',
            'password' => 'Captain123!',
            'password_confirmation' => 'Captain123!',
            'role' => 'user',
        ])->assertRedirect();

        $user = User::where('username', 'captain')->firstOrFail();

        $this->actingAs($admin)->put("/admin/users/{$user->id}", [
            'fullname' => 'Boat Captain Updated',
            'username' => 'captain2',
            'password' => '',
            'password_confirmation' => '',
            'role' => 'user',
            'is_locked' => false,
        ])->assertRedirect();

        $this->assertDatabaseHas('users', ['username' => 'captain2']);

        $this->actingAs($admin)->delete("/admin/users/{$user->id}")->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_locked_account_cannot_login(): void
    {
        $user = User::factory()->create([
            'username' => 'locked',
            'password' => Hash::make('Password123!'),
            'is_locked' => true,
            'locked_at' => now(),
        ]);

        $this->post('/login', [
            'username' => 'locked',
            'password' => 'Password123!',
        ])->assertSessionHasErrors('username');

        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'activity' => 'Blocked login attempt for locked account',
        ]);
    }

    public function test_admin_account_is_not_locked_after_failed_login_attempts(): void
    {
        $admin = User::factory()->create([
            'username' => 'adminsafe',
            'password' => Hash::make('Admin@12345'),
            'role' => 'admin',
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->from('/login')->post('/login', [
                'username' => 'adminsafe',
                'password' => 'WrongPass123!',
            ])->assertSessionHasErrors('username');
        }

        $admin->refresh();

        $this->assertFalse($admin->is_locked);
        $this->assertNull($admin->locked_at);
        $this->assertSame(0, $admin->failed_login_attempts);
    }

    public function test_admin_can_login_with_correct_password_after_rate_limit(): void
    {
        $admin = User::factory()->create([
            'username' => 'adminrecover',
            'password' => Hash::make('Admin@12345'),
            'role' => 'admin',
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->from('/login')->post('/login', [
                'username' => 'adminrecover',
                'password' => 'WrongPass123!',
            ])->assertSessionHasErrors('username');
        }

        $this->post('/login', [
            'username' => 'adminrecover',
            'password' => 'Admin@12345',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($admin);
        $this->assertFalse($admin->fresh()->is_locked);
    }

    public function test_rate_limited_login_returns_retry_time_message(): void
    {
        User::factory()->create([
            'username' => 'limiteduser',
            'password' => Hash::make('UserPass123!'),
            'role' => 'user',
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->from('/login')->post('/login', [
                'username' => 'limiteduser',
                'password' => 'WrongPass123!',
            ])->assertSessionHasErrors('username');
        }

        $this->from('/login')->post('/login', [
            'username' => 'limiteduser',
            'password' => 'WrongPass123!',
        ])->assertSessionHasErrors('username');

        $error = session('errors')->get('username')[0];

        $this->assertStringContainsString('Too many login attempts. Please try again in', $error);
        $this->assertStringContainsString('seconds.', $error);
        $this->assertDatabaseCount('activity_logs', 6);
        $this->assertTrue(ActivityLog::where('activity', 'like', 'Rate limited login attempt; retry available in % seconds')->exists());
    }

    public function test_admin_account_cannot_be_locked_from_user_management(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $targetAdmin = User::factory()->create([
            'username' => 'targetadmin',
            'role' => 'admin',
            'failed_login_attempts' => 3,
        ]);

        $this->actingAs($admin)->put("/admin/users/{$targetAdmin->id}", [
            'fullname' => $targetAdmin->fullname,
            'username' => $targetAdmin->username,
            'password' => '',
            'password_confirmation' => '',
            'role' => 'admin',
            'is_locked' => true,
        ])->assertRedirect();

        $targetAdmin->refresh();

        $this->assertFalse($targetAdmin->is_locked);
        $this->assertNull($targetAdmin->locked_at);
        $this->assertSame(0, $targetAdmin->failed_login_attempts);
    }

    public function test_logout_creates_log(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/logout')->assertRedirect('/login');

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'activity' => 'Logout',
        ]);
    }

    public function test_keep_alive_endpoint_keeps_authenticated_session_active(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/session/keep-alive')
            ->assertNoContent();

        $this->assertAuthenticatedAs($user);
    }

    public function test_inactivity_timeout_logs_activity_and_logs_user_out(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/session/timeout')
            ->assertRedirect('/login');

        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'activity' => 'Session timed out due to inactivity',
        ]);
    }

    public function test_admin_user_management_is_paginated(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(12)->create();

        $this->actingAs($admin)
            ->get('/admin/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users')
                ->has('users.data', 8)
                ->where('users.per_page', 8)
            );
    }

    public function test_activity_logs_are_paginated(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        ActivityLog::factory()->count(15)->create(['user_id' => $admin->id]);

        $this->actingAs($admin)
            ->get('/admin/logs')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Logs')
                ->has('logs.data', 10)
                ->where('logs.per_page', 10)
            );
    }

    public function test_admin_can_clear_activity_logs_and_keep_audit_record(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        ActivityLog::factory()->count(5)->create(['user_id' => $admin->id]);

        $this->actingAs($admin)
            ->delete('/admin/logs')
            ->assertRedirect();

        $this->assertDatabaseCount('activity_logs', 1);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $admin->id,
            'activity' => 'Activity logs cleared',
        ]);
    }

    public function test_normal_user_cannot_clear_activity_logs(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        ActivityLog::factory()->count(3)->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete('/admin/logs')
            ->assertForbidden();

        $this->assertDatabaseCount('activity_logs', 3);
    }
}
