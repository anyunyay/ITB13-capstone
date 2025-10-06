import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle } from 'lucide-react';

export default function PasswordChange() {
  const { data, setData, post, processing, errors } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/password/change');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Head title="Change Password Required" />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Password Change Required
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            For security reasons, you must change your password before accessing the system.
          </p>
        </div>

        <Alert className="bg-amber-900/20 border-amber-700 text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription>
            You are using a temporary password set by the administrator. Please create a new, secure password to continue.
          </AlertDescription>
        </Alert>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Change Your Password</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your current password and choose a new secure password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-gray-200">Current Password</Label>
                <PasswordInput
                  id="current_password"
                  value={data.current_password}
                  onChange={(e) => setData('current_password', e.target.value)}
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 ${errors.current_password ? 'border-red-500' : ''}`}
                  placeholder="Enter your current password"
                  required
                />
                {errors.current_password && (
                  <p className="text-sm text-red-400">{errors.current_password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">New Password</Label>
                <PasswordInput
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your new password"
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-gray-200">Confirm New Password</Label>
                <PasswordInput
                  id="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                  placeholder="Confirm your new password"
                  required
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-400">{errors.password_confirmation}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0" 
                disabled={processing}
              >
                {processing ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Need help? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
