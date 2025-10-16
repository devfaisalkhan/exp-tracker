import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NetworkService } from './network.service';
import { PWAService } from './pwa.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('exp-tracker');
  isOnline = true;
  showInstallButton = false;
  
  constructor(
    public router: Router, 
    private networkService: NetworkService,
    private pwaService: PWAService
  ) {}
  
  ngOnInit() {
    this.networkService.networkStatus$.subscribe(status => {
      this.isOnline = status;
    });
    
    // Check if install prompt is available
    // The beforeinstallprompt event might not fire immediately, so we'll check periodically
    window.addEventListener('beforeinstallprompt', () => {
      this.showInstallButton = this.pwaService.isInstallable();
    });
    
    // Also check after a delay in case the event already fired
    setTimeout(() => {
      if (!this.showInstallButton) {
        this.showInstallButton = this.pwaService.isInstallable();
      }
    }, 2000);
  }
  
  installPWA() {
    this.pwaService.showInstallPrompt();
  }
  
  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
