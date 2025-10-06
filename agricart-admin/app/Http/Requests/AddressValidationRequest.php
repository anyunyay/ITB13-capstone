<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressValidationRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|in:home,work,other',
            'label' => 'nullable|string|max:255',
            'street' => 'required|string|max:500',
            'barangay' => 'required|string|in:Sala',
            'city' => 'required|string|in:Cabuyao',
            'province' => 'required|string|in:Laguna',
            'postal_code' => 'required|string|max:10',
            'is_default' => 'boolean',
            'contact_number' => [
                'required',
                'string',
                'regex:/^(\+639|09)\d{9}$/',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Please select an address type.',
            'type.in' => 'Address type must be home, work, or other.',
            'street.required' => 'Street address is required.',
            'street.max' => 'Street address must not exceed 500 characters.',
            'barangay.required' => 'Barangay is required.',
            'barangay.in' => 'Only Barangay Sala is available for registration.',
            'city.required' => 'City is required.',
            'city.in' => 'Only Cabuyao City is available for registration.',
            'province.required' => 'Province is required.',
            'province.in' => 'Only Laguna Province is available for registration.',
            'postal_code.required' => 'Postal code is required.',
            'postal_code.max' => 'Postal code must not exceed 10 characters.',
            'contact_number.required' => 'Contact number is required.',
            'contact_number.regex' => 'The contact number must be a valid Philippine mobile number (e.g., +639XXXXXXXXX or 09XXXXXXXXX).',
        ];
    }
}
