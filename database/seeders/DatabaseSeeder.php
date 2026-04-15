<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Member;
use App\Models\Program;
use App\Models\Plan;
use App\Models\Expense;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Users
        User::create([
            'name' => 'Admin',
            'email' => 'admin@p4p.com',
            'password' => Hash::make('p0und4P0und*'), 
        ]);

        /*$users = [
            ['name' => 'Lij Faeldonea', 'email' => 'lij@gmail.com', 'password' => 'lij123'],
            ['name' => 'KJR Calampinay', 'email' => 'kjr@gmail.com', 'password' => 'kjr123'],
            ['name' => 'Russ Garde', 'email' => 'russgarde03@gmail.com', 'password' => 'russ123'],
        ];

        foreach ($users as $user) {
            User::create([
                'name' => $user['name'],
                'email' => $user['email'],
                'password' => Hash::make($user['password']),
            ]);
        }

        //Expenses
        Expense::factory()->count(20)->create();

        // Members
        Member::factory()->count(10)->create();

        // Programs
        $programs = [
            ['name' => 'Strength Training', 'description' => 'Build muscle and strength.'],
            ['name' => 'Cardio Blast', 'description' => 'Improve stamina and endurance.'],
            ['name' => 'Yoga & Flexibility', 'description' => 'Increase flexibility and balance.'],
            ['name' => 'HIIT Challenge', 'description' => 'High-intensity interval training.'],
        ];

        $programIds = [];
        foreach ($programs as $prog) {
            $programIds[] = Program::create([
                'name' => $prog['name'],
                'description' => $prog['description'],
            ])->id;
        }

        // Plans
        $plans = [
            ['name' => 'Monthly Plan', 'price' => 1000, 'duration_days' => 30],
            ['name' => 'Quarterly Plan', 'price' => 2700, 'duration_days' => 90],
            ['name' => 'Annual Plan', 'price' => 10000, 'duration_days' => 365],
        ];

        // Randomly assign plans to programs
        foreach ($plans as $plan) {
            Plan::create([
                'program_id' => $programIds[array_rand($programIds)], // pick a random program
                'name' => $plan['name'],
                'price' => $plan['price'],
                'duration_days' => $plan['duration_days'],
                'is_promo' => false,
                'max_slots' => null,
                'is_active' => true,
            ]);
        }*/
    }
}