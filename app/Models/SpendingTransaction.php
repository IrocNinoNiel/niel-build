<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpendingTransaction extends Model
{
    protected $table = 'spending_transactions';

    protected $fillable = [
        'category_id',
        'type',
        'amount',
        'description',
        'transaction_date',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the category that owns the transaction.
     */
    public function category()
    {
        return $this->belongsTo(SpendingCategory::class, 'category_id');
    }
}
