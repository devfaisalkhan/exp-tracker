import { Routes } from '@angular/router';
import { SwipeLayoutComponent } from './swipe-layout.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'welcome',
        loadComponent: () => import('./welcome/welcome').then(m => m.WelcomeComponent)
    },
    {
        // Group the swipeable routes under a parent layout
        path: '',
        component: SwipeLayoutComponent,
        children: [
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
                path: 'incomes',
                loadComponent: () => import('./income-list/income-list').then(m => m.IncomeListComponent)
            }
        ]
    },
    {
        path: 'set-income',
        loadComponent: () => import('./set-monthly-income/set-monthly-income').then(m => m.SetMonthlyIncomeComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfileComponent)
    }
];