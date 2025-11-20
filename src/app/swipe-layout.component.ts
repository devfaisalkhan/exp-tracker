import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwipeService } from './swipe.service';
import { Subscription } from 'rxjs';
import { SwipeContainerComponent } from './swipe-container.component';

@Component({
  selector: 'app-swipe-layout',
  template: `
    <app-swipe-container (onSwipeEvent)="handleSwipe($event)" class="swipe-layout-container">
      <div class="layout-content">
        <router-outlet></router-outlet>
      </div>
    </app-swipe-container>
  `,
  styleUrls: ['./swipe-layout.component.scss'],
  standalone: true,
  imports: [SwipeContainerComponent, RouterOutlet]
})
export class SwipeLayoutComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private swipeService: SwipeService
  ) {}

  ngOnInit() {
    // Subscribe to current index changes from the swipe service
    this.subscription.add(
      this.swipeService.currentIndex$.subscribe(index => {
        const route = this.swipeService.getRouteAt(index);
        if (route && this.router.url !== route) {
          // Only navigate if we're not already on the target route
          this.router.navigate([route], { replaceUrl: true });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  handleSwipe(direction: string) {
    let nextRoute: string | null = null;

    if (direction === 'left') {
      // Swiping left goes to next tab (e.g., from dashboard to add)
      nextRoute = this.swipeService.getNextRoute();
    } else if (direction === 'right') {
      // Swiping right goes to previous tab
      nextRoute = this.swipeService.getPreviousRoute();
    }

    if (nextRoute && this.router.url !== nextRoute) {
      const index = this.swipeService.getIndexForRoute(nextRoute);
      if (index !== -1) {
        this.swipeService.setCurrentIndex(index);
        // Navigate to the new route
        this.router.navigate([nextRoute]);
      }
    }
  }
}