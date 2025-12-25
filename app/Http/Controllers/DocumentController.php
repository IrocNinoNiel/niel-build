<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Store a newly uploaded document.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_application_id' => 'required|exists:job_applications,id',
            'document_type' => 'nullable|string|max:255',
            'file' => 'required|file|max:10240', // Max 10MB
        ]);

        // Store the file
        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('documents', $fileName);

        // Create document record
        $document = Document::create([
            'job_application_id' => $validated['job_application_id'],
            'document_type' => $validated['document_type'] ?? null,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'uploaded_at' => now(),
        ]);

        $document->load('jobApplication');

        return response()->json($document, 201);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy(Document $document)
    {
        // Delete the file from storage
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        // Delete the database record
        $document->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }
}
