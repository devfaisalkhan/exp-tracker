import { Directive, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appSwipe]'
})
export class SwipeDirective implements OnInit {
  @Output() swipe = new EventEmitter<string>();
  private startX: number = 0;
  private startY: number = 0;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.addEventListener('touchstart', (event: TouchEvent) => {
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
    });

    this.el.nativeElement.addEventListener('touchend', (event: TouchEvent) => {
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;

      const diffX = endX - this.startX;
      const diffY = endY - this.startY;

      // Only trigger swipe if horizontal movement is significantly larger than vertical
      // and movement is above threshold
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && Math.abs(diffY) < 100) {
        if (diffX > 0) {
          this.swipe.emit('right');
        } else {
          this.swipe.emit('left');
        }
      }
      // For vertical scrolling, don't prevent default behavior so scrolling works normally
    });

    // For mouse events (desktop testing)
    this.el.nativeElement.addEventListener('mousedown', (event: MouseEvent) => {
      this.startX = event.clientX;
      this.startY = event.clientY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (Math.abs(moveEvent.clientX - this.startX) > 0 || Math.abs(moveEvent.clientY - this.startY) > 0) {
          document.removeEventListener('mousemove', handleMouseMove);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);

      const handleMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener('mouseup', handleMouseUp);
        const diffX = upEvent.clientX - this.startX;
        const diffY = upEvent.clientY - this.startY;

        // Only trigger swipe if horizontal movement is significantly larger than vertical
        // and movement is above threshold
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && Math.abs(diffY) < 100) {
          if (diffX > 0) {
            this.swipe.emit('right');
          } else {
            this.swipe.emit('left');
          }
        }
      };

      document.addEventListener('mouseup', handleMouseUp, { once: true });
    });
  }
}