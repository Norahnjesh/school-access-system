<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'import_type',
        'status',
        'total_rows',
        'processed_rows',
        'success_count',
        'error_count',
        'error_log',
    ];

    protected $casts = [
        'total_rows' => 'integer',
        'processed_rows' => 'integer',
        'success_count' => 'integer',
        'error_count' => 'integer',
        'error_log' => 'array',
    ];

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    /**
     * Import type constants
     */
    const TYPE_STUDENTS = 'students';
    const TYPE_BUSES = 'buses';
    const TYPE_TRANSPORT_DETAILS = 'transport_details';
    const TYPE_LUNCH_DETAILS = 'lunch_details';

    /**
     * Get available statuses
     */
    public static function getStatuses()
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_FAILED => 'Failed',
        ];
    }

    /**
     * Get available import types
     */
    public static function getImportTypes()
    {
        return [
            self::TYPE_STUDENTS => 'Students',
            self::TYPE_BUSES => 'Buses',
            self::TYPE_TRANSPORT_DETAILS => 'Transport Details',
            self::TYPE_LUNCH_DETAILS => 'Lunch Details',
        ];
    }

    /**
     * Get the user who created this import job
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by import type
     */
    public function scopeByImportType($query, $importType)
    {
        return $query->where('import_type', $importType);
    }

    /**
     * Scope to get pending jobs
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope to get processing jobs
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    /**
     * Scope to get completed jobs
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope to get failed jobs
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope to get recent jobs
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Check if job is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if job is processing
     */
    public function isProcessing()
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    /**
     * Check if job is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if job has failed
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Check if job is in progress
     */
    public function isInProgress()
    {
        return $this->isPending() || $this->isProcessing();
    }

    /**
     * Check if job is finished
     */
    public function isFinished()
    {
        return $this->isCompleted() || $this->isFailed();
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentageAttribute()
    {
        if ($this->total_rows === 0) {
            return 0;
        }
        
        return round(($this->processed_rows / $this->total_rows) * 100, 2);
    }

    /**
     * Get remaining rows
     */
    public function getRemainingRowsAttribute()
    {
        return max(0, $this->total_rows - $this->processed_rows);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'gray',
            self::STATUS_PROCESSING => 'blue',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_FAILED => 'red',
            default => 'gray',
        };
    }

    /**
     * Get status display text
     */
    public function getStatusDisplayAttribute()
    {
        return self::getStatuses()[$this->status] ?? $this->status;
    }

    /**
     * Get import type display text
     */
    public function getImportTypeDisplayAttribute()
    {
        return self::getImportTypes()[$this->import_type] ?? $this->import_type;
    }

    /**
     * Get success rate
     */
    public function getSuccessRateAttribute()
    {
        if ($this->processed_rows === 0) {
            return 0;
        }
        
        return round(($this->success_count / $this->processed_rows) * 100, 2);
    }

    /**
     * Get error rate
     */
    public function getErrorRateAttribute()
    {
        if ($this->processed_rows === 0) {
            return 0;
        }
        
        return round(($this->error_count / $this->processed_rows) * 100, 2);
    }

    /**
     * Add error to error log
     */
    public function addError($row, $identifier, $error)
    {
        $errors = $this->error_log ?? [];
        
        $errors[] = [
            'row' => $row,
            'identifier' => $identifier,
            'error' => $error,
            'timestamp' => now()->toIso8601String(),
        ];
        
        $this->error_log = $errors;
        $this->save();
    }

    /**
     * Get formatted duration
     */
    public function getDurationAttribute()
    {
        if (!$this->isFinished()) {
            return 'In progress';
        }
        
        $seconds = $this->created_at->diffInSeconds($this->updated_at);
        
        if ($seconds < 60) {
            return $seconds . ' seconds';
        }
        
        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;
        
        return $minutes . ' min ' . $remainingSeconds . ' sec';
    }

    /**
     * Mark job as processing
     */
    public function markAsProcessing()
    {
        $this->update(['status' => self::STATUS_PROCESSING]);
    }

    /**
     * Mark job as completed
     */
    public function markAsCompleted()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Mark job as failed
     */
    public function markAsFailed($error = null)
    {
        $updates = ['status' => self::STATUS_FAILED];
        
        if ($error) {
            $this->addError(0, 'N/A', $error);
        }
        
        $this->update($updates);
    }

    /**
     * Increment processed rows counter
     */
    public function incrementProcessed($isSuccess = true)
    {
        $this->increment('processed_rows');
        
        if ($isSuccess) {
            $this->increment('success_count');
        } else {
            $this->increment('error_count');
        }
    }
}