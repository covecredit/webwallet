import React from 'react';
import { Search, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GraphContextMenuProps {
  x: number;
  y: number;
  node: any;
  onClose: () => void;
  onSearch?: () => void;
  onCopy?: () => void;
  copiedAddress: boolean;
}

const GraphContextMenu: React.FC<GraphContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onSearch,
  onCopy,
  copiedAddress
}) => {
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  if (!node) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-50 bg-background border border-primary/30 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: `${Math.min(x, window.innerWidth - 160)}px`,
        top: `${Math.min(y, window.innerHeight - 100)}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {node.type === 'wallet' && (
        <>
          <button
            onClick={onSearch}
            className="w-full px-4 py-2 text-left hover:bg-primary/10 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Address</span>
          </button>
          <button
            onClick={onCopy}
            className="w-full px-4 py-2 text-left hover:bg-primary/10 flex items-center space-x-2"
          >
            {copiedAddress ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>Copy Address</span>
          </button>
        </>
      )}
    </motion.div>
  );
};

export default GraphContextMenu;