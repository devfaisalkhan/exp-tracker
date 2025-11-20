import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  private currentIndexSubject = new BehaviorSubject<number>(0);
  public currentIndex$ = this.currentIndexSubject.asObservable();

  private navigationRoutes = [
    '/dashboard',
    '/add',
    '/expenses',
    '/budgets',
    '/incomes'
  ];

  constructor(private router: Router) {
    // Initialize based on current route
    this.updateIndexFromCurrentRoute();

    // Listen for route changes to update the current index
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateIndexFromCurrentRoute();
      });
  }

  private updateIndexFromCurrentRoute(): void {
    const currentPath = this.router.url;
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
    const newIndex = currentIndex - 1;
    const prevIndex = newIndex < 0 ? this.navigationRoutes.length - 1 : newIndex;
    return this.navigationRoutes[prevIndex];
  }

  getIndexForRoute(route: string): number {
    return this.navigationRoutes.indexOf(route);
  }

  public getRoutesCount(): number {
    return this.navigationRoutes.length;
  }

  public getRouteAt(index: number): string | null {
    if (index < 0 || index >= this.navigationRoutes.length) return null;
    return this.navigationRoutes[index];
  }
}
