import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function PasswordChange() {
  const t = useTranslation();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Head title={t('ui.change_password_required')} />
      
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-400" />
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-white">
            {t('ui.password_change_required')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-300 px-2">
            {t('ui.security_password_change_message')}
          </p>
        </div>

        <Alert className="bg-amber-900/20 border-amber-700 text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription>
            {t('ui.temporary_password_message')}
          </AlertDescription>
        </Alert>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{t('admin.change_password')}</CardTitle>
            <CardDescription className="text-gray-300">
              {t('member.enter_new_password')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-gray-200 text-sm">{t('admin.current_password')}</Label>
                <PasswordInput
                  id="current_password"
                  value={data.current_password}
                  onChange={(e) => setData('current_password', e.target.value)}
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 ${errors.current_password ? 'border-red-500' : ''}`}
                  placeholder={t('ui.enter_current_password')}
                  required
                />
                {errors.current_password && (
                  <p className="text-xs sm:text-sm text-red-400">{errors.current_password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 text-sm">{t('admin.new_password')}</Label>
                <PasswordInput
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder={t('ui.enter_new_password')}
                  required
                />
                {errors.password && (
                  <p className="text-xs sm:text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-gray-200 text-sm">{t('admin.confirm_password')}</Label>
                <PasswordInput
                  id="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                  placeholder={t('ui.confirm_your_new_password')}
                  required
                />
                {errors.password_confirmation && (
                  <p className="text-xs sm:text-sm text-red-400">{errors.password_confirmation}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 py-2 sm:py-3" 
                disabled={processing}
              >
                {processing ? t('ui.saving') : t('admin.change_password')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            {t('ui.need_help_contact_admin')}
          </p>
        </div>
      </div>
    </div>
  );
}
