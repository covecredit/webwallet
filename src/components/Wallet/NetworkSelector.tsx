import React, { useState } from 'react';
import { Globe, Plus } from 'lucide-react';
import { useNetworkStore } from '../../store/networkStore';
import { NetworkConfig } from '../../types/network';

interface NetworkSelectorProps {
  className?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ className = '' }) => {
  const { networks, selectedNetwork, selectNetwork, addNetwork } = useNetworkStore();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');

  const handleAddCustomNetwork = () => {
    if (!customUrl || !customName) return;

    const newNetwork: NetworkConfig = {
      id: `custom-${Date.now()}`,
      name: customName,
      url: customUrl,
      type: 'custom'
    };

    addNetwork(newNetwork);
    setShowCustomForm(false);
    setCustomUrl('');
    setCustomName('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="text-sm text-text">Network</label>
        <div className="relative">
          <select
            value={selectedNetwork.id}
            onChange={(e) => selectNetwork(e.target.value)}
            className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                     text-text appearance-none focus:outline-none focus:border-primary pr-10"
          >
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name} ({network.type})
              </option>
            ))}
          </select>
          <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
        </div>
      </div>

      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Network</span>
        </button>
      ) : (
        <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-primary/30">
          <div className="space-y-2">
            <label className="text-sm text-text">Network Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="My Custom Network"
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                       text-text placeholder-text/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text">WebSocket URL</label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="wss://..."
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                       text-text placeholder-text/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCustomForm(false)}
              className="flex-1 px-3 py-2 border border-primary/30 text-primary rounded-lg
                       hover:bg-primary/10 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomNetwork}
              disabled={!customUrl || !customName}
              className="flex-1 px-3 py-2 bg-primary text-background rounded-lg
                       hover:bg-primary/90 transition-colors text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Network
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;