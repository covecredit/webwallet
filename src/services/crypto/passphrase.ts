import { Buffer } from 'buffer';
import { storageService } from '../storage';
import { STORAGE_KEYS } from '../../constants/storage';
import { EventEmitter } from '../../utils/EventEmitter';

class PassphraseService extends EventEmitter {
  private static instance: PassphraseService;
  private passphrase: string | null = null;
  private attempts = 0;
  private readonly MAX_ATTEMPTS = 10;
  private readonly SALT_LENGTH = 16;
  private readonly IV_LENGTH = 12;

  private constructor() {
    super();
  }

  static getInstance(): PassphraseService {
    if (!PassphraseService.instance) {
      PassphraseService.instance = new PassphraseService();
    }
    return PassphraseService.instance;
  }

  async setPassphrase(passphrase: string): Promise<void> {
    if (!passphrase) throw new Error('Passphrase is required');
    if (passphrase.length < 8) throw new Error('Passphrase must be at least 8 characters');

    try {
      // If there's existing encrypted data, try to decrypt it first
      if (this.hasEncryptedData()) {
        const encryptedData = await storageService.get(STORAGE_KEYS.SEED);
        if (encryptedData) {
          try {
            this.passphrase = passphrase;
            await this.decrypt(encryptedData);
            // If decryption succeeds, keep the passphrase
            this.attempts = 0;
            this.emit('unlocked');
            return;
          } catch (error) {
            this.passphrase = null;
            this.attempts++;
            
            if (this.attempts >= this.MAX_ATTEMPTS) {
              console.log('Max attempts reached, clearing encrypted data');
              await storageService.clear();
              this.attempts = 0;
              throw new Error('Maximum attempts exceeded. Encrypted data cleared.');
            }
            
            throw new Error('Invalid passphrase');
          }
        }
      }

      // No existing data, just set the new passphrase
      this.passphrase = passphrase;
      this.attempts = 0;
      this.emit('set');
    } catch (error) {
      console.error('Failed to set passphrase:', error);
      throw error;
    }
  }

  async encrypt(data: string): Promise<string> {
    if (!this.passphrase) throw new Error('Passphrase not set');

    try {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      const key = await this.deriveKey(salt);
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );

      const result = Buffer.concat([
        Buffer.from(salt),
        Buffer.from(iv),
        Buffer.from(encrypted)
      ]);

      return result.toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.passphrase) throw new Error('Passphrase not set');

    try {
      const data = Buffer.from(encryptedData, 'base64');
      const salt = data.slice(0, this.SALT_LENGTH);
      const iv = data.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = data.slice(this.SALT_LENGTH + this.IV_LENGTH);

      const key = await this.deriveKey(salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Invalid passphrase');
    }
  }

  private async deriveKey(salt: Uint8Array): Promise<CryptoKey> {
    if (!this.passphrase) throw new Error('Passphrase not set');

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  hasEncryptedData(): boolean {
    return storageService.has(STORAGE_KEYS.SEED);
  }

  hasPassphrase(): boolean {
    return this.passphrase !== null;
  }

  clearPassphrase(): void {
    this.passphrase = null;
    this.attempts = 0;
    this.emit('cleared');
  }
}

export const passphraseService = PassphraseService.getInstance();