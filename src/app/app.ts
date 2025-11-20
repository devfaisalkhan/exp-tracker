import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NetworkService } from './network.service';
import { PWAService } from './pwa.service';
import { ToastComponent } from './toast/toast.component';
import { CommonModule } from '@angular/common';
import { DesktopNavComponent } from './desktop-nav/desktop-nav.component';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';
import { SwipeLayoutComponent } from './swipe-layout.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ToastComponent,
    DesktopNavComponent,
    MobileNavComponent,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('exp-tracker');
  isOnline = true;
  showInstallButton = false;
  isMobile = false;

  links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill' },
    { path: '/add', label: 'Add Expense', icon: 'bi-plus-circle', activeIcon: 'bi-plus-circle-fill' },
    { path: '/expenses', label: 'Expenses', icon: 'bi-collection', activeIcon: 'bi-collection-fill' },
    { path: '/budgets', label: 'Budgets', icon: 'bi-wallet', activeIcon: 'bi-wallet-fill' },
    { path: '/incomes', label: 'Incomes', icon: 'bi-piggy-bank', activeIcon: 'bi-piggy-bank-fill' }
  ];

  constructor(
    public router: Router,
    private networkService: NetworkService,
    private pwaService: PWAService
  ) {}

  ngOnInit() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.networkService.networkStatus$.subscribe(status => {
      this.isOnline = status;
    });

    // Check if install prompt is available
    window.addEventListener('beforeinstallprompt', (e) => {
      this.showInstallButton = this.pwaService.isInstallable() && !this.hasSeenInstallBanner();
    });

    // Also listen to appinstalled event
    window.addEventListener('appinstalled', () => {
      this.showInstallButton = false; // Hide the install button after installation
      // this.setInstallButtonSeen(); // Remember that user installed the app
    });

    // Check periodically if installable
    const checkInstallability = () => {
      const isInstallable = this.pwaService.isInstallable();
      const canInstall = this.pwaService.canInstall();

      if (canInstall && !this.hasSeenInstallBanner()) {
        this.showInstallButton = true;
      }
    };

    setTimeout(checkInstallability, 1000);
    setInterval(checkInstallability, 5000);
  }

  installPWA() {
    // this.setInstallButtonSeen();
    this.pwaService.showInstallPrompt();
  }

  private hasSeenInstallBanner(): boolean {
    return localStorage.getItem('installBannerSeen') === 'true';
  }

  private setInstallBannerSeen(): void {
    localStorage.setItem('installBannerSeen', 'true');
  }
}
