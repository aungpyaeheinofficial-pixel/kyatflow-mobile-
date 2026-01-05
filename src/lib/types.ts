// KyatFlow Type Definitions

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'cash' 
  | 'kbzpay' 
  | 'wavemoney' 
  | 'cbpay' 
  | 'ayapay'
  | 'bank_transfer';

export type TransactionCategory = 
  | 'sales'
  | 'services'
  | 'other_income'
  | 'inventory'
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'transport'
  | 'marketing'
  | 'equipment'
  | 'other_expense';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptUrl?: string;
  partyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PartyType = 'customer' | 'supplier';

export interface Party {
  id: string;
  name: string;
  phone?: string;
  type: PartyType;
  balance: number; // Positive = receivable, Negative = payable
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  receivables: number;
  payables: number;
  totalBalance: number;
  pendingPayments: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  color: string;
}

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  cash: { label: 'Cash', icon: 'banknote', color: 'hsl(152, 69%, 40%)' },
  kbzpay: { label: 'KBZPay', icon: 'smartphone', color: 'hsl(211, 100%, 50%)' },
  wavemoney: { label: 'Wave Money', icon: 'waves', color: 'hsl(45, 100%, 50%)' },
  cbpay: { label: 'CB Pay', icon: 'credit-card', color: 'hsl(262, 80%, 50%)' },
  ayapay: { label: 'AYA Pay', icon: 'wallet', color: 'hsl(339, 100%, 50%)' },
  bank_transfer: { label: 'Bank Transfer', icon: 'building-2', color: 'hsl(210, 40%, 40%)' },
};

export const INCOME_CATEGORIES: Record<string, { label: string; labelMm: string }> = {
  sales: { label: 'Sales', labelMm: 'အရောင်း' },
  services: { label: 'Services', labelMm: 'ဝန်ဆောင်မှု' },
  other_income: { label: 'Other Income', labelMm: 'အခြားဝင်ငွေ' },
};

export const EXPENSE_CATEGORIES: Record<string, { label: string; labelMm: string }> = {
  inventory: { label: 'Inventory', labelMm: 'ကုန်ပစ္စည်း' },
  rent: { label: 'Rent', labelMm: 'ငှားရမ်းခ' },
  utilities: { label: 'Utilities', labelMm: 'အသုံးအဆောင်' },
  salaries: { label: 'Salaries', labelMm: 'လစာ' },
  transport: { label: 'Transport', labelMm: 'သယ်ယူပို့ဆောင်' },
  marketing: { label: 'Marketing', labelMm: 'စျေးကွက်ရှာဖွေ' },
  equipment: { label: 'Equipment', labelMm: 'ပစ္စည်းကိရိယာ' },
  other_expense: { label: 'Other Expense', labelMm: 'အခြားကုန်ကျစရိတ်' },
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  sales: 'hsl(152, 69%, 40%)',
  services: 'hsl(181, 80%, 40%)',
  other_income: 'hsl(210, 60%, 50%)',
  inventory: 'hsl(38, 92%, 50%)',
  rent: 'hsl(262, 80%, 50%)',
  utilities: 'hsl(339, 70%, 50%)',
  salaries: 'hsl(211, 100%, 50%)',
  transport: 'hsl(45, 100%, 45%)',
  marketing: 'hsl(300, 60%, 50%)',
  equipment: 'hsl(180, 50%, 45%)',
  other_expense: 'hsl(0, 0%, 50%)',
};
