import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { PermissionGuard } from '@/components/permission-guard';
import { PermissionGate } from '@/components/permission-gate';

interface Staff {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  created_at: string;
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
  staff: Staff[];
}

export default function StaffIndex({ staff }: Props) {
  const { props } = usePage<SharedData>();
  const { createStaffs, editStaffs, deleteStaffs } = props.permissions || {};

  return (
    <PermissionGuard 
      permissions={['view staffs', 'create staffs', 'edit staffs', 'delete staffs']}
      pageTitle="Staff Management Access Denied"
    >
      <AppLayout>
        <Head title="Staff Management" />
        
        <div className="m-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage staff members and their permissions
            </p>
          </div>
          <div className="flex gap-2">
            {createStaffs && (
              <Button asChild>
                <Link href="/admin/staff/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Link>
              </Button>
            )}
            <PermissionGate permission="generate staff report">
              <Button variant="outline" asChild>
                <Link href={route('admin.staff.report')}>
                  Generate Report
                </Link>
              </Button>
            </PermissionGate>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              A list of all staff members and their assigned permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.contact_number || 'N/A'}</TableCell>
                    <TableCell>
                      {member.default_address ? 
                        `${member.default_address.street}, ${member.default_address.barangay}, ${member.default_address.city}, ${member.default_address.province}` 
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission) => (
                          <Badge key={permission.name} variant="secondary" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {member.permissions.length === 0 && (
                          <span className="text-muted-foreground text-sm">No permissions</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/staff/${member.id}/edit`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {editStaffs && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/staff/${member.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {deleteStaffs && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this staff member?')) {
                                router.delete(`/admin/staff/${member.id}`);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No staff members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
    </PermissionGuard>
  );
} 