<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LunchAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'meal_date',
        'scanned_at',
        'scanned_by',
        'diet_type_served',
    ];

    protected $casts = [
        'meal_date' => 'date',
        'scanned_at' => 'datetime',
    ];

    /**
     * Get the student that this attendance belongs to
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who scanned this attendance
     */
    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }

    /**
     * Get the lunch detail for this student
     */
    public function lunchDetail()
    {
        return $this->hasOneThrough(
            LunchDetail::class,
            Student::class,
            'id',         // Foreign key on students table
            'student_id', // Foreign key on lunch_details table
            'student_id', // Local key on lunch_attendance table
            'id'          // Local key on students table
        );
    }

    /**
     * Scope to filter by date
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('meal_date', $date);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('meal_date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by student
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope to filter by diet type served
     */
    public function scopeByDietType($query, $dietType)
    {
        return $query->where('diet_type_served', $dietType);
    }

    /**
     * Scope to get normal diet meals
     */
    public function scopeNormalDiet($query)
    {
        return $query->where('diet_type_served', 'normal');
    }

    /**
     * Scope to get special diet meals
     */
    public function scopeSpecialDiet($query)
    {
        return $query->where('diet_type_served', 'special');
    }

    /**
     * Scope to get today's attendance
     */
    public function scopeToday($query)
    {
        return $query->whereDate('meal_date', Carbon::today());
    }

    /**
     * Scope to get this week's attendance
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('meal_date', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek(),
        ]);
    }

    /**
     * Scope to get this month's attendance
     */
    public function scopeThisMonth($query)
    {
        return $query->whereBetween('meal_date', [
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth(),
        ]);
    }

    /**
     * Check if student has been served today
     */
    public static function hasBeenServedToday($studentId)
    {
        return self::where('student_id', $studentId)
            ->whereDate('meal_date', Carbon::today())
            ->exists();
    }

    /**
     * Check if this is a special diet meal
     */
    public function isSpecialDiet()
    {
        return $this->diet_type_served === 'special';
    }

    /**
     * Get formatted diet type for display
     */
    public function getDietTypeDisplayAttribute()
    {
        return $this->isSpecialDiet() ? '⚠️ SPECIAL' : '🍽️ NORMAL';
    }

    /**
     * Get formatted meal date
     */
    public function getMealDateFormattedAttribute()
    {
        return $this->meal_date->format('Y-m-d');
    }

    /**
     * Get formatted scan time
     */
    public function getScanTimeAttribute()
    {
        return $this->scanned_at->format('H:i:s');
    }

    /**
     * Get meal time of day
     */
    public function getMealTimeOfDayAttribute()
    {
        $hour = $this->scanned_at->hour;
        
        if ($hour >= 6 && $hour < 11) {
            return 'Breakfast';
        } elseif ($hour >= 11 && $hour < 15) {
            return 'Lunch';
        } elseif ($hour >= 15 && $hour < 18) {
            return 'Snack';
        } else {
            return 'Meal';
        }
    }

    /**
     * Get count of meals for a student in date range
     */
    public static function getMealCountForStudent($studentId, $startDate, $endDate)
    {
        return self::where('student_id', $studentId)
            ->whereBetween('meal_date', [$startDate, $endDate])
            ->count();
    }

    /**
     * Get daily meal statistics
     */
    public static function getDailyStats($date = null)
    {
        $date = $date ?? Carbon::today();
        
        $total = self::whereDate('meal_date', $date)->count();
        $normal = self::whereDate('meal_date', $date)
            ->where('diet_type_served', 'normal')
            ->count();
        $special = self::whereDate('meal_date', $date)
            ->where('diet_type_served', 'special')
            ->count();
        
        return [
            'date' => $date->format('Y-m-d'),
            'total_meals' => $total,
            'normal_meals' => $normal,
            'special_meals' => $special,
        ];
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set meal_date to today and scanned_at to now if not provided
        static::creating(function ($attendance) {
            if (!$attendance->meal_date) {
                $attendance->meal_date = Carbon::today();
            }
            
            if (!$attendance->scanned_at) {
                $attendance->scanned_at = now();
            }
        });
    }
}