import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full'
    },
    {
        path: 'welcome',
        loadComponent: () => import('./welcome/welcome').then(m => m.WelcomeComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
        // canActivate: [() => import('./welcome.guard').then(m => m.WelcomeGuard)]
    },
    {
        path: 'add',
        loadComponent: () => import('./add-expense/add-expense').then(m => m.AddExpense)
        // canActivate: [() => import('./income.guard').then(m => m.IncomeGuard)]
    },
    {
        path: 'expenses',
        loadComponent: () => import('./expenses-list/expenses-list').then(m => m.ExpensesList)
        // canActivate: [() => import('./welcome.guard').then(m => m.WelcomeGuard)]
    },
    {
        path: 'budgets',
        loadComponent: () => import('./budgets/budgets').then(m => m.BudgetsComponent)
        // canActivate: [() => import('./welcome.guard').then(m => m.WelcomeGuard)]
    },
    {
        path: 'set-income',
        loadComponent: () => import('./set-monthly-income/set-monthly-income').then(m => m.SetMonthlyIncomeComponent)
    },
    {
        path: 'incomes',
        loadComponent: () => import('./income-list/income-list').then(m => m.IncomeListComponent)
        // canActivate: [() => import('./welcome.guard').then(m => m.WelcomeGuard)]
    },
    {
        path: 'profile',
        loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfileComponent)
        // canActivate: [() => import('./welcome.guard').then(m => m.WelcomeGuard)]
    }
];