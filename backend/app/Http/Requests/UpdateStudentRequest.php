<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
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
        $studentId = $this->route('student'); // Get student ID from route

        return [
            'admission_number' => 'sometimes|string|max:50|unique:students,admission_number,' . $studentId,
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'grade_class' => 'sometimes|string|max:50',
            'qr_code' => 'nullable|string|max:100|unique:students,qr_code,' . $studentId,
            'is_active' => 'sometimes|boolean',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:100',
            'transport_enabled' => 'sometimes|boolean',
            'lunch_enabled' => 'sometimes|boolean',
            
            // Transport details (nested)
            'transport' => 'nullable|array',
            'transport.bus_id' => 'sometimes|exists:buses,id',
            'transport.pickup_point' => 'sometimes|string|max:255',
            'transport.dropoff_point' => 'sometimes|string|max:255',
            'transport.pickup_time' => 'nullable|date_format:H:i',
            'transport.dropoff_time' => 'nullable|date_format:H:i',
            'transport.notes' => 'nullable|string|max:500',
            
            // Lunch details (nested)
            'lunch' => 'nullable|array',
            'lunch.diet_type' => 'sometimes|in:normal,special',
            'lunch.diet_notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'admission_number.unique' => 'This admission number is already registered',
            'guardian_email.email' => 'Invalid email format',
            'transport.bus_id.exists' => 'Selected bus does not exist',
            'lunch.diet_type.in' => 'Diet type must be either normal or special',
        ];
    }
}