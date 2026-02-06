<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TransportAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'bus_id',
        'scan_type',
        'scanned_at',
        'scanned_by',
        'is_valid',
        'alert_message',
    ];

    protected $casts = [
        'is_valid' => 'boolean',
        'scanned_at' => 'datetime',
    ];

    /**
     * Scan type constants
     */
    const SCAN_MORNING_PICKUP = 'morning_pickup';
    const SCAN_EVENING_DROPOFF = 'evening_dropoff';

    /**
     * Get available scan types
     */
    public static function getScanTypes()
    {
        return [
            self::SCAN_MORNING_PICKUP => 'Morning Pickup',
            self::SCAN_EVENING_DROPOFF => 'Evening Dropoff',
        ];
    }

    /**
     * Get the student that this attendance belongs to
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the bus that this attendance belongs to
     */
    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    /**
     * Get the user who scanned this attendance
     */
    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }

    /**
     * Scope to get only valid scans
     */
    public function scopeValid($query)
    {
        return $query->where('is_valid', true);
    }

    /**
     * Scope to get only invalid scans (alerts)
     */
    public function scopeInvalid($query)
    {
        return $query->where('is_valid', false);
    }

    /**
     * Scope to filter by date
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('scanned_at', $date);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('scanned_at', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by scan type
     */
    public function scopeByScanType($query, $scanType)
    {
        return $query->where('scan_type', $scanType);
    }

    /**
     * Scope to get morning pickups
     */
    public function scopeMorningPickups($query)
    {
        return $query->where('scan_type', self::SCAN_MORNING_PICKUP);
    }

    /**
     * Scope to get evening dropoffs
     */
    public function scopeEveningDropoffs($query)
    {
        return $query->where('scan_type', self::SCAN_EVENING_DROPOFF);
    }

    /**
     * Scope to filter by student
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope to filter by bus
     */
    public function scopeForBus($query, $busId)
    {
        return $query->where('bus_id', $busId);
    }

    /**
     * Scope to get today's attendance
     */
    public function scopeToday($query)
    {
        return $query->whereDate('scanned_at', Carbon::today());
    }

    /**
     * Check if this is a morning pickup
     */
    public function isMorningPickup()
    {
        return $this->scan_type === self::SCAN_MORNING_PICKUP;
    }

    /**
     * Check if this is an evening dropoff
     */
    public function isEveningDropoff()
    {
        return $this->scan_type === self::SCAN_EVENING_DROPOFF;
    }

    /**
     * Get formatted scan type for display
     */
    public function getScanTypeDisplayAttribute()
    {
        return $this->isMorningPickup() ? '🌅 Morning Pickup' : '🌆 Evening Dropoff';
    }

    /**
     * Get formatted scan time
     */
    public function getScanTimeAttribute()
    {
        return $this->scanned_at->format('H:i:s');
    }

    /**
     * Get formatted scan date
     */
    public function getScanDateAttribute()
    {
        return $this->scanned_at->format('Y-m-d');
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return $this->is_valid ? 'green' : 'red';
    }

    /**
     * Get status text
     */
    public function getStatusTextAttribute()
    {
        return $this->is_valid ? '✓ Valid' : '✗ Invalid';
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set scanned_at to now if not provided
        static::creating(function ($attendance) {
            if (!$attendance->scanned_at) {
                $attendance->scanned_at = now();
            }
        });
    }
}