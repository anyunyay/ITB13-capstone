import { router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function LoginModal({ 
  isOpen, 
  onClose,
  title,
  description
}: LoginModalProps) {
  const t = useTranslation();

  const handleLogin = () => {
    onClose();
    router.visit('/login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="w-[90vw] max-w-md mx-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center sm:text-left">
            {title || t('customer.login_required') || 'Login Required'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base md:text-lg text-center sm:text-left">
            {description || t('customer.login_required_description') || 'You must be logged in to access this feature.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
          <Button 
            variant="outline"
            className="flex-1 text-sm sm:text-base md:text-lg py-2.5 sm:py-3 order-2 sm:order-1" 
            onClick={onClose}
          >
            {t('customer.cancel') || 'Cancel'}
          </Button>
          <Button 
            className="flex-1 text-sm sm:text-base md:text-lg py-2.5 sm:py-3 order-1 sm:order-2" 
            onClick={handleLogin}
          >
            {t('customer.go_to_login') || 'Go to Login'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
