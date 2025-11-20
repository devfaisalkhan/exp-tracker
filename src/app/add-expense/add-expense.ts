import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../expense.service';
import { Expense } from '../models';
import { ExpenseCategory } from '../expense-category.enum';
import { ToastService } from '../toast.service';
import { IncomeService } from '../income.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-expense.html',
  styleUrls: ['./add-expense.scss']
})
export class AddExpense implements OnInit {
  expenseForm!: FormGroup;
  expenseCategories = Object.values(ExpenseCategory);
  paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment', 'Other'];
  defaultDate: Date = new Date();
  
  // Income tracking properties
  hasMonthlyIncome = false;
  currentMonthIncome = 0;
  currentMonthSpent = 0;
  remainingBudget = 0;
  percentageUsed = 0;
  
  // Make Math available to the template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.checkMonthlyIncome();
    this.initForm();
  }

  private checkMonthlyIncome(): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    const monthlyIncome = this.incomeService.getMonthlyIncome(year, month);
    this.hasMonthlyIncome = !!monthlyIncome;
    
    if (monthlyIncome) {
      this.currentMonthIncome = monthlyIncome.amount;
      this.currentMonthSpent = this.expenseService.getMonthlySpent(year, month);
      this.remainingBudget = this.incomeService.getRemainingBudget(year, month);
      this.percentageUsed = this.incomeService.getPercentageUsed(year, month);
    }
  }

  private initForm(): void {
    this.expenseForm = this.fb.group({
      title: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [this.formatDateForInput(this.defaultDate), [Validators.required]],
      category: ['', [Validators.required]],
      paymentMethod: [''],
      notes: [''],
      tags: ['']
    });
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const tags = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
      
      const newExpense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formValue.title,
        amount: parseFloat(formValue.amount),
        date: new Date(formValue.date),
        category: formValue.category,
        notes: formValue.notes,
        paymentMethod: formValue.paymentMethod,
        tags: tags.length > 0 ? tags : undefined
      };
      
      // Check if this expense will exceed monthly income
      const expenseDate = new Date(formValue.date);
      const year = expenseDate.getFullYear();
      const month = expenseDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      
      const monthlyIncome = this.incomeService.getMonthlyIncome(year, month);
      if (monthlyIncome) {
        const currentSpent = this.expenseService.getMonthlySpent(year, month);
        const newTotal = currentSpent + newExpense.amount;
        
        if (newTotal > monthlyIncome.amount) {
          const excessAmount = newTotal - monthlyIncome.amount;
          
          // Show warning and ask for confirmation
          const confirmAdd = confirm(`This expense will exceed your monthly income by ${excessAmount.toFixed(2)} PKR. Do you want to add it anyway as "Over Budget"?`);
          
          if (confirmAdd) {
            this.expenseService.addExpense(newExpense);
            this.expenseForm.reset({
              title: '',
              amount: '',
              date: this.formatDateForInput(this.defaultDate),
              category: '',
              paymentMethod: '',
              notes: '',
              tags: ''
            });
            this.toastService.warning('Expense added successfully (Over Budget)!'); 
            this.checkMonthlyIncome(); // Refresh budget data
          } else {
            this.toastService.info('Expense not added.');
          }
        } else {
          // Within budget, add normally
          this.expenseService.addExpense(newExpense);
          this.expenseForm.reset({
            title: '',
            amount: '',
            date: this.formatDateForInput(this.defaultDate),
            category: '',
            paymentMethod: '',
            notes: '',
            tags: ''
          });
          this.toastService.success('Expense added successfully!');
          this.checkMonthlyIncome(); // Refresh budget data
        }
      } else {
        // No monthly income set, add normally
        this.expenseService.addExpense(newExpense);
        this.expenseForm.reset({
          title: '',
          amount: '',
          date: this.formatDateForInput(this.defaultDate),
          category: '',
          paymentMethod: '',
          notes: '',
          tags: ''
        });
        this.toastService.success('Expense added successfully!');
      }
    } else {
      this.toastService.error('Please fill in all required fields correctly.');
    }
  }
}