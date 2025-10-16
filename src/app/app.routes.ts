import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./add-expense/add-expense').then(m => m.AddExpense)
    },
    {
        path: 'expenses',
        loadComponent: () => import('./expenses-list/expenses-list').then(m => m.ExpensesList)
    },
    {
        path: 'budgets',
        loadComponent: () => import('./budgets/budgets').then(m => m.BudgetsComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfileComponent)
    }
];