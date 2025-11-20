import { Component, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NetworkService } from './network.service';
import { PWAService } from './pwa.service';
import { ToastComponent } from './toast/toast.component';
import { CommonModule } from '@angular/common';
import { SwipeDirective } from './swipe.directive';
import { SwipeService } from './swipe.service';
import { filter } from 'rxjs';
import { DesktopNavComponent } from './desktop-nav/desktop-nav.component';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    RouterOutlet, 
    ToastComponent, 
    SwipeDirective, 
    DesktopNavComponent,
    MobileNavComponent
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
  selectedIndex = 0;
  
  @ViewChild('swipeContainer', { static: false }) swipeContainer!: ElementRef;

  constructor(
    public router: Router, 
    private networkService: NetworkService,
    private pwaService: PWAService,
    private swipeService: SwipeService
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
    
    setTimeout(checkInstallability, 1000);
    setInterval(checkInstallability, 5000);
    
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const index = this.links.findIndex(link => event.urlAfterRedirects.includes(link.path));
      if (index !== -1) {
        this.selectedIndex = index;
        this.swipeService.setCurrentIndex(index);
      }
    });
  }
  
  installPWA() {
    this.setInstallBannerSeen();
    this.pwaService.showInstallPrompt();
  }
  
  private hasSeenInstallBanner(): boolean {
    return localStorage.getItem('installBannerSeen') === 'true';
  }
  
  private setInstallBannerSeen(): void {
    localStorage.setItem('installBannerSeen', 'true');
  }

  tabChanged(event: any) {
    // console.log('tab changed', event);
  }
  
  private isSwiping = false;

  onSwipeLeft() {
    if (this.isSwiping) { return; }
    this.isSwiping = true;
    this.router.navigate([this.swipeService.getPreviousRoute()]);
    setTimeout(() => this.isSwiping = false, 300);
  }

  onSwipeRight() {
    if (this.isSwiping) { return; }
    this.isSwiping = true;
    this.router.navigate([this.swipeService.getNextRoute()]);
    setTimeout(() => this.isSwiping = false, 300);
  }
}
