import { Injectable } from '@angular/core';
import { Budget } from './enhanced-expense.model';
import { ExpenseCategory } from './expense-category.enum';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private localStorageKey = 'budgets';

  constructor() { }

  private loadBudgets(): Budget[] {
    const stored = localStorage.getItem(this.localStorageKey);
    if (stored) {
      const budgets = JSON.parse(stored);
      return budgets.map((budget: any) => ({
        ...budget,
        startDate: new Date(budget.startDate),
        endDate: budget.endDate ? new Date(budget.endDate) : undefined,
        createdAt: new Date(budget.createdAt),
        updatedAt: new Date(budget.updatedAt)
      }));
    }
    return [];
  }

  private saveBudgets(budgets: Budget[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(budgets));
  }

  getBudgets(): Budget[] {
    return this.loadBudgets();
  }

  getBudgetByCategory(category: ExpenseCategory): Budget | undefined {
    const budgets = this.loadBudgets();
    return budgets.find(budget => budget.categoryId === category && 
              (!budget.endDate || new Date(budget.endDate) >= new Date()));
  }

  addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const budgets = this.loadBudgets();
    const newBudget: Budget = {
      ...budget,
      id: budgets.length > 0 ? Math.max(...budgets.map(b => b.id)) + 1 : 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    budgets.push(newBudget);
    this.saveBudgets(budgets);
    return newBudget;
  }

  updateBudget(updatedBudget: Budget): boolean {
    const budgets = this.loadBudgets();
    const index = budgets.findIndex(b => b.id === updatedBudget.id);
    if (index !== -1) {
      budgets[index] = {
        ...updatedBudget,
        updatedAt: new Date()
      };
      this.saveBudgets(budgets);
      return true;
    }
    return false;
  }

  deleteBudget(id: number): boolean {
    const budgets = this.loadBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets.splice(index, 1);
      this.saveBudgets(budgets);
      return true;
    }
    return false;
  }
}