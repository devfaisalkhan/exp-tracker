import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IncomeService } from './income.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeGuard implements CanActivate {
  constructor(
    private incomeService: IncomeService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    const monthlyIncome = this.incomeService.getMonthlyIncome(year, month);
    
    if (monthlyIncome) {
      return true; // Allow access if monthly income is set
    } else {
      // Redirect to set income page if monthly income is not set
      this.router.navigate(['/set-income']);
      return false;
    }
  }
}