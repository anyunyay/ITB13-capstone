import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PasswordInput from '@/components/ui/password-input';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PermissionGuard } from '@/components/permission-guard';

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
}

export default function StaffEdit({ staff, availablePermissions }: Props) {
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

  // Define permission groups with their detailed permissions
  const permissionGroups = [
    {
      name: 'Inventory Management',
      description: 'Full access to inventory management including products, archive, stocks, and tracking',
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
      name: 'Order Management',
      description: 'Access to order management and processing',
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
      name: 'Sales Management',
      description: 'Access to sales data and reporting',
      permissions: [
        'view sales',
        'view member sales',
        'export sales data',
        'generate sales report'
      ]
    },
    {
      name: 'Logistics Management',
      description: 'Access to logistics management and operations',
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
      name: 'Trend Analysis',
      description: 'Access to trend analysis and reporting',
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
      // Add all permissions in the group
      const newPermissions = [...data.permissions];
      groupPermissions.forEach(permission => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      });
      setData('permissions', newPermissions);
    } else {
      // Remove all permissions in the group
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
      pageTitle="Edit Staff Access Denied"
    >
      <AppLayout>
        <Head title={`Edit Staff Member - ${staff.name}`} />
        <div className="min-h-screen bg-background">
          <div className="w-full flex flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/staff">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Staff Member</h1>
            <p className="text-muted-foreground">
              Update staff member information and permissions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
            <CardDescription>
              Update the staff member's information and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => {
                      // Only allow alphabetic characters and spaces
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setData('name', value);
                    }}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    type="tel"
                    value={data.contact_number}
                    onChange={(e) => setData('contact_number', e.target.value)}
                    className={errors.contact_number ? 'border-destructive' : ''}
                    placeholder="+63 9XX XXX XXXX (Philippine format only)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: +639XXXXXXXXX or 09XXXXXXXXX
                  </p>
                  {errors.contact_number && (
                    <p className="text-sm text-destructive">{errors.contact_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password (leave blank to keep current)</Label>
                  <PasswordInput
                    id="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password</Label>
                  <PasswordInput
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className={errors.password_confirmation ? 'border-destructive' : ''}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Address Information</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update the staff member's address.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      type="text"
                      value={data.street}
                      onChange={(e) => setData('street', e.target.value)}
                      className={errors.street ? 'border-destructive' : ''}
                      placeholder="Enter street address"
                    />
                    {errors.street && (
                      <p className="text-sm text-destructive">{errors.street}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input
                      id="barangay"
                      type="text"
                      value={data.barangay}
                      onChange={(e) => setData('barangay', e.target.value)}
                      className={errors.barangay ? 'border-destructive' : ''}
                      placeholder="Enter barangay"
                    />
                    {errors.barangay && (
                      <p className="text-sm text-destructive">{errors.barangay}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={data.city}
                      onChange={(e) => setData('city', e.target.value)}
                      className={errors.city ? 'border-destructive' : ''}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      type="text"
                      value={data.province}
                      onChange={(e) => setData('province', e.target.value)}
                      className={errors.province ? 'border-destructive' : ''}
                      placeholder="Enter province"
                    />
                    {errors.province && (
                      <p className="text-sm text-destructive">{errors.province}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Access Permission Groups */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Access Permissions</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the main access areas this staff member should have.
                    </p>
                  </div>

                  <div className="space-y-4">
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
                  </div>
                </div>

                {/* Delete Permissions */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Delete Permissions (Advanced)</Label>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-amber-800 mb-2">
                        <strong>⚠️ Warning:</strong> These permissions allow staff members to permanently delete records from the database.
                      </p>
                      <p className="text-sm text-amber-700">
                        Only grant these permissions to trusted staff members who understand the consequences of permanently deleting data. Note: Staff and Member management use "deactivate" permissions instead of delete.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </div>

              <div className="flex items-center justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href="/admin/staff">Cancel</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  {processing ? 'Updating...' : 'Update Staff Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
} 