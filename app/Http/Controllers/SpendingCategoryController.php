<?php

namespace App\Http\Controllers;

use App\Http\Resources\SpendingCategoryResource;
use App\Models\SpendingCategory;

class SpendingCategoryController extends Controller
{
    public function index()
    {
        $categories = SpendingCategory::orderBy('type')->orderBy('name')->get();
        return SpendingCategoryResource::collection($categories);
    }
}
