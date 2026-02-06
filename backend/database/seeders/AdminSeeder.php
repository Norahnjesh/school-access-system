<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@littlewonder.school',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create Transport Staff
        User::create([
            'name' => 'Transport Staff',
            'email' => 'transport@littlewonder.school',
            'password' => Hash::make('password'),
            'role' => 'transport_staff',
            'is_active' => true,
        ]);

        // Create Lunch Staff
        User::create([
            'name' => 'Lunch Staff',
            'email' => 'lunch@littlewonder.school',
            'password' => Hash::make('password'),
            'role' => 'lunch_staff',
            'is_active' => true,
        ]);

        $this->command->info('✓ Admin users created successfully!');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('==================');
        $this->command->info('Admin: admin@littlewonder.school / password');
        $this->command->info('Transport: transport@littlewonder.school / password');
        $this->command->info('Lunch: lunch@littlewonder.school / password');
    }
}