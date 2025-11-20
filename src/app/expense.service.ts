import { Injectable } from '@angular/core';
import { Expense } from './models';
import { ToastService } from './toast.service';
import { AppConstant } from './app.constant';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(
    private toastService: ToastService,
    private storageService: StorageService
  ) { }

  private loadExpenses(): Expense[] {
    const stored = this.storageService.getItem(AppConstant.KEY_EXPENSES);
    if (stored) {
      const expenses = stored;
      // Ensure dates are properly converted to Date objects
      return expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt)
      }));
    }
    return [];
  }

  private saveExpenses(expenses: Expense[]) {
    this.storageService.setItem(AppConstant.KEY_EXPENSES, expenses);
  }

  getExpenses(): Expense[] {
    return this.loadExpenses();
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
    const expenses = this.loadExpenses();
    const now = new Date();
    const newExpense: Expense = {
      ...expense,
      id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
      createdAt: now,
      updatedAt: now
    };
    expenses.push(newExpense);
    this.saveExpenses(expenses);
    this.toastService.success('Expense added successfully!');
    return newExpense;
  }

  updateExpense(updatedExpense: Expense) {
    const expenses = this.loadExpenses();
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      const now = new Date();
      expenses[index] = {
        ...updatedExpense,
        updatedAt: now
      };
      this.saveExpenses(expenses);
      this.toastService.success('Expense updated successfully!');
      return true;
    }
    this.toastService.error('Failed to update expense!');
    return false;
  }

  deleteExpense(id: number): boolean {
    const expenses = this.loadExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses.splice(index, 1);
      this.saveExpenses(expenses);
      this.toastService.success('Expense deleted successfully!');
      return true;
    }
    this.toastService.error('Failed to delete expense!');
    return false;
  }

  getMonthlyExpenses(year: number, month: number): Expense[] {
    const expenses = this.loadExpenses();
    return expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
    });
  }

  getMonthlySpent(year: number, month: number): number {
    const expenses = this.getMonthlyExpenses(year, month);
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
}
