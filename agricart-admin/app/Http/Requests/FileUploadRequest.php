<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\FileUploadService;

class FileUploadRequest extends FormRequest
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
        $category = $this->route('category') ?? $this->input('category');
        $required = $this->input('required', true);

        if (!$category) {
            return [
                'category' => 'required|string|in:products,documents,delivery-proofs,avatars'
            ];
        }

        try {
            return [
                'file' => FileUploadService::getValidationRules($category, $required),
                'category' => 'required|string|in:products,documents,delivery-proofs,avatars',
                'custom_name' => 'nullable|string|max:255',
            ];
        } catch (\InvalidArgumentException $e) {
            return [
                'category' => 'required|string|in:products,documents,delivery-proofs,avatars'
            ];
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'A file is required for upload.',
            'file.file' => 'The uploaded item must be a valid file.',
            'file.mimes' => 'The file type is not allowed for this category.',
            'file.max' => 'The file size exceeds the maximum allowed size.',
            'category.required' => 'File category is required.',
            'category.in' => 'Invalid file category specified.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'file' => 'uploaded file',
            'category' => 'file category',
            'custom_name' => 'custom file name',
        ];
    }
}