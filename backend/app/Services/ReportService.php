<?php

namespace App\Services;

use App\Models\{Student, Bus, TransportAttendance, LunchAttendance, TransportDetail, LunchDetail};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): array
    {
        return [
            'students' => [
                'total' => Student::count(),
                'active' => Student::active()->count(),
                'inactive' => Student::inactive()->count(),
                'transport_enabled' => Student::transportEnabled()->count(),
                'lunch_enabled' => Student::lunchEnabled()->count(),
            ],
            'buses' => [
                'total' => Bus::count(),
                'active' => Bus::active()->count(),
            ],
            'today' => [
                'transport_scans' => TransportAttendance::whereDate('scanned_at', Carbon::today())->count(),
                'lunch_scans' => LunchAttendance::whereDate('meal_date', Carbon::today())->count(),
                'transport_valid' => TransportAttendance::whereDate('scanned_at', Carbon::today())->where('is_valid', true)->count(),
                'transport_invalid' => TransportAttendance::whereDate('scanned_at', Carbon::today())->where('is_valid', false)->count(),
            ],
            'this_week' => [
                'transport_scans' => TransportAttendance::whereBetween('scanned_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])->count(),
                'lunch_scans' => LunchAttendance::whereBetween('meal_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])->count(),
            ],
        ];
    }

    /**
     * Get transport attendance report
     */
    public function getTransportReport(array $filters = []): array
    {
        $from = $filters['from'] ?? Carbon::today()->toDateString();
        $to = $filters['to'] ?? Carbon::today()->toDateString();
        $busId = $filters['bus_id'] ?? null;

        $query = TransportAttendance::with(['student', 'bus'])
            ->whereBetween('scanned_at', [$from, $to]);

        if ($busId) {
            $query->where('bus_id', $busId);
        }

        $records = $query->get();

        $totalScans = $records->count();
        $validScans = $records->where('is_valid', true)->count();
        $invalidScans = $records->where('is_valid', false)->count();
        $morningPickups = $records->where('scan_type', 'morning_pickup')->where('is_valid', true)->count();
        $eveningDropoffs = $records->where('scan_type', 'evening_dropoff')->where('is_valid', true)->count();
        $uniqueStudents = $records->pluck('student_id')->unique()->count();

        // Attendance by bus
        $attendanceByBus = $records->groupBy('bus_id')->map(function ($group, $busId) {
            $bus = Bus::find($busId);
            return [
                'bus_number' => $bus ? $bus->bus_number : 'Unknown',
                'count' => $group->count(),
                'valid' => $group->where('is_valid', true)->count(),
                'invalid' => $group->where('is_valid', false)->count(),
            ];
        })->values()->toArray();

        // Daily breakdown
        $dailyBreakdown = $records->groupBy(function ($record) {
            return $record->scanned_at->toDateString();
        })->map(function ($group, $date) {
            return [
                'date' => $date,
                'total' => $group->count(),
                'valid' => $group->where('is_valid', true)->count(),
                'morning' => $group->where('scan_type', 'morning_pickup')->count(),
                'evening' => $group->where('scan_type', 'evening_dropoff')->count(),
            ];
        })->values()->toArray();

        return [
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'summary' => [
                'total_scans' => $totalScans,
                'valid_scans' => $validScans,
                'invalid_scans' => $invalidScans,
                'morning_pickups' => $morningPickups,
                'evening_dropoffs' => $eveningDropoffs,
                'unique_students' => $uniqueStudents,
            ],
            'attendance_by_bus' => $attendanceByBus,
            'daily_breakdown' => $dailyBreakdown,
        ];
    }

    /**
     * Get lunch consumption report
     */
    public function getLunchReport(array $filters = []): array
    {
        $from = $filters['from'] ?? Carbon::today()->toDateString();
        $to = $filters['to'] ?? Carbon::today()->toDateString();
        $dietType = $filters['diet_type'] ?? null;

        $query = LunchAttendance::with(['student'])
            ->whereBetween('meal_date', [$from, $to]);

        if ($dietType) {
            $query->where('diet_type_served', $dietType);
        }

        $records = $query->get();

        $totalMeals = $records->count();
        $normalMeals = $records->where('diet_type_served', 'normal')->count();
        $specialMeals = $records->where('diet_type_served', 'special')->count();
        $uniqueStudents = $records->pluck('student_id')->unique()->count();

        // Meals by grade
        $mealsByGrade = $records->groupBy(function ($record) {
            return $record->student->grade_class;
        })->map(function ($group, $grade) {
            return [
                'grade' => $grade,
                'count' => $group->count(),
                'normal' => $group->where('diet_type_served', 'normal')->count(),
                'special' => $group->where('diet_type_served', 'special')->count(),
            ];
        })->values()->toArray();

        // Daily breakdown
        $dailyBreakdown = $records->groupBy(function ($record) {
            return $record->meal_date->toDateString();
        })->map(function ($group, $date) {
            return [
                'date' => $date,
                'total' => $group->count(),
                'normal' => $group->where('diet_type_served', 'normal')->count(),
                'special' => $group->where('diet_type_served', 'special')->count(),
            ];
        })->values()->toArray();

        return [
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'summary' => [
                'total_meals' => $totalMeals,
                'normal_meals' => $normalMeals,
                'special_meals' => $specialMeals,
                'unique_students' => $uniqueStudents,
            ],
            'meals_by_grade' => $mealsByGrade,
            'daily_breakdown' => $dailyBreakdown,
        ];
    }

    /**
     * Get attendance summary report (combined transport and lunch)
     */
    public function getAttendanceSummary(array $filters = []): array
    {
        $from = $filters['from'] ?? Carbon::today()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? Carbon::today()->endOfMonth()->toDateString();

        // Transport stats
        $transportTotal = TransportAttendance::whereBetween('scanned_at', [$from, $to])->count();
        $transportValid = TransportAttendance::whereBetween('scanned_at', [$from, $to])
            ->where('is_valid', true)
            ->count();

        // Lunch stats
        $lunchTotal = LunchAttendance::whereBetween('meal_date', [$from, $to])->count();

        // Student participation
        $transportStudents = TransportAttendance::whereBetween('scanned_at', [$from, $to])
            ->where('is_valid', true)
            ->distinct('student_id')
            ->count('student_id');

        $lunchStudents = LunchAttendance::whereBetween('meal_date', [$from, $to])
            ->distinct('student_id')
            ->count('student_id');

        return [
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'transport' => [
                'total_scans' => $transportTotal,
                'valid_scans' => $transportValid,
                'unique_students' => $transportStudents,
            ],
            'lunch' => [
                'total_meals' => $lunchTotal,
                'unique_students' => $lunchStudents,
            ],
        ];
    }

    /**
     * Get bus usage report
     */
    public function getBusUsageReport(): array
    {
        $buses = Bus::active()->get();

        $busUsage = $buses->map(function ($bus) {
            $assignedStudents = TransportDetail::where('bus_id', $bus->id)
                ->where('is_active', true)
                ->whereHas('student', function ($query) {
                    $query->where('is_active', true)
                          ->where('transport_enabled', true);
                })
                ->count();

            $todayScans = TransportAttendance::where('bus_id', $bus->id)
                ->whereDate('scanned_at', Carbon::today())
                ->where('is_valid', true)
                ->count();

            $thisWeekScans = TransportAttendance::where('bus_id', $bus->id)
                ->whereBetween('scanned_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])
                ->where('is_valid', true)
                ->count();

            $capacityUsage = $bus->capacity 
                ? round(($assignedStudents / $bus->capacity) * 100, 2)
                : 0;

            return [
                'bus_number' => $bus->bus_number,
                'bus_name' => $bus->bus_name,
                'capacity' => $bus->capacity,
                'assigned_students' => $assignedStudents,
                'capacity_usage' => $capacityUsage,
                'today_scans' => $todayScans,
                'this_week_scans' => $thisWeekScans,
                'driver' => $bus->driver_name,
            ];
        })->toArray();

        return [
            'total_buses' => $buses->count(),
            'bus_usage' => $busUsage,
        ];
    }

    /**
     * Get diet distribution report
     */
    public function getDietDistributionReport(): array
    {
        $totalStudents = Student::where('is_active', true)
            ->where('lunch_enabled', true)
            ->count();

        $normalDiet = LunchDetail::where('diet_type', 'normal')
            ->where('is_active', true)
            ->whereHas('student', function ($query) {
                $query->where('is_active', true)
                      ->where('lunch_enabled', true);
            })
            ->count();

        $specialDiet = LunchDetail::where('diet_type', 'special')
            ->where('is_active', true)
            ->whereHas('student', function ($query) {
                $query->where('is_active', true)
                      ->where('lunch_enabled', true);
            })
            ->count();

        // Special diet students with notes
        $specialDietStudents = Student::with('lunchDetail')
            ->where('is_active', true)
            ->where('lunch_enabled', true)
            ->whereHas('lunchDetail', function ($query) {
                $query->where('diet_type', 'special')
                      ->where('is_active', true);
            })
            ->get()
            ->map(function ($student) {
                return [
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'grade_class' => $student->grade_class,
                    'diet_notes' => $student->lunchDetail->diet_notes,
                ];
            })
            ->toArray();

        return [
            'total_students' => $totalStudents,
            'normal_diet' => $normalDiet,
            'special_diet' => $specialDiet,
            'normal_percentage' => $totalStudents > 0 ? round(($normalDiet / $totalStudents) * 100, 2) : 0,
            'special_percentage' => $totalStudents > 0 ? round(($specialDiet / $totalStudents) * 100, 2) : 0,
            'special_diet_students' => $specialDietStudents,
        ];
    }

    /**
     * Get student activity report
     */
    public function getStudentActivityReport(int $studentId, array $filters = []): array
    {
        $from = $filters['from'] ?? Carbon::now()->subDays(30)->toDateString();
        $to = $filters['to'] ?? Carbon::today()->toDateString();

        $student = Student::with(['transportDetail.bus', 'lunchDetail'])->findOrFail($studentId);

        // Transport activity
        $transportScans = TransportAttendance::where('student_id', $studentId)
            ->whereBetween('scanned_at', [$from, $to])
            ->get();

        // Lunch activity
        $lunchScans = LunchAttendance::where('student_id', $studentId)
            ->whereBetween('meal_date', [$from, $to])
            ->get();

        return [
            'student' => [
                'admission_number' => $student->admission_number,
                'full_name' => $student->full_name,
                'grade_class' => $student->grade_class,
                'transport_enabled' => $student->transport_enabled,
                'lunch_enabled' => $student->lunch_enabled,
            ],
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'transport' => [
                'total_scans' => $transportScans->count(),
                'valid_scans' => $transportScans->where('is_valid', true)->count(),
                'morning_pickups' => $transportScans->where('scan_type', 'morning_pickup')->count(),
                'evening_dropoffs' => $transportScans->where('scan_type', 'evening_dropoff')->count(),
                'recent_scans' => $transportScans->take(10)->map(function ($scan) {
                    return [
                        'date' => $scan->scanned_at->toDateString(),
                        'time' => $scan->scanned_at->format('H:i:s'),
                        'type' => $scan->scan_type,
                        'valid' => $scan->is_valid,
                    ];
                })->toArray(),
            ],
            'lunch' => [
                'total_meals' => $lunchScans->count(),
                'recent_meals' => $lunchScans->take(10)->map(function ($scan) {
                    return [
                        'date' => $scan->meal_date->toDateString(),
                        'time' => $scan->scanned_at->format('H:i:s'),
                        'diet_type' => $scan->diet_type_served,
                    ];
                })->toArray(),
            ],
        ];
    }

    /**
     * Get monthly comparison report
     */
    public function getMonthlyComparison(int $months = 6): array
    {
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $transportScans = TransportAttendance::whereBetween('scanned_at', [$startOfMonth, $endOfMonth])
                ->where('is_valid', true)
                ->count();

            $lunchMeals = LunchAttendance::whereBetween('meal_date', [$startOfMonth, $endOfMonth])
                ->count();

            $data[] = [
                'month' => $date->format('M Y'),
                'transport_scans' => $transportScans,
                'lunch_meals' => $lunchMeals,
            ];
        }

        return [
            'months' => $months,
            'data' => $data,
        ];
    }
}