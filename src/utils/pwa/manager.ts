import { EventEmitter } from '../EventEmitter';
import { PWAInstallOutcome } from './types';

class PWAManager extends EventEmitter {
  private deferredPrompt: any = null;

  constructor() {
    super();
    this.initialize();
  }

  private initialize() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.emit('canInstall');
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.emit('installed');
      });
    }
  }

  canInstall(): boolean {
    return Boolean(this.deferredPrompt);
  }

  isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  async install(): Promise<PWAInstallOutcome> {
    if (!this.deferredPrompt) {
      throw new Error('Installation prompt not available');
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    return outcome;
  }

  async uninstall(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }

    // Reload to ensure clean state
    window.location.reload();
  }
}

export const pwaManager = new PWAManager();