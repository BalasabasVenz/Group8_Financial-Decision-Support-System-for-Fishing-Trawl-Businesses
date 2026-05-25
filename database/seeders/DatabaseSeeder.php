<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate([
            'username' => 'admin',
        ], [
            'fullname' => 'System Administrator',
            'password' => Hash::make('Admin@12345'),
            'role' => 'admin',
            'is_locked' => false,
            'failed_login_attempts' => 0,
            'locked_at' => null,
        ]);
    }
}
