import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1090;">
      <div 
        *ngFor="let toast of toasts; let i = index" 
        class="toast fade show align-items-center mb-2"
        [ngClass]="'toast-' + toast.type"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style="min-width: 300px; max-width: 400px;"
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
  styleUrls: ['./toast.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeToast(id: number) {
    this.toastService.remove(id);
  }
}