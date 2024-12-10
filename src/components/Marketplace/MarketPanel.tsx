import React from 'react';
import { Tent, ShoppingCart, Tag } from 'lucide-react';
import Widget from '../Widget/Widget';

interface MarketItem {
  id: string;
  type: 'NFT' | 'Token';
  name: string;
  description: string;
  price: number;
  seller: string;
}

const mockItems: MarketItem[] = [
  {
    id: '1',
    type: 'NFT',
    name: 'XRPL Art #1337',
    description: 'Unique digital artwork on XRPL',
    price: 100,
    seller: 'Artist_123'
  },
  {
    id: '2',
    type: 'Token',
    name: 'Gaming Token',
    description: 'Utility token for XRP gaming',
    price: 50,
    seller: 'GameStudio'
  }
];

const MarketPanel: React.FC = () => {
  return (
    <Widget
      id="market"
      title="XRPL Market"
      icon={Tent}
      defaultPosition={{ x: 360, y: 80 }}
      defaultSize={{ width: 800, height: 500 }}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Available Items</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
              My Listings
            </button>
            <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
              Create Listing
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-primary/20">
                <th className="py-3 px-4 text-primary">Type</th>
                <th className="py-3 px-4 text-primary">Name</th>
                <th className="py-3 px-4 text-primary">Description</th>
                <th className="py-3 px-4 text-primary">Price (XRP)</th>
                <th className="py-3 px-4 text-primary">Seller</th>
                <th className="py-3 px-4 text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockItems.map((item) => (
                <tr key={item.id} className="border-b border-primary/10 hover:bg-primary/5">
                  <td className="py-4 px-4 text-text">{item.type}</td>
                  <td className="py-4 px-4 text-primary font-medium">{item.name}</td>
                  <td className="py-4 px-4 text-text">{item.description}</td>
                  <td className="py-4 px-4 text-primary">{item.price}</td>
                  <td className="py-4 px-4 text-text">{item.seller}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                      </button>
                      <button className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors">
                        <Tag className="w-4 h-4 text-primary" />
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

export default MarketPanel;