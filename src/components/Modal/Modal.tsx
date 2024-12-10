import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { LAYOUT } from '../../constants/layout';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative bg-background border border-primary/30 rounded-lg shadow-xl max-w-md w-full mx-auto z-[101]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-primary/30">
            <h2 className="text-xl font-bold text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text hover:text-primary" />
            </button>
          </div>
          
          <div className="p-4">
            {children}
          </div>
        </motion.div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;