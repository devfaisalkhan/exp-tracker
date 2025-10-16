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
      return JSON.parse(stored);
    }
    return [];
  }

  private saveExpenses(expenses: Expense[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(expenses));
  }

  getExpenses(): Expense[] {
    return this.loadExpenses();
  }

  addExpense(expense: Omit<Expense, 'id'>) {
    const expenses = this.loadExpenses();
    const newExpense: Expense = {
      ...expense,
      id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1
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
      expenses[index] = updatedExpense;
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
