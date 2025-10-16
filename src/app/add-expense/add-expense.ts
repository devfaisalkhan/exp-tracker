import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../expense.service';
import { Expense } from '../expense.model';
import { ExpenseCategory } from '../expense-category.enum';
import { ToastService } from '../toast.service';

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
  paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment', 'Other'];
  defaultDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
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
    } else {
      this.toastService.error('Please fill in all required fields correctly.');
    }
  }
}