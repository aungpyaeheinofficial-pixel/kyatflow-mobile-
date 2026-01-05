import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  showInLakhs: boolean;
  toggleCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [showInLakhs, setShowInLakhs] = useState(false);

  const toggleCurrency = () => setShowInLakhs(prev => !prev);

  return (
    <CurrencyContext.Provider value={{ showInLakhs, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
