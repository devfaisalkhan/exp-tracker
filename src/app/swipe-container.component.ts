import { Component, OnInit, OnDestroy, importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SwipeDirective } from './swipe.directive';
import { SwipeService } from './swipe.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-swipe-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SwipeDirective],
  template: `
    <div class="swipe-container" appSwipe 
         (swipeLeft)="onSwipeLeft()" 
         (swipeRight)="onSwipeRight()"
         [enableSwipe]="isMobile">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .swipe-container {
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }
  `]
})
export class SwipeContainerComponent implements OnInit, OnDestroy {
  isMobile = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private swipeService: SwipeService
  ) {}

  ngOnInit() {
    // Detect mobile devices
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Subscribe to route changes to update the current index
    this.subscription.add(
      this.router.events.subscribe(() => {
        const currentRoute = this.router.url;
        const index = this.swipeService.getIndexForRoute(currentRoute);
        if (index !== -1) {
          this.swipeService.setCurrentIndex(index);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSwipeLeft() {
    // Navigate to next tab
    this.router.navigate([this.swipeService.getNextRoute()]);
  }

  onSwipeRight() {
    // Navigate to previous tab
    this.router.navigate([this.swipeService.getPreviousRoute()]);
  }
}