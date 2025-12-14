<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            ['name' => 'Salary', 'type' => 'income', 'icon' => '💰', 'color' => '#4caf50'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => '💼', 'color' => '#8bc34a'],
            ['name' => 'Business', 'type' => 'income', 'icon' => '🏢', 'color' => '#66bb6a'],
            ['name' => 'Investment', 'type' => 'income', 'icon' => '📈', 'color' => '#81c784'],
            ['name' => 'Gift', 'type' => 'income', 'icon' => '🎁', 'color' => '#a5d6a7'],
            ['name' => 'Other Income', 'type' => 'income', 'icon' => '💵', 'color' => '#c8e6c9'],

            // Expense Categories
            ['name' => 'Food & Dining', 'type' => 'expense', 'icon' => '🍔', 'color' => '#ff5722'],
            ['name' => 'Transportation', 'type' => 'expense', 'icon' => '🚗', 'color' => '#ff9800'],
            ['name' => 'Shopping', 'type' => 'expense', 'icon' => '🛍️', 'color' => '#ffc107'],
            ['name' => 'Bills & Utilities', 'type' => 'expense', 'icon' => '💡', 'color' => '#ffeb3b'],
            ['name' => 'Entertainment', 'type' => 'expense', 'icon' => '🎮', 'color' => '#9c27b0'],
            ['name' => 'Health & Fitness', 'type' => 'expense', 'icon' => '💊', 'color' => '#e91e63'],
            ['name' => 'Education', 'type' => 'expense', 'icon' => '📚', 'color' => '#3f51b5'],
            ['name' => 'Other Expenses', 'type' => 'expense', 'icon' => '📝', 'color' => '#607d8b'],
        ];

        foreach ($categories as $category) {
            DB::table('spending_categories')->insert([
                'name' => $category['name'],
                'type' => $category['type'],
                'icon' => $category['icon'],
                'color' => $category['color'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
