import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SwipeDirective } from './swipe.directive';
import { SwipeService } from './swipe.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-swipe-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SwipeDirective],
  template: `
    <div class="swipe-wrapper" appSwipe
         (panStart)="onPanStart()"
         (panMove)="onPanMove($event)"
         (panEnd)="onPanEnd($event)"
         (swipeLeft)="onSwipeLeft()"
         (swipeRight)="onSwipeRight()"
         [enableSwipe]="isMobile"
         #wrapper>
      
      <!-- Page container that slides -->
      <div class="page-container" #pageContainer>
        <router-outlet></router-outlet>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .swipe-wrapper { 
      position: relative; 
      width: 100%; 
      height: 100%; 
      overflow: hidden; 
      touch-action: pan-y;
      background: #f8f9fa;
    }
    .page-container { 
      width: 100%; 
      height: 100%; 
      will-change: transform;
    }
  `]
})
export class SwipeContainerComponent implements OnInit, OnDestroy {
  isMobile = false;
  private subscription = new Subscription();
  private width = 0;
  private isDragging = false;

  @ViewChild('pageContainer', { static: false }) pageContainer!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private swipeService: SwipeService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Detect mobile devices
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.width = window.innerWidth || document.documentElement.clientWidth;

    // Subscribe to route changes
    this.subscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          const currentRoute = this.router.url;
          const index = this.swipeService.getIndexForRoute(currentRoute);
          if (index !== -1) {
            this.swipeService.setCurrentIndex(index);
          }
          // Reset transforms after navigation completes
          this.resetTransform();
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSwipeLeft() {
    const next = this.swipeService.getNextRoute();
    this.router.navigate([next]);
  }

  onSwipeRight() {
    const prev = this.swipeService.getPreviousRoute();
    this.router.navigate([prev]);
  }

  onPanStart() {
    if (!this.isMobile || !this.pageContainer) return;
    this.isDragging = true;
    
    this.ngZone.runOutsideAngular(() => {
      this.pageContainer.nativeElement.style.transition = 'none';
    });
  }

  onPanMove(event: { deltaX: number }) {
    if (!this.isDragging || !this.pageContainer) return;
    const dx = event.deltaX;
    
    this.ngZone.runOutsideAngular(() => {
      this.pageContainer.nativeElement.style.transform = `translateX(${dx}px)`;
    });
  }

  onPanEnd(event: { deltaX: number, velocity: number }) {
    if (!this.isDragging || !this.pageContainer) return;
    this.isDragging = false;
    
    const dx = event.deltaX;
    const v = event.velocity || 0;
    const absDx = Math.abs(dx);
    const threshold = Math.min(100, this.width * 0.25);
    const shouldNavigate = absDx > threshold || Math.abs(v) > 0.6;

    this.ngZone.runOutsideAngular(() => {
      this.pageContainer.nativeElement.style.transition = 'transform 300ms cubic-bezier(0.22, 0.9, 0.28, 1)';

      if (shouldNavigate) {
        // Complete the swipe - navigate immediately
        const finalDx = dx < 0 ? -this.width : this.width;
        this.pageContainer.nativeElement.style.transform = `translateX(${finalDx}px)`;

        // Navigate after a short delay to let animation start
        this.ngZone.run(() => {
          if (dx < 0) {
            this.router.navigate([this.swipeService.getNextRoute()]);
          } else {
            this.router.navigate([this.swipeService.getPreviousRoute()]);
          }
        });
      } else {
        // Snap back to origin
        this.pageContainer.nativeElement.style.transform = 'translateX(0)';
      }
    });
  }

  private resetTransform() {
    if (!this.pageContainer) return;
    
    this.ngZone.runOutsideAngular(() => {
      this.pageContainer.nativeElement.style.transition = '';
      this.pageContainer.nativeElement.style.transform = '';
    });
  }
}
