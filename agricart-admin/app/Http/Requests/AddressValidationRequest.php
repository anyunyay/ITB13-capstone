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
            'contact_number' => [
                'required',
                'string',
                'regex:/^(\+639|09)\d{9}$/',
            ],
            'address' => 'required|string|max:500',
            'barangay' => 'required|string|in:Sala',
            'city' => 'required|string|in:Cabuyao',
            'province' => 'required|string|in:Laguna',
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
            'contact_number.regex' => 'The contact number must be a valid Philippine mobile number (e.g., +639XXXXXXXXX or 09XXXXXXXXX).',
            'barangay.in' => 'Only Barangay Sala is available for registration.',
            'city.in' => 'Only Cabuyao City is available for registration.',
            'province.in' => 'Only Laguna Province is available for registration.',
        ];
    }
}
