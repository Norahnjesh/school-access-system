<?php

namespace App\Imports;

use App\Models\{Bus, ImportJob};
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

class BusesImport implements 
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
            // Convert Yes/No to boolean
            $isActive = strtolower($row['is_active'] ?? 'yes') === 'yes';

            // Find or create bus
            $bus = Bus::updateOrCreate(
                ['bus_number' => $row['bus_number']],
                [
                    'bus_name' => $row['bus_name'] ?? null,
                    'capacity' => isset($row['capacity']) ? (int)$row['capacity'] : null,
                    'driver_name' => $row['driver_name'] ?? null,
                    'driver_phone' => $row['driver_phone'] ?? null,
                    'route_description' => $row['route_description'] ?? null,
                    'is_active' => $isActive,
                ]
            );

            // Update counters
            $this->importJob->increment('processed_rows');
            $this->importJob->increment('success_count');

            DB::commit();
            
            return $bus;
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            $this->errors[] = [
                'row' => $this->importJob->processed_rows + 1,
                'bus_number' => $row['bus_number'] ?? 'N/A',
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
            'bus_number' => 'required|string|max:50',
            'bus_name' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1|max:100',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:20',
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
                'bus_number' => 'N/A',
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