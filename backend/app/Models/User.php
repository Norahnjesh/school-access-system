<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/* ✅ ADD THESE IMPORTS (THIS WAS THE MISSING PART) */
use App\Models\TransportAttendance;
use App\Models\LunchAttendance;
use App\Models\AuditLog;
use App\Models\ImportJob;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Role constants
     */
    const ROLE_ADMIN = 'admin';
    const ROLE_TRANSPORT_STAFF = 'transport_staff';
    const ROLE_LUNCH_STAFF = 'lunch_staff';

    /**
     * Get available roles
     */
    public static function getRoles()
    {
        return [
            self::ROLE_ADMIN => 'Administrator',
            self::ROLE_TRANSPORT_STAFF => 'Transport Staff',
            self::ROLE_LUNCH_STAFF => 'Lunch Staff',
        ];
    }

    /**
     * Get transport attendance scans performed by this user
     */
    public function transportScans()
    {
        return $this->hasMany(TransportAttendance::class, 'scanned_by');
    }

    /**
     * Get lunch attendance scans performed by this user
     */
    public function lunchScans()
    {
        return $this->hasMany(LunchAttendance::class, 'scanned_by');
    }

    /**
     * Get audit logs for this user
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get import jobs created by this user
     */
    public function importJobs()
    {
        return $this->hasMany(ImportJob::class);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is transport staff
     */
    public function isTransportStaff()
    {
        return $this->role === self::ROLE_TRANSPORT_STAFF;
    }

    /**
     * Check if user is lunch staff
     */
    public function isLunchStaff()
    {
        return $this->role === self::ROLE_LUNCH_STAFF;
    }

    /**
     * Check if user has permission for transport operations
     */
    public function canAccessTransport()
    {
        return $this->isAdmin() || $this->isTransportStaff();
    }

    /**
     * Check if user has permission for lunch operations
     */
    public function canAccessLunch()
    {
        return $this->isAdmin() || $this->isLunchStaff();
    }

    /**
     * Check if user has permission for student management
     */
    public function canManageStudents()
    {
        return $this->isAdmin();
    }

    /**
     * Check if user has permission for reports
     */
    public function canAccessReports()
    {
        return $this->isAdmin();
    }

    /**
     * Scope to get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to get admins
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    /**
     * Scope to get transport staff
     */
    public function scopeTransportStaff($query)
    {
        return $query->where('role', self::ROLE_TRANSPORT_STAFF);
    }

    /**
     * Scope to get lunch staff
     */
    public function scopeLunchStaff($query)
    {
        return $query->where('role', self::ROLE_LUNCH_STAFF);
    }

    /**
     * Get formatted role name for display
     */
    public function getRoleDisplayAttribute()
    {
        return self::getRoles()[$this->role] ?? $this->role;
    }

    /**
     * Get role badge color
     */
    public function getRoleBadgeColorAttribute()
    {
        return match ($this->role) {
            self::ROLE_ADMIN => 'purple',
            self::ROLE_TRANSPORT_STAFF => 'blue',
            self::ROLE_LUNCH_STAFF => 'green',
            default => 'gray',
        };
    }

    /**
     * Get today's scan count
     */
    public function getTodayScanCount()
    {
        $transportCount = $this->transportScans()
            ->whereDate('scanned_at', today())
            ->count();

        $lunchCount = $this->lunchScans()
            ->whereDate('scanned_at', today())
            ->count();

        return $transportCount + $lunchCount;
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($user) {
            if ($user->isDirty('is_active') && !$user->is_active) {
                $user->tokens()->delete();
            }
        });
    }
}
