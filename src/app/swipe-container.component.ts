import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SwipeDirective } from './swipe.directive';

@Component({
  selector: 'app-swipe-container',
  template: `
    <div class="swipe-container" appSwipe (swipe)="onSwipe($event)">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./swipe-container.component.scss'],
  standalone: true,
  imports: [SwipeDirective]
})
export class SwipeContainerComponent {
  @Input() swipeEnabled = true;
  @Output() onSwipeEvent = new EventEmitter<string>();

  onSwipe(direction: string) {
    if (this.swipeEnabled) {
      this.onSwipeEvent.emit(direction);
    }
  }
}