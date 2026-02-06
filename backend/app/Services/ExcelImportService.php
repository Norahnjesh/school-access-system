<?php

namespace App\Services;

use App\Models\ImportJob;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Jobs\{
    ProcessStudentImport,
    ProcessBusImport,
    ProcessLunchDetailImport,
    ProcessTransportDetailImport
};

class ExcelImportService
{
    /**
     * Import types
     */
    const TYPE_STUDENTS = 'students';
    const TYPE_BUSES = 'buses';
    const TYPE_TRANSPORT_DETAILS = 'transport_details';
    const TYPE_LUNCH_DETAILS = 'lunch_details';

    /**
     * Get import type from file or parameter
     */
    public function getImportType(?string $type = null): string
    {
        return $type ?? self::TYPE_STUDENTS;
    }

    /**
     * Import students from Excel
     */
    public function importStudents(UploadedFile $file): ImportJob
    {
        return $this->processImport($file, self::TYPE_STUDENTS, ProcessStudentImport::class);
    }

    /**
     * Import buses from Excel
     */
    public function importBuses(UploadedFile $file): ImportJob
    {
        return $this->processImport($file, self::TYPE_BUSES, ProcessBusImport::class);
    }

    /**
     * Import transport details from Excel
     */
    public function importTransportDetails(UploadedFile $file): ImportJob
    {
        return $this->processImport($file, self::TYPE_TRANSPORT_DETAILS, ProcessTransportDetailImport::class);
    }

    /**
     * Import lunch details from Excel
     */
    public function importLunchDetails(UploadedFile $file): ImportJob
    {
        return $this->processImport($file, self::TYPE_LUNCH_DETAILS, ProcessLunchDetailImport::class);
    }

    /**
     * Generic import processor
     */
    private function processImport(UploadedFile $file, string $type, string $jobClass): ImportJob
    {
        // Store file
        $path = $file->store('imports');
        
        // Get authenticated user ID safely
        $userId = Auth::check() ? Auth::id() : null;
        
        // Create import job
        $importJob = ImportJob::create([
            'user_id' => $userId,
            'filename' => $file->getClientOriginalName(),
            'import_type' => $type,
            'status' => ImportJob::STATUS_PENDING,
        ]);

        // Dispatch appropriate job
        $jobClass::dispatch($importJob, $path);

        return $importJob;
    }

    /**
     * Get template path for import type
     */
    public function getTemplate(string $type): string
    {
        $templates = [
            self::TYPE_STUDENTS => 'templates/student_import_template.xlsx',
            self::TYPE_BUSES => 'templates/bus_import_template.xlsx',
            self::TYPE_TRANSPORT_DETAILS => 'templates/transport_details_import_template.xlsx',
            self::TYPE_LUNCH_DETAILS => 'templates/lunch_details_import_template.xlsx',
        ];

        $templatePath = storage_path('app/' . ($templates[$type] ?? $templates[self::TYPE_STUDENTS]));
        
        if (!file_exists($templatePath)) {
            throw new \Exception("Template file not found: {$templatePath}");
        }

        return $templatePath;
    }

    /**
     * Get import instructions for type
     */
    public function getImportInstructions(string $type): array
    {
        return match($type) {
            self::TYPE_STUDENTS => [
                'title' => 'Student Import Instructions',
                'description' => 'Upload student records with optional transport and lunch assignments',
                'required_columns' => ['admission_number', 'first_name', 'last_name', 'grade_class'],
                'optional_columns' => ['guardian_name', 'guardian_phone', 'guardian_email', 'transport_enabled', 'lunch_enabled'],
            ],
            self::TYPE_BUSES => [
                'title' => 'Bus Import Instructions',
                'description' => 'Upload bus fleet information including driver details',
                'required_columns' => ['bus_number'],
                'optional_columns' => ['bus_name', 'capacity', 'driver_name', 'driver_phone', 'route_description'],
            ],
            self::TYPE_TRANSPORT_DETAILS => [
                'title' => 'Transport Assignment Import Instructions',
                'description' => 'Assign students to buses with pickup and dropoff points',
                'required_columns' => ['admission_number', 'bus_number', 'pickup_point', 'dropoff_point'],
                'optional_columns' => ['pickup_time', 'dropoff_time', 'notes'],
            ],
            self::TYPE_LUNCH_DETAILS => [
                'title' => 'Lunch Configuration Import Instructions',
                'description' => 'Configure lunch settings and dietary requirements for students',
                'required_columns' => ['admission_number', 'diet_type'],
                'optional_columns' => ['diet_notes', 'allergies', 'preferences'],
            ],
            default => [],
        };
    }

    /**
     * Validate import file
     */
    public function validateFile(UploadedFile $file): array
    {
        $errors = [];

        // Check file extension
        if (!in_array($file->getClientOriginalExtension(), ['xlsx', 'xls'])) {
            $errors[] = 'File must be .xlsx or .xls format';
        }

        // Check file size (max 10MB)
        if ($file->getSize() > 10 * 1024 * 1024) {
            $errors[] = 'File size must not exceed 10MB';
        }

        // Check if file is readable
        if (!$file->isValid()) {
            $errors[] = 'File upload failed or file is corrupted';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Get sample data for template generation
     */
    public function getSampleData(string $type): array
    {
        return match($type) {
            self::TYPE_STUDENTS => [
                [
                    'admission_number' => '2024001',
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'grade_class' => 'Grade 5A',
                    'is_active' => 'Yes',
                    'guardian_name' => 'Jane Doe',
                    'guardian_phone' => '+254712345678',
                    'guardian_email' => 'jane@example.com',
                    'transport_enabled' => 'Yes',
                    'lunch_enabled' => 'Yes',
                ],
                [
                    'admission_number' => '2024002',
                    'first_name' => 'Mary',
                    'last_name' => 'Smith',
                    'grade_class' => 'Grade 6B',
                    'is_active' => 'Yes',
                    'guardian_name' => 'Robert Smith',
                    'guardian_phone' => '+254798765432',
                    'guardian_email' => 'robert@example.com',
                    'transport_enabled' => 'No',
                    'lunch_enabled' => 'Yes',
                ],
            ],
            self::TYPE_BUSES => [
                [
                    'bus_number' => 'BUS-001',
                    'bus_name' => 'Route A - Morning',
                    'capacity' => '40',
                    'driver_name' => 'Michael Driver',
                    'driver_phone' => '+254722111222',
                    'route_description' => 'Main Gate → Estate A → Estate B',
                    'is_active' => 'Yes',
                ],
                [
                    'bus_number' => 'BUS-002',
                    'bus_name' => 'Route B - Morning',
                    'capacity' => '35',
                    'driver_name' => 'Sarah Driver',
                    'driver_phone' => '+254733444555',
                    'route_description' => 'Main Gate → Downtown → City Center',
                    'is_active' => 'Yes',
                ],
            ],
            self::TYPE_TRANSPORT_DETAILS => [
                [
                    'admission_number' => '2024001',
                    'bus_number' => 'BUS-001',
                    'pickup_point' => 'Main Gate',
                    'dropoff_point' => 'Estate A, Block 5',
                    'pickup_time' => '07:00',
                    'dropoff_time' => '15:30',
                    'notes' => 'First stop',
                ],
                [
                    'admission_number' => '2024002',
                    'bus_number' => 'BUS-001',
                    'pickup_point' => 'Estate A, Block 5',
                    'dropoff_point' => 'Estate B, Gate 2',
                    'pickup_time' => '07:15',
                    'dropoff_time' => '15:45',
                    'notes' => '',
                ],
            ],
            self::TYPE_LUNCH_DETAILS => [
                [
                    'admission_number' => '2024001',
                    'diet_type' => 'normal',
                    'diet_notes' => '',
                    'allergies' => 'None',
                    'preferences' => '',
                ],
                [
                    'admission_number' => '2024002',
                    'diet_type' => 'special',
                    'diet_notes' => 'Gluten-free diet required',
                    'allergies' => 'Gluten, Nuts',
                    'preferences' => 'No dairy products',
                ],
            ],
            default => [],
        };
    }
}