import { ExpenseCategory } from './expense-category.enum';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  notes: string;
  paymentMethod?: string;
  receipt?: string;
  tags?: string[];
  groupId?: number; // For grouping related expenses
  recurringId?: number; // For tracking recurring expenses
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: number;
  name: string;
  categoryId: ExpenseCategory;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  currentSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringExpense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  notes: string;
  startDate: Date;
  endDate?: Date; // Optional - if not set, it continues indefinitely
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  theme: 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseGroup {
  id: number;
  name: string;
  description: string;
  totalAmount: number;
  expenseIds: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseReport {
  id: number;
  name: string;
  dateRange: { start: Date; end: Date };
  categoryFilter?: ExpenseCategory;
  includeSubcategories?: boolean;
  generatedAt: Date;
  data: any; // Detailed report data
}