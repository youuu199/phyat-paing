import { useState, useEffect } from 'react';
import type { BudgetLimits } from '../types';

const BUDGET_STORAGE_KEY = 'bill-organizer-budgets';

function loadBudgets(): BudgetLimits {
  try {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetLimits>(loadBudgets);

  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  return { budgets, setBudgets };
}
