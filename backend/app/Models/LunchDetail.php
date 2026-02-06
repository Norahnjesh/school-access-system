<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LunchDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'diet_type',
        'diet_notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Diet type constants
     */
    const DIET_NORMAL = 'normal';
    const DIET_SPECIAL = 'special';

    /**
     * Get available diet types
     */
    public static function getDietTypes()
    {
        return [
            self::DIET_NORMAL => 'Normal Diet',
            self::DIET_SPECIAL => 'Special Diet',
        ];
    }

    /**
     * Get the student that owns this lunch detail
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get attendance records for this lunch detail
     */
    public function attendanceRecords()
    {
        return $this->hasMany(LunchAttendance::class, 'student_id', 'student_id');
    }

    /**
     * Scope to get only active lunch details
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by diet type
     */
    public function scopeByDietType($query, $dietType)
    {
        return $query->where('diet_type', $dietType);
    }

    /**
     * Scope to get special diet students
     */
    public function scopeSpecialDiet($query)
    {
        return $query->where('diet_type', self::DIET_SPECIAL);
    }

    /**
     * Scope to get normal diet students
     */
    public function scopeNormalDiet($query)
    {
        return $query->where('diet_type', self::DIET_NORMAL);
    }

    /**
     * Check if this is a special diet
     */
    public function isSpecialDiet()
    {
        return $this->diet_type === self::DIET_SPECIAL;
    }

    /**
     * Get formatted diet type for display
     */
    public function getDietTypeDisplayAttribute()
    {
        return $this->isSpecialDiet() ? '⚠️ SPECIAL' : '🍽️ NORMAL';
    }

    /**
     * Get diet description including notes
     */
    public function getDietDescriptionAttribute()
    {
        $description = ucfirst($this->diet_type) . ' Diet';
        
        if ($this->diet_notes) {
            $description .= ' - ' . $this->diet_notes;
        }
        
        return $description;
    }
}