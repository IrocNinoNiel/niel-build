<?php

namespace App\Http\Controllers;

use App\Http\Resources\SpendingCategoryResource;
use App\Models\SpendingCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpendingCategoryController extends Controller
{
    public function index()
    {
        $categories = SpendingCategory::orderBy('type')->orderBy('name')->get();
        return SpendingCategoryResource::collection($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['income', 'expense'])],
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/|size:7',
        ]);

        $category = SpendingCategory::create($validated);
        return new SpendingCategoryResource($category);
    }

    public function show(SpendingCategory $spendingCategory)
    {
        return new SpendingCategoryResource($spendingCategory);
    }

    public function update(Request $request, SpendingCategory $spendingCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['income', 'expense'])],
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/|size:7',
        ]);

        $spendingCategory->update($validated);
        return new SpendingCategoryResource($spendingCategory);
    }

    public function destroy(SpendingCategory $spendingCategory)
    {
        // Check if category has any transactions
        if ($spendingCategory->transactions()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with existing transactions. Please delete or reassign the transactions first.'
            ], 422);
        }

        $spendingCategory->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
