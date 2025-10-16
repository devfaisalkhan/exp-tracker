import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'add',
        pathMatch: 'full'
    },
    {
        path: 'add',
        loadComponent: () => import('./add-expense/add-expense').then(m => m.AddExpense)
    },
    {
        path: 'expenses',
        loadComponent: () => import('./expenses-list/expenses-list').then(m => m.ExpensesList)
    }
];