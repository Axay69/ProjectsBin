import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CounterState {
  count: number;
}

interface CounterContextType extends CounterState {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return (
    <CounterContext.Provider value={{ count, increment, decrement, reset }}>
      {children}
    </CounterContext.Provider>
  );
}

export function useCounterContext() {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounterContext must be used within a CounterProvider');
  }
  return context;
}

