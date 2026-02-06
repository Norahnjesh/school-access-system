<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransportAttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            
            // Student information
            'student' => $this->when($this->relationLoaded('student'), function () {
                return [
                    'id' => $this->student->id,
                    'admission_number' => $this->student->admission_number,
                    'full_name' => $this->student->full_name,
                    'grade_class' => $this->student->grade_class,
                    'qr_code' => $this->student->qr_code,
                ];
            }),
            
            // Bus information
            'bus' => $this->when($this->relationLoaded('bus'), function () {
                return [
                    'id' => $this->bus->id,
                    'bus_number' => $this->bus->bus_number,
                    'bus_name' => $this->bus->bus_name,
                ];
            }),
            
            // Scan information
            'scan_type' => $this->scan_type,
            'scan_type_display' => $this->scan_type_display,
            'scanned_at' => $this->scanned_at->toIso8601String(),
            'scan_time' => $this->scan_time,
            'scan_date' => $this->scan_date,
            
            // Validation
            'is_valid' => $this->is_valid,
            'alert_message' => $this->alert_message,
            'status' => $this->status_text,
            'status_color' => $this->status_color,
            
            // Scanned by
            'scanned_by' => $this->when($this->relationLoaded('scannedBy'), function () {
                if ($this->scannedBy) {
                    return [
                        'id' => $this->scannedBy->id,
                        'name' => $this->scannedBy->name,
                        'role' => $this->scannedBy->role,
                    ];
                }
                return null;
            }),
            
            // Timestamps
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}