import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IncomeService } from '../income.service';
import { MonthlyIncome } from '../income.model';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './income-list.html',
  styleUrls: ['./income-list.scss']
})
export class IncomeListComponent implements OnInit {
  monthlyIncomes: MonthlyIncome[] = [];
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  constructor(private incomeService: IncomeService) {}

  ngOnInit(): void {
    this.loadMonthlyIncomes();
  }

  private loadMonthlyIncomes(): void {
    this.monthlyIncomes = this.incomeService.getAllMonthlyIncomes()
      .sort((a, b) => {
        // Sort by year and month descending
        const [aYear, aMonth] = a.id.split('-').map(Number);
        const [bYear, bMonth] = b.id.split('-').map(Number);
        
        if (aYear !== bYear) {
          return bYear - aYear;
        }
        return bMonth - aMonth;
      });
  }

  getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.name || '';
  }

  deleteIncome(id: string): void {
    if (confirm('Are you sure you want to delete this monthly income?')) {
      // Extract year and month from id
      const [year, month] = id.split('-').map(Number);
      
      if (this.incomeService.deleteMonthlyIncome(year, month)) {
        this.loadMonthlyIncomes();
      }
    }
  }

  // Format the ID to a readable date
  formatIncomeDate(id: string): string {
    const [year, month] = id.split('-').map(Number);
    const monthName = this.getMonthName(month);
    return `${monthName} ${year}`;
  }
}