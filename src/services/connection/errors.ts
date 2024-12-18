
export class ConnectionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Connection timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}
