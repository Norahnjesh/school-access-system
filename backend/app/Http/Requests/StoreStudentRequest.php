<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'admission_number' => 'required|string|max:50|unique:students,admission_number',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'grade_class' => 'required|string|max:50',
            'qr_code' => 'nullable|string|max:100|unique:students,qr_code',
            'is_active' => 'boolean',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:100',
            'transport_enabled' => 'boolean',
            'lunch_enabled' => 'boolean',
            
            // Transport details (nested)
            'transport' => 'nullable|array',
            'transport.bus_id' => 'required_if:transport_enabled,true|exists:buses,id',
            'transport.pickup_point' => 'required_if:transport_enabled,true|string|max:255',
            'transport.dropoff_point' => 'required_if:transport_enabled,true|string|max:255',
            'transport.pickup_time' => 'nullable|date_format:H:i',
            'transport.dropoff_time' => 'nullable|date_format:H:i',
            'transport.notes' => 'nullable|string|max:500',
            
            // Lunch details (nested)
            'lunch' => 'nullable|array',
            'lunch.diet_type' => 'required_if:lunch_enabled,true|in:normal,special',
            'lunch.diet_notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'admission_number.required' => 'Admission number is required',
            'admission_number.unique' => 'This admission number is already registered',
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'grade_class.required' => 'Grade/Class is required',
            'guardian_email.email' => 'Invalid email format',
            'transport.bus_id.required_if' => 'Please select a bus when transport is enabled',
            'transport.pickup_point.required_if' => 'Pickup point is required when transport is enabled',
            'transport.dropoff_point.required_if' => 'Dropoff point is required when transport is enabled',
            'lunch.diet_type.required_if' => 'Diet type is required when lunch is enabled',
            'lunch.diet_type.in' => 'Diet type must be either normal or special',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'admission_number' => 'admission number',
            'first_name' => 'first name',
            'last_name' => 'last name',
            'grade_class' => 'grade/class',
            'guardian_email' => 'guardian email',
            'transport.bus_id' => 'bus',
            'transport.pickup_point' => 'pickup point',
            'transport.dropoff_point' => 'dropoff point',
            'lunch.diet_type' => 'diet type',
        ];
    }
}