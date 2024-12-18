import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Plus, AlertTriangle, Loader } from 'lucide-react';
import Widget from '../Widget/Widget';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { useWalletStore } from '../../store/walletStore';
import { formatDistanceToNow } from 'date-fns';

const ChatWidget: React.FC = () => {
  const { messages, conversations, activeConversation, sendMessage, loadMessages, loadConversations, initialize } = useChatStore();
  const { isConnected, wallet } = useWalletStore();
  const [input, setInput] = useState('');
  const [newChat, setNewChat] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (isConnected && wallet) {
        try {
          setIsInitializing(true);
          setError(null);
          await initialize();
          await loadConversations();
        } catch (error: any) {
          console.error('Chat initialization failed:', error);
          setError(error.message || 'Failed to initialize chat');
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initChat();
  }, [isConnected, wallet]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation).catch(console.error);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    try {
      await sendMessage(input);
      setInput('');
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChat.trim()) return;
    
    try {
      setError(null);
      await loadMessages(newChat);
      await sendMessage('👋 Hello!');
      setNewChat('');
      setShowNewChat(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!isConnected) {
    return (
      <Widget
        id="chat"
        title="CØVE Chat"
        icon={MessageCircle}
        defaultPosition={{ x: window.innerWidth - 340, y: 80 }}
        defaultSize={{ width: 320, height: 400 }}
      >
        <div className="flex items-center justify-center h-full text-text/50">
          Connect your wallet to use chat
        </div>
      </Widget>
    );
  }

  if (isInitializing) {
    return (
      <Widget
        id="chat"
        title="CØVE Chat"
        icon={MessageCircle}
        defaultPosition={{ x: window.innerWidth - 340, y: 80 }}
        defaultSize={{ width: 320, height: 400 }}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <div className="text-text/50">Initializing chat...</div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget
      id="chat"
      title="CØVE Chat"
      icon={MessageCircle}
      defaultPosition={{ x: window.innerWidth - 340, y: 80 }}
      defaultSize={{ width: 320, height: 500 }}
    >
      <div className="flex h-full">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-primary/30 p-2 space-y-2">
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full flex items-center space-x-2 p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv}
                onClick={() => loadMessages(conv)}
                className={`w-full p-2 rounded-lg text-left truncate transition-colors ${
                  activeConversation === conv
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-primary/10'
                }`}
              >
                {conv.slice(0, 6)}...{conv.slice(-4)}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${msg.sender === wallet?.address ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg
                      ${msg.sender === wallet?.address 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-background/50 text-text'}
                    `}
                  >
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs opacity-50 mt-1">
                      {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="p-4 border-t border-primary/30">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-background/50 border border-primary/30 rounded-lg px-4 py-2 text-text placeholder-text/50 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-background border border-primary/30 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Start New Chat</h3>
              <input
                type="text"
                value={newChat}
                onChange={(e) => setNewChat(e.target.value)}
                placeholder="Enter recipient address"
                className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="px-4 py-2 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartNewChat}
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Widget>
  );
};

export default ChatWidget;