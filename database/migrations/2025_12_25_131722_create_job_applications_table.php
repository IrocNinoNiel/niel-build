<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('job_title');
            $table->string('job_url')->nullable();
            $table->text('description')->nullable();
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->string('location')->nullable();
            $table->enum('job_type', ['remote', 'hybrid', 'onsite'])->nullable();
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'freelance'])->nullable();
            $table->enum('status', ['wishlist', 'applied', 'interviewing', 'offered', 'accepted', 'rejected', 'withdrawn'])->default('wishlist');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->date('applied_at')->nullable();
            $table->date('deadline')->nullable();
            $table->string('source')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
