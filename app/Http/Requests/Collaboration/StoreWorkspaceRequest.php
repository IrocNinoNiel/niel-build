<?php

namespace App\Http\Requests\Collaboration;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkspaceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Any authenticated user can create a workspace
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('workspaces', 'slug'),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'avatar_url' => ['nullable', 'string', 'url', 'max:255'],
            'settings' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a name for your workspace.',
            'name.max' => 'Workspace name cannot exceed 255 characters.',
            'slug.unique' => 'This workspace slug is already taken.',
            'slug.alpha_dash' => 'Workspace slug can only contain letters, numbers, dashes and underscores.',
            'avatar_url.url' => 'Please provide a valid URL for the workspace avatar.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'workspace name',
            'slug' => 'workspace slug',
            'description' => 'workspace description',
            'avatar_url' => 'avatar URL',
        ];
    }
}
