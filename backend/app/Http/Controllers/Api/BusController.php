<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BusController extends Controller
{
    /**
     * Get all buses
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bus::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('bus_number', 'LIKE', "%{$search}%")
                  ->orWhere('bus_name', 'LIKE', "%{$search}%")
                  ->orWhere('driver_name', 'LIKE', "%{$search}%");
            });
        }

        $buses = $query->orderBy('bus_number')->get();

        // Add capacity info
        $buses = $buses->map(function ($bus) {
            return [
                'id' => $bus->id,
                'bus_number' => $bus->bus_number,
                'bus_name' => $bus->bus_name,
                'capacity' => $bus->capacity,
                'driver_name' => $bus->driver_name,
                'driver_phone' => $bus->driver_phone,
                'route_description' => $bus->route_description,
                'is_active' => $bus->is_active,
                'current_capacity' => $bus->getCurrentCapacity(),
                'remaining_capacity' => $bus->remaining_capacity,
                'capacity_percentage' => $bus->capacity_percentage,
                'has_available_capacity' => $bus->hasAvailableCapacity(),
                'created_at' => $bus->created_at,
                'updated_at' => $bus->updated_at,
            ];
        });

        return response()->json([
            'buses' => $buses
        ]);
    }

    /**
     * Get single bus
     */
    public function show(int $id): JsonResponse
    {
        $bus = Bus::with(['transportDetails.student'])->find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        return response()->json([
            'bus' => [
                'id' => $bus->id,
                'bus_number' => $bus->bus_number,
                'bus_name' => $bus->bus_name,
                'capacity' => $bus->capacity,
                'driver_name' => $bus->driver_name,
                'driver_phone' => $bus->driver_phone,
                'route_description' => $bus->route_description,
                'is_active' => $bus->is_active,
                'current_capacity' => $bus->getCurrentCapacity(),
                'remaining_capacity' => $bus->remaining_capacity,
                'capacity_percentage' => $bus->capacity_percentage,
                'assigned_students' => $bus->transportDetails->map(function ($detail) {
                    return [
                        'student_id' => $detail->student->id,
                        'admission_number' => $detail->student->admission_number,
                        'full_name' => $detail->student->full_name,
                        'grade_class' => $detail->student->grade_class,
                        'pickup_point' => $detail->pickup_point,
                        'dropoff_point' => $detail->dropoff_point,
                    ];
                }),
                'created_at' => $bus->created_at,
                'updated_at' => $bus->updated_at,
            ]
        ]);
    }

    /**
     * Create new bus
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_number' => 'required|string|max:50|unique:buses,bus_number',
            'bus_name' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1|max:100',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:20',
            'route_description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $bus = Bus::create($validated);

        return response()->json([
            'message' => 'Bus created successfully',
            'bus' => $bus
        ], 201);
    }

    /**
     * Update bus
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        $validated = $request->validate([
            'bus_number' => 'sometimes|string|max:50|unique:buses,bus_number,' . $id,
            'bus_name' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1|max:100',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:20',
            'route_description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $bus->update($validated);

        return response()->json([
            'message' => 'Bus updated successfully',
            'bus' => $bus
        ]);
    }

    /**
     * Delete bus
     */
    public function destroy(int $id): JsonResponse
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        // Check if bus has assigned students
        if ($bus->transportDetails()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete bus with assigned students. Please reassign students first.',
                'assigned_students_count' => $bus->transportDetails()->count()
            ], 422);
        }

        $bus->delete();

        return response()->json([
            'message' => 'Bus deleted successfully'
        ]);
    }

    /**
     * Get students assigned to bus
     */
    public function getStudents(int $id): JsonResponse
    {
        $bus = Bus::with(['transportDetails.student'])->find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        $students = $bus->transportDetails
            ->filter(function ($detail) {
                return $detail->student && $detail->student->is_active && $detail->student->transport_enabled;
            })
            ->map(function ($detail) {
                return [
                    'student_id' => $detail->student->id,
                    'admission_number' => $detail->student->admission_number,
                    'full_name' => $detail->student->full_name,
                    'grade_class' => $detail->student->grade_class,
                    'pickup_point' => $detail->pickup_point,
                    'dropoff_point' => $detail->dropoff_point,
                    'pickup_time' => $detail->pickup_time_formatted,
                    'dropoff_time' => $detail->dropoff_time_formatted,
                    'qr_code' => $detail->student->qr_code,
                ];
            })
            ->values();

        return response()->json([
            'bus' => [
                'id' => $bus->id,
                'bus_number' => $bus->bus_number,
                'bus_name' => $bus->bus_name,
            ],
            'students' => $students,
            'total_students' => $students->count(),
        ]);
    }

    /**
     * Get bus capacity info
     */
    public function getCapacity(int $id): JsonResponse
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        return response()->json([
            'bus_number' => $bus->bus_number,
            'capacity' => $bus->capacity,
            'current_capacity' => $bus->getCurrentCapacity(),
            'remaining_capacity' => $bus->remaining_capacity,
            'capacity_percentage' => $bus->capacity_percentage,
            'has_available_capacity' => $bus->hasAvailableCapacity(),
        ]);
    }

    /**
     * Get active buses only
     */
    public function getActiveBuses(): JsonResponse
    {
        $buses = Bus::active()
            ->orderBy('bus_number')
            ->get()
            ->map(function ($bus) {
                return [
                    'id' => $bus->id,
                    'bus_number' => $bus->bus_number,
                    'bus_name' => $bus->bus_name,
                    'capacity' => $bus->capacity,
                    'current_capacity' => $bus->getCurrentCapacity(),
                    'driver_name' => $bus->driver_name,
                ];
            });

        return response()->json([
            'buses' => $buses
        ]);
    }

    /**
     * Activate bus
     */
    public function activate(int $id): JsonResponse
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        $bus->update(['is_active' => true]);

        return response()->json([
            'message' => 'Bus activated successfully',
            'bus' => $bus
        ]);
    }

    /**
     * Deactivate bus
     */
    public function deactivate(int $id): JsonResponse
    {
        $bus = Bus::find($id);

        if (!$bus) {
            return response()->json([
                'message' => 'Bus not found'
            ], 404);
        }

        $bus->update(['is_active' => false]);

        return response()->json([
            'message' => 'Bus deactivated successfully',
            'bus' => $bus
        ]);
    }
}