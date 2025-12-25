<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationReminder extends Model
{
    protected $fillable = [
        'job_application_id',
        'reminder_type',
        'reminder_date',
        'message',
        'is_completed',
    ];

    protected $casts = [
        'reminder_date' => 'datetime',
        'is_completed' => 'boolean',
    ];

    public function jobApplication()
    {
        return $this->belongsTo(JobApplication::class);
    }
}
