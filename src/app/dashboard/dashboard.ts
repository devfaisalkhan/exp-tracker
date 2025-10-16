import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../expense.service';
import { Expense } from '../expense.model';
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

  // Chart configuration
  public weeklyChartType: ChartType = 'line';
  public categoryChartType: ChartType = 'doughnut';
  
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

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.expenses = this.expenseService.getExpenses();
    this.calculateDashboardStats();
    this.updateCharts();
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
  }

  getTopCategory(): CategorySummary | null {
    if (this.categorySummaries.length > 0) {
      return this.categorySummaries[0];
    }
    return null;
  }
}