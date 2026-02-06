<?php

namespace App\Services;

use App\Models\{Student, Bus, TransportAttendance, TransportDetail};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // ✅ ADDED

class TransportService
{
    /**
     * Scan QR code for transport access
     */
    public function scanQRCode(string $qrCode, int $busId, string $scanType): array
    {
        // Find active student with transport enabled
        $student = Student::with(['transportDetail.bus'])
            ->where('qr_code', $qrCode)
            ->where('is_active', true)
            ->where('transport_enabled', true)
            ->first();

        if (!$student) {
            return [
                'success' => false,
                'message' => 'Student not found or transport service not enabled',
                'alert' => true,
            ];
        }

        // Check if transport details exist
        if (!$student->transportDetail) {
            return [
                'success' => false,
                'message' => 'Transport details not configured for this student',
                'alert' => true,
            ];
        }

        $allocatedBusId = $student->transportDetail->bus_id;
        $allocatedBus = $student->transportDetail->bus;

        // Wrong bus validation
        if ($allocatedBusId !== $busId) {
            // Log invalid attempt
            $this->logAttendance(
                $student->id,
                $busId,
                $scanType,
                false,
                "Wrong bus - allocated to {$allocatedBus->bus_number}"
            );

            return [
                'success' => false,
                'alert' => true,
                'student' => [
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'allocated_bus' => $allocatedBus->bus_number,
                ],
                'message' => "⚠️ WRONG BUS! Student allocated to {$allocatedBus->bus_number}",
                'current_bus' => $allocatedBus->bus_number,
            ];
        }

        // Check for duplicate scan (already scanned in last 2 hours)
        $recentScan = TransportAttendance::where('student_id', $student->id)
            ->where('scan_type', $scanType)
            ->where('scanned_at', '>', Carbon::now()->subHours(2))
            ->first();

        if ($recentScan) {
            return [
                'success' => false,
                'alert' => false,
                'student' => [
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                ],
                'message' => '⚠️ Already scanned recently',
                'scanned_at' => $recentScan->scanned_at->format('H:i:s'),
            ];
        }

        // Valid scan - log attendance
        $this->logAttendance($student->id, $busId, $scanType, true);

        return [
            'success' => true,
            'student' => [
                'admission_number' => $student->admission_number,
                'full_name' => $student->full_name,
                'grade_class' => $student->grade_class,
                'allocated_bus' => $allocatedBus->bus_number,
                'pickup_point' => $student->transportDetail->pickup_point,
                'dropoff_point' => $student->transportDetail->dropoff_point,
            ],
            'message' => '✅ ACCESS GRANTED',
        ];
    }

    /**
     * Log transport attendance
     */
    private function logAttendance(
        int $studentId,
        int $busId,
        string $scanType,
        bool $isValid,
        ?string $alertMessage = null
    ): void {
        TransportAttendance::create([
            'student_id' => $studentId,
            'bus_id' => $busId,
            'scan_type' => $scanType,
            // ✅ FIXED — SAME LOGIC, NO REMOVAL
            'scanned_by' => Auth::check() ? Auth::id() : null,
            'is_valid' => $isValid,
            'alert_message' => $alertMessage,
            'scanned_at' => now(),
        ]);
    }

    /**
     * Get daily student list for a bus (for offline caching)
     */
    public function getDailyStudentList(int $busId, ?string $date = null): array
    {
        $date = $date ?? Carbon::today()->toDateString();

        $students = Student::with('transportDetail')
            ->where('is_active', true)
            ->where('transport_enabled', true)
            ->whereHas('transportDetail', function ($query) use ($busId) {
                $query->where('bus_id', $busId)
                      ->where('is_active', true);
            })
            ->get()
            ->map(function ($student) {
                return [
                    'qr_code' => $student->qr_code,
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'pickup_point' => $student->transportDetail->pickup_point,
                    'dropoff_point' => $student->transportDetail->dropoff_point,
                    'pickup_time' => $student->transportDetail->pickup_time_formatted,
                    'dropoff_time' => $student->transportDetail->dropoff_time_formatted,
                ];
            })
            ->toArray();

        return $students;
    }

    /**
     * Get attendance records with filters
     */
    public function getAttendance(array $filters = []): array
    {
        $query = TransportAttendance::with(['student', 'bus', 'scannedBy']);

        if (isset($filters['from'])) {
            $query->whereDate('scanned_at', '>=', $filters['from']);
        }

        if (isset($filters['to'])) {
            $query->whereDate('scanned_at', '<=', $filters['to']);
        }

        if (isset($filters['bus_id'])) {
            $query->where('bus_id', $filters['bus_id']);
        }

        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        if (isset($filters['scan_type'])) {
            $query->where('scan_type', $filters['scan_type']);
        }

        if (isset($filters['is_valid'])) {
            $query->where('is_valid', filter_var($filters['is_valid'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('scanned_at', 'desc')
                     ->paginate($filters['per_page'] ?? 50)
                     ->toArray();
    }

    /**
     * Get today's attendance for a bus
     */
    public function getTodayAttendance(int $busId): array
    {
        return TransportAttendance::with(['student'])
            ->where('bus_id', $busId)
            ->whereDate('scanned_at', Carbon::today())
            ->orderBy('scanned_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get attendance summary for a date
     */
    public function getAttendanceSummary(int $busId, ?string $date = null): array
    {
        $date = $date ?? Carbon::today()->toDateString();

        $total = TransportAttendance::where('bus_id', $busId)
            ->whereDate('scanned_at', $date)
            ->count();

        $valid = TransportAttendance::where('bus_id', $busId)
            ->whereDate('scanned_at', $date)
            ->where('is_valid', true)
            ->count();

        $invalid = TransportAttendance::where('bus_id', $busId)
            ->whereDate('scanned_at', $date)
            ->where('is_valid', false)
            ->count();

        $morningPickups = TransportAttendance::where('bus_id', $busId)
            ->whereDate('scanned_at', $date)
            ->where('scan_type', 'morning_pickup')
            ->where('is_valid', true)
            ->count();

        $eveningDropoffs = TransportAttendance::where('bus_id', $busId)
            ->whereDate('scanned_at', $date)
            ->where('scan_type', 'evening_dropoff')
            ->where('is_valid', true)
            ->count();

        $expectedCount = TransportDetail::where('bus_id', $busId)
            ->where('is_active', true)
            ->whereHas('student', function ($query) {
                $query->where('is_active', true)
                      ->where('transport_enabled', true);
            })
            ->count();

        return [
            'date' => $date,
            'bus_id' => $busId,
            'total_scans' => $total,
            'valid_scans' => $valid,
            'invalid_scans' => $invalid,
            'morning_pickups' => $morningPickups,
            'evening_dropoffs' => $eveningDropoffs,
            'expected_students' => $expectedCount,
            'attendance_rate' => $expectedCount > 0
                ? round(($morningPickups / $expectedCount) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get students who haven't been scanned yet today
     */
    public function getMissingStudents(int $busId, string $scanType): array
    {
        $today = Carbon::today();

        $assignedStudents = Student::where('is_active', true)
            ->where('transport_enabled', true)
            ->whereHas('transportDetail', function ($query) use ($busId) {
                $query->where('bus_id', $busId)
                      ->where('is_active', true);
            })
            ->pluck('id')
            ->toArray();

        $scannedStudents = TransportAttendance::where('bus_id', $busId)
            ->whereDate('scanned_at', $today)
            ->where('scan_type', $scanType)
            ->where('is_valid', true)
            ->pluck('student_id')
            ->toArray();

        $missingStudentIds = array_diff($assignedStudents, $scannedStudents);

        return Student::with('transportDetail')
            ->whereIn('id', $missingStudentIds)
            ->get()
            ->map(function ($student) {
                return [
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'pickup_point' => $student->transportDetail->pickup_point,
                ];
            })
            ->toArray();
    }

    /**
     * Get alert/invalid scans for a date range
     */
    public function getAlerts(array $filters = []): array
    {
        $query = TransportAttendance::with(['student', 'bus'])
            ->where('is_valid', false);

        if (isset($filters['from'])) {
            $query->whereDate('scanned_at', '>=', $filters['from']);
        }

        if (isset($filters['to'])) {
            $query->whereDate('scanned_at', '<=', $filters['to']);
        }

        if (isset($filters['bus_id'])) {
            $query->where('bus_id', $filters['bus_id']);
        }

        return $query->orderBy('scanned_at', 'desc')
                     ->get()
                     ->toArray();
    }
}
