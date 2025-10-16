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
  groupId?: number;
  recurringId?: number;
  createdAt: Date;
  updatedAt: Date;
}