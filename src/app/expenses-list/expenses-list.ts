import { Component, OnInit } from '@angular/core';
import { Expense } from '../expense.model';
import { ExpenseService } from '../expense.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseCategory } from '../expense-category.enum';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses-list.html',
  styleUrls: ['./expenses-list.scss']
})
export class ExpensesList implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  categories: ExpenseCategory[] = [
    ExpenseCategory.Food, 
    ExpenseCategory.Transport, 
    ExpenseCategory.Bills,
    ExpenseCategory.Entertainment, 
    ExpenseCategory.Shopping, 
    ExpenseCategory.Healthcare, 
    ExpenseCategory.Education,
    ExpenseCategory.Travel, 
    ExpenseCategory.Gifts, 
    ExpenseCategory.Utilities,
    ExpenseCategory.Insurance, 
    ExpenseCategory.Other
  ];
  
  // Filter properties
  selectedCategory: string = '';
  startDate: string = '';
  endDate: string = '';

  constructor(private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenses = this.expenseService.getExpenses();
    this.applyFilters();
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      const deleted = this.expenseService.deleteExpense(id);
      if (deleted) {
        this.loadExpenses(); // Refresh the list
      }
    }
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      // Category filter
      if (this.selectedCategory && expense.category !== this.selectedCategory) {
        return false;
      }
      
      // Date filter
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      
      if (this.startDate && expenseDate < this.startDate) {
        return false;
      }
      
      if (this.endDate && expenseDate > this.endDate) {
        return false;
      }
      
      return true;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }
}