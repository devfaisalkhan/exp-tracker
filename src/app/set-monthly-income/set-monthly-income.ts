import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IncomeService } from '../income.service';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-set-monthly-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-monthly-income.html',
  styleUrls: ['./set-monthly-income.scss']
})
export class SetMonthlyIncomeComponent implements OnInit { 
  incomeForm!: FormGroup;
  currentMonthIncome: number | null = null;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // 1-12 format

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

  years: number[] = [];

  constructor(
    private fb: FormBuilder,
    public incomeService: IncomeService,
    private toastService: ToastService
  ) {
    // Generate years array (current year and next 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.years.push(i);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentMonthIncome();
  }

  private initForm(): void {
    this.incomeForm = this.fb.group({
      year: [this.currentYear, [Validators.required]],
      month: [this.currentMonth, [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  private loadCurrentMonthIncome(): void {
    const income = this.incomeService.getMonthlyIncome(this.currentYear, this.currentMonth);
    if (income) {
      this.currentMonthIncome = income.amount;
      this.incomeForm.patchValue({
        amount: income.amount
      });
    }
  }

  onSubmit(): void {
    if (this.incomeForm.valid) {
      const { year, month, amount } = this.incomeForm.value;
      
      this.incomeService.setMonthlyIncome(year, month, amount);
      this.toastService.success(`Monthly income for ${this.getMonthName(month)} ${year} set to ${amount} PKR!`);
      
      // Update current month if that's what was changed
      if (year === this.currentYear && month === this.currentMonth) {
        this.currentMonthIncome = amount;
      }
    } else {
      this.toastService.error('Please enter a valid income amount.');
    }
  }

  public getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.name || '';
  }

  onMonthYearChange(): void {
    // Update current month income when month/year changes
    const { year, month } = this.incomeForm.value;
    if (year && month) {
      const income = this.incomeService.getMonthlyIncome(year, month);
      this.currentMonthIncome = income ? income.amount : null;
    }
  }
}