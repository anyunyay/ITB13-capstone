import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Admin {
  name: string;
}

interface AdminNotesProps {
  adminNotes: string;
  admin?: Admin;
}

export const AdminNotes = ({ adminNotes, admin }: AdminNotesProps) => {
  if (!adminNotes) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{adminNotes}</p>
        {admin && (
          <p className="text-xs text-gray-500 mt-2">
            Added by {admin.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
