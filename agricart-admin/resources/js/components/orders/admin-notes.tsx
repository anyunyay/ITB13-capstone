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
        <CardTitle className="text-lg font-semibold text-foreground">Admin Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground leading-relaxed">{adminNotes}</p>
        {admin && (
          <p className="text-xs text-muted-foreground mt-3">
            Added by {admin.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
