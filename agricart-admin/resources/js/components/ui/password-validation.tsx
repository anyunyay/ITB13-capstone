import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordValidationProps {
  password: string;
  className?: string;
}

interface ValidationRule {
  id: string;
  text: string;
  met: boolean;
  required: boolean;
}

export default function PasswordValidation({ password, className }: PasswordValidationProps) {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);

  useEffect(() => {
    const rules: ValidationRule[] = [
      {
        id: 'length',
        text: 'At least 8 characters',
        met: password.length >= 8,
        required: true,
      },
      {
        id: 'uppercase',
        text: 'Contains uppercase letter (A-Z)',
        met: /[A-Z]/.test(password),
        required: true,
      },
      {
        id: 'lowercase',
        text: 'Contains lowercase letter (a-z)',
        met: /[a-z]/.test(password),
        required: true,
      },
      {
        id: 'number',
        text: 'Contains number (0-9)',
        met: /[0-9]/.test(password),
        required: true,
      },
      {
        id: 'symbol',
        text: 'Contains special character (!@#$%^&*)',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        required: true,
      },
      {
        id: 'no-spaces',
        text: 'No spaces allowed',
        met: !/\s/.test(password),
        required: true,
      },
    ];

    setValidationRules(rules);
  }, [password]);

  const getPasswordStrength = () => {
    const metRules = validationRules.filter(rule => rule.met).length;
    const totalRules = validationRules.length;
    
    if (metRules === 0) return { level: 'none', color: 'text-gray-400', bgColor: 'bg-gray-200' };
    if (metRules <= 2) return { level: 'weak', color: 'text-red-500', bgColor: 'bg-red-500' };
    if (metRules <= 3) return { level: 'medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    return { level: 'strong', color: 'text-green-500', bgColor: 'bg-green-500' };
  };

  const strength = getPasswordStrength();
  const strengthPercentage = (validationRules.filter(rule => rule.met).length / validationRules.length) * 100;

  // Don't show validation if password is empty
  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Password Strength Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={cn('text-sm font-medium capitalize', strength.color)}>
            {strength.level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', strength.bgColor)}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Validation Rules */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
        <div className="space-y-1">
          {validationRules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-2 text-sm">
              {rule.met ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className={cn(
                rule.met ? 'text-green-600' : 'text-red-600'
              )}>
                {rule.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
