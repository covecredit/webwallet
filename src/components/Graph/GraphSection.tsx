import React from 'react';
import { Activity } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';

const mockGraphData = {
  nodes: [
    { id: 'wallet1', label: 'Wallet A', type: 'wallet' },
    { id: 'wallet2', label: 'Wallet B', type: 'wallet' },
    { id: 'tx1', label: 'TX 123', type: 'transaction' }
  ],
  links: [
    { source: 'wallet1', target: 'tx1' },
    { source: 'tx1', target: 'wallet2' }
  ]
};

const GraphSection: React.FC = () => {
  return (
    <div className="bg-background/50 backdrop-blur-md p-6 rounded-lg border border-primary/20">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-primary">Transaction Graph</h2>
      </div>
      
      <div className="h-[300px] relative">
        <ForceGraph2D
          graphData={mockGraphData}
          nodeColor={(node: any) => node.type === 'wallet' ? '#FFD700' : '#4A90E2'}
          nodeLabel={(node: any) => node.label}
          linkColor={() => 'rgba(255, 215, 0, 0.2)'}
          backgroundColor="transparent"
          width={800}
          height={300}
        />
      </div>
    </div>
  );
};

export default GraphSection;