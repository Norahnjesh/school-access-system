<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Disable updated_at timestamp (we only need created_at)
     */
    const UPDATED_AT = null;

    /**
     * Action constants
     */
    const ACTION_CREATED = 'created';
    const ACTION_UPDATED = 'updated';
    const ACTION_DELETED = 'deleted';
    const ACTION_IMPORTED = 'imported';
    const ACTION_EXPORTED = 'exported';
    const ACTION_LOGIN = 'login';
    const ACTION_LOGOUT = 'logout';
    const ACTION_SCANNED = 'scanned';

    /**
     * Get the user who performed this action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by action
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by entity type
     */
    public function scopeByEntityType($query, $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    /**
     * Scope to filter by entity
     */
    public function scopeByEntity($query, $entityType, $entityId)
    {
        return $query->where('entity_type', $entityType)
                     ->where('entity_id', $entityId);
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by date
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('created_at', $date);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get recent logs
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get changes made in this audit log
     */
    public function getChangesAttribute()
    {
        if (!$this->old_values || !$this->new_values) {
            return [];
        }

        $changes = [];
        
        foreach ($this->new_values as $key => $newValue) {
            $oldValue = $this->old_values[$key] ?? null;
            
            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }
        
        return $changes;
    }

    /**
     * Get formatted action for display
     */
    public function getActionDisplayAttribute()
    {
        return ucfirst($this->action);
    }

    /**
     * Get formatted entity for display
     */
    public function getEntityDisplayAttribute()
    {
        return ucfirst(str_replace('_', ' ', $this->entity_type));
    }

    /**
     * Get current user ID safely
     * SIMPLIFIED: Only uses Auth facade
     */
    protected static function getCurrentUserId()
    {
        try {
            // Only use Auth facade - most reliable
            if (Auth::check()) {
                return Auth::id();
            }
            
            // Fallback: try to get user directly
            $user = Auth::user();
            return $user ? $user->id : null;
            
        } catch (\Exception $e) {
            // If anything fails, return null
            return null;
        }
    }

    /**
     * Create audit log helper method
     * FIXED: Uses simplified getCurrentUserId() with only Auth facade
     */
    public static function log($action, $entityType, $entityId = null, $oldValues = null, $newValues = null)
    {
        return self::create([
            'user_id' => self::getCurrentUserId(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Log creation
     */
    public static function logCreation($entityType, $entity)
    {
        return self::log(
            self::ACTION_CREATED,
            $entityType,
            $entity->id ?? null,
            null,
            is_array($entity) ? $entity : $entity->toArray()
        );
    }

    /**
     * Log update
     */
    public static function logUpdate($entityType, $entity, $oldValues)
    {
        return self::log(
            self::ACTION_UPDATED,
            $entityType,
            $entity->id ?? null,
            $oldValues,
            is_array($entity) ? $entity : $entity->toArray()
        );
    }

    /**
     * Log deletion
     */
    public static function logDeletion($entityType, $entity)
    {
        return self::log(
            self::ACTION_DELETED,
            $entityType,
            $entity->id ?? null,
            is_array($entity) ? $entity : $entity->toArray(),
            null
        );
    }

    /**
     * Log import
     */
    public static function logImport($filename, $results)
    {
        return self::log(
            self::ACTION_IMPORTED,
            'import',
            null,
            null,
            [
                'filename' => $filename,
                'results' => $results,
            ]
        );
    }

    /**
     * Log export
     */
    public static function logExport($entityType, $filters)
    {
        return self::log(
            self::ACTION_EXPORTED,
            $entityType,
            null,
            null,
            ['filters' => $filters]
        );
    }

    /**
     * Get activity summary for a date range
     */
    public static function getActivitySummary($startDate, $endDate)
    {
        return self::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('action, entity_type, COUNT(*) as count')
            ->groupBy('action', 'entity_type')
            ->get()
            ->groupBy('action');
    }
}