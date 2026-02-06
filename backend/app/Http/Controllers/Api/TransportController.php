<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TransportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransportController extends Controller
{
    public function __construct(
        private TransportService $transportService
    ) {}

    /**
     * Scan QR code for transport access
     */
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_code' => 'required|string',
            'bus_id' => 'required|integer|exists:buses,id',
            'scan_type' => 'required|in:morning_pickup,evening_dropoff',
        ]);

        $result = $this->transportService->scanQRCode(
            $validated['qr_code'],
            $validated['bus_id'],
            $validated['scan_type']
        );

        $statusCode = $result['success'] ? 200 : ($result['alert'] ?? false ? 403 : 422);

        return response()->json($result, $statusCode);
    }

    /**
     * Get daily student list for offline caching
     */
    public function getDailyStudentList(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_id' => 'required|integer|exists:buses,id',
            'date' => 'nullable|date',
        ]);

        $students = $this->transportService->getDailyStudentList(
            $validated['bus_id'],
            $validated['date'] ?? null
        );

        return response()->json([
            'bus_id' => $validated['bus_id'],
            'date' => $validated['date'] ?? now()->toDateString(),
            'students' => $students,
            'total_students' => count($students),
            'cache_expires_at' => now()->endOfDay()->toIso8601String(),
        ]);
    }

    /**
     * Get transport attendance records
     */
    public function getAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'bus_id' => 'nullable|integer|exists:buses,id',
            'student_id' => 'nullable|integer|exists:students,id',
            'scan_type' => 'nullable|in:morning_pickup,evening_dropoff',
            'is_valid' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $attendance = $this->transportService->getAttendance($validated);

        return response()->json($attendance);
    }

    /**
     * Get today's attendance for a bus
     */
    public function getTodayAttendance(int $busId): JsonResponse
    {
        $attendance = $this->transportService->getTodayAttendance($busId);

        return response()->json([
            'bus_id' => $busId,
            'date' => now()->toDateString(),
            'attendance' => $attendance,
            'total_scans' => count($attendance),
        ]);
    }

    /**
     * Get attendance summary
     */
    public function getAttendanceSummary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_id' => 'required|integer|exists:buses,id',
            'date' => 'nullable|date',
        ]);

        $summary = $this->transportService->getAttendanceSummary(
            $validated['bus_id'],
            $validated['date'] ?? null
        );

        return response()->json($summary);
    }

    /**
     * Get missing students (not scanned yet)
     */
    public function getMissingStudents(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_id' => 'required|integer|exists:buses,id',
            'scan_type' => 'required|in:morning_pickup,evening_dropoff',
        ]);

        $missing = $this->transportService->getMissingStudents(
            $validated['bus_id'],
            $validated['scan_type']
        );

        return response()->json([
            'bus_id' => $validated['bus_id'],
            'scan_type' => $validated['scan_type'],
            'date' => now()->toDateString(),
            'missing_students' => $missing,
            'total_missing' => count($missing),
        ]);
    }

    /**
     * Get alerts (invalid scans)
     */
    public function getAlerts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'bus_id' => 'nullable|integer|exists:buses,id',
        ]);

        $alerts = $this->transportService->getAlerts($validated);

        return response()->json([
            'alerts' => $alerts,
            'total_alerts' => count($alerts),
        ]);
    }

    /**
     * Get scan statistics for dashboard
     */
    public function getScanStatistics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_id' => 'nullable|integer|exists:buses,id',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $from = $validated['from'] ?? now()->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $query = \App\Models\TransportAttendance::whereBetween('scanned_at', [$from, $to]);

        if (isset($validated['bus_id'])) {
            $query->where('bus_id', $validated['bus_id']);
        }

        $total = $query->count();
        $valid = $query->where('is_valid', true)->count();
        $invalid = $query->where('is_valid', false)->count();
        $morningPickups = $query->where('scan_type', 'morning_pickup')->where('is_valid', true)->count();
        $eveningDropoffs = $query->where('scan_type', 'evening_dropoff')->where('is_valid', true)->count();

        return response()->json([
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'statistics' => [
                'total_scans' => $total,
                'valid_scans' => $valid,
                'invalid_scans' => $invalid,
                'morning_pickups' => $morningPickups,
                'evening_dropoffs' => $eveningDropoffs,
                'success_rate' => $total > 0 ? round(($valid / $total) * 100, 2) : 0,
            ],
        ]);
    }
}