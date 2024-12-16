export class ConnectionTimeout {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }

  start(onTimeout: () => void): void {
    this.clear();
    this.timeoutId = setTimeout(onTimeout, this.duration);
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}