<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    /**
     * Get dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        $stats = $this->reportService->getDashboardStats();

        return response()->json($stats);
    }

    /**
     * Get transport attendance report
     */
    public function transport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'bus_id' => 'nullable|integer|exists:buses,id',
        ]);

        $report = $this->reportService->getTransportReport($validated);

        return response()->json($report);
    }

    /**
     * Get lunch consumption report
     */
    public function lunch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'diet_type' => 'nullable|in:normal,special',
        ]);

        $report = $this->reportService->getLunchReport($validated);

        return response()->json($report);
    }

    /**
     * Get attendance summary (combined transport and lunch)
     */
    public function attendanceSummary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $summary = $this->reportService->getAttendanceSummary($validated);

        return response()->json($summary);
    }

    /**
     * Get bus usage report
     */
    public function busUsage(): JsonResponse
    {
        $report = $this->reportService->getBusUsageReport();

        return response()->json($report);
    }

    /**
     * Get diet distribution report
     */
    public function dietDistribution(): JsonResponse
    {
        $report = $this->reportService->getDietDistributionReport();

        return response()->json($report);
    }

    /**
     * Get student activity report
     */
    public function studentActivity(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $report = $this->reportService->getStudentActivityReport($studentId, $validated);

        return response()->json($report);
    }

    /**
     * Get monthly comparison report
     */
    public function monthlyComparison(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'months' => 'nullable|integer|min:1|max:12',
        ]);

        $report = $this->reportService->getMonthlyComparison($validated['months'] ?? 6);

        return response()->json($report);
    }

    /**
     * Export transport report (future feature)
     */
    public function exportTransport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
            'bus_id' => 'nullable|integer|exists:buses,id',
            'format' => 'nullable|in:pdf,excel',
        ]);

        // TODO: Implement export functionality
        return response()->json([
            'message' => 'Export feature coming soon',
            'requested_format' => $validated['format'] ?? 'excel',
        ]);
    }

    /**
     * Export lunch report (future feature)
     */
    public function exportLunch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
            'diet_type' => 'nullable|in:normal,special',
            'format' => 'nullable|in:pdf,excel',
        ]);

        // TODO: Implement export functionality
        return response()->json([
            'message' => 'Export feature coming soon',
            'requested_format' => $validated['format'] ?? 'excel',
        ]);
    }

    /**
     * Get real-time dashboard data (for live updates)
     */
    public function realtimeStats(): JsonResponse
    {
        $transportToday = \App\Models\TransportAttendance::whereDate('scanned_at', today())->count();
        $lunchToday = \App\Models\LunchAttendance::whereDate('meal_date', today())->count();
        
        $transportLastHour = \App\Models\TransportAttendance::where('scanned_at', '>=', now()->subHour())->count();
        $lunchLastHour = \App\Models\LunchAttendance::where('scanned_at', '>=', now()->subHour())->count();

        return response()->json([
            'timestamp' => now()->toIso8601String(),
            'today' => [
                'transport_scans' => $transportToday,
                'lunch_scans' => $lunchToday,
            ],
            'last_hour' => [
                'transport_scans' => $transportLastHour,
                'lunch_scans' => $lunchLastHour,
            ],
        ]);
    }

    /**
     * Get grade-wise statistics
     */
    public function gradeStatistics(): JsonResponse
    {
        $grades = \App\Models\Student::select('grade_class')
            ->distinct()
            ->orderBy('grade_class')
            ->pluck('grade_class');

        $stats = $grades->map(function ($grade) {
            $total = \App\Models\Student::where('grade_class', $grade)->where('is_active', true)->count();
            $transport = \App\Models\Student::where('grade_class', $grade)
                ->where('is_active', true)
                ->where('transport_enabled', true)
                ->count();
            $lunch = \App\Models\Student::where('grade_class', $grade)
                ->where('is_active', true)
                ->where('lunch_enabled', true)
                ->count();

            return [
                'grade' => $grade,
                'total_students' => $total,
                'transport_enabled' => $transport,
                'lunch_enabled' => $lunch,
                'transport_percentage' => $total > 0 ? round(($transport / $total) * 100, 2) : 0,
                'lunch_percentage' => $total > 0 ? round(($lunch / $total) * 100, 2) : 0,
            ];
        });

        return response()->json([
            'grades' => $stats,
            'total_grades' => $stats->count(),
        ]);
    }

    /**
     * Get alert summary
     */
    public function alertSummary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        $from = $validated['from'] ?? today()->toDateString();
        $to = $validated['to'] ?? today()->toDateString();

        $alerts = \App\Models\TransportAttendance::whereBetween('scanned_at', [$from, $to])
            ->where('is_valid', false)
            ->with(['student', 'bus'])
            ->get();

        $groupedAlerts = $alerts->groupBy('alert_message')->map(function ($group) {
            return [
                'message' => $group->first()->alert_message,
                'count' => $group->count(),
                'examples' => $group->take(3)->map(function ($alert) {
                    return [
                        'student' => $alert->student->full_name,
                        'bus' => $alert->bus->bus_number,
                        'time' => $alert->scanned_at->format('H:i:s'),
                    ];
                }),
            ];
        })->values();

        return response()->json([
            'period' => [
                'from' => $from,
                'to' => $to,
            ],
            'total_alerts' => $alerts->count(),
            'grouped_alerts' => $groupedAlerts,
        ]);
    }
}