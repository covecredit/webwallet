export class RetryStrategy {
  private attempts = 0;
  private readonly MAX_ATTEMPTS = 3;
  private readonly BASE_DELAY = 2000;

  shouldRetry(): boolean {
    return this.attempts < this.MAX_ATTEMPTS;
  }

  async wait(): Promise<void> {
    const delay = this.BASE_DELAY * Math.pow(2, this.attempts);
    this.attempts++;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  reset(): void {
    this.attempts = 0;
  }

  getAttempts(): number {
    return this.attempts;
  }
}
