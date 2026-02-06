<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusRequest extends FormRequest
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
            'bus_number' => 'required|string|max:50|unique:buses,bus_number',
            'bus_name' => 'nullable|string|max:100',
            'capacity' => 'nullable|integer|min:1|max:100',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:20',
            'route_description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'bus_number.required' => 'Bus number is required',
            'bus_number.unique' => 'This bus number is already registered',
            'capacity.integer' => 'Capacity must be a number',
            'capacity.min' => 'Capacity must be at least 1',
            'capacity.max' => 'Capacity cannot exceed 100',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'bus_number' => 'bus number',
            'bus_name' => 'bus name',
            'driver_name' => 'driver name',
            'driver_phone' => 'driver phone',
        ];
    }
}