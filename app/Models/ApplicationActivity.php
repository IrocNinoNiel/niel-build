<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationActivity extends Model
{
    protected $fillable = [
        'job_application_id',
        'activity_type',
        'title',
        'description',
        'scheduled_at',
        'completed_at',
        'outcome',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function jobApplication()
    {
        return $this->belongsTo(JobApplication::class);
    }
}
