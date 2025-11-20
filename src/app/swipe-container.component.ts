import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { SwipeDirective } from './swipe.directive';

@Component({
  selector: 'app-swipe-container',
  template: `
    <div class="swipe-container" #swipeContainer appSwipe
         (swipe)="onSwipe($event)"
         (swipeMove)="onSwipeMove($event)"
         (swipeStart)="onSwipeStart($event)"
         (swipeEnd)="onSwipeEnd($event)">
      <div class="swipe-content" #swipeContent>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./swipe-container.component.scss'],
  standalone: true,
  imports: [SwipeDirective]
})
export class SwipeContainerComponent implements AfterViewInit {
  @Input() swipeEnabled = true;
  @Output() onSwipeEvent = new EventEmitter<string>();

  @ViewChild('swipeContainer', { static: false }) swipeContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('swipeContent', { static: false }) swipeContent!: ElementRef<HTMLDivElement>;

  private isSwiping = false;
  private startTranslateX = 0;
  private containerWidth = 0;

  ngAfterViewInit() {
    // Initialize container width
    this.containerWidth = this.swipeContainer.nativeElement.clientWidth;
  }

  private swipeHandled = false; // Flag to ensure swipe is handled only once per gesture

  onSwipe(direction: string) {
    if (this.swipeEnabled && !this.swipeHandled) {
      this.swipeHandled = true; // Mark that swipe has been handled for this gesture

      this.onSwipeEvent.emit(direction);

      // Add a subtle animation when swipe completes
      if (this.swipeContent) {
        this.swipeContent.nativeElement.style.transition = 'transform 0.3s ease-out';
        setTimeout(() => {
          this.swipeContent.nativeElement.style.transform = 'translateX(0)';
          setTimeout(() => {
            this.swipeContent.nativeElement.style.transition = '';
          }, 300);
        }, 10);
      }
    }
  }

  onSwipeStart(event: {x: number, y: number}) {
    if (this.swipeEnabled && this.swipeContent) {
      this.isSwiping = true;
      this.swipeHandled = false; // Reset the swipe handled flag for new gesture

      // Get current transform value
      const computedStyle = window.getComputedStyle(this.swipeContent.nativeElement);
      const matrix = new DOMMatrixReadOnly(computedStyle.transform);
      this.startTranslateX = matrix.m41; // Get X translation

      // Disable transition during swipe for immediate response
      this.swipeContent.nativeElement.style.transition = 'none';
    }
  }

  onSwipeMove(event: {x: number, y: number, deltaX: number, deltaY: number}) {
    if (this.swipeEnabled && this.isSwiping && this.swipeContent) {
      // Calculate new position based on swipe delta
      const translateX = this.startTranslateX + event.deltaX;
      this.swipeContent.nativeElement.style.transform = `translateX(${translateX}px)`;
    }
  }

  onSwipeEnd(event: {x: number, y: number}) {
    if (this.swipeEnabled && this.isSwiping && this.swipeContent) {
      this.isSwiping = false;

      // Re-enable transition
      this.swipeContent.nativeElement.style.transition = 'transform 0.3s ease-out';

      // Get current position after the swipe
      const computedStyle = window.getComputedStyle(this.swipeContent.nativeElement);
      const matrix = new DOMMatrixReadOnly(computedStyle.transform);
      const currentTranslateX = matrix.m41;

      // If the swipe was significant enough, complete the transition
      const threshold = this.containerWidth * 0.3; // 30% of screen width

      if (Math.abs(currentTranslateX) > threshold) {
        // Animate to full swipe position then emit swipe event
        const direction = currentTranslateX > 0 ? 'right' : 'left';
        const finalPosition = direction === 'left' ? -this.containerWidth : this.containerWidth;

        this.swipeContent.nativeElement.style.transform = `translateX(${finalPosition}px)`;

        // After animation completes, emit the swipe event
        setTimeout(() => {
          // Only emit swipe event if it hasn't been handled yet
          if (!this.swipeHandled) {
            this.onSwipeEvent.emit(direction);
            this.swipeHandled = true;
          }
          this.swipeContent.nativeElement.style.transform = 'translateX(0)';
          this.swipeContent.nativeElement.style.transition = '';
        }, 300);
      } else {
        // Animate back to original position
        this.swipeContent.nativeElement.style.transform = 'translateX(0)';
        this.swipeContent.nativeElement.style.transition = 'transform 0.3s ease-out';
      }
    }
    // Reset swipe handled flag after the interaction is complete
    setTimeout(() => {
      this.swipeHandled = false;
    }, 350); // Slightly longer than the animation time
  }
}