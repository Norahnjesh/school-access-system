<?php

namespace App\Imports;

use App\Models\{Student, LunchDetail, ImportJob};
use Maatwebsite\Excel\Concerns\{
    ToModel,
    WithHeadingRow,
    WithChunkReading,
    WithValidation,
    SkipsOnError,
    SkipsOnFailure
};
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\DB;

class LunchDetailsImport implements 
    ToModel, 
    WithHeadingRow, 
    WithChunkReading, 
    WithValidation,
    SkipsOnError,
    SkipsOnFailure
{
    private ImportJob $importJob;
    private array $errors = [];

    public function __construct(ImportJob $importJob)
    {
        $this->importJob = $importJob;
    }

    public function model(array $row)
    {
        DB::beginTransaction();
        
        try {
            // Find student by admission number
            $student = Student::where('admission_number', $row['admission_number'])->first();
            
            if (!$student) {
                throw new \Exception("Student with admission number {$row['admission_number']} not found");
            }

            // Validate diet type
            $dietType = strtolower($row['diet_type'] ?? 'normal');
            if (!in_array($dietType, ['normal', 'special'])) {
                throw new \Exception("Invalid diet type: {$dietType}. Must be 'normal' or 'special'");
            }

            // Enable lunch for student if not already enabled
            if (!$student->lunch_enabled) {
                $student->update(['lunch_enabled' => true]);
            }

            // Combine diet notes, allergies, and preferences
            $dietNotes = trim(implode('. ', array_filter([
                $row['diet_notes'] ?? '',
                isset($row['allergies']) && $row['allergies'] !== 'None' ? "Allergies: {$row['allergies']}" : '',
                $row['preferences'] ?? '',
            ])));

            // Create or update lunch detail
            $lunchDetail = LunchDetail::updateOrCreate(
                ['student_id' => $student->id],
                [
                    'diet_type' => $dietType,
                    'diet_notes' => $dietNotes ?: null,
                    'is_active' => true,
                ]
            );

            // Update counters
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('success_count');

            DB::commit();
            
            return $lunchDetail;
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            $this->errors[] = [
                'row' => $this->importJob->processed_rows + 1,
                'admission_number' => $row['admission_number'] ?? 'N/A',
                'error' => $e->getMessage(),
            ];
            
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('error_count');
            
            return null;
        }
    }

    public function rules(): array
    {
        return [
            'admission_number' => 'required|string',
            'diet_type' => 'required|in:normal,special,Normal,Special,NORMAL,SPECIAL',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'diet_type.in' => 'Diet type must be either "normal" or "special"',
        ];
    }

    public function onError(\Throwable $e)
    {
        // Handle error
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->errors[] = [
                'row' => $failure->row(),
                'admission_number' => 'N/A',
                'error' => implode(', ', $failure->errors()),
            ];
            
            $this->importJob->increment('error_count');
        }
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function __destruct()
    {
        // Save errors to import job
        if (!empty($this->errors)) {
            $existingErrors = $this->importJob->error_log ?? [];
            $this->importJob->update([
                'error_log' => array_merge($existingErrors, $this->errors),
            ]);
        }
    }
}