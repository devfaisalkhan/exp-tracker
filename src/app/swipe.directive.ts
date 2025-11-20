import { Directive, ElementRef, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SwipeService } from './swipe.service';

declare var Hammer: any;

@Directive({
  selector: '[appSwipe]'
})
export class SwipeDirective implements OnInit, OnDestroy {
  @Output() swipeLeft = new EventEmitter<void>();
  @Output() swipeRight = new EventEmitter<void>();
  @Input() enableSwipe = true; // Allow enabling/disabling of swipe
  
  private hammer!: any;

  constructor(
    private el: ElementRef,
    private router: Router,
    private swipeService: SwipeService
  ) {}

  ngOnInit() {
    if (this.enableSwipe && typeof Hammer !== 'undefined') {
      this.hammer = new Hammer(this.el.nativeElement);
      
      // Configure the recognizer to only recognize horizontal swipes
      this.hammer.get('swipe').set({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 30 // Minimum distance for swipe recognition
      });
      
      // Also add a recognizer for the pan gesture to handle more natural swiping
      const pan = new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 10 // Lower threshold for pan gesture
      });
      this.hammer.add(pan);
      
      this.hammer.on('swipeleft', (event: any) => {
        // Prevent default behavior to avoid conflicts
        event.preventDefault();
        this.swipeLeft.emit();
      });
      
      this.hammer.on('swiperight', (event: any) => {
        // Prevent default behavior to avoid conflicts
        event.preventDefault();
        this.swipeRight.emit();
      });
      
      // Handle pan end for more responsive swiping
      this.hammer.on('panend', (event: any) => {
        if (Math.abs(event.velocityX) > 0.3) { // Minimum velocity check
          if (event.velocityX < 0) {
            // Swiping left
            event.preventDefault();
            this.swipeLeft.emit();
          } else {
            // Swiping right
            event.preventDefault();
            this.swipeRight.emit();
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.hammer) {
      this.hammer.destroy();
    }
  }
}