import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { Progress } from '@/components/ui/progress';
import { targetStorage } from '@/lib/targets';
import { useState, useEffect } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatInputWithCommas, parseNumberInput } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

interface TargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIncome: number;
}

export function TargetDialog({ open, onOpenChange, currentIncome }: TargetDialogProps) {
  const { toast } = useToast();
  const [target, setTarget] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const currentTarget = targetStorage.getMonthlyIncomeTarget();
  const progress = currentTarget > 0 ? (currentIncome / currentTarget) * 100 : 0;
  const isMet = currentIncome >= currentTarget && currentTarget > 0;

  useEffect(() => {
    if (open) {
      setTarget(currentTarget > 0 ? currentTarget.toString() : '');
      setIsEditing(false);
    }
  }, [open, currentTarget]);

  const handleSave = () => {
    const targetValue = parseNumberInput(target);
    if (targetValue <= 0) {
      toast({
        title: 'Invalid Target',
        description: 'Please enter a valid target amount',
        variant: 'destructive',
      });
      return;
    }
    targetStorage.setMonthlyIncomeTarget(targetValue);
    setIsEditing(false);
    toast({
      title: 'Target Updated',
      description: 'Monthly income target has been set successfully.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Monthly Income Target
          </DialogTitle>
          <DialogDescription>
            Set and track your monthly income goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {!isEditing && currentTarget > 0 ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Target</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </div>
                <MoneyDisplay amount={currentTarget} size="lg" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Income</span>
                  <MoneyDisplay amount={currentIncome} size="sm" />
                </div>
                <Progress value={Math.min(progress, 100)} className="h-3" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={cn(
                    "font-semibold",
                    isMet ? "text-success" : "text-muted-foreground"
                  )}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>

              {isMet && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Target achieved! 🎉</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    targetStorage.clearTarget();
                    toast({
                      title: 'Target Cleared',
                      description: 'Monthly target has been removed.',
                    });
                    onOpenChange(false);
                  }}
                >
                  Clear Target
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                >
                  Change Target
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="target">Monthly Income Target (MMK)</Label>
                <div className="relative">
                  <Input
                    id="target"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={target}
                    onChange={(e) => setTarget(formatInputWithCommas(e.target.value))}
                    className="text-2xl font-bold h-14 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    MMK
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setTarget(currentTarget > 0 ? currentTarget.toString() : '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                >
                  Save Target
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

