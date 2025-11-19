import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import PasswordInput from '@/components/ui/password-input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { 
  User, 
  Lock, 
  Phone, 
  MapPin,
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield
} from 'lucide-react';
import { PermissionGuard } from '@/components/common/permission-guard';
import { FlashMessage } from '@/components/common/feedback/flash-message';
import { useTranslation } from '@/hooks/use-translation';
import axios from 'axios';

interface Permission {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  permissions: Array<{ name: string }>;
  default_address?: {
    id: number;
    street: string;
    barangay: string;
    city: string;
    province: string;
    full_address: string;
  };
}

interface Props {
  staff: Staff;
  availablePermissions: Permission[];
  flash?: {
    message?: string;
    error?: string;
  };
}

// Validation functions
const validatePassword = (password: string) => {
  if (!password) return { isValid: true, checks: { minLength: true, hasUpperCase: true, hasLowerCase: true, hasNumber: true } };
  
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    checks: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber
    }
  };
};

const validatePhoneNumber = (phone: string) => {
  if (!phone) return true;
  const philippineFormat = /^(\+639|09)\d{9}$/;
  return philippineFormat.test(phone);
};

const validateEmail = (email: string) => {
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailFormat.test(email);
};

const validateRequired = (value: string) => {
  return value.trim().length > 0;
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function StaffEdit({ staff, availablePermissions, flash }: Props) {
  const t = useTranslation();
  const { data, setData, put, processing, errors } = useForm({
    name: staff.name,
    email: staff.email,
    contact_number: staff.contact_number || '',
    password: '',
    password_confirmation: '',
    permissions: staff.permissions.map(p => p.name),
    street: staff.default_address?.street || '',
    barangay: staff.default_address?.barangay || '',
    city: staff.default_address?.city || '',
    province: staff.default_address?.province || '',
  });

  // Store original values for change detection
  const originalData = {
    name: staff.name,
    email: staff.email,
    contact_number: staff.contact_number || '',
    permissions: staff.permissions.map(p => p.name).sort(),
    street: staff.default_address?.street || '',
    barangay: staff.default_address?.barangay || '',
    city: staff.default_address?.city || '',
    province: staff.default_address?.province || '',
  };

  // Duplicate check states
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isDuplicateContact, setIsDuplicateContact] = useState(false);
  const [isCheckingContact, setIsCheckingContact] = useState(false);
  
  // Change detection state
  const [hasChanges, setHasChanges] = useState(false);

  // Validation state
  const [validation, setValidation] = useState({
    password: validatePassword(data.password),
    phone: validatePhoneNumber(data.contact_number),
    email: validateEmail(data.email),
    name: validateRequired(data.name),
    street: validateRequired(data.street),
    barangay: validateRequired(data.barangay),
    city: validateRequired(data.city),
    province: validateRequired(data.province),
  });

  // Update validation when data changes
  useEffect(() => {
    setValidation({
      password: validatePassword(data.password),
      phone: validatePhoneNumber(data.contact_number),
      email: validateEmail(data.email),
      name: validateRequired(data.name),
      street: validateRequired(data.street),
      barangay: validateRequired(data.barangay),
      city: validateRequired(data.city),
      province: validateRequired(data.province),
    });
  }, [data]);

  // Detect changes in form data
  useEffect(() => {
    const currentPermissions = [...data.permissions].sort();
    const hasDataChanged = 
      data.name !== originalData.name ||
      data.email !== originalData.email ||
      data.contact_number !== originalData.contact_number ||
      data.street !== originalData.street ||
      data.barangay !== originalData.barangay ||
      data.city !== originalData.city ||
      data.province !== originalData.province ||
      data.password !== '' ||
      data.password_confirmation !== '' ||
      JSON.stringify(currentPermissions) !== JSON.stringify(originalData.permissions);
    
    setHasChanges(hasDataChanged);
  }, [data, originalData]);

  // Debounced duplicate check for email (excluding current staff)
  const checkDuplicateEmail = useCallback(
    debounce(async (email: string) => {
      if (!email.trim() || !validateEmail(email) || email === staff.email) {
        setIsDuplicateEmail(false);
        setIsCheckingEmail(false);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await axios.post(route('staff.checkDuplicateEmail'), { email, exclude_id: staff.id });
        setIsDuplicateEmail(response.data.exists);
      } catch (error) {
        console.error('Error checking duplicate email:', error);
        setIsDuplicateEmail(false);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500),
    [staff.email, staff.id]
  );

  // Debounced duplicate check for contact number (excluding current staff)
  const checkDuplicateContact = useCallback(
    debounce(async (contactNumber: string) => {
      if (!contactNumber.trim() || contactNumber === staff.contact_number) {
        setIsDuplicateContact(false);
        setIsCheckingContact(false);
        return;
      }

      setIsCheckingContact(true);
      try {
        const response = await axios.post(route('staff.checkDuplicateContact'), { contact_number: contactNumber, exclude_id: staff.id });
        setIsDuplicateContact(response.data.exists);
      } catch (error) {
        console.error('Error checking duplicate contact:', error);
        setIsDuplicateContact(false);
      } finally {
        setIsCheckingContact(false);
      }
    }, 500),
    [staff.contact_number, staff.id]
  );

  // Handle name change with sanitization
  const handleNameChange = (value: string) => {
    const sanitizedValue = value.replace(/[^a-zA-Z\s\-'.]/g, '');
    setData('name', sanitizedValue);
  };

  // Handle email change with duplicate check
  const handleEmailChange = (value: string) => {
    setData('email', value);
    checkDuplicateEmail(value);
  };

  // Handle contact number change with sanitization and duplicate check
  const handleContactChange = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9+]/g, '');
    setData('contact_number', sanitizedValue);
    checkDuplicateContact(sanitizedValue);
  };

  // Check if form is valid
  const isFormValid = validation.password.isValid && 
                     validation.phone && 
                     validation.email &&
                     validation.name && 
                     validation.street && 
                     validation.barangay && 
                     validation.city && 
                     validation.province && 
                     data.permissions.length > 0 &&
                     !isDuplicateEmail &&
                     !isDuplicateContact &&
                     !isCheckingEmail &&
                     !isCheckingContact &&
                     (data.password === '' || data.password === data.password_confirmation) &&
                     hasChanges; // Only enable if there are changes

  // Define permission groups with their detailed permissions
  const permissionGroups = [
    {
      name: t('admin.inventory_management_permissions'),
      description: t('admin.inventory_permissions_description'),
      permissions: [
        'view inventory',
        'create products',
        'edit products',
        'view archive',
        'archive products',
        'unarchive products',
        'view stocks',
        'create stocks',
        'edit stocks',
        'view sold stock',
        'view stock trail',
        'generate inventory report'
      ]
    },
    {
      name: t('admin.order_management_permissions'),
      description: t('admin.order_permissions_description'),
      permissions: [
        'view orders',
        'manage orders',
        'approve orders',
        'reject orders',
        'process orders',
        'assign logistics',
        'mark orders urgent',
        'unmark orders urgent',
        'view order receipts',
        'generate order report'
      ]
    },
    {
      name: t('admin.sales_management_permissions'),
      description: t('admin.sales_permissions_description'),
      permissions: [
        'view sales',
        'view member sales',
        'export sales data',
        'generate sales report'
      ]
    },
    {
      name: t('admin.logistics_management_permissions'),
      description: t('admin.logistics_permissions_description'),
      permissions: [
        'view logistics',
        'create logistics',
        'edit logistics',
        'deactivate logistics',
        'reactivate logistics',
        'generate logistics report'
      ]
    },
    {
      name: t('admin.trend_analysis_permissions'),
      description: t('admin.trend_permissions_description'),
      permissions: [
        'view trend analysis',
        'generate trend report'
      ]
    }
  ];

  const deletePermissions = [
    'delete products',
    'delete archived products',
    'delete stocks'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/staff/${staff.id}`);
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setData('permissions', [...data.permissions, permissionName]);
    } else {
      setData('permissions', data.permissions.filter(p => p !== permissionName));
    }
  };

  const handleGroupPermissionChange = (groupPermissions: string[], checked: boolean) => {
    if (checked) {
      const newPermissions = [...data.permissions];
      groupPermissions.forEach(permission => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      });
      setData('permissions', newPermissions);
    } else {
      setData('permissions', data.permissions.filter(p => !groupPermissions.includes(p)));
    }
  };

  const isGroupSelected = (groupPermissions: string[]) => {
    return groupPermissions.every(permission => data.permissions.includes(permission));
  };

  const isGroupPartiallySelected = (groupPermissions: string[]) => {
    const selectedCount = groupPermissions.filter(permission => data.permissions.includes(permission)).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };

  return (
    <PermissionGuard 
      permission="edit staffs"
      pageTitle={t('admin.access_denied')}
    >
      <AppLayout>
        <Head title={t('staff.edit_staff_member')} />
        <div className="bg-background">
          <div className="w-full px-2 py-2 flex flex-col gap-2 sm:px-4 sm:py-4 lg:px-8">
            {/* Flash Messages */}
            <FlashMessage flash={flash} />
            
            {/* Page Header */}
            <div className="mb-2 sm:mb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('staff.edit_staff_member')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('staff.update_staff_description')}</p>
                  </div>
                </div>
                {/* Mobile: Icon only */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  asChild
                  className="sm:hidden"
                >
                  <Link href="/admin/staff">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                {/* Desktop: Full button with text */}
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="hidden sm:flex items-center gap-2"
                >
                  <Link href="/admin/staff">
                    <ArrowLeft className="h-4 w-4" />
                    {t('staff.back_to_staff')}
                  </Link>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Display Error */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>{t('admin.error_title')}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {Object.entries(errors).map(([key, message]) => (
                        <li key={key} className="text-sm">{message as string}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Basic Information Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t('staff.staff_information')}</CardTitle>
                  <CardDescription>{t('staff.update_staff_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      {t('staff.name')} <span className="text-destructive">*</span>
                      {validation.name ? (
                        <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                      )}
                    </Label>
                    <Input
                      id="name"
                      placeholder={t('staff.enter_name')}
                      value={data.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={validation.name ? 'border-green-500' : errors.name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t('staff.email')} <span className="text-destructive">*</span>
                      {validation.email && !isDuplicateEmail && !isCheckingEmail ? (
                        <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                      )}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('staff.enter_email')}
                      value={data.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`${validation.email && !isDuplicateEmail ? 'border-green-500' : ''} ${isDuplicateEmail ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                    {isCheckingEmail && (
                      <p className="text-xs text-muted-foreground">
                        {t('staff.checking_email') || 'Checking email...'}
                      </p>
                    )}
                    {isDuplicateEmail && !isCheckingEmail && (
                      <p className="text-xs text-destructive">
                        {t('staff.email_exists') || 'This email is already registered.'}
                      </p>
                    )}
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-sm font-medium">
                      <Phone className="h-4 w-4 inline mr-1" />
                      {t('staff.contact_number')}
                      {validation.phone && !isDuplicateContact && !isCheckingContact ? (
                        <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                      ) : data.contact_number ? (
                        <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                      ) : null}
                    </Label>
                    <Input
                      id="contact_number"
                      type="tel"
                      placeholder={t('admin.philippine_format_only')}
                      value={data.contact_number}
                      onChange={(e) => handleContactChange(e.target.value)}
                      className={`${validation.phone && !isDuplicateContact ? 'border-green-500' : ''} ${isDuplicateContact ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('admin.format_hint')}
                    </p>
                    {isCheckingContact && (
                      <p className="text-xs text-muted-foreground">
                        {t('admin.checking_contact_number') || 'Checking contact number...'}
                      </p>
                    )}
                    {isDuplicateContact && !isCheckingContact && (
                      <p className="text-xs text-destructive">
                        {t('admin.contact_number_exists') || 'This contact number is already registered.'}
                      </p>
                    )}
                    {errors.contact_number && (
                      <p className="text-sm text-red-500">{errors.contact_number}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      <Lock className="h-4 w-4 inline mr-1" />
                      {t('staff.password')} ({t('admin.leave_blank_to_keep')})
                      {validation.password.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                      ) : data.password ? (
                        <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                      ) : null}
                    </Label>
                    <PasswordInput
                      id="password"
                      placeholder={t('admin.create_secure_password')}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={validation.password.isValid ? 'border-green-500' : errors.password ? 'border-red-500' : ''}
                    />
                    {data.password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {validation.password.checks.minLength ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={validation.password.checks.minLength ? 'text-green-600' : 'text-red-600'}>
                            {t('admin.at_least_8_characters')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {validation.password.checks.hasUpperCase ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={validation.password.checks.hasUpperCase ? 'text-green-600' : 'text-red-600'}>
                            {t('admin.one_uppercase_letter')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {validation.password.checks.hasLowerCase ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={validation.password.checks.hasLowerCase ? 'text-green-600' : 'text-red-600'}>
                            {t('admin.one_lowercase_letter')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {validation.password.checks.hasNumber ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={validation.password.checks.hasNumber ? 'text-green-600' : 'text-red-600'}>
                            {t('admin.one_number')}
                          </span>
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium">
                      {t('admin.confirm_password')}
                      {data.password && data.password === data.password_confirmation ? (
                        <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                      ) : data.password_confirmation ? (
                        <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                      ) : null}
                    </Label>
                    <PasswordInput
                      id="password_confirmation"
                      placeholder={t('admin.confirm_password')}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={data.password && data.password === data.password_confirmation ? 'border-green-500' : errors.password_confirmation ? 'border-red-500' : ''}
                    />
                    {data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                      <p className="text-xs text-destructive">
                        {t('admin.passwords_do_not_match') || 'Passwords do not match'}
                      </p>
                    )}
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('staff.address_information')}
                  </CardTitle>
                  <CardDescription>{t('staff.update_staff_address')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm font-medium">
                        {t('staff.street')} <span className="text-destructive">*</span>
                        {validation.street ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </Label>
                      <Input
                        id="street"
                        placeholder="Enter street address"
                        value={data.street}
                        onChange={(e) => setData('street', e.target.value)}
                        className={validation.street ? 'border-green-500' : errors.street ? 'border-red-500' : ''}
                        required
                      />
                      {errors.street && (
                        <p className="text-sm text-red-500">{errors.street}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barangay" className="text-sm font-medium">
                        {t('staff.barangay')} <span className="text-destructive">*</span>
                        {validation.barangay ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </Label>
                      <Input
                        id="barangay"
                        placeholder="Enter barangay"
                        value={data.barangay}
                        onChange={(e) => setData('barangay', e.target.value)}
                        className={validation.barangay ? 'border-green-500' : errors.barangay ? 'border-red-500' : ''}
                        required
                      />
                      {errors.barangay && (
                        <p className="text-sm text-red-500">{errors.barangay}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        {t('staff.city')} <span className="text-destructive">*</span>
                        {validation.city ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={data.city}
                        onChange={(e) => setData('city', e.target.value)}
                        className={validation.city ? 'border-green-500' : errors.city ? 'border-red-500' : ''}
                        required
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm font-medium">
                        {t('staff.province')} <span className="text-destructive">*</span>
                        {validation.province ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </Label>
                      <Input
                        id="province"
                        placeholder="Enter province"
                        value={data.province}
                        onChange={(e) => setData('province', e.target.value)}
                        className={validation.province ? 'border-green-500' : errors.province ? 'border-red-500' : ''}
                        required
                      />
                      {errors.province && (
                        <p className="text-sm text-red-500">{errors.province}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('staff.permissions')}
                  </CardTitle>
                  <CardDescription>{t('staff.select_access_areas')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {permissionGroups.map((group) => (
                    <div key={group.name} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`group-${group.name}`}
                          checked={isGroupSelected(group.permissions)}
                          onCheckedChange={(checked) => 
                            handleGroupPermissionChange(group.permissions, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`group-${group.name}`}
                          className="text-base font-medium cursor-pointer"
                        >
                          {group.name}
                          {isGroupPartiallySelected(group.permissions) && (
                            <span className="text-xs text-muted-foreground ml-2">(Partial)</span>
                          )}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6 mb-3">
                        {group.description}
                      </p>
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission}`}
                              checked={data.permissions.includes(permission)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`permission-${permission}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Delete Permissions */}
                  <div className="border rounded-lg p-4 bg-amber-50/50">
                    <Label className="text-base font-medium">{t('admin.delete_permissions_advanced')}</Label>
                    <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 my-3">
                      <p className="text-sm text-amber-800 mb-2">
                        <strong>{t('admin.delete_permissions_warning')}</strong> {t('admin.delete_permissions_description')}
                      </p>
                      <p className="text-sm text-amber-700">
                        {t('admin.delete_permissions_caution')}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {deletePermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`delete-permission-${permission}`}
                            checked={data.permissions.includes(permission)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`delete-permission-${permission}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errors.permissions && (
                    <p className="text-sm text-destructive">{errors.permissions}</p>
                  )}
                </CardContent>
              </Card>

              {/* Form Actions */}
              <Card className="shadow-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={isFormValid ? "default" : "secondary"}>
                        {!hasChanges ? t('admin.no_changes') || 'No changes made' : isFormValid ? t('admin.ready_to_submit') : t('admin.incomplete_form')}
                      </Badge>
                      {isFormValid && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/admin/staff">{t('ui.cancel')}</Link>
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={processing || !isFormValid}
                        className="min-w-[120px]"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('ui.updating')}
                          </>
                        ) : (
                          t('staff.update_staff')
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
}
