<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'fullname' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'password' => static::$password ??= Hash::make('password'),
            'avatar_path' => null,
            'contact_number' => fake()->optional()->phoneNumber(),
            'boat_name' => fake()->optional()->randomElement(['FV Cantil 1', 'FV Cantil 2', 'FV Masbate']),
            'position' => fake()->optional()->randomElement(['Owner', 'Captain', 'Crew', 'Bookkeeper']),
            'address' => fake()->optional()->address(),
            'bio' => fake()->optional()->sentence(),
            'role' => 'user',
            'is_locked' => false,
            'failed_login_attempts' => 0,
            'locked_at' => null,
        ];
    }
}
