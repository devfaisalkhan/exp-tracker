import { Injectable } from '@angular/core';
import { MonthlyIncome } from './income.model';
import { AppConstant } from './app.constant';
import { StorageService } from './storage.service';
import { ExpenseService } from './expense.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(private storageService: StorageService, private expenseService: ExpenseService) { }

  private loadMonthlyIncome(): MonthlyIncome[] {
    const stored = this.storageService.getItem(AppConstant.KEY_INCOME);
    if (stored) {
      const income = stored;
      return income.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    }
    return [];
  }

  private saveMonthlyIncome(income: MonthlyIncome[]) {
    this.storageService.setItem(AppConstant.KEY_INCOME, income);
  }

  getMonthlyIncome(year: number, month: number): MonthlyIncome | undefined {
    const income = this.loadMonthlyIncome();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    return income.find(i => i.id === monthKey);
  }

  setMonthlyIncome(year: number, month: number, amount: number): MonthlyIncome {
    const income = this.loadMonthlyIncome();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const now = new Date();

    const existingIndex = income.findIndex(i => i.id === monthKey);
    if (existingIndex !== -1) {
      // Update existing income
      income[existingIndex] = {
        ...income[existingIndex],
        amount,
        updatedAt: now
      };
    } else {
      // Create new income
      const newIncome: MonthlyIncome = {
        id: monthKey,
        amount,
        currency: 'PKR',
        createdAt: now,
        updatedAt: now
      };
      income.push(newIncome);
    }

    this.saveMonthlyIncome(income);
    return income[existingIndex !== -1 ? existingIndex : income.length - 1];
  }

  deleteMonthlyIncome(year: number, month: number): boolean {
    const income = this.loadMonthlyIncome();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const index = income.findIndex(i => i.id === monthKey);

    if (index !== -1) {
      income.splice(index, 1);
      this.saveMonthlyIncome(income);
      return true;
    }
    return false;
  }
  
  // Get all monthly incomes
  getAllMonthlyIncomes(): MonthlyIncome[] {
    return this.loadMonthlyIncome();
  }
  
  // Format month key
  private formatMonthKey(year: number, month: number): string {
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  // Calculate remaining budget for a specific month
  getRemainingBudget(year: number, month: number): number {
    const monthlyIncome = this.getMonthlyIncome(year, month);
    if (!monthlyIncome) return 0;

    const totalSpent = this.expenseService.getMonthlySpent(year, month);
    return monthlyIncome.amount - totalSpent;
  }

  // Calculate percentage used for a specific month
  getPercentageUsed(year: number, month: number): number {
    const monthlyIncome = this.getMonthlyIncome(year, month);
    if (!monthlyIncome || monthlyIncome.amount === 0) return 0;

    const totalSpent = this.expenseService.getMonthlySpent(year, month);
    return Math.min(100, (totalSpent / monthlyIncome.amount) * 100);
  }

  // Check if expenses exceed income for a specific month
  isOverBudget(year: number, month: number): boolean {
    return this.getRemainingBudget(year, month) < 0;
  }

  // Check if a specific expense amount would exceed the monthly budget
  wouldExceedBudget(year: number, month: number, expenseAmount: number): { exceeds: boolean; excessAmount: number } {
    const monthlyIncome = this.getMonthlyIncome(year, month);
    if (!monthlyIncome) {
      return { exceeds: false, excessAmount: 0 };
    }
    
    const currentSpent = this.expenseService.getMonthlySpent(year, month);
    const newTotal = currentSpent + expenseAmount;
    const excessAmount = newTotal - monthlyIncome.amount;
    
    return {
      exceeds: newTotal > monthlyIncome.amount,
      excessAmount: Math.max(0, excessAmount)
    };
  }
}