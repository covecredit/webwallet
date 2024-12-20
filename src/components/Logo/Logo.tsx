import React from 'react';
import { Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../constants/layout';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

  return (
    <motion.div 
      className={`flex items-center space-x-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Anchor className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-primary`} />
      <div className={`flex items-center ${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
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