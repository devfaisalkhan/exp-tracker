import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../budget.service';
import { ExpenseService } from '../expense.service';
import { Budget } from '../enhanced-expense.model';
import { ExpenseCategory } from '../expense-category.enum';

interface BudgetWithProgress extends Budget {
  spentPercentage: number;
  remainingAmount: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budgets.html',
  styleUrls: ['./budgets.scss']
})
export class BudgetsComponent implements OnInit {
  budgetForm!: FormGroup;
  budgets: BudgetWithProgress[] = [];
  expenseCategories = Object.values(ExpenseCategory);
  periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBudgets();
  }

  private initForm(): void {
    this.budgetForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      period: ['monthly', [Validators.required]],
      startDate: [this.getTodayString(), [Validators.required]]
    });
  }

  private getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private loadBudgets(): void {
    const allBudgets = this.budgetService.getBudgets();
    const expenses = this.expenseService.getExpenses();

    this.budgets = allBudgets.map(budget => {
      // Calculate total expenses for this budget's category within the budget period
      const budgetExpenses = expenses.filter(expense => 
        expense.category === budget.categoryId && 
        new Date(expense.date) >= new Date(budget.startDate) &&
        (!budget.endDate || new Date(expense.date) <= new Date(budget.endDate))
      );

      const currentSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const spentPercentage = budget.amount > 0 ? (currentSpent / budget.amount) * 100 : 0;
      const remainingAmount = budget.amount - currentSpent;

      return {
        ...budget,
        currentSpent,
        spentPercentage,
        remainingAmount
      };
    });
  }

  onSubmit(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const budget: Omit<Budget, 'id' | 'currentSpent' | 'createdAt' | 'updatedAt'> = {
        name: formValue.name,
        categoryId: formValue.categoryId as ExpenseCategory,
        amount: formValue.amount,
        period: formValue.period,
        startDate: new Date(formValue.startDate),
        endDate: this.calculateEndDate(formValue.startDate, formValue.period),
        // currentSpent: 0, // Will be calculated when loading
        // createdAt: new Date(),
        // updatedAt: new Date()
      };

      this.budgetService.addBudget(budget);
      this.budgetForm.reset({
        name: '',
        categoryId: '',
        amount: '',
        period: 'monthly',
        startDate: this.getTodayString()
      });
      this.loadBudgets();
    }
  }

  private calculateEndDate(startDate: string, period: string): Date {
    const start = new Date(startDate);
    let end = new Date(start);

    switch (period) {
      case 'daily':
        end.setDate(start.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        break;
      default:
        // Default to monthly if period is unknown
        end.setMonth(start.getMonth() + 1);
        break;
    }

    return end;
  }

  deleteBudget(id: number): void {
    if (confirm('Are you sure you want to delete this budget?')) {
      const deleted = this.budgetService.deleteBudget(id);
      if (deleted) {
        this.loadBudgets();
      }
    }
  }

  getBudgetStatusClass(budget: BudgetWithProgress): string {
    if (budget.spentPercentage >= 100) return 'bg-danger';
    if (budget.spentPercentage >= 80) return 'bg-warning';
    return 'bg-success';
  }
}