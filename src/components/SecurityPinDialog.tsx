import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Shield } from 'lucide-react';

interface SecurityPinDialogProps {
  open: boolean;
  onVerify: (pin: string) => boolean;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export function SecurityPinDialog({
  open,
  onVerify,
  onCancel,
  title = 'Enter PIN',
  description = 'This transaction requires PIN verification',
}: SecurityPinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError(true);
      return;
    }

    const isValid = onVerify(pin);
    if (isValid) {
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCancel = () => {
    setPin('');
    setError(false);
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPin(value);
                setError(false);
              }}
              className={cn(
                'text-center text-2xl font-bold tracking-widest h-16',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              placeholder="••••"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive text-center">
                Invalid PIN. Please try again.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={pin.length < 4}>
              <Lock className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

