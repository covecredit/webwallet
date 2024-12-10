import { Buffer } from 'buffer';

export class HashService {
  private static instance: HashService;

  private constructor() {}

  static getInstance(): HashService {
    if (!HashService.instance) {
      HashService.instance = new HashService();
    }
    return HashService.instance;
  }

  async sha512(input: string): Promise<Buffer> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      return Buffer.from(hashBuffer);
    } catch (error) {
      console.error('SHA-512 generation failed:', error);
      throw new Error('Failed to generate hash');
    }
  }

  async sha512Half(input: string): Promise<Buffer> {
    const fullHash = await this.sha512(input);
    return fullHash.slice(0, 16);
  }
}

export const hashService = HashService.getInstance();