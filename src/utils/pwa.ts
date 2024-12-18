export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

export const canInstallPWA = (): boolean => {
  return Boolean((window as any).deferredPrompt);
};

export const installPWA = async (): Promise<void> => {
  const promptEvent = (window as any).deferredPrompt;
  if (!promptEvent) {
    throw new Error('No installation prompt available');
  }

  promptEvent.prompt();
  const result = await promptEvent.userChoice;
  
  if (result.outcome === 'accepted') {
    console.log('PWA installed successfully');
  } else {
    console.log('PWA installation declined');
  }
  
  delete (window as any).deferredPrompt;
};

export const uninstallPWA = (): void => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
};