import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NetworkService } from './network.service';
import { PWAService } from './pwa.service';
import { ToastComponent } from './toast/toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
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
    window.addEventListener('beforeinstallprompt', (e) => {
      this.showInstallButton = this.pwaService.isInstallable() && !this.hasSeenInstallBanner();
    });
    
    // Also listen to appinstalled event
    window.addEventListener('appinstalled', () => {
      this.showInstallButton = false; // Hide the install button after installation
      this.setInstallBannerSeen(); // Remember that user installed the app
    });
    
    // Check periodically if installable
    const checkInstallability = () => {
      const isInstallable = this.pwaService.isInstallable();
      const canInstall = this.pwaService.canInstall();
      
      if (canInstall && !this.hasSeenInstallBanner()) {
        this.showInstallButton = true;
      }
    };
    
    // Check immediately
    setTimeout(() => {
      checkInstallability();
    }, 1000);
    
    // Check every 5 seconds to see if installable
    setInterval(checkInstallability, 5000);
  }
  
  installPWA() {
    this.setInstallBannerSeen(); // Mark that user interacted with install
    this.pwaService.showInstallPrompt();
  }
  
  private hasSeenInstallBanner(): boolean {
    return localStorage.getItem('installBannerSeen') === 'true';
  }
  
  private setInstallBannerSeen(): void {
    localStorage.setItem('installBannerSeen', 'true');
  }
  
  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}
