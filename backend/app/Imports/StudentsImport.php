<?php

namespace App\Imports;

use App\Models\{Student, Bus, ImportJob};
use App\Services\QRCodeService;
use Maatwebsite\Excel\Concerns\{
    ToModel,
    WithHeadingRow,
    WithChunkReading,
    WithValidation,
    SkipsOnError,
    SkipsOnFailure,
    WithStartRow
};
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentsImport implements 
    ToModel, 
    WithHeadingRow, 
    WithChunkReading, 
    WithValidation,
    SkipsOnError,
    SkipsOnFailure,
    WithStartRow
{
    private ImportJob $importJob;
    private QRCodeService $qrCodeService;
    private array $errors = [];

    public function __construct(ImportJob $importJob)
    {
        $this->importJob = $importJob;
        $this->qrCodeService = new QRCodeService();
    }

    /**
     * Start reading from row 2 (row 1 is headers)
     */
    public function startRow(): int
    {
        return 2;
    }

    /**
     * Process each row and create/update student
     */
    public function model(array $row)
    {
        DB::beginTransaction();
        
        try {
            // Normalize column names (handle spaces and case)
            $row = $this->normalizeRow($row);

            // Convert Yes/No to boolean
            $isActive = $this->parseBoolean($row['is_active'] ?? 'yes');
            $transportEnabled = $this->parseBoolean($row['transport_enabled'] ?? 'no');
            $lunchEnabled = $this->parseBoolean($row['lunch_enabled'] ?? 'no');

            // Generate QR code if not provided
            $qrCode = $row['qr_code'] ?? $this->qrCodeService->generateUnique($row['admission_number']);

            // Find or create student
            $student = Student::updateOrCreate(
                ['admission_number' => $row['admission_number']],
                [
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'grade_class' => $row['grade_class'],
                    'qr_code' => $qrCode,
                    'is_active' => $isActive,
                    'guardian_name' => $row['guardian_name'] ?? null,
                    'guardian_phone' => $this->formatPhoneNumber($row['guardian_phone'] ?? null),
                    'guardian_email' => $row['guardian_email'] ?? null,
                    'transport_enabled' => $transportEnabled,
                    'lunch_enabled' => $lunchEnabled,
                ]
            );

            // Handle transport details if provided in same row
            if ($transportEnabled && !empty($row['bus_number'])) {
                $this->handleTransportDetails($student, $row);
            }

            // Handle lunch details if provided in same row
            if ($lunchEnabled && !empty($row['diet_type'])) {
                $this->handleLunchDetails($student, $row);
            }

            // Update counters
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('success_count');

            DB::commit();
            
            return $student;
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            $this->errors[] = [
                'row' => $this->importJob->processed_rows + 2, // +2 because of header and 0-index
                'admission_number' => $row['admission_number'] ?? 'N/A',
                'error' => $e->getMessage(),
            ];
            
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('error_count');
            
            return null;
        }
    }

    /**
     * Validation rules for each row
     */
    public function rules(): array
    {
        return [
            '*.admission_number' => [
                'required',
                'string',
                'max:50',
            ],
            '*.first_name' => [
                'required',
                'string',
                'max:100',
            ],
            '*.last_name' => [
                'required',
                'string',
                'max:100',
            ],
            '*.grade_class' => [
                'required',
                'string',
                'max:50',
            ],
            '*.guardian_email' => [
                'nullable',
                'email',
                'max:100',
            ],
            '*.guardian_phone' => [
                'nullable',
                'string',
                'max:20',
            ],
            '*.is_active' => [
                'nullable',
                'in:Yes,No,yes,no,YES,NO,Y,N,y,n,1,0,true,false',
            ],
            '*.transport_enabled' => [
                'nullable',
                'in:Yes,No,yes,no,YES,NO,Y,N,y,n,1,0,true,false',
            ],
            '*.lunch_enabled' => [
                'nullable',
                'in:Yes,No,yes,no,YES,NO,Y,N,y,n,1,0,true,false',
            ],
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages(): array
    {
        return [
            '*.admission_number.required' => 'Admission number is required',
            '*.admission_number.unique' => 'Admission number already exists',
            '*.first_name.required' => 'First name is required',
            '*.last_name.required' => 'Last name is required',
            '*.grade_class.required' => 'Grade/Class is required',
            '*.guardian_email.email' => 'Invalid email format',
        ];
    }

    /**
     * Handle validation errors
     */
    public function onError(\Throwable $e)
    {
        // Error is already logged in model() method
    }

    /**
     * Handle validation failures
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->errors[] = [
                'row' => $failure->row(),
                'admission_number' => 'N/A',
                'error' => implode(', ', $failure->errors()),
            ];
            
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('error_count');
        }
    }

    /**
     * Process in chunks for better performance
     */
    public function chunkSize(): int
    {
        return 100;
    }

    /**
     * Normalize row keys (handle spaces and case)
     */
    private function normalizeRow(array $row): array
    {
        $normalized = [];
        
        foreach ($row as $key => $value) {
            // Convert to lowercase and replace spaces with underscores
            $normalizedKey = strtolower(str_replace(' ', '_', trim($key)));
            $normalized[$normalizedKey] = $value;
        }
        
        return $normalized;
    }

    /**
     * Parse boolean values from various formats
     */
    private function parseBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        $value = strtolower(trim($value ?? ''));
        
        return in_array($value, ['yes', 'y', '1', 'true', 'on'], true);
    }

    /**
     * Format phone number
     */
    private function formatPhoneNumber(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        // Remove all non-numeric characters except +
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Add + if it starts with country code but no +
        if (strlen($phone) > 10 && !str_starts_with($phone, '+')) {
            $phone = '+' . $phone;
        }
        
        return $phone;
    }

    /**
     * Handle transport details from the same row
     */
    private function handleTransportDetails(Student $student, array $row): void
    {
        if (empty($row['bus_number'])) {
            return;
        }

        // Find bus by bus_number
        $bus = Bus::where('bus_number', $row['bus_number'])->first();
        
        if (!$bus) {
            throw new \Exception("Bus {$row['bus_number']} not found. Please import buses first.");
        }

        // Create or update transport detail
        $student->transportDetail()->updateOrCreate(
            ['student_id' => $student->id],
            [
                'bus_id' => $bus->id,
                'pickup_point' => $row['pickup_point'] ?? 'Not specified',
                'dropoff_point' => $row['dropoff_point'] ?? 'Not specified',
                'pickup_time' => $this->parseTime($row['pickup_time'] ?? null),
                'dropoff_time' => $this->parseTime($row['dropoff_time'] ?? null),
                'notes' => $row['transport_notes'] ?? null,
                'is_active' => true,
            ]
        );
    }

    /**
     * Handle lunch details from the same row
     */
    private function handleLunchDetails(Student $student, array $row): void
    {
        if (empty($row['diet_type'])) {
            return;
        }

        $dietType = strtolower(trim($row['diet_type']));
        
        if (!in_array($dietType, ['normal', 'special'])) {
            throw new \Exception("Invalid diet type: {$dietType}. Must be 'normal' or 'special'");
        }

        // Create or update lunch detail
        $student->lunchDetail()->updateOrCreate(
            ['student_id' => $student->id],
            [
                'diet_type' => $dietType,
                'diet_notes' => $row['diet_notes'] ?? null,
                'is_active' => true,
            ]
        );
    }

    /**
     * Parse time string to HH:MM format
     */
    private function parseTime(?string $time): ?string
    {
        if (empty($time)) {
            return null;
        }

        // Try to parse various time formats
        try {
            $parsed = \Carbon\Carbon::parse($time);
            return $parsed->format('H:i');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Save errors to import job when done
     */
    public function __destruct()
    {
        if (!empty($this->errors)) {
            $existingErrors = $this->importJob->error_log ?? [];
            $this->importJob->update([
                'error_log' => array_merge($existingErrors, $this->errors),
            ]);
        }
    }
}