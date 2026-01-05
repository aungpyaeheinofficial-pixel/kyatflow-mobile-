import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Party, PartyType } from '@/lib/types';
import { Users, Building2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PartyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    name: string;
    type: PartyType;
    phone?: string;
  }) => void;
  party?: Party | null;
}

export function PartyForm({ open, onOpenChange, onSubmit, party }: PartyFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<PartyType>('customer');
  const [phone, setPhone] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (party) {
        // Edit mode
        setName(party.name);
        setType(party.type);
        setPhone(party.phone || '');
      } else {
        // Create mode
        setName('');
        setType('customer');
        setPhone('');
      }
    }
  }, [open, party]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a party name',
        variant: 'destructive',
      });
      return;
    }

    onSubmit?.({
      name: name.trim(),
      type,
      phone: phone.trim() || undefined,
    });

    toast({
      title: party ? 'Party Updated!' : 'Party Added!',
      description: `${party ? 'Updated' : 'Added'} ${name.trim()} successfully`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {party ? 'Edit Party' : 'Add New Party'}
          </DialogTitle>
          <DialogDescription>
            {party ? 'Update party information' : 'Add a new customer or supplier'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Type Toggle */}
          <Tabs value={type} onValueChange={(v) => setType(v as PartyType)}>
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger
                value="customer"
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "flex items-center gap-2 font-medium"
                )}
              >
                <Users className="h-4 w-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger
                value="supplier"
                className={cn(
                  "data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
                  "flex items-center gap-2 font-medium"
                )}
              >
                <Building2 className="h-4 w-4" />
                Supplier
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Party Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter party name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            {party ? 'Update Party' : 'Add Party'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

