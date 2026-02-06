<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScanQRRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'qr_code' => 'required|string|max:100',
            'bus_id' => 'nullable|integer|exists:buses,id',
            'scan_type' => 'nullable|in:morning_pickup,evening_dropoff',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'qr_code.required' => 'QR code is required',
            'bus_id.exists' => 'Selected bus does not exist',
            'scan_type.in' => 'Invalid scan type. Must be morning_pickup or evening_dropoff',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'qr_code' => 'QR code',
            'bus_id' => 'bus',
            'scan_type' => 'scan type',
        ];
    }
}