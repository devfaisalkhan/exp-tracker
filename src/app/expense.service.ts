import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from './models';
import { ToastService } from './toast.service';
import { AppConstant } from './app.constant';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  public expenses$ = this.expensesSubject.asObservable();

  constructor(
    private toastService: ToastService,
    private storageService: StorageService
  ) {
    this.loadExpenses();
  }

  private loadExpenses() {
    const stored = this.storageService.getItem(AppConstant.KEY_EXPENSES);
    if (stored) {
      const expenses = stored.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt)
      }));
      this.expensesSubject.next(expenses);
    } else {
      this.expensesSubject.next([]);
    }
  }

  private saveExpenses(expenses: Expense[]) {
    this.storageService.setItem(AppConstant.KEY_EXPENSES, expenses);
    this.expensesSubject.next(expenses);
  }

  getExpenses(): Expense[] {
    return this.expensesSubject.value;
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
    const expenses = this.getExpenses();
    const now = new Date();
    const newExpense: Expense = {
      ...expense,
      id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
      createdAt: now,
      updatedAt: now
    };
    const updatedExpenses = [...expenses, newExpense];
    this.saveExpenses(updatedExpenses);
    return newExpense;
  }

  updateExpense(updatedExpense: Expense) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      const now = new Date();
      const newExpenses = [...expenses];
      newExpenses[index] = {
        ...updatedExpense,
        updatedAt: now
      };
      this.saveExpenses(newExpenses);
      this.toastService.success('Expense updated successfully!');
      return true;
    }
    this.toastService.error('Failed to update expense!');
    return false;
  }

  deleteExpense(id: number): boolean {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      const newExpenses = [...expenses];
      newExpenses.splice(index, 1);
      this.saveExpenses(newExpenses);
      return true;
    }
    return false;
  }

  getMonthlyExpenses(year: number, month: number): Expense[] {
    const expenses = this.getExpenses();
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
