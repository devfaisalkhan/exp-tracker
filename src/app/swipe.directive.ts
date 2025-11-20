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
  @Output() panStart = new EventEmitter<void>();
  @Output() panMove = new EventEmitter<{deltaX: number}>();
  @Output() panEnd = new EventEmitter<{deltaX: number, velocity: number}>();
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
      
      // Configure recognizers: we want both pan (drag) and swipe
      const swipe = this.hammer.get('swipe');
      swipe.set({ direction: Hammer.DIRECTION_HORIZONTAL, velocity: 0.3, threshold: 20 });
      const pan = this.hammer.get('pan');
      pan.set({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0 });

      // Pan events for interactive dragging
      this.hammer.on('panstart', (ev: any) => {
        ev.preventDefault();
        this.panStart.emit();
      });

      this.hammer.on('panmove', (ev: any) => {
        ev.preventDefault();
        this.panMove.emit({ deltaX: ev.deltaX });
      });

      this.hammer.on('panend pancancel', (ev: any) => {
        ev.preventDefault();
        this.panEnd.emit({ deltaX: ev.deltaX, velocity: ev.velocityX || 0 });
      });

      // Keep the legacy swipe events as a fallback for quick flicks
      this.hammer.on('swipeleft', (event: any) => {
        event.preventDefault();
        this.swipeLeft.emit();
      });

      this.hammer.on('swiperight', (event: any) => {
        event.preventDefault();
        this.swipeRight.emit();
      });
    }
  }

  ngOnDestroy() {
    if (this.hammer) {
      this.hammer.destroy();
    }
  }
}