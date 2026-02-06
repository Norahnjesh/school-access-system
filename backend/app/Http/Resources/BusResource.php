<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bus_number' => $this->bus_number,
            'bus_name' => $this->bus_name,
            'capacity' => $this->capacity,
            'is_active' => $this->is_active,
            
            // Driver information
            'driver' => [
                'name' => $this->driver_name,
                'phone' => $this->driver_phone,
            ],
            
            // Route information
            'route_description' => $this->route_description,
            
            // Capacity information
            'capacity_info' => [
                'total' => $this->capacity,
                'current' => $this->getCurrentCapacity(),
                'remaining' => $this->remaining_capacity,
                'percentage' => $this->capacity_percentage,
                'has_available' => $this->hasAvailableCapacity(),
            ],
            
            // Assigned students count
            'assigned_students_count' => $this->transportDetails()->count(),
            
            // Timestamps
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}