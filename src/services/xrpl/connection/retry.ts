export class RetryStrategy {
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 5000;

  shouldRetry(): boolean {
    return this.retryCount < this.MAX_RETRIES;
  }

  async wait(): Promise<void> {
    const delay = this.BASE_DELAY * Math.pow(2, this.retryCount);
    this.retryCount++;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  reset(): void {
    this.retryCount = 0;
  }

  getRetryCount(): number {
    return this.retryCount;
  }
}