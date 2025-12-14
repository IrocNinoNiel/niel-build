<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create default "General" project
        $projectId = DB::table('projects')->insertGetId([
            'name' => 'General',
            'description' => 'Default project for general tasks',
            'color' => '#1976d2',
            'status' => 'active',
            'due_date' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Assign all tasks with NULL project_id to the default project
        DB::table('tasks')
            ->whereNull('project_id')
            ->update(['project_id' => $projectId]);

        // Make project_id NOT NULL
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Make project_id nullable again
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->change();
        });

        // Delete the default "General" project (tasks will be set to NULL due to cascade)
        DB::table('projects')->where('name', 'General')->delete();
    }
};
