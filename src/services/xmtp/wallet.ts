import { Wallet } from 'xrpl';
import { Signer } from '@xmtp/xmtp-js';

export class XMTPWalletAdapter implements Signer {
  constructor(private wallet: Wallet) {}

  async getAddress(): Promise<string> {
    return this.wallet.classicAddress;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      // Convert message to hex string for XRPL signing
      const messageHex = Buffer.from(message).toString('hex');
      const signature = this.wallet.sign(messageHex);
      
      // Convert signature back to Uint8Array
      return new Uint8Array(Buffer.from(signature, 'hex'));
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }
}