import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PartyForm } from '@/components/PartyForm';
import { QuickTransactionForm } from '@/components/QuickTransactionForm';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { useSetFAB } from '@/contexts/FABContext';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListSkeleton } from '@/components/EnhancedSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useParties } from '@/hooks/use-parties';
import { useTransactions } from '@/hooks/use-transactions';
import { Party } from '@/lib/types';
import { 
  Search, 
  Plus, 
  Users, 
  Building2, 
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function PartiesContent() {
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [repeatTransaction, setRepeatTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { parties, isLoading: partiesLoading, deleteParty, createParty, updateParty } = useParties();
  const { transactions, createTransaction } = useTransactions();
  const setFAB = useSetFAB();

  const handleQuickIncome = () => {
    setTransactionType('income');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  };

  const handleQuickExpense = () => {
    setTransactionType('expense');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  };

  const handleRepeatLast = () => {
    if (transactions.length > 0) {
      setRepeatTransaction(transactions[transactions.length - 1]);
      setShowTransactionForm(true);
    }
  };

  useEffect(() => {
    setFAB({
      onQuickIncome: handleQuickIncome,
      onQuickExpense: handleQuickExpense,
      onRepeatLast: handleRepeatLast,
    });
  }, [setFAB, transactions]);
  
  const filteredParties = parties.filter(party => {
    if (activeTab !== 'all' && party.type !== activeTab) return false;
    if (searchQuery && !party.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const customers = parties.filter(p => p.type === 'customer');
  const suppliers = parties.filter(p => p.type === 'supplier');
  
  const totalReceivables = customers.reduce((sum, p) => sum + Math.max(0, p.balance), 0);
  const totalPayables = suppliers.reduce((sum, p) => sum + Math.abs(Math.min(0, p.balance)), 0);

  const handleAddParty = () => {
    setEditingParty(null);
    setShowPartyForm(true);
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setShowPartyForm(true);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold lg:text-3xl">Parties</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage customers and suppliers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyToggle />
          <Button onClick={handleAddParty}>
            <Plus className="h-4 w-4 mr-2" />
            Add Party
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Receivables</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">ရရန်ရှိငွေ</p>
                <MoneyDisplay amount={totalReceivables} size="lg" className="mt-2 text-success" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payables</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">ပေးရန်ရှိငွေ</p>
                <MoneyDisplay amount={totalPayables} size="lg" className="mt-2 text-destructive" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search - Mobile Friendly */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Filter parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({parties.length})</SelectItem>
                <SelectItem value="customer">Customers ({customers.length})</SelectItem>
                <SelectItem value="supplier">Suppliers ({suppliers.length})</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search parties..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties List */}
      <Card>
        <CardContent className="p-0">
          {partiesLoading ? (
            <ListSkeleton count={4} />
          ) : filteredParties.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No parties found"
              description={searchQuery ? "Try adjusting your search" : "Add your first customer or supplier to get started"}
              actionLabel="Add Party"
              onAction={handleAddParty}
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredParties.map((party, index) => (
              <motion.div
                key={party.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  delay: index * 0.03, 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 hover:bg-secondary/50 transition-colors cursor-pointer group touch-manipulation rounded-lg",
                  "min-h-[64px] sm:min-h-[72px]"
                )}
                onClick={() => handleEditParty(party)}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-base sm:text-lg font-bold shrink-0",
                    party.type === 'customer' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {party.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{party.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 sm:mt-1 flex-wrap">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full whitespace-nowrap",
                        party.type === 'customer' 
                          ? "bg-primary/10 text-primary" 
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {party.type === 'customer' ? 'Customer' : 'Supplier'}
                      </span>
                      {party.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <Phone className="h-3 w-3" />
                          {party.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2 sm:ml-4">
                  <MoneyDisplay 
                    amount={Math.abs(party.balance)} 
                    size="md"
                    className={cn(
                      "font-bold",
                      party.balance >= 0 ? "text-success" : "text-destructive"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 whitespace-nowrap">
                    {party.balance >= 0 ? 'Receivable' : 'Payable'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete ${party.name}?`)) {
                      deleteParty(party.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PartyForm
        open={showPartyForm}
        onOpenChange={(open) => {
          setShowPartyForm(open);
          if (!open) {
            setEditingParty(null);
          }
        }}
        party={editingParty}
        onSubmit={(data) => {
          if (editingParty) {
            // Update existing party
            updateParty({
              id: editingParty.id,
              updates: {
                name: data.name,
                type: data.type,
                phone: data.phone,
              },
            });
          } else {
            // Create new party
            createParty({
              name: data.name,
              type: data.type,
              phone: data.phone,
              balance: 0,
            });
          }
        }}
      />

      <QuickTransactionForm
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        initialType={transactionType}
        lastTransaction={repeatTransaction}
        transactions={transactions}
        onSubmit={(data) => {
          createTransaction({
            date: data.date || new Date(),
            amount: data.amount,
            type: data.type,
            category: data.category,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            partyId: data.partyId,
          });
        }}
      />

    </AppLayout>
  );
}

export default function Parties() {
  return (
    <CurrencyProvider>
      <PartiesContent />
    </CurrencyProvider>
  );
}
