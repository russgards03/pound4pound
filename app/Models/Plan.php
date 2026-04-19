<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'name',
        'duration_days',
        'price',
        'is_promo',
        'promo_start_date',
        'promo_end_date',
        'max_slots',
        'is_active',
    ];

    protected $casts = [
    'price' => 'float',
    'is_promo' => 'boolean',
    'is_active' => 'boolean',
    'promo_start_date' => 'date',
    'promo_end_date' => 'date',   
    'duration_days' => 'integer',
    'max_slots' => 'integer',
    ];

    public function programs() {
        return $this->belongsToMany(Program::class);
    }

    public function trainingSubscriptions()
    {
        return $this->hasMany(TrainingSubscription::class);
    }
}