<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\{
    StudentController,
    BusController,
    TransportController,
    LunchController,
    ImportController,
    ReportController
};

/*
|--------------------------------------------------------------------------
| API Routes - Little Wonder School Access System
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them
| will be assigned to the "api" middleware group.
|
*/

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    
    // --------------------------------------------
    // AUTH ROUTES
    // --------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // --------------------------------------------
    // STUDENT ROUTES
    // --------------------------------------------
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::post('/', [StudentController::class, 'store']);
        Route::get('/statistics', [StudentController::class, 'getStatistics']);
        Route::get('/grades', [StudentController::class, 'getGrades']);
        Route::get('/qr/{qrCode}', [StudentController::class, 'getByQRCode']);
        Route::get('/admission/{admissionNumber}', [StudentController::class, 'getByAdmissionNumber']);
        Route::get('/grade/{grade}', [StudentController::class, 'getByGrade']);
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::put('/{id}', [StudentController::class, 'update']);
        Route::delete('/{id}', [StudentController::class, 'destroy']);
        
        // Student actions
        Route::post('/{id}/activate', [StudentController::class, 'activate']);
        Route::post('/{id}/deactivate', [StudentController::class, 'deactivate']);
        Route::post('/{id}/transport/enable', [StudentController::class, 'enableTransport']);
        Route::post('/{id}/transport/disable', [StudentController::class, 'disableTransport']);
        Route::post('/{id}/lunch/enable', [StudentController::class, 'enableLunch']);
        Route::post('/{id}/lunch/disable', [StudentController::class, 'disableLunch']);
    });

    // --------------------------------------------
    // BUS ROUTES
    // --------------------------------------------
    Route::prefix('buses')->group(function () {
        Route::get('/', [BusController::class, 'index']);
        Route::post('/', [BusController::class, 'store']);
        Route::get('/active', [BusController::class, 'getActiveBuses']);
        Route::get('/{id}', [BusController::class, 'show']);
        Route::put('/{id}', [BusController::class, 'update']);
        Route::delete('/{id}', [BusController::class, 'destroy']);
        
        // Bus actions
        Route::post('/{id}/activate', [BusController::class, 'activate']);
        Route::post('/{id}/deactivate', [BusController::class, 'deactivate']);
        Route::get('/{id}/students', [BusController::class, 'getStudents']);
        Route::get('/{id}/capacity', [BusController::class, 'getCapacity']);
    });

    // --------------------------------------------
    // TRANSPORT SCANNING ROUTES
    // --------------------------------------------
    Route::prefix('transport')->group(function () {
        Route::post('/scan', [TransportController::class, 'scan']);
        Route::get('/daily-list', [TransportController::class, 'getDailyStudentList']);
        Route::get('/attendance', [TransportController::class, 'getAttendance']);
        Route::get('/today/{busId}', [TransportController::class, 'getTodayAttendance']);
        Route::get('/summary', [TransportController::class, 'getAttendanceSummary']);
        Route::get('/missing', [TransportController::class, 'getMissingStudents']);
        Route::get('/alerts', [TransportController::class, 'getAlerts']);
        Route::get('/statistics', [TransportController::class, 'getScanStatistics']);
    });

    // --------------------------------------------
    // LUNCH SCANNING ROUTES
    // --------------------------------------------
    Route::prefix('lunch')->group(function () {
        Route::post('/scan', [LunchController::class, 'scan']);
        Route::get('/check-served/{studentId}', [LunchController::class, 'checkIfServedToday']);
        Route::get('/attendance', [LunchController::class, 'getAttendance']);
        Route::get('/today', [LunchController::class, 'getTodayAttendance']);
        Route::get('/summary', [LunchController::class, 'getAttendanceSummary']);
        Route::get('/missing', [LunchController::class, 'getMissingStudents']);
        Route::get('/weekly-stats', [LunchController::class, 'getWeeklyStats']);
        Route::get('/monthly-stats', [LunchController::class, 'getMonthlyStats']);
        Route::get('/diet-distribution', [LunchController::class, 'getDietDistribution']);
        Route::get('/student/{studentId}/history', [LunchController::class, 'getStudentHistory']);
        Route::get('/special-diet-students', [LunchController::class, 'getSpecialDietStudents']);
        Route::get('/statistics', [LunchController::class, 'getLunchStatistics']);
    });

    // --------------------------------------------
    // IMPORT/EXPORT ROUTES
    // --------------------------------------------
    Route::prefix('import')->group(function () {
        // Import templates
        Route::get('/template', [ImportController::class, 'downloadTemplate']);
        Route::get('/instructions', [ImportController::class, 'getImportInstructions']);
        
        // Import jobs
        Route::get('/jobs', [ImportController::class, 'getRecentJobs']);
        Route::get('/jobs/{job}', [ImportController::class, 'getJobStatus']);
        Route::delete('/jobs/{job}', [ImportController::class, 'deleteJob']);
    });

    // Import specific entities
    Route::post('/students/import', [ImportController::class, 'importStudents']);
    Route::post('/buses/import', [ImportController::class, 'importBuses']);
    Route::post('/transport-details/import', [ImportController::class, 'importTransportDetails']);
    Route::post('/lunch-details/import', [ImportController::class, 'importLunchDetails']);

    // Export (future feature)
    Route::post('/students/export', [ImportController::class, 'exportStudents']);
    Route::post('/buses/export', [ImportController::class, 'exportBuses']);

    // --------------------------------------------
    // REPORT ROUTES
    // --------------------------------------------
    Route::prefix('reports')->group(function () {
        Route::get('/dashboard', [ReportController::class, 'dashboard']);
        Route::get('/transport', [ReportController::class, 'transport']);
        Route::get('/lunch', [ReportController::class, 'lunch']);
        Route::get('/attendance-summary', [ReportController::class, 'attendanceSummary']);
        Route::get('/bus-usage', [ReportController::class, 'busUsage']);
        Route::get('/diet-distribution', [ReportController::class, 'dietDistribution']);
        Route::get('/student-activity/{studentId}', [ReportController::class, 'studentActivity']);
        Route::get('/monthly-comparison', [ReportController::class, 'monthlyComparison']);
        Route::get('/realtime-stats', [ReportController::class, 'realtimeStats']);
        Route::get('/grade-statistics', [ReportController::class, 'gradeStatistics']);
        Route::get('/alert-summary', [ReportController::class, 'alertSummary']);
        
        // Export reports (future feature)
        Route::post('/transport/export', [ReportController::class, 'exportTransport']);
        Route::post('/lunch/export', [ReportController::class, 'exportLunch']);
    });
});

// ============================================
// HEALTH CHECK ROUTE
// ============================================
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// ============================================
// FALLBACK ROUTE (404)
// ============================================
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found',
        'status' => 404,
    ], 404);
});