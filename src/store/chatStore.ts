import { create } from 'zustand';
import { Message } from '../services/xmtp/types';
import { xmtpService } from '../services/xmtp';
import { useWalletStore } from './walletStore';

interface ChatState {
  messages: Message[];
  conversations: string[];
  activeConversation: string | null;
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  setActiveConversation: (address: string) => void;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (address: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      const wallet = useWalletStore.getState().wallet;
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      await xmtpService.initialize(wallet);
      
      // Subscribe to new messages
      xmtpService.on('message', (message: Message) => {
        const { activeConversation } = get();
        if (message.conversation === activeConversation) {
          set((state) => ({
            messages: [...state.messages, message]
          }));
        }
      });

      // Load initial conversations
      await get().loadConversations();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  setActiveConversation: (address) => {
    set({ activeConversation: address });
  },

  sendMessage: async (content) => {
    const { activeConversation } = get();
    if (!activeConversation) {
      throw new Error('No active conversation');
    }

    try {
      await xmtpService.sendMessage(activeConversation, content);
      // Message will be added through the message event listener
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  loadMessages: async (address) => {
    try {
      set({ isLoading: true, error: null });
      const messages = await xmtpService.getMessages(address);
      set({ messages, activeConversation: address });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      const conversations = await xmtpService.listConversations();
      set({ conversations });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));