<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExcelImportService;
use App\Models\ImportJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ImportController extends Controller
{
    public function __construct(
        private ExcelImportService $importService
    ) {}

    /**
     * Import students from Excel
     */
    public function importStudents(Request $request): JsonResponse
    {
        return $this->handleImport($request, 'students');
    }

    /**
     * Import buses from Excel
     */
    public function importBuses(Request $request): JsonResponse
    {
        return $this->handleImport($request, 'buses');
    }

    /**
     * Import transport details from Excel
     */
    public function importTransportDetails(Request $request): JsonResponse
    {
        return $this->handleImport($request, 'transport_details');
    }

    /**
     * Import lunch details from Excel
     */
    public function importLunchDetails(Request $request): JsonResponse
    {
        return $this->handleImport($request, 'lunch_details');
    }

    /**
     * Generic import handler
     */
    private function handleImport(Request $request, string $type): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');

        $validation = $this->importService->validateFile($file);
        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'errors' => $validation['errors'],
            ], 422);
        }

        try {
            $importJob = match ($type) {
                'students' => $this->importService->importStudents($file),
                'buses' => $this->importService->importBuses($file),
                'transport_details' => $this->importService->importTransportDetails($file),
                'lunch_details' => $this->importService->importLunchDetails($file),
                default => throw new \Exception("Invalid import type: {$type}"),
            };

            return response()->json([
                'success' => true,
                'job_id' => $importJob->id,
                'status' => $importJob->status,
                'message' => "Import started. Processing {$importJob->total_rows} rows.",
            ], 202);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get import job status
     */
    public function getJobStatus(ImportJob $job): JsonResponse
    {
       
    /** @var \App\Models\User|null $user */
    $user = Auth::user();

    if (!$user || ($job->user_id !== $user->id && !$user->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this import job',
            ], 403);
        }

        return response()->json([
            'id' => $job->id,
            'import_type' => $job->import_type ?? 'students',
            'filename' => $job->filename,
            'status' => $job->status,
            'total_rows' => $job->total_rows,
            'processed_rows' => $job->processed_rows,
            'success_count' => $job->success_count,
            'error_count' => $job->error_count,
            'errors' => $job->error_log ?? [],
            'progress_percentage' => $job->progress_percentage,
            'success_rate' => $job->success_rate,
            'created_at' => $job->created_at->toIso8601String(),
            'updated_at' => $job->updated_at->toIso8601String(),
            'completed_at' => $job->completed_at?->toIso8601String(),
        ]);
    }

    /**
     * Download Excel template
     */
    public function downloadTemplate(Request $request)
    {
        $type = $request->query('type', 'students');

        try {
            $templatePath = $this->importService->getTemplate($type);

            $filename = match ($type) {
                'students' => 'student_import_template.xlsx',
                'buses' => 'bus_import_template.xlsx',
                'transport_details' => 'transport_details_import_template.xlsx',
                'lunch_details' => 'lunch_details_import_template.xlsx',
                default => 'import_template.xlsx',
            };

            return response()->download($templatePath, $filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found: ' . $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get import instructions
     */
    public function getImportInstructions(Request $request): JsonResponse
    {
        return response()->json(
            $this->importService->getImportInstructions(
                $request->query('type', 'students')
            )
        );
    }

    /**
     * Get recent import jobs
     */
    public function getRecentJobs(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $query = ImportJob::with('user')
            ->where('user_id', $user->id)
            ->recent($request->query('days', 7))
            ->orderByDesc('created_at');

        if ($request->query('type')) {
            $query->where('import_type', $request->query('type'));
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Delete import job
     */
    public function deleteJob(ImportJob $job): JsonResponse
    {
     
    /** @var \App\Models\User|null $user */
    $user = Auth::user();

    if (!$user || ($job->user_id !== $user->id && !$user->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'Import job deleted successfully',
        ]);
    }

    /**
     * Retry failed import job
     */
    public function retryJob(ImportJob $job): JsonResponse
    {
       
    /** @var \App\Models\User|null $user */
    $user = Auth::user();

    if (!$user || ($job->user_id !== $user->id && !$user->isAdmin()))

        {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($job->status !== 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'Only failed jobs can be retried',
            ], 422);
        }

        $job->update([
            'status' => 'pending',
            'processed_rows' => 0,
            'success_count' => 0,
            'error_count' => 0,
            'error_log' => [],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Import job queued for retry',
            'job_id' => $job->id,
        ]);
    }

    /**
     * Get import statistics
     */
    public function getImportStatistics(): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'total_imports' => ImportJob::where('user_id', $user->id)->count(),
            'completed' => ImportJob::where('user_id', $user->id)->where('status', 'completed')->count(),
            'pending' => ImportJob::where('user_id', $user->id)->where('status', 'pending')->count(),
            'processing' => ImportJob::where('user_id', $user->id)->where('status', 'processing')->count(),
            'failed' => ImportJob::where('user_id', $user->id)->where('status', 'failed')->count(),
        ]);
    }
}
