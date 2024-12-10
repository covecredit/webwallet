import React from 'react';
import { Anchor } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <motion.div 
      className={`flex items-center space-x-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Anchor className="w-6 h-6 text-primary" />
      <div className="flex items-center text-xl font-bold">
        <span className="text-text">C</span>
        <span className="relative mx-0.5">
          <span className="text-text">O</span>
          <div
            className="absolute top-1/2 left-1/2 w-[120%] h-[2px] bg-primary"
            style={{
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              transformOrigin: 'center'
            }}
          />
        </span>
        <span className="text-text">VE</span>
      </div>
    </motion.div>
  );
};

export default Logo;