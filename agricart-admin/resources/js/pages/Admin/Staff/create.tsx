import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Permission {
  id: number;
  name: string;
}

interface Props {
  availablePermissions: Permission[];
}

export default function StaffCreate({ availablePermissions }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    permissions: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/staff');
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setData('permissions', [...data.permissions, permissionName]);
    } else {
      setData('permissions', data.permissions.filter(p => p !== permissionName));
    }
  };

  return (
    <AppLayout>
      <Head title="Add Staff Member" />
      
      <div className="m-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/staff">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Staff Member</h1>
            <p className="text-muted-foreground">
              Create a new staff member and assign their permissions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
            <CardDescription>
              Enter the staff member's basic information
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
                    onChange={(e) => setData('name', e.target.value)}
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
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
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className={errors.password_confirmation ? 'border-destructive' : ''}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Permissions</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the permissions this staff member should have. Staff members cannot manage other staff, members, or delete records.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={data.permissions.includes(permission.name)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.name, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                    </div>
                  ))}
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
                  {processing ? 'Creating...' : 'Create Staff Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 