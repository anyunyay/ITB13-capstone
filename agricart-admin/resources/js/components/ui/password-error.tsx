import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface PasswordErrorProps {
  error?: string;
  className?: string;
  showError?: boolean;
}

export default function PasswordError({ error, className, showError = true }: PasswordErrorProps) {
  const t = useTranslation();
  // Don't show error if showError is false or no error exists
  if (!error || !showError) return null;

  // Parse Laravel password validation errors and make them more user-friendly
  const getSpecificErrors = (errorMessage: string) => {
    const errors: string[] = [];
    
    // Handle multiple errors separated by newlines or semicolons
    const errorLines = errorMessage.split(/\n|;|\./).filter(line => line.trim());
    
    errorLines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('at least 8 characters')) {
        errors.push(t('validation.password_too_short'));
      } else if (trimmedLine.includes('contain at least one symbol')) {
        errors.push(t('validation.password_symbol'));
      } else if (trimmedLine.includes('contain at least one number')) {
        errors.push(t('validation.password_number'));
      } else if (trimmedLine.includes('contain at least one uppercase')) {
        errors.push(t('validation.password_uppercase'));
      } else if (trimmedLine.includes('contain at least one lowercase')) {
        errors.push(t('validation.password_lowercase'));
      } else if (trimmedLine.includes('contain letters')) {
        errors.push(t('validation.password_letters'));
      } else if (trimmedLine.includes('confirmed')) {
        errors.push(t('validation.password_confirmation'));
      } else if (trimmedLine.includes('regex') || trimmedLine.includes('format')) {
        errors.push(t('validation.password_no_spaces'));
      } else if (trimmedLine.trim()) {
        // If no specific pattern matches, use the original error
        errors.push(trimmedLine);
      }
    });
    
    // If no specific errors found, return the original error
    if (errors.length === 0) {
      errors.push(errorMessage);
    }
    
    return errors;
  };

  const specificErrors = getSpecificErrors(error);

  return (
    <div className={cn('space-y-2', className)}>
      {specificErrors.map((specificError, index) => (
        <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-medium">{t('validation.password_error_header')}</p>
            <p>{specificError}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
