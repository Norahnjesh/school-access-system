<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'bus_id',
        'pickup_point',
        'dropoff_point',
        'pickup_time',
        'dropoff_time',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'pickup_time' => 'datetime',
        'dropoff_time' => 'datetime',
    ];

    /**
     * Get the student that owns this transport detail
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the bus assigned to this transport detail
     */
    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    /**
     * Scope to get only active transport details
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by bus
     */
    public function scopeForBus($query, $busId)
    {
        return $query->where('bus_id', $busId);
    }

    /**
     * Scope to filter by pickup point
     */
    public function scopeByPickupPoint($query, $pickupPoint)
    {
        return $query->where('pickup_point', 'LIKE', "%{$pickupPoint}%");
    }

    /**
     * Get full route description
     */
    public function getRouteAttribute()
    {
        return "{$this->pickup_point} → {$this->dropoff_point}";
    }

    /**
     * Get formatted pickup time
     */
    public function getPickupTimeFormattedAttribute()
    {
        return $this->pickup_time ? $this->pickup_time->format('H:i') : null;
    }

    /**
     * Get formatted dropoff time
     */
    public function getDropoffTimeFormattedAttribute()
    {
        return $this->dropoff_time ? $this->dropoff_time->format('H:i') : null;
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // When transport detail is deleted, also clean up related attendance
        static::deleting(function ($transportDetail) {
            // Optionally: Clean up old attendance records
            // $transportDetail->attendanceRecords()->delete();
        });
    }
}