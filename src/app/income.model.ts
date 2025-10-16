import { Expense } from './expense.model';

export interface MonthlyIncome {
  id: string; // Format: "YYYY-MM" (e.g., "2025-10" for October 2025)
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithBudgetStatus extends Expense {
  isOverBudget?: boolean; // Added property to track if expense exceeds monthly limit
}