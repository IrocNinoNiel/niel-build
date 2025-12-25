<?php

namespace App\Http\Controllers;

use App\Models\ApplicationActivity;
use Illuminate\Http\Request;

class ApplicationActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = ApplicationActivity::with('jobApplication');

        // Filter by job application if provided
        if ($request->has('job_application_id')) {
            $query->where('job_application_id', $request->job_application_id);
        }

        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($activities);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_application_id' => 'required|exists:job_applications,id',
            'activity_type' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'outcome' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $activity = ApplicationActivity::create($validated);
        $activity->load('jobApplication');

        return response()->json($activity, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ApplicationActivity $applicationActivity)
    {
        $validated = $request->validate([
            'job_application_id' => 'sometimes|required|exists:job_applications,id',
            'activity_type' => 'nullable|string|max:255',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'outcome' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $applicationActivity->update($validated);
        $applicationActivity->load('jobApplication');

        return response()->json($applicationActivity);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ApplicationActivity $applicationActivity)
    {
        $applicationActivity->delete();

        return response()->json(['message' => 'Activity deleted successfully']);
    }
}
