import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  private currentIndexSubject = new BehaviorSubject<number>(0);
  public currentIndex$ = this.currentIndexSubject.asObservable();

  // Define the navigation routes and their corresponding indices (same as mobile nav)
  private navigationRoutes = [
    '/dashboard',
    '/add', 
    '/expenses',
    '/budgets',
    '/incomes'
  ];

  // Functions that load the component for a given index. These mirror the lazy loaders
  // used in app.routes.ts so the swipe container can preload the adjacent page.
  public navigationLoaders: Array<() => Promise<any>> = [
    () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    () => import('./add-expense/add-expense').then(m => m.AddExpense),
    () => import('./expenses-list/expenses-list').then(m => m.ExpensesList),
    () => import('./budgets/budgets').then(m => m.BudgetsComponent),
    () => import('./income-list/income-list').then(m => m.IncomeListComponent)
  ];

  constructor() {
    // Initialize current index based on current route if needed
    const currentPath = window.location.pathname;
    const index = this.navigationRoutes.indexOf(currentPath);
    if (index !== -1) {
      this.currentIndexSubject.next(index);
    }
  }

  setCurrentIndex(index: number): void {
    if (index >= 0 && index < this.navigationRoutes.length) {
      this.currentIndexSubject.next(index);
    }
  }

  getCurrentIndex(): number {
    return this.currentIndexSubject.value;
  }

  getCurrentRoute(): string {
    return this.navigationRoutes[this.currentIndexSubject.value] || '/dashboard';
  }

  getNextRoute(): string {
    const currentIndex = this.currentIndexSubject.value;
    const nextIndex = (currentIndex + 1) % this.navigationRoutes.length;
    return this.navigationRoutes[nextIndex];
  }

  getPreviousRoute(): string {
    const currentIndex = this.currentIndexSubject.value;
    const prevIndex = (currentIndex - 1 + this.navigationRoutes.length) % this.navigationRoutes.length;
    return this.navigationRoutes[prevIndex];
  }

  getIndexForRoute(route: string): number {
    // Only return index if the route is part of our swipeable navigation
    return this.navigationRoutes.indexOf(route);
  }

  // Public helpers for swipe container
  public getRoutesCount(): number {
    return this.navigationRoutes.length;
  }

  public getRouteAt(index: number): string | null {
    if (index < 0 || index >= this.navigationRoutes.length) return null;
    return this.navigationRoutes[index];
  }
}