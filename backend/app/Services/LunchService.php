<?php

namespace App\Services;

use App\Models\{Student, LunchAttendance, LunchDetail};
use Carbon\Carbon;
use Illuminate\Support\Facades\{DB, Auth};

class LunchService
{
    /**
     * Scan QR code for lunch access
     */
    public function scanQRCode(string $qrCode): array
    {
        // Find active student with lunch enabled
        $student = Student::with('lunchDetail')
            ->where('qr_code', $qrCode)
            ->where('is_active', true)
            ->where('lunch_enabled', true)
            ->first();

        if (!$student) {
            return [
                'success' => false,
                'message' => 'Student not found or lunch service not enabled',
            ];
        }

        // Check if lunch details exist
        if (!$student->lunchDetail) {
            return [
                'success' => false,
                'message' => 'Lunch details not configured for this student',
            ];
        }

        // Check if already served today
        $today = Carbon::today();
        $alreadyServed = LunchAttendance::where('student_id', $student->id)
            ->whereDate('meal_date', $today)
            ->exists();

        if ($alreadyServed) {
            $previousScan = LunchAttendance::where('student_id', $student->id)
                ->whereDate('meal_date', $today)
                ->first();

            return [
                'success' => false,
                'message' => '⚠️ Already served today!',
                'already_served_today' => true,
                'student' => [
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'diet_type' => $student->lunchDetail->diet_type,
                ],
                'served_at' => $previousScan->scanned_at->format('H:i:s'),
            ];
        }

        // Get authenticated user ID safely
        $scannedBy = Auth::check() ? Auth::id() : null;

        // Log lunch attendance
        LunchAttendance::create([
            'student_id' => $student->id,
            'meal_date' => $today,
            'scanned_by' => $scannedBy,
            'diet_type_served' => $student->lunchDetail->diet_type,
        ]);

        return [
            'success' => true,
            'student' => [
                'admission_number' => $student->admission_number,
                'full_name' => $student->full_name,
                'grade_class' => $student->grade_class,
                'diet_type' => $student->lunchDetail->diet_type,
                'diet_notes' => $student->lunchDetail->diet_notes,
            ],
            'message' => '✅ Meal Authorized',
            'already_served_today' => false,
        ];
    }

    /**
     * Check if student has been served today
     */
    public function hasBeenServedToday(int $studentId): bool
    {
        return LunchAttendance::where('student_id', $studentId)
            ->whereDate('meal_date', Carbon::today())
            ->exists();
    }

    /**
     * Get attendance records with filters
     */
    public function getAttendance(array $filters = []): array
    {
        $query = LunchAttendance::with(['student', 'scannedBy']);

        // Date range filter
        if (isset($filters['from'])) {
            $query->whereDate('meal_date', '>=', $filters['from']);
        }

        if (isset($filters['to'])) {
            $query->whereDate('meal_date', '<=', $filters['to']);
        }

        // Student filter
        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        // Diet type filter
        if (isset($filters['diet_type'])) {
            $query->where('diet_type_served', $filters['diet_type']);
        }

        return $query->orderBy('scanned_at', 'desc')
                     ->paginate($filters['per_page'] ?? 50)
                     ->toArray();
    }

    /**
     * Get today's attendance
     */
    public function getTodayAttendance(): array
    {
        return LunchAttendance::with(['student'])
            ->whereDate('meal_date', Carbon::today())
            ->orderBy('scanned_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get attendance summary for a date
     */
    public function getAttendanceSummary(?string $date = null): array
    {
        $date = $date ?? Carbon::today()->toDateString();

        $total = LunchAttendance::whereDate('meal_date', $date)->count();

        $normalMeals = LunchAttendance::whereDate('meal_date', $date)
            ->where('diet_type_served', 'normal')
            ->count();

        $specialMeals = LunchAttendance::whereDate('meal_date', $date)
            ->where('diet_type_served', 'special')
            ->count();

        $uniqueStudents = LunchAttendance::whereDate('meal_date', $date)
            ->distinct('student_id')
            ->count('student_id');

        $expectedCount = Student::where('is_active', true)
            ->where('lunch_enabled', true)
            ->count();

        // Get meals by grade
        $mealsByGrade = LunchAttendance::with('student')
            ->whereDate('meal_date', $date)
            ->get()
            ->groupBy(function ($attendance) {
                return $attendance->student->grade_class;
            })
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();

        return [
            'date' => $date,
            'total_meals' => $total,
            'normal_meals' => $normalMeals,
            'special_meals' => $specialMeals,
            'unique_students' => $uniqueStudents,
            'expected_students' => $expectedCount,
            'attendance_rate' => $expectedCount > 0 ? round(($uniqueStudents / $expectedCount) * 100, 2) : 0,
            'meals_by_grade' => $mealsByGrade,
        ];
    }

    /**
     * Get students who haven't had lunch yet today
     */
    public function getMissingStudents(): array
    {
        $today = Carbon::today();

        // Get all students with lunch enabled
        $lunchStudents = Student::where('is_active', true)
            ->where('lunch_enabled', true)
            ->pluck('id')
            ->toArray();

        // Get students who have had lunch today
        $servedStudents = LunchAttendance::whereDate('meal_date', $today)
            ->pluck('student_id')
            ->toArray();

        // Find missing students
        $missingStudentIds = array_diff($lunchStudents, $servedStudents);

        return Student::with('lunchDetail')
            ->whereIn('id', $missingStudentIds)
            ->get()
            ->map(function ($student) {
                return [
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'diet_type' => $student->lunchDetail->diet_type ?? 'normal',
                ];
            })
            ->toArray();
    }

    /**
     * Get weekly attendance statistics
     */
    public function getWeeklyStats(): array
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $dailyStats = [];
        $currentDate = $startOfWeek->copy();

        while ($currentDate <= $endOfWeek) {
            $dateStr = $currentDate->toDateString();
            
            $total = LunchAttendance::whereDate('meal_date', $dateStr)->count();
            $normal = LunchAttendance::whereDate('meal_date', $dateStr)
                ->where('diet_type_served', 'normal')
                ->count();
            $special = LunchAttendance::whereDate('meal_date', $dateStr)
                ->where('diet_type_served', 'special')
                ->count();

            $dailyStats[] = [
                'date' => $dateStr,
                'day' => $currentDate->format('l'),
                'total' => $total,
                'normal' => $normal,
                'special' => $special,
            ];

            $currentDate->addDay();
        }

        return [
            'week_start' => $startOfWeek->toDateString(),
            'week_end' => $endOfWeek->toDateString(),
            'daily_stats' => $dailyStats,
            'weekly_total' => array_sum(array_column($dailyStats, 'total')),
        ];
    }

    /**
     * Get monthly attendance statistics
     */
    public function getMonthlyStats(?string $month = null): array
    {
        $date = $month ? Carbon::parse($month) : Carbon::now();
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        $total = LunchAttendance::whereBetween('meal_date', [$startOfMonth, $endOfMonth])->count();

        $normalMeals = LunchAttendance::whereBetween('meal_date', [$startOfMonth, $endOfMonth])
            ->where('diet_type_served', 'normal')
            ->count();

        $specialMeals = LunchAttendance::whereBetween('meal_date', [$startOfMonth, $endOfMonth])
            ->where('diet_type_served', 'special')
            ->count();

        $uniqueStudents = LunchAttendance::whereBetween('meal_date', [$startOfMonth, $endOfMonth])
            ->distinct('student_id')
            ->count('student_id');

        $averagePerDay = $total > 0 ? round($total / $date->daysInMonth, 2) : 0;

        return [
            'month' => $date->format('F Y'),
            'start_date' => $startOfMonth->toDateString(),
            'end_date' => $endOfMonth->toDateString(),
            'total_meals' => $total,
            'normal_meals' => $normalMeals,
            'special_meals' => $specialMeals,
            'unique_students' => $uniqueStudents,
            'average_per_day' => $averagePerDay,
        ];
    }

    /**
     * Get diet distribution statistics
     */
    public function getDietDistribution(): array
    {
        $normalDiet = LunchDetail::where('diet_type', 'normal')
            ->where('is_active', true)
            ->count();

        $specialDiet = LunchDetail::where('diet_type', 'special')
            ->where('is_active', true)
            ->count();

        $totalActive = Student::where('is_active', true)
            ->where('lunch_enabled', true)
            ->count();

        return [
            'normal_diet' => $normalDiet,
            'special_diet' => $specialDiet,
            'total_active' => $totalActive,
            'normal_percentage' => $totalActive > 0 ? round(($normalDiet / $totalActive) * 100, 2) : 0,
            'special_percentage' => $totalActive > 0 ? round(($specialDiet / $totalActive) * 100, 2) : 0,
        ];
    }

    /**
     * Get student lunch history
     */
    public function getStudentHistory(int $studentId, int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);

        return LunchAttendance::where('student_id', $studentId)
            ->whereDate('meal_date', '>=', $startDate)
            ->orderBy('meal_date', 'desc')
            ->get()
            ->map(function ($attendance) {
                return [
                    'date' => $attendance->meal_date->toDateString(),
                    'scanned_at' => $attendance->scanned_at->format('H:i:s'),
                    'diet_type' => $attendance->diet_type_served,
                ];
            })
            ->toArray();
    }
}