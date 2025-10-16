import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkStatus = new BehaviorSubject<boolean>(navigator.onLine);
  public networkStatus$ = this.networkStatus.asObservable();

  constructor() {
    window.addEventListener('online', () => {
      this.networkStatus.next(true);
    });

    window.addEventListener('offline', () => {
      this.networkStatus.next(false);
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}