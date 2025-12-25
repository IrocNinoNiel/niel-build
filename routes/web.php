<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SpendingCategoryController;
use App\Http\Controllers\SpendingTransactionController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\ApplicationActivityController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ApplicationReminderController;
use App\Http\Controllers\DocumentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard - accessible without auth
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// API routes for projects and tasks
Route::prefix('api')->group(function () {
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('spending-categories', SpendingCategoryController::class);
    Route::apiResource('spending-transactions', SpendingTransactionController::class);

    // Job Application Tracker Routes
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('job-applications', JobApplicationController::class);
    Route::apiResource('application-activities', ApplicationActivityController::class);
    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('application-reminders', ApplicationReminderController::class);
    Route::post('documents', [DocumentController::class, 'store']);
    Route::delete('documents/{document}', [DocumentController::class, 'destroy']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
