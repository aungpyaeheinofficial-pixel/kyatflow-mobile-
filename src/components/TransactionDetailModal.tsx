import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { PaymentMethodBadge } from '@/components/PaymentMethodBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, TransactionCategory, PaymentMethod, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/types';
import { formatInputWithCommas, parseNumberInput } from '@/lib/formatters';
import { 
  Edit, 
  Copy, 
  Trash2, 
  Upload, 
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, updates: Partial<Transaction>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onDuplicate,
}: TransactionDetailModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Transaction>>({});

  if (!transaction) return null;

  const categories = transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleEdit = () => {
    setEditedData({
      amount: transaction.amount,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      type: transaction.type,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onUpdate && editedData.amount && editedData.category) {
      onUpdate(transaction.id, {
        ...editedData,
        amount: typeof editedData.amount === 'string' 
          ? parseNumberInput(editedData.amount) 
          : editedData.amount,
      });
      setIsEditing(false);
      toast({
        title: 'Transaction Updated',
        description: 'Transaction has been updated successfully.',
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      onDelete?.(transaction.id);
      onOpenChange(false);
    }
  };

  const handleDuplicate = () => {
    onDuplicate?.(transaction);
    toast({
      title: 'Transaction Duplicated',
      description: 'A new transaction has been created with the same details.',
    });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server and get URL
      const url = URL.createObjectURL(file);
      onUpdate?.(transaction.id, { receiptUrl: url });
      toast({
        title: 'Receipt Uploaded',
        description: 'Receipt has been attached to this transaction.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDuplicate}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </Button>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                title="Delete"
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Type & Amount */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                transaction.type === 'income' 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {transaction.type === 'income' ? 'Income' : 'Expense'}
                </p>
                {isEditing ? (
                  <Input
                    type="text"
                    value={typeof editedData.amount === 'string' ? editedData.amount : editedData.amount?.toString() || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      amount: formatInputWithCommas(e.target.value),
                    })}
                    className="text-2xl font-bold h-auto p-0 border-0 bg-transparent"
                  />
                ) : (
                  <MoneyDisplay 
                    amount={transaction.type === 'income' ? transaction.amount : -transaction.amount} 
                    size="xl" 
                    showSign
                    className={transaction.type === 'income' ? "text-success" : "text-destructive"}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(transaction.date, 'MMM dd, yyyy hh:mm a')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Payment Method</Label>
              {isEditing ? (
                <Select
                  value={editedData.paymentMethod || transaction.paymentMethod}
                  onValueChange={(v) => setEditedData({ ...editedData, paymentMethod: v as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PAYMENT_METHODS).map((method) => (
                      <SelectItem key={method} value={method}>
                        {PAYMENT_METHODS[method as PaymentMethod].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <PaymentMethodBadge method={transaction.paymentMethod} size="md" />
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs text-muted-foreground">Category</Label>
              {isEditing ? (
                <Select
                  value={editedData.category || transaction.category}
                  onValueChange={(v) => setEditedData({ ...editedData, category: v as TransactionCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 rounded-lg bg-secondary/50">
                  <span className="text-sm">
                    {categories[transaction.category]?.label || transaction.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Notes
            </Label>
            {isEditing ? (
              <Textarea
                value={editedData.notes || transaction.notes || ''}
                onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                placeholder="Add notes..."
                className="min-h-[80px]"
              />
            ) : (
              <div className="p-3 rounded-lg bg-secondary/50 min-h-[60px]">
                <p className="text-sm">{transaction.notes || 'No notes'}</p>
              </div>
            )}
          </div>

          {/* Receipt */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Receipt / Photo</Label>
            {transaction.receiptUrl ? (
              <div className="relative">
                <img 
                  src={transaction.receiptUrl} 
                  alt="Receipt" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => onUpdate?.(transaction.id, { receiptUrl: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <Label htmlFor="receipt-upload" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReceiptUpload}
                  />
                </Label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditing(false);
                  setEditedData({});
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

