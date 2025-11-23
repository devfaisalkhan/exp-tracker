import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { BudgetService } from '../budget.service';
import { ExpenseService } from '../expense.service';
import { Budget } from '../models';
import { ExpenseCategory } from '../expense-category.enum';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LineController, BarController, DoughnutController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register the chart components we need
import { Chart } from 'chart.js';
Chart.register(
  LineController,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BudgetWithProgress extends Budget {
  spentPercentage: number;
  remainingAmount: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective, TitleCasePipe],
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

  // Computed properties for the budget summary
  totalBudgets = 0;
  totalAllocated = 0;
  totalSpent = 0;
  totalRemaining = 0;

  // Chart configuration for budget visualization
  public budgetChartType: ChartType = 'doughnut';
  public budgetChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
        '#f43f5e', '#f97316', '#eab308', '#84cc16',
        '#10b981', '#06b6d4', '#3b82f6', '#64748b'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Inter'
          }
        }
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) { }

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
    // Subscribe to expenses updates
    this.expenseService.expenses$.subscribe(expenses => {
      const allBudgets = this.budgetService.getBudgets();

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

      // Update the budget chart data
      this.updateBudgetChart();
      this.cdr.markForCheck();
    });
  }

  private updateBudgetChart(): void {
    // Only show chart for budgets that have spending activity
    const activeBudgets = this.budgets.filter(b => b.currentSpent > 0 || b.amount > 0);

    if (activeBudgets.length > 0) {
      this.budgetChartData.labels = activeBudgets.map(b => `${b.name} (${b.categoryId})`);
      this.budgetChartData.datasets[0].data = activeBudgets.map(b => b.currentSpent);
    } else {
      this.budgetChartData.labels = ['No budget data'];
      this.budgetChartData.datasets[0].data = [1]; // Show a placeholder if no data
    }

    // Calculate summary values
    this.totalBudgets = this.budgets.length;
    this.totalAllocated = this.budgets.reduce((sum, budget) => sum + budget.amount, 0);
    this.totalSpent = this.budgets.reduce((sum, budget) => sum + budget.currentSpent, 0);
    this.totalRemaining = this.budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);
  }

  onSubmit(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formValue.name,
        categoryId: formValue.categoryId as ExpenseCategory,
        amount: formValue.amount,
        period: formValue.period,
        startDate: new Date(formValue.startDate),
        endDate: this.calculateEndDate(formValue.startDate, formValue.period),
        currentSpent: 0, // Will be calculated when loading
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