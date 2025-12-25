<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'website',
        'logo_url',
        'industry',
        'location',
        'company_size',
        'notes',
        'rating',
    ];

    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }
}
