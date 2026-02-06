<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentService;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StudentController extends Controller
{
    public function __construct(
        private StudentService $studentService
    ) {}

    /**
     * Get all students with filters
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'grade',
            'status',
            'transport_enabled',
            'lunch_enabled',
            'per_page'
        ]);

        $students = $this->studentService->getAll($filters);

        return response()->json($students);
    }

    /**
     * Get student by ID
     */
    public function show(int $id): JsonResponse
    {
        $student = $this->studentService->findById($id);

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'student' => $student
        ]);
    }

    /**
     * Create new student
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'admission_number' => 'required|string|max:50|unique:students,admission_number',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'grade_class' => 'required|string|max:50',
            'qr_code' => 'nullable|string|max:100|unique:students,qr_code',
            'is_active' => 'boolean',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:100',
            'transport_enabled' => 'boolean',
            'lunch_enabled' => 'boolean',
            'transport' => 'nullable|array',
            'transport.bus_id' => 'required_if:transport_enabled,true|exists:buses,id',
            'transport.pickup_point' => 'required_if:transport_enabled,true|string',
            'transport.dropoff_point' => 'required_if:transport_enabled,true|string',
            'transport.pickup_time' => 'nullable|date_format:H:i',
            'transport.dropoff_time' => 'nullable|date_format:H:i',
            'transport.notes' => 'nullable|string',
            'lunch' => 'nullable|array',
            'lunch.diet_type' => 'required_if:lunch_enabled,true|in:normal,special',
            'lunch.diet_notes' => 'nullable|string',
        ]);

        try {
            $student = $this->studentService->createStudent($validated);

            return response()->json([
                'message' => 'Student created successfully',
                'student' => $student
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update student
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'grade_class' => 'sometimes|string|max:50',
            'is_active' => 'sometimes|boolean',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:100',
            'transport_enabled' => 'sometimes|boolean',
            'lunch_enabled' => 'sometimes|boolean',
            'transport' => 'nullable|array',
            'transport.bus_id' => 'sometimes|exists:buses,id',
            'transport.pickup_point' => 'sometimes|string',
            'transport.dropoff_point' => 'sometimes|string',
            'transport.pickup_time' => 'nullable|date_format:H:i',
            'transport.dropoff_time' => 'nullable|date_format:H:i',
            'transport.notes' => 'nullable|string',
            'lunch' => 'nullable|array',
            'lunch.diet_type' => 'sometimes|in:normal,special',
            'lunch.diet_notes' => 'nullable|string',
        ]);

        try {
            $student = $this->studentService->updateStudent($id, $validated);

            return response()->json([
                'message' => 'Student updated successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete student
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->studentService->deleteStudent($id);

            return response()->json([
                'message' => 'Student deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student by QR code
     */
    public function getByQRCode(string $qrCode): JsonResponse
    {
        $student = $this->studentService->findByQRCode($qrCode);

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'student' => $student
        ]);
    }

    /**
     * Get student by admission number
     */
    public function getByAdmissionNumber(string $admissionNumber): JsonResponse
    {
        $student = $this->studentService->findByAdmissionNumber($admissionNumber);

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'student' => $student
        ]);
    }

    /**
     * Activate student
     */
    public function activate(int $id): JsonResponse
    {
        try {
            $student = $this->studentService->activate($id);

            return response()->json([
                'message' => 'Student activated successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to activate student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate student
     */
    public function deactivate(int $id): JsonResponse
    {
        try {
            $student = $this->studentService->deactivate($id);

            return response()->json([
                'message' => 'Student deactivated successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to deactivate student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enable transport for student
     */
    public function enableTransport(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'pickup_point' => 'required|string',
            'dropoff_point' => 'required|string',
            'pickup_time' => 'nullable|date_format:H:i',
            'dropoff_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        try {
            $student = $this->studentService->enableTransport($id, $validated);

            return response()->json([
                'message' => 'Transport enabled successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to enable transport',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disable transport for student
     */
    public function disableTransport(int $id): JsonResponse
    {
        try {
            $student = $this->studentService->disableTransport($id);

            return response()->json([
                'message' => 'Transport disabled successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to disable transport',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enable lunch for student
     */
    public function enableLunch(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'diet_type' => 'required|in:normal,special',
            'diet_notes' => 'nullable|string',
        ]);

        try {
            $student = $this->studentService->enableLunch($id, $validated);

            return response()->json([
                'message' => 'Lunch enabled successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to enable lunch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disable lunch for student
     */
    public function disableLunch(int $id): JsonResponse
    {
        try {
            $student = $this->studentService->disableLunch($id);

            return response()->json([
                'message' => 'Lunch disabled successfully',
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to disable lunch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get students by grade
     */
    public function getByGrade(string $grade): JsonResponse
    {
        $students = $this->studentService->getByGrade($grade);

        return response()->json([
            'grade' => $grade,
            'students' => $students
        ]);
    }

    /**
     * Get all grades
     */
    public function getGrades(): JsonResponse
    {
        $grades = $this->studentService->getAllGrades();

        return response()->json([
            'grades' => $grades
        ]);
    }

    /**
     * Get student statistics
     */
    public function getStatistics(): JsonResponse
    {
        $stats = $this->studentService->getStatistics();

        return response()->json($stats);
    }
}