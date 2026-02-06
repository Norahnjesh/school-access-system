<?php

namespace App\Services;

class QRCodeService
{
    /**
     * Generate QR code string from admission number
     * Format: QR{ADMISSION_NUMBER}
     */
    public function generate(string $admissionNumber): string
    {
        return 'QR' . strtoupper(trim($admissionNumber));
    }

    /**
     * Validate QR code format
     */
    public function validate(string $qrCode): bool
    {
        // QR code should start with 'QR' followed by alphanumeric characters
        return preg_match('/^QR[A-Z0-9]+$/i', $qrCode) === 1;
    }

    /**
     * Extract admission number from QR code
     */
    public function extractAdmissionNumber(string $qrCode): ?string
    {
        if (!$this->validate($qrCode)) {
            return null;
        }

        // Remove 'QR' prefix
        return substr($qrCode, 2);
    }

    /**
     * Batch generate QR codes for multiple admission numbers
     */
    public function generateBatch(array $admissionNumbers): array
    {
        $qrCodes = [];
        
        foreach ($admissionNumbers as $admissionNumber) {
            $qrCodes[$admissionNumber] = $this->generate($admissionNumber);
        }
        
        return $qrCodes;
    }

    /**
     * Check if QR code already exists in database
     */
    public function exists(string $qrCode): bool
    {
        return \App\Models\Student::where('qr_code', $qrCode)->exists();
    }

    /**
     * Generate unique QR code (ensures no duplicates)
     */
    public function generateUnique(string $admissionNumber, int $attempt = 0): string
    {
        $qrCode = $this->generate($admissionNumber);
        
        // If QR code exists and this is a retry, append attempt number
        if ($this->exists($qrCode) && $attempt > 0) {
            $qrCode = $this->generate($admissionNumber . '-' . $attempt);
        }
        
        // If still exists, try again with incremented attempt
        if ($this->exists($qrCode) && $attempt < 10) {
            return $this->generateUnique($admissionNumber, $attempt + 1);
        }
        
        return $qrCode;
    }
}