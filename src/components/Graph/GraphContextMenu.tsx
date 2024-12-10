import React from 'react';
import { Search, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface GraphContextMenuProps {
  x: number;
  y: number;
  node: any;
  onSearch: () => void;
  onCopy: () => void;
  onClose: () => void;
}

const GraphContextMenu: React.FC<GraphContextMenuProps> = ({
  x,
  y,
  node,
  onSearch,
  onCopy,
  onClose
}) => {
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  if (!node) return null;

  // Calculate menu position relative to viewport
  const menuStyle = {
    position: 'fixed' as const,
    left: `${Math.min(x, window.innerWidth - 160)}px`,
    top: `${Math.min(y, window.innerHeight - 100)}px`,
    zIndex: 50
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background border border-primary/30 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {node.type === 'wallet' && (
        <>
          <button
            onClick={onSearch}
            className="w-full px-4 py-2 text-left hover:text-primary flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Address</span>
          </button>
          <button
            onClick={onCopy}
            className="w-full px-4 py-2 text-left hover:text-primary flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Address</span>
          </button>
        </>
      )}
    </motion.div>
  );
};

export default GraphContextMenu;
