import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1090;">
      <div 
        *ngFor="let toast of toastService.toasts$ | async; trackBy: trackById" 
        class="toast align-items-center mb-2"
        [ngClass]="'toast-' + toast.type"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style="min-width: 300px; max-width: 400px; display: block;"
        [@toastAnimation]
      >
        <div class="toast-body d-flex align-items-center">
          <span class="me-2" [ngSwitch]="toast.type">
            <i *ngSwitchCase="'success'" class="bi bi-check-circle-fill text-success fs-5"></i>
            <i *ngSwitchCase="'error'" class="bi bi-x-circle-fill text-danger fs-5"></i>
            <i *ngSwitchCase="'warning'" class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
            <i *ngSwitchCase="'info'" class="bi bi-info-circle-fill text-info fs-5"></i>
          </span>
          <span class="flex-grow-1">{{ toast.message }}</span>
          <button 
            type="button" 
            class="btn-close ms-2" 
            (click)="removeToast(toast.id)"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toast.scss'],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }

  removeToast(id: number) {
    this.toastService.remove(id);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}