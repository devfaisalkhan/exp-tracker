import { Injectable } from '@angular/core';
import { Budget } from './models';
import { ExpenseCategory } from './expense-category.enum';
import { ToastService } from './toast.service';
import { AppConstant } from './app.constant';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  constructor(private toastService: ToastService, private storageService: StorageService) { }

  private loadBudgets(): Budget[] {
    const stored = this.storageService.getItem(AppConstant.KEY_BUDGETS);
    if (stored) {
      const budgets = stored;
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
    this.storageService.setItem(AppConstant.KEY_BUDGETS, budgets);
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
    this.toastService.success('Budget created successfully!');
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
      this.toastService.success('Budget updated successfully!');
      return true;
    }
    this.toastService.error('Failed to update budget!');
    return false;
  }

  deleteBudget(id: number): boolean {
    const budgets = this.loadBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets.splice(index, 1);
      this.saveBudgets(budgets);
      this.toastService.success('Budget deleted successfully!');
      return true;
    }
    this.toastService.error('Failed to delete budget!');
    return false;
  }
}