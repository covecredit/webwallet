export type PWAInstallOutcome = 'accepted' | 'dismissed';

export interface PWAEvents {
  canInstall: () => void;
  installed: () => void;
  error: (error: Error) => void;
}