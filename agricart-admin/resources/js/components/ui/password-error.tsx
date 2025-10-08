import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordErrorProps {
  error?: string;
  className?: string;
  showError?: boolean;
}

export default function PasswordError({ error, className, showError = true }: PasswordErrorProps) {
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
        errors.push('Password must be at least 8 characters long');
      } else if (trimmedLine.includes('contain at least one symbol')) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
      } else if (trimmedLine.includes('contain at least one number')) {
        errors.push('Password must contain at least one number (0-9)');
      } else if (trimmedLine.includes('contain at least one uppercase')) {
        errors.push('Password must contain at least one uppercase letter (A-Z)');
      } else if (trimmedLine.includes('contain at least one lowercase')) {
        errors.push('Password must contain at least one lowercase letter (a-z)');
      } else if (trimmedLine.includes('contain letters')) {
        errors.push('Password must contain letters');
      } else if (trimmedLine.includes('confirmed')) {
        errors.push('Password confirmation does not match');
      } else if (trimmedLine.includes('regex') || trimmedLine.includes('format')) {
        errors.push('Password cannot contain spaces');
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
            <p className="font-medium">Password Error:</p>
            <p>{specificError}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
