<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'job_application_id',
        'document_type',
        'file_name',
        'file_path',
        'file_size',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function jobApplication()
    {
        return $this->belongsTo(JobApplication::class);
    }
}
