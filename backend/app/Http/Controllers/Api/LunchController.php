<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LunchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LunchController extends Controller
{
    public function __construct(
        private LunchService $lunchService
    ) {}

    /**
     * Scan QR code for lunch access
     */
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_code' => 'required|string',
        ]);

        $result = $this->lunchService->scanQRCode($validated['qr_code']);

        $statusCode = $result['success'] ? 200 : 422;

        return response()->json($result, $statusCode);
    }

    /**
     * Check if student has been served today
     */
    public function checkIfServedToday(int $studentId): JsonResponse
    {
        $hasBeenServed = $this->lunchService->hasBeenServedToday($studentId);

        return response()->json([
            'student_id' => $studentId,
            'date' => now()->toDateString(),
            'has_been_served' => $hasBeenServed,
        ]);
    }

    /**
     * Get lunch attendance records
     */
    public function getAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'student_id' => 'nullable|integer|exists:students,id',
            'diet_type' => 'nullable|in:normal,special',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $attendance = $this->lunchService->getAttendance($validated);

        return response()->json($attendance);
    }

    /**
     * Get today's lunch attendance
     */
    public function getTodayAttendance(): JsonResponse
    {
        $attendance = $this->lunchService->getTodayAttendance();

        return response()->json([
            'date' => now()->toDateString(),
            'attendance' => $attendance,
            'total_meals' => count($attendance),
        ]);
    }

    /**
     * Get lunch attendance summary
     */
    public function getAttendanceSummary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
        ]);

        $summary = $this->lunchService->getAttendanceSummary($validated['date'] ?? null);

        return response()->json($summary);
    }

    /**
     * Get missing students (not served yet)
     */
    public function getMissingStudents(): JsonResponse
    {
        $missing = $this->lunchService->getMissingStudents();

        return response()->json([
            'date' => now()->toDateString(),
            'missing_students' => $missing,
            'total_missing' => count($missing),
        ]);
    }

    /**
     * Get weekly statistics
     */
    public function getWeeklyStats(): JsonResponse
    {
        $stats = $this->lunchService->getWeeklyStats();

        return response()->json($stats);
    }

    /**
     * Get monthly statistics
     */
    public function getMonthlyStats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'nullable|date_format:Y-m',
        ]);

        $stats = $this->lunchService->getMonthlyStats($validated['month'] ?? null);

        return response()->json($stats);
    }

    /**
     * Get diet distribution
     */
    public function getDietDistribution(): JsonResponse
    {
        $distribution = $this->lunchService->getDietDistribution();

        return response()->json($distribution);
    }

    /**
     * Get student lunch history
     */
    public function getStudentHistory(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $history = $this->lunchService->getStudentHistory(
            $studentId,
            $validated['days'] ?? 30
        );

        return response()->json([
            'student_id' => $studentId,
            'days' => $validated['days'] ?? 30,
            'history' => $history,
            'total_meals' => count($history),
        ]);
    }

    /**
     * Get lunch statistics for dashboard
     */
    public function getLunchStatistics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $from = $validated['from'] ?? now()->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $query = \App\Models\LunchAttendance::whereBetween('meal_date', [$from, $to]);

        $total = $query->count();
        $normalMeals = $query->where('diet_type_served', 'normal')->count();
        $specialMeals = $query->where('diet_type_served', 'special')->count();
        $uniqueStudents = $query->distinct('student_id')->count('student_id');

        return response()->json([
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'statistics' => [
                'total_meals' => $total,
                'normal_meals' => $normalMeals,
                'special_meals' => $specialMeals,
                'unique_students' => $uniqueStudents,
                'normal_percentage' => $total > 0 ? round(($normalMeals / $total) * 100, 2) : 0,
                'special_percentage' => $total > 0 ? round(($specialMeals / $total) * 100, 2) : 0,
            ],
        ]);
    }

    /**
     * Get special diet students list
     */
    public function getSpecialDietStudents(): JsonResponse
    {
        $students = \App\Models\Student::with('lunchDetail')
            ->where('is_active', true)
            ->where('lunch_enabled', true)
            ->whereHas('lunchDetail', function ($query) {
                $query->where('diet_type', 'special')
                      ->where('is_active', true);
            })
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'diet_notes' => $student->lunchDetail->diet_notes,
                    'qr_code' => $student->qr_code,
                ];
            });

        return response()->json([
            'students' => $students,
            'total' => $students->count(),
        ]);
    }
}