<?php

namespace App\Http\Controllers;

use App\Models\ApplicationReminder;
use Illuminate\Http\Request;

class ApplicationReminderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = ApplicationReminder::with('jobApplication');

        // Filter by completion status
        if ($request->has('is_completed')) {
            $query->where('is_completed', $request->boolean('is_completed'));
        }

        // Filter for upcoming reminders (not completed and in the future)
        if ($request->has('upcoming') && $request->boolean('upcoming')) {
            $query->where('is_completed', false)
                  ->where('reminder_date', '>=', now());
        }

        // Filter by job application if provided
        if ($request->has('job_application_id')) {
            $query->where('job_application_id', $request->job_application_id);
        }

        $reminders = $query->orderBy('reminder_date', 'asc')->paginate($perPage);

        return response()->json($reminders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_application_id' => 'required|exists:job_applications,id',
            'reminder_type' => 'nullable|string|max:255',
            'reminder_date' => 'required|date',
            'message' => 'required|string',
            'is_completed' => 'nullable|boolean',
        ]);

        $reminder = ApplicationReminder::create($validated);
        $reminder->load('jobApplication');

        return response()->json($reminder, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ApplicationReminder $applicationReminder)
    {
        $validated = $request->validate([
            'job_application_id' => 'sometimes|required|exists:job_applications,id',
            'reminder_type' => 'nullable|string|max:255',
            'reminder_date' => 'sometimes|required|date',
            'message' => 'sometimes|required|string',
            'is_completed' => 'nullable|boolean',
        ]);

        $applicationReminder->update($validated);
        $applicationReminder->load('jobApplication');

        return response()->json($applicationReminder);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ApplicationReminder $applicationReminder)
    {
        $applicationReminder->delete();

        return response()->json(['message' => 'Reminder deleted successfully']);
    }
}
