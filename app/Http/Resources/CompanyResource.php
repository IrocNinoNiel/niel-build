<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
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
            'name' => $this->name,
            'website' => $this->website,
            'logo_url' => $this->logo_url,
            'industry' => $this->industry,
            'location' => $this->location,
            'company_size' => $this->company_size,
            'notes' => $this->notes,
            'rating' => $this->rating,
            'job_applications' => JobApplicationResource::collection($this->whenLoaded('jobApplications')),
            'contacts' => ContactResource::collection($this->whenLoaded('contacts')),
            'applications_count' => $this->when(isset($this->job_applications_count), $this->job_applications_count),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
