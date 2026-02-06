<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_number',
        'bus_name',
        'capacity',
        'driver_name',
        'driver_phone',
        'route_description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'capacity' => 'integer',
    ];

    /**
     * Get all students assigned to this bus
     */
    public function transportDetails()
    {
        return $this->hasMany(TransportDetail::class);
    }

    /**
     * Get all students assigned to this bus (through transport details)
     */
    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            TransportDetail::class,
            'bus_id',      // Foreign key on transport_details table
            'id',          // Foreign key on students table
            'id',          // Local key on buses table
            'student_id'   // Local key on transport_details table
        );
    }

    /**
     * Get attendance records for this bus
     */
    public function attendanceRecords()
    {
        return $this->hasMany(TransportAttendance::class);
    }

    /**
     * Scope to get only active buses
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get current capacity usage
     */
    public function getCurrentCapacity()
    {
        return $this->transportDetails()
            ->whereHas('student', function ($query) {
                $query->where('is_active', true)
                      ->where('transport_enabled', true);
            })
            ->count();
    }

    /**
     * Check if bus has available capacity
     */
    public function hasAvailableCapacity()
    {
        if (!$this->capacity) {
            return true; // No limit set
        }
        
        return $this->getCurrentCapacity() < $this->capacity;
    }

    /**
     * Get remaining capacity
     */
    public function getRemainingCapacityAttribute()
    {
        if (!$this->capacity) {
            return null;
        }
        
        return max(0, $this->capacity - $this->getCurrentCapacity());
    }

    /**
     * Get capacity percentage
     */
    public function getCapacityPercentageAttribute()
    {
        if (!$this->capacity || $this->capacity === 0) {
            return 0;
        }
        
        return round(($this->getCurrentCapacity() / $this->capacity) * 100, 2);
    }
}