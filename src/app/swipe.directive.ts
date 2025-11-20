import { Directive, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appSwipe]'
})
export class SwipeDirective implements OnInit {
  @Output() swipe = new EventEmitter<string>();
  @Output() swipeMove = new EventEmitter<{x: number, y: number, deltaX: number, deltaY: number}>();
  @Output() swipeStart = new EventEmitter<{x: number, y: number}>();
  @Output() swipeEnd = new EventEmitter<{x: number, y: number}>();

  private startX: number = 0;
  private startY: number = 0;
  private hasEmittedSwipe = false; // Flag to prevent multiple swipe emissions

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Touch events
    this.el.nativeElement.addEventListener('touchstart', (event: TouchEvent) => {
      if (event.touches.length === 1) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
        this.hasEmittedSwipe = false; // Reset flag on new touch
        this.swipeStart.emit({x: this.startX, y: this.startY});
      }
    });

    this.el.nativeElement.addEventListener('touchmove', (event: TouchEvent) => {
      if (event.touches.length === 1 && !this.hasEmittedSwipe) { // Don't emit move if swipe already happened
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const deltaX = currentX - this.startX;
        const deltaY = currentY - this.startY;

        this.swipeMove.emit({
          x: currentX,
          y: currentY,
          deltaX: deltaX,
          deltaY: deltaY
        });
      }
    });

    this.el.nativeElement.addEventListener('touchend', (event: TouchEvent) => {
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const deltaX = endX - this.startX;
      const deltaY = endY - this.startY;

      // Emit swipeEnd regardless of whether it's a valid swipe
      this.swipeEnd.emit({x: endX, y: endY});

      // Only trigger swipe if horizontal movement is significantly larger than vertical
      // and movement is above threshold, and if we haven't already emitted a swipe
      if (!this.hasEmittedSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        if (deltaX > 0) {
          this.swipe.emit('right');
        } else {
          this.swipe.emit('left');
        }
        this.hasEmittedSwipe = true; // Set flag to prevent additional emissions
      }
    });

    // Mouse events (desktop testing)
    this.el.nativeElement.addEventListener('mousedown', (event: MouseEvent) => {
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.hasEmittedSwipe = false; // Reset flag on new touch
      this.swipeStart.emit({x: this.startX, y: this.startY});

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!this.hasEmittedSwipe) { // Don't emit move if swipe already happened
          const deltaX = moveEvent.clientX - this.startX;
          const deltaY = moveEvent.clientY - this.startY;

          this.swipeMove.emit({
            x: moveEvent.clientX,
            y: moveEvent.clientY,
            deltaX: deltaX,
            deltaY: deltaY
          });
        }
      };

      document.addEventListener('mousemove', handleMouseMove);

      const handleMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const deltaX = upEvent.clientX - this.startX;
        const deltaY = upEvent.clientY - this.startY;

        // Emit swipeEnd regardless of whether it's a valid swipe
        this.swipeEnd.emit({x: upEvent.clientX, y: upEvent.clientY});

        // Only trigger swipe if horizontal movement is significantly larger than vertical
        // and movement is above threshold, and if we haven't already emitted a swipe
        if (!this.hasEmittedSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
          if (deltaX > 0) {
            this.swipe.emit('right');
          } else {
            this.swipe.emit('left');
          }
          this.hasEmittedSwipe = true; // Set flag to prevent additional emissions
        }
      };

      document.addEventListener('mouseup', handleMouseUp, { once: true });
    });
  }
}