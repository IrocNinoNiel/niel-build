<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'position',
        'email',
        'phone',
        'linkedin_url',
        'notes',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
