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

  constructor() {
    this.listenForInstallPrompt();
  }

  private listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('Install prompt deferred');
    });
  }

  public showInstallPrompt(): Promise<void> | undefined {
    if (this.deferredPrompt) {
      // Show the install prompt
      return this.deferredPrompt.prompt();
    }
    return undefined;
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  public async getInstallPromptResult(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string } | null> {
    if (this.deferredPrompt) {
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return choiceResult;
    }
    return null;
  }
}