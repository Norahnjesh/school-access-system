<?php

namespace App\Services;

use App\Models\{Student, TransportDetail, LunchDetail};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentService
{
    public function __construct(
        private QRCodeService $qrCodeService
    ) {}

    /**
     * Get all students with filters and pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Student::with(['transportDetail.bus', 'lunchDetail']);

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Grade filter
        if (!empty($filters['grade'])) {
            $query->byGrade($filters['grade']);
        }

        // Status filter
        if (isset($filters['status'])) {
            if ($filters['status'] === 'active') {
                $query->active();
            } elseif ($filters['status'] === 'inactive') {
                $query->inactive();
            }
        }

        // Transport enabled filter
        if (isset($filters['transport_enabled'])) {
            $query->where('transport_enabled', filter_var($filters['transport_enabled'], FILTER_VALIDATE_BOOLEAN));
        }

        // Lunch enabled filter
        if (isset($filters['lunch_enabled'])) {
            $query->where('lunch_enabled', filter_var($filters['lunch_enabled'], FILTER_VALIDATE_BOOLEAN));
        }

        // Pagination
        $perPage = $filters['per_page'] ?? 50;
        
        return $query->orderBy('admission_number')->paginate($perPage);
    }

    /**
     * Find student by ID
     */
    public function findById(int $id): ?Student
    {
        return Student::with(['transportDetail.bus', 'lunchDetail'])->find($id);
    }

    /**
     * Find student by admission number
     */
    public function findByAdmissionNumber(string $admissionNumber): ?Student
    {
        return Student::with(['transportDetail.bus', 'lunchDetail'])
            ->where('admission_number', $admissionNumber)
            ->first();
    }

    /**
     * Find student by QR code
     */
    public function findByQRCode(string $qrCode): ?Student
    {
        return Student::with(['transportDetail.bus', 'lunchDetail'])
            ->where('qr_code', $qrCode)
            ->first();
    }

    /**
     * Create new student
     */
    public function createStudent(array $data): Student
    {
        DB::beginTransaction();
        
        try {
            // Generate QR code if not provided
            if (!isset($data['qr_code'])) {
                $data['qr_code'] = $this->qrCodeService->generateUnique($data['admission_number']);
            }

            // Create student
            $student = Student::create([
                'admission_number' => $data['admission_number'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'grade_class' => $data['grade_class'],
                'qr_code' => $data['qr_code'],
                'is_active' => $data['is_active'] ?? true,
                'guardian_name' => $data['guardian_name'] ?? null,
                'guardian_phone' => $data['guardian_phone'] ?? null,
                'guardian_email' => $data['guardian_email'] ?? null,
                'transport_enabled' => $data['transport_enabled'] ?? false,
                'lunch_enabled' => $data['lunch_enabled'] ?? false,
            ]);

            // Create transport details if enabled
            if ($data['transport_enabled'] && isset($data['transport'])) {
                $student->transportDetail()->create([
                    'bus_id' => $data['transport']['bus_id'],
                    'pickup_point' => $data['transport']['pickup_point'],
                    'dropoff_point' => $data['transport']['dropoff_point'],
                    'pickup_time' => $data['transport']['pickup_time'] ?? null,
                    'dropoff_time' => $data['transport']['dropoff_time'] ?? null,
                    'notes' => $data['transport']['notes'] ?? null,
                    'is_active' => true,
                ]);
            }

            // Create lunch details if enabled
            if ($data['lunch_enabled'] && isset($data['lunch'])) {
                $student->lunchDetail()->create([
                    'diet_type' => $data['lunch']['diet_type'] ?? 'normal',
                    'diet_notes' => $data['lunch']['diet_notes'] ?? null,
                    'is_active' => true,
                ]);
            }

            DB::commit();
            
            return $student->load(['transportDetail.bus', 'lunchDetail']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update student
     */
    public function updateStudent(int $id, array $data): Student
    {
        DB::beginTransaction();
        
        try {
            $student = Student::findOrFail($id);

            // Update basic info
            $student->update([
                'first_name' => $data['first_name'] ?? $student->first_name,
                'last_name' => $data['last_name'] ?? $student->last_name,
                'grade_class' => $data['grade_class'] ?? $student->grade_class,
                'is_active' => $data['is_active'] ?? $student->is_active,
                'guardian_name' => $data['guardian_name'] ?? $student->guardian_name,
                'guardian_phone' => $data['guardian_phone'] ?? $student->guardian_phone,
                'guardian_email' => $data['guardian_email'] ?? $student->guardian_email,
                'transport_enabled' => $data['transport_enabled'] ?? $student->transport_enabled,
                'lunch_enabled' => $data['lunch_enabled'] ?? $student->lunch_enabled,
            ]);

            // Update transport details
            if (isset($data['transport']) && $data['transport_enabled']) {
                if ($student->transportDetail) {
                    $student->transportDetail->update($data['transport']);
                } else {
                    $student->transportDetail()->create(array_merge(
                        $data['transport'],
                        ['is_active' => true]
                    ));
                }
            }

            // Update lunch details
            if (isset($data['lunch']) && $data['lunch_enabled']) {
                if ($student->lunchDetail) {
                    $student->lunchDetail->update($data['lunch']);
                } else {
                    $student->lunchDetail()->create(array_merge(
                        $data['lunch'],
                        ['is_active' => true]
                    ));
                }
            }

            DB::commit();
            
            return $student->fresh(['transportDetail.bus', 'lunchDetail']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete student
     */
    public function deleteStudent(int $id): bool
    {
        $student = Student::findOrFail($id);
        return $student->delete();
    }

    /**
     * Activate student
     */
    public function activate(int $id): Student
    {
        $student = Student::findOrFail($id);
        $student->update(['is_active' => true]);
        
        return $student;
    }

    /**
     * Deactivate student
     */
    public function deactivate(int $id): Student
    {
        $student = Student::findOrFail($id);
        $student->update(['is_active' => false]);
        
        return $student;
    }

    /**
     * Enable transport for student
     */
    public function enableTransport(int $id, array $transportData): Student
    {
        DB::beginTransaction();
        
        try {
            $student = Student::findOrFail($id);
            
            $student->update(['transport_enabled' => true]);
            
            if ($student->transportDetail) {
                $student->transportDetail->update(array_merge(
                    $transportData,
                    ['is_active' => true]
                ));
            } else {
                $student->transportDetail()->create(array_merge(
                    $transportData,
                    ['is_active' => true]
                ));
            }
            
            DB::commit();
            
            return $student->fresh(['transportDetail.bus', 'lunchDetail']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Disable transport for student
     */
    public function disableTransport(int $id): Student
    {
        $student = Student::findOrFail($id);
        $student->update(['transport_enabled' => false]);
        
        if ($student->transportDetail) {
            $student->transportDetail->update(['is_active' => false]);
        }
        
        return $student->fresh(['transportDetail.bus', 'lunchDetail']);
    }

    /**
     * Enable lunch for student
     */
    public function enableLunch(int $id, array $lunchData): Student
    {
        DB::beginTransaction();
        
        try {
            $student = Student::findOrFail($id);
            
            $student->update(['lunch_enabled' => true]);
            
            if ($student->lunchDetail) {
                $student->lunchDetail->update(array_merge(
                    $lunchData,
                    ['is_active' => true]
                ));
            } else {
                $student->lunchDetail()->create(array_merge(
                    $lunchData,
                    ['is_active' => true]
                ));
            }
            
            DB::commit();
            
            return $student->fresh(['transportDetail.bus', 'lunchDetail']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Disable lunch for student
     */
    public function disableLunch(int $id): Student
    {
        $student = Student::findOrFail($id);
        $student->update(['lunch_enabled' => false]);
        
        if ($student->lunchDetail) {
            $student->lunchDetail->update(['is_active' => false]);
        }
        
        return $student->fresh(['transportDetail.bus', 'lunchDetail']);
    }

    /**
     * Get students by grade
     */
    public function getByGrade(string $grade): array
    {
        return Student::with(['transportDetail.bus', 'lunchDetail'])
            ->byGrade($grade)
            ->active()
            ->orderBy('admission_number')
            ->get()
            ->toArray();
    }

    /**
     * Get all grades (unique)
     */
    public function getAllGrades(): array
    {
        return Student::select('grade_class')
            ->distinct()
            ->orderBy('grade_class')
            ->pluck('grade_class')
            ->toArray();
    }

    /**
     * Get student statistics
     */
    public function getStatistics(): array
    {
        return [
            'total' => Student::count(),
            'active' => Student::active()->count(),
            'inactive' => Student::inactive()->count(),
            'transport_enabled' => Student::transportEnabled()->count(),
            'lunch_enabled' => Student::lunchEnabled()->count(),
            'both_services' => Student::transportEnabled()->lunchEnabled()->count(),
        ];
    }
}