<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = Contact::with('company');

        // Filter by company if provided
        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $contacts = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($contacts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $contact = Contact::create($validated);
        $contact->load('company');

        return response()->json($contact, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'company_id' => 'sometimes|required|exists:companies,id',
            'name' => 'sometimes|required|string|max:255',
            'position' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $contact->update($validated);
        $contact->load('company');

        return response()->json($contact);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }
}
