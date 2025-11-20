import { Expense } from './models';

export interface MonthlyIncome {
  id: string; // Format: "YYYY-MM" (e.g., "2025-10" for October 2025)
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}