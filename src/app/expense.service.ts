import { Injectable } from '@angular/core';
import { Expense } from './expense.model';
import { ToastService } from './toast.service';
import { IncomeService } from './income.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private localStorageKey = 'expenses';

  constructor(
    private toastService: ToastService,
    private incomeService: IncomeService
  ) { }

  private loadExpenses(): Expense[] {
    const stored = localStorage.getItem(this.localStorageKey);
    if (stored) {
      const expenses = JSON.parse(stored);
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
    localStorage.setItem(this.localStorageKey, JSON.stringify(expenses));
  }

  getExpenses(): Expense[] {
    return this.loadExpenses();
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
    // Check if this expense would exceed the monthly income
    const expenseDate = new Date(expense.date);
    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    const monthlyIncome = this.incomeService.getMonthlyIncome(year, month);
    if (monthlyIncome) {
      const currentSpent = this.incomeService.getMonthlySpent(year, month);
      const newTotal = currentSpent + expense.amount;
      
      if (newTotal > monthlyIncome.amount) {
        const excessAmount = newTotal - monthlyIncome.amount;
        this.toastService.warning(`You are exceeding your monthly income by ${excessAmount.toFixed(2)} PKR. Expense added as "Over Budget".`);
      }
    }

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
}
