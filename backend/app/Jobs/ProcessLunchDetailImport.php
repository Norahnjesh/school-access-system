<?php

namespace App\Jobs;

use App\Models\ImportJob;
use App\Imports\LunchDetailsImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ProcessLunchDetailImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private ImportJob $importJob,
        private string $filePath
    ) {}

    public function handle(): void
    {
        $this->importJob->markAsProcessing();
        
        try {
            Excel::import(
                new LunchDetailsImport($this->importJob), 
                storage_path('app/' . $this->filePath)
            );
            
            $this->importJob->markAsCompleted();
        } catch (\Exception $e) {
            $this->importJob->markAsFailed($e->getMessage());
        }
    }
}