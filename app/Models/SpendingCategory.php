<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpendingCategory extends Model
{
    protected $table = 'spending_categories';

    protected $fillable = [
        'name',
        'type',
        'icon',
        'color',
    ];

    /**
     * Get the transactions for the category.
     */
    public function transactions()
    {
        return $this->hasMany(SpendingTransaction::class, 'category_id');
    }
}
