<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_number', 'first_name', 'last_name', 'grade_class',
        'qr_code', 'is_active', 'guardian_name', 'guardian_phone',
        'guardian_email', 'transport_enabled', 'lunch_enabled',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'transport_enabled' => 'boolean',
        'lunch_enabled' => 'boolean',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function transportDetail()
    {
        return $this->hasOne(TransportDetail::class);
    }

    public function lunchDetail()
    {
        return $this->hasOne(LunchDetail::class);
    }
}