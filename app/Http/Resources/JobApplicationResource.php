<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'job_title' => $this->job_title,
            'job_url' => $this->job_url,
            'description' => $this->description,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'location' => $this->location,
            'job_type' => $this->job_type,
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'priority' => $this->priority,
            'applied_at' => $this->applied_at?->format('Y-m-d'),
            'deadline' => $this->deadline?->format('Y-m-d'),
            'source' => $this->source,
            'notes' => $this->notes,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'activities' => ApplicationActivityResource::collection($this->whenLoaded('activities')),
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
            'reminders' => ApplicationReminderResource::collection($this->whenLoaded('reminders')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
