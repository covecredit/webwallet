import React from 'react';
import { LucideIcon } from 'lucide-react';

interface WalletButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const WalletButton: React.FC<WalletButtonProps> = ({ icon: Icon, label, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full px-4 py-3 bg-primary-opacity border border-primary-opacity
        rounded-lg text-primary font-medium transition-all duration-300
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-opacity-20 active:bg-opacity-30'}
      `}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
    </button>
  );
};

export default WalletButton;