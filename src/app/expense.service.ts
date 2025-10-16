import { Injectable } from '@angular/core';
import { Expense } from './expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private localStorageKey = 'expenses';

  constructor() { }

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
    console.log('Expense added:', newExpense);
    console.log('All expenses:', expenses);
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
      console.log('Expense updated:', updatedExpense);
      return true;
    }
    return false;
  }

  deleteExpense(id: number): boolean {
    const expenses = this.loadExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses.splice(index, 1);
      this.saveExpenses(expenses);
      console.log('Expense deleted:', id);
      return true;
    }
    return false;
  }
}
