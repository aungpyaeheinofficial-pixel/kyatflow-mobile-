import { useCurrency } from '@/contexts/CurrencyContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function CurrencyToggle() {
  const { showInLakhs, toggleCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
      <Label 
        htmlFor="currency-toggle" 
        className={`text-sm font-medium transition-colors ${!showInLakhs ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        MMK
      </Label>
      <Switch
        id="currency-toggle"
        checked={showInLakhs}
        onCheckedChange={toggleCurrency}
        className="data-[state=checked]:bg-primary"
      />
      <Label 
        htmlFor="currency-toggle" 
        className={`text-sm font-medium transition-colors ${showInLakhs ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        Lakhs <span className="text-xs text-muted-foreground">(သိန်း)</span>
      </Label>
    </div>
  );
}
