class CryptoService {
  private static instance: CryptoService;
  private key: CryptoKey | null = null;
  private readonly SALT = new Uint8Array([
    0x43, 0x4f, 0x56, 0x45, 0x5f, 0x53, 0x41, 0x4c, 
    0x54, 0x5f, 0x32, 0x30, 0x32, 0x34, 0x5f, 0x76
  ]);
  private readonly KEY_MATERIAL = 'COVE_SECURE_KEY_2024_v1';

  private constructor() {
    this.initializeKey();
  }

  static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  private async initializeKey(): Promise<void> {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.KEY_MATERIAL),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      this.key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: this.SALT,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      console.log('Crypto key initialized successfully');
    } catch (error) {
      console.error('Failed to initialize crypto key:', error);
      throw error;
    }
  }

  async encrypt(data: string): Promise<string> {
    try {
      if (!this.key) {
        await this.initializeKey();
      }
      if (!this.key) {
        throw new Error('Encryption key not available');
      }

      const encoder = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.key,
        encodedData
      );

      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  async decrypt(data: string): Promise<string> {
    try {
      if (!this.key) {
        await this.initializeKey();
      }
      if (!this.key) {
        throw new Error('Decryption key not available');
      }

      const decoder = new TextDecoder();
      const combined = new Uint8Array(
        atob(data).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.key,
        encrypted
      );

      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }
}

export const cryptoService = CryptoService.getInstance();