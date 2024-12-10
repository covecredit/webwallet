import { useState } from 'react';

export const useCopyToClipboard = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(`${type}-${text}`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return { copiedItem, handleCopy };
};