import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../expense.service';
import { Expense } from '../expense.model';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-expense.html',
  styleUrls: ['./add-expense.scss']
})
export class AddExpense {
  defaultDate: Date = new Date();

  constructor(private expenseService: ExpenseService) { }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const newExpense: Omit<Expense, 'id'> = {
        title: form.value.title,
        amount: parseFloat(form.value.amount),
        date: new Date(form.value.date),
        category: form.value.category,
        notes: form.value.notes
      };
      this.expenseService.addExpense(newExpense);
      form.resetForm();
    }
  }
}