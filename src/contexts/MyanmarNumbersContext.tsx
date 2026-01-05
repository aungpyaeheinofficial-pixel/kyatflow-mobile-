import { createContext, useContext, useState, ReactNode } from 'react';

interface MyanmarNumbersContextType {
  useMyanmarNumbers: boolean;
  toggleMyanmarNumbers: () => void;
}

const MyanmarNumbersContext = createContext<MyanmarNumbersContextType | undefined>(undefined);

export function MyanmarNumbersProvider({ children }: { children: ReactNode }) {
  const [useMyanmarNumbers, setUseMyanmarNumbers] = useState(() => {
    const saved = localStorage.getItem('useMyanmarNumbers');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleMyanmarNumbers = () => {
    const newValue = !useMyanmarNumbers;
    setUseMyanmarNumbers(newValue);
    localStorage.setItem('useMyanmarNumbers', JSON.stringify(newValue));
  };

  return (
    <MyanmarNumbersContext.Provider value={{ useMyanmarNumbers, toggleMyanmarNumbers }}>
      {children}
    </MyanmarNumbersContext.Provider>
  );
}

export function useMyanmarNumbers() {
  const context = useContext(MyanmarNumbersContext);
  if (context === undefined) {
    throw new Error('useMyanmarNumbers must be used within a MyanmarNumbersProvider');
  }
  return context;
}

