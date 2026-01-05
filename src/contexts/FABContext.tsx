import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface FABHandlers {
  onQuickIncome: () => void;
  onQuickExpense: () => void;
  onRepeatLast: () => void;
}

interface FABContextType {
  handlers: FABHandlers | null;
  setHandlers: (handlers: FABHandlers) => void;
}

const FABContext = createContext<FABContextType | null>(null);

export function FABProvider({ children }: { children: ReactNode }) {
  const [handlers, setHandlersState] = useState<FABHandlers | null>(null);

  const setHandlers = useCallback((newHandlers: FABHandlers) => {
    setHandlersState(newHandlers);
  }, []);

  return (
    <FABContext.Provider value={{ handlers, setHandlers }}>
      {children}
    </FABContext.Provider>
  );
}

export function useFAB() {
  const context = useContext(FABContext);
  return context?.handlers || null;
}

export function useSetFAB() {
  const context = useContext(FABContext);
  if (!context) {
    throw new Error('useSetFAB must be used within FABProvider');
  }
  return context.setHandlers;
}

