<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = [
        'company_id',
        'job_title',
        'job_url',
        'description',
        'salary_min',
        'salary_max',
        'location',
        'job_type',
        'employment_type',
        'status',
        'priority',
        'applied_at',
        'deadline',
        'source',
        'notes',
    ];

    protected $casts = [
        'applied_at' => 'date',
        'deadline' => 'date',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function activities()
    {
        return $this->hasMany(ApplicationActivity::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function reminders()
    {
        return $this->hasMany(ApplicationReminder::class);
    }
}
