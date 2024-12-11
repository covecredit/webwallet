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

export const GraphContextMenu: React.FC<GraphContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onSearch,
  onCopy,
  copiedAddress
}) => {
  // Component implementation remains the same
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
      {/* Component JSX remains the same */}
    </motion.div>
  );
};

export default GraphContextMenu;