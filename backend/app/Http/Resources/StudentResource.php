<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'admission_number' => $this->admission_number,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'grade_class' => $this->grade_class,
            'qr_code' => $this->qr_code,
            'is_active' => $this->is_active,
            
            // Guardian information
            'guardian' => [
                'name' => $this->guardian_name,
                'phone' => $this->guardian_phone,
                'email' => $this->guardian_email,
            ],
            
            // Services
            'transport_enabled' => $this->transport_enabled,
            'lunch_enabled' => $this->lunch_enabled,
            'active_services' => $this->active_services,
            
            // Transport details (if loaded)
            'transport_detail' => $this->when($this->relationLoaded('transportDetail'), function () {
                if ($this->transportDetail) {
                    return [
                        'bus_id' => $this->transportDetail->bus_id,
                        'bus_number' => $this->transportDetail->bus->bus_number ?? null,
                        'bus_name' => $this->transportDetail->bus->bus_name ?? null,
                        'pickup_point' => $this->transportDetail->pickup_point,
                        'dropoff_point' => $this->transportDetail->dropoff_point,
                        'pickup_time' => $this->transportDetail->pickup_time_formatted,
                        'dropoff_time' => $this->transportDetail->dropoff_time_formatted,
                        'route' => $this->transportDetail->route,
                        'notes' => $this->transportDetail->notes,
                        'is_active' => $this->transportDetail->is_active,
                    ];
                }
                return null;
            }),
            
            // Lunch details (if loaded)
            'lunch_detail' => $this->when($this->relationLoaded('lunchDetail'), function () {
                if ($this->lunchDetail) {
                    return [
                        'diet_type' => $this->lunchDetail->diet_type,
                        'diet_type_display' => $this->lunchDetail->diet_type_display,
                        'diet_notes' => $this->lunchDetail->diet_notes,
                        'diet_description' => $this->lunchDetail->diet_description,
                        'is_special_diet' => $this->lunchDetail->isSpecialDiet(),
                        'is_active' => $this->lunchDetail->is_active,
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