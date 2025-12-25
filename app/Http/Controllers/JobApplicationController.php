<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = JobApplication::with('company');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $jobApplications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($jobApplications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'job_title' => 'required|string|max:255',
            'job_url' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'priority' => 'nullable|string|max:255',
            'applied_at' => 'nullable|date',
            'deadline' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $jobApplication = JobApplication::create($validated);
        $jobApplication->load('company');

        return response()->json($jobApplication, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(JobApplication $jobApplication)
    {
        $jobApplication->load(['company', 'activities', 'documents', 'reminders']);

        return response()->json($jobApplication);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobApplication $jobApplication)
    {
        $validated = $request->validate([
            'company_id' => 'sometimes|required|exists:companies,id',
            'job_title' => 'sometimes|required|string|max:255',
            'job_url' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'priority' => 'nullable|string|max:255',
            'applied_at' => 'nullable|date',
            'deadline' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $jobApplication->update($validated);
        $jobApplication->load('company');

        return response()->json($jobApplication);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobApplication $jobApplication)
    {
        $jobApplication->delete();

        return response()->json(['message' => 'Job application deleted successfully']);
    }
}
