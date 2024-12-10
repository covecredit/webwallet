import React from 'react';
import { Tent, ShoppingCart, Tag } from 'lucide-react';
import Widget from '../Widget/Widget';

interface MarketItem {
  id: string;
  type: 'NFT' | 'Software' | 'Token';
  name: string;
  description: string;
  author: string;
  price: number;
  icon: string;
}

const mockItems: MarketItem[] = [
  {
    id: '1',
    type: 'NFT',
    name: 'Digital Art #1337',
    description: 'Unique digital artwork on XRPL',
    author: 'CryptoArtist',
    price: 100,
    icon: '🎨'
  },
  {
    id: '2',
    type: 'Software',
    name: 'DeFi Analytics Pro',
    description: 'Advanced trading analytics tool',
    author: 'FinTech Labs',
    price: 500,
    icon: '💻'
  },
  {
    id: '3',
    type: 'Token',
    name: 'GameFi Token',
    description: 'Gaming platform utility token',
    author: 'GameFi DAO',
    price: 50,
    icon: '🎮'
  }
];

const MarketplaceWidget: React.FC = () => {
  return (
    <Widget
      id="marketplace"
      title="Marketplace"
      icon={Tent}
      defaultPosition={{ x: 320, y: 80 }}
      defaultSize={{ width: 800, height: 500 }}
    >
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-nautical-silver border-b border-nautical-wave">
                <th className="py-3 px-4 text-left">Icon</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Author</th>
                <th className="py-3 px-4 text-left">Price (XRP)</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockItems.map((item) => (
                <tr key={item.id} className="border-b border-nautical-wave/30 hover:bg-nautical-wave/20">
                  <td className="py-4 px-4 text-2xl">{item.icon}</td>
                  <td className="py-4 px-4 text-nautical-silver">{item.type}</td>
                  <td className="py-4 px-4 text-nautical-gold font-medium">{item.name}</td>
                  <td className="py-4 px-4 text-nautical-silver">{item.description}</td>
                  <td className="py-4 px-4 text-nautical-silver">{item.author}</td>
                  <td className="py-4 px-4 text-nautical-gold">{item.price}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 bg-nautical-gold/20 hover:bg-nautical-gold/30 rounded-lg transition-colors group"
                        onClick={() => {}}
                      >
                        <ShoppingCart className="w-4 h-4 text-nautical-gold" />
                      </button>
                      <button
                        className="p-2 bg-nautical-wave/20 hover:bg-nautical-wave/30 rounded-lg transition-colors group"
                        onClick={() => {}}
                      >
                        <Tag className="w-4 h-4 text-nautical-silver" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Widget>
  );
};

export default MarketplaceWidget;