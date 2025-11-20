import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../expense.service';
import { ExpenseCategory } from '../expense-category.enum';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LineController, BarController, DoughnutController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { IncomeService } from '../income.service';

// Register the chart components we need
import { Chart } from 'chart.js';
import { Expense } from '../models';
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

interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  expenses: Expense[] = [];
  totalExpenses = 0;
  totalAmount = 0;
  weeklyExpenses: { day: string; amount: number }[] = [];
  categorySummaries: CategorySummary[] = [];

  // Income and budget tracking
  currentMonthIncome: number | null = null;
  currentMonthSpent: number = 0;
  remainingBudget: number = 0;
  percentageUsed: number = 0;
  isOverBudget: boolean = false;

  // Chart configuration
  public weeklyChartType: ChartType = 'line';
  public categoryChartType: ChartType = 'doughnut';
  public budgetChartType: ChartType = 'doughnut';
  
  public weeklyChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Amount (PKR)',
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',
      fill: true
    }]
  };
  
  public categoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
      ]
    }]
  };

  public monthlyBudgetChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#36A2EB', '#4BC0C0' // Blue for spent, Teal for remaining
      ]
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1
  
  // Make Math available to the template
  Math = Math;
  // Income and budget tracking


  constructor(
    private expenseService: ExpenseService,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.expenses = this.expenseService.getExpenses();
    this.loadIncomeData();
    this.calculateDashboardStats();
    this.updateCharts();
  }

  private loadIncomeData(): void {
    // Load current month's income and spending
    const monthlyIncome = this.incomeService.getMonthlyIncome(this.currentYear, this.currentMonth);
    this.currentMonthIncome = monthlyIncome ? monthlyIncome.amount : null;
    this.currentMonthSpent = this.expenseService.getMonthlySpent(this.currentYear, this.currentMonth);
    this.remainingBudget = this.incomeService.getRemainingBudget(this.currentYear, this.currentMonth);
    this.percentageUsed = this.incomeService.getPercentageUsed(this.currentYear, this.currentMonth);
    this.isOverBudget = this.incomeService.isOverBudget(this.currentYear, this.currentMonth);
  }

  private calculateDashboardStats(): void {
    // Calculate totals
    this.totalExpenses = this.expenses.length;
    this.totalAmount = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate weekly expenses for the last 7 days
    this.weeklyExpenses = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayExpenses = this.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      this.weeklyExpenses.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayTotal
      });
    }

    // Calculate category summaries
    const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
    this.expenses.forEach(expense => {
      if (!categoryMap.has(expense.category)) {
        categoryMap.set(expense.category, { total: 0, count: 0 });
      }
      const summary = categoryMap.get(expense.category)!;
      summary.total += expense.amount;
      summary.count += 1;
    });

    this.categorySummaries = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    })).sort((a, b) => b.total - a.total); // Sort by highest amount
  }

  private updateCharts(): void {
    // Update weekly chart data
    this.weeklyChartData.labels = this.weeklyExpenses.map(item => item.day);
    this.weeklyChartData.datasets[0].data = this.weeklyExpenses.map(item => item.amount);
    
    // Update category chart data
    this.categoryChartData.labels = this.categorySummaries.map(item => item.category);
    this.categoryChartData.datasets[0].data = this.categorySummaries.map(item => item.total);

    // Update monthly budget chart data
    if (this.currentMonthIncome !== null) {
      this.monthlyBudgetChartData.labels = ['Spent', 'Remaining'];
      this.monthlyBudgetChartData.datasets[0].data = [
        this.currentMonthSpent,
        Math.max(0, this.currentMonthIncome - this.currentMonthSpent)
      ];
      
      // Update colors based on over-budget status
      this.monthlyBudgetChartData.datasets[0].backgroundColor = [
        this.isOverBudget ? '#dc3545' : '#36A2EB',  // Red if over budget, blue if under
        this.isOverBudget ? '#ffc107' : '#4BC0C0'   // Yellow if over budget, teal if under
      ];
    } else {
      this.monthlyBudgetChartData.labels = ['No Income Set'];
      this.monthlyBudgetChartData.datasets[0].data = [1];
      this.monthlyBudgetChartData.datasets[0].backgroundColor = ['#999999'];
    }
  }

  getTopCategory(): CategorySummary | null {
    if (this.categorySummaries.length > 0) {
      return this.categorySummaries[0];
    }
    return null;
  }
}