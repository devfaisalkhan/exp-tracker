import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../expense.service';
import { Expense } from '../expense.model';
import { ExpenseCategory } from '../expense-category.enum';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-expense.html',
  styleUrls: ['./add-expense.scss']
})
export class AddExpense implements OnInit {
  expenseForm!: FormGroup;
  expenseCategories = Object.values(ExpenseCategory);
  defaultDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      title: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [this.formatDateForInput(this.defaultDate), [Validators.required]],
      category: ['', [Validators.required]],
      notes: ['']
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
      const newExpense: Omit<Expense, 'id'> = {
        title: formValue.title,
        amount: parseFloat(formValue.amount),
        date: new Date(formValue.date),
        category: formValue.category,
        notes: formValue.notes
      };
      
      this.expenseService.addExpense(newExpense);
      this.expenseForm.reset({
        title: '',
        amount: '',
        date: this.formatDateForInput(this.defaultDate),
        category: '',
        notes: ''
      });
    }
  }
}