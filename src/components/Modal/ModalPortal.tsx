import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative bg-background border border-primary/30 rounded-lg shadow-xl max-w-md w-full mx-auto z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ModalPortal;