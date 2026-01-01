<?php

namespace App\Http\Requests\Collaboration;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:10000'],
            'parent_id' => ['nullable', 'integer', Rule::exists('messages', 'id')],
            'content_type' => ['nullable', 'string', Rule::in(['text', 'file', 'system'])],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
