<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LunchAttendanceResource extends JsonResource
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
            
            // Meal information
            'meal_date' => $this->meal_date->toDateString(),
            'diet_type_served' => $this->diet_type_served,
            'diet_type_display' => ucfirst($this->diet_type_served),
            
            // Scan information
            'scanned_at' => $this->scanned_at->toIso8601String(),
            'scan_time' => $this->scanned_at->format('H:i:s'),
            
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