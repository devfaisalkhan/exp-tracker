import { Injectable } from '@angular/core';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  deferredPrompt: BeforeInstallPromptEvent | null = null;
  isStandalone: boolean = false;

  constructor() {
    this.listenForInstallPrompt();
    this.checkStandaloneMode();
  }

  private listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e as BeforeInstallPromptEvent;
    });
    
    // Listen to the install event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null; // Clear the deferred prompt as it's no longer needed
    });
  }

  private checkStandaloneMode() {
    // Check if the app is running in standalone mode
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (navigator as any).standalone || 
                       document.referrer.includes('android-app://');
  }

  public showInstallPrompt(): Promise<void> | undefined {
    if (this.deferredPrompt) {
      // Show the install prompt
      return this.deferredPrompt.prompt();
    }
    if (!this.hasShownInstallInstructions()) {
      this.showManualInstallInstructions();
      this.setInstallInstructionsShown();
    }
    return undefined;
  }

  private showManualInstallInstructions(): void {
    // Determine the platform and show appropriate instructions
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      alert('To install this app on iOS:\n1. Tap the Share button (box with arrow)\n2. Select "Add to Home Screen"\n3. Tap "Add"');
    } else if (isAndroid) {
      alert('To install this app on Android:\n1. Tap the menu button (3 dots)\n2. Select "Install app" or "Add to home screen"');
    } else {
      alert('To install this app:\n1. Look for the install icon in the address bar\n2. Or look for "Install" option in the browser menu (3 dots)');
    }
  }

  public isInstallable(): boolean {
    const installable = this.deferredPrompt !== null && !this.isStandalone;
    return installable;
  }

  public getDeferredPrompt(): BeforeInstallPromptEvent | null {
    return this.deferredPrompt;
  }

  public async getInstallPromptResult(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string } | null> {
    if (this.deferredPrompt) {
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return choiceResult;
    }
    return null;
  }
  
  // Alternative install method for when beforeinstallprompt is not available
  public isInStandaloneMode(): boolean {
    return this.isStandalone || 
           window.matchMedia('(display-mode: standalone)').matches || 
           (navigator as any).standalone || 
           document.referrer.includes('android-app://');
  }
  
  public canInstall(): boolean {
    // Check if we're in a browser that supports PWA installation
    const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
    const isNotStandalone = !this.isInStandaloneMode();
    
    // Return true if we can show manual install instructions
    return supportsPWA && isNotStandalone;
  }
  
  // Get platform-specific install instructions
  public getInstallInstructions(): string {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      return 'To install on iOS: Tap the Share button (box with arrow) → "Add to Home Screen" → "Add"';
    } else if (isAndroid) {
      return 'To install on Android: Tap the menu button (3 dots) → "Install app" or "Add to home screen"';
    } else {
      return 'To install: Look for the install icon in the address bar or browser menu';
    }
  }
  
  private hasShownInstallInstructions(): boolean {
    return localStorage.getItem('installInstructionsShown') === 'true';
  }
  
  private setInstallInstructionsShown(): void {
    localStorage.setItem('installInstructionsShown', 'true');
  }
  
  public resetInstallInstructions(): void {
    localStorage.removeItem('installInstructionsShown');
  }
}