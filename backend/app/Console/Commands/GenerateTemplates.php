<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

class GenerateTemplates extends Command
{
    protected $signature = 'templates:generate';
    protected $description = 'Generate Excel import templates';

    public function handle()
    {
        $this->info('Generating Excel templates...');

        $this->generateStudentTemplate();
        $this->generateBusTemplate();
        $this->generateTransportDetailsTemplate();
        $this->generateLunchDetailsTemplate();

        $this->info('All templates generated successfully!');
    }

    private function generateStudentTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Headers
        $headers = [
            'admission_number', 'first_name', 'last_name', 'grade_class', 'is_active',
            'guardian_name', 'guardian_phone', 'guardian_email', 'transport_enabled',
            'lunch_enabled', 'bus_number', 'pickup_point', 'dropoff_point',
            'pickup_time', 'dropoff_time', 'diet_type', 'diet_notes'
        ];

        $sheet->fromArray($headers, null, 'A1');

        // Sample data
        $sampleData = [
            ['2024001', 'John', 'Doe', 'Grade 5A', 'Yes', 'Jane Doe', '+254712345678', 
             'jane@example.com', 'Yes', 'Yes', 'BUS-001', 'Main Gate', 'Estate A', 
             '07:00', '15:30', 'normal', ''],
            ['2024002', 'Mary', 'Smith', 'Grade 6B', 'Yes', 'Robert Smith', '+254798765432',
             'robert@example.com', 'No', 'Yes', '', '', '', '', '', 'special', 'Gluten-free']
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        // Style header row
        $sheet->getStyle('A1:Q1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']]
        ]);

        // Auto-size columns
        foreach (range('A', 'Q') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path('app/templates/student_import_template.xlsx'));
        
        $this->info('✓ Student template created');
    }

    private function generateBusTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['bus_number', 'bus_name', 'capacity', 'driver_name', 'driver_phone', 'route_description', 'is_active'];
        $sheet->fromArray($headers, null, 'A1');

        $sampleData = [
            ['BUS-001', 'Route A - Morning', '40', 'Michael Driver', '+254722111222', 'Main Gate → Estate A → Estate B', 'Yes'],
            ['BUS-002', 'Route B - Morning', '35', 'Sarah Driver', '+254733444555', 'Main Gate → Downtown → City Center', 'Yes']
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        $sheet->getStyle('A1:G1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '70AD47']]
        ]);

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path('app/templates/bus_import_template.xlsx'));
        
        $this->info('✓ Bus template created');
    }

    private function generateTransportDetailsTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['admission_number', 'bus_number', 'pickup_point', 'dropoff_point', 'pickup_time', 'dropoff_time', 'notes'];
        $sheet->fromArray($headers, null, 'A1');

        $sampleData = [
            ['2024001', 'BUS-001', 'Main Gate', 'Estate A, Block 5', '07:00', '15:30', 'First stop'],
            ['2024002', 'BUS-001', 'Estate A, Block 5', 'Estate B, Gate 2', '07:15', '15:45', '']
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        $sheet->getStyle('A1:G1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFC000']]
        ]);

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path('app/templates/transport_details_import_template.xlsx'));
        
        $this->info('✓ Transport details template created');
    }

    private function generateLunchDetailsTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['admission_number', 'diet_type', 'diet_notes', 'allergies', 'preferences'];
        $sheet->fromArray($headers, null, 'A1');

        $sampleData = [
            ['2024001', 'normal', '', 'None', ''],
            ['2024002', 'special', 'Gluten-free diet required', 'Gluten, Nuts', 'No dairy products']
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'ED7D31']]
        ]);

        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save(storage_path('app/templates/lunch_details_import_template.xlsx'));
        
        $this->info('✓ Lunch details template created');
    }
}