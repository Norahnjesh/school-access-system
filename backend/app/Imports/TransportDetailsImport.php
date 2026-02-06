<?php

namespace App\Imports;

use App\Models\{Student, Bus, TransportDetail, ImportJob};
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

class TransportDetailsImport implements 
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

            // Find bus by bus number
            $bus = Bus::where('bus_number', $row['bus_number'])->first();
            
            if (!$bus) {
                throw new \Exception("Bus {$row['bus_number']} not found");
            }

            // Enable transport for student if not already enabled
            if (!$student->transport_enabled) {
                $student->update(['transport_enabled' => true]);
            }

            // Create or update transport detail
            $transportDetail = TransportDetail::updateOrCreate(
                ['student_id' => $student->id],
                [
                    'bus_id' => $bus->id,
                    'pickup_point' => $row['pickup_point'],
                    'dropoff_point' => $row['dropoff_point'],
                    'pickup_time' => $row['pickup_time'] ?? null,
                    'dropoff_time' => $row['dropoff_time'] ?? null,
                    'notes' => $row['notes'] ?? null,
                    'is_active' => true,
                ]
            );

            // Update counters
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('success_count');

            DB::commit();
            
            return $transportDetail;
            
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
            'bus_number' => 'required|string',
            'pickup_point' => 'required|string|max:255',
            'dropoff_point' => 'required|string|max:255',
            'pickup_time' => 'nullable|string',
            'dropoff_time' => 'nullable|string',
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