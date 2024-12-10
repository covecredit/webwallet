import React, { useCallback, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphNode, GraphLink } from '../types';

interface TransactionGraphProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  onNodeClick?: (node: GraphNode) => void;
  zoomLevel?: number;
}

const getNodeColor = (node: any) => {
  switch (node.type) {
    case 'wallet':
      return '#FFD700'; // Gold
    case 'transaction':
      return '#E6E8E6'; // Silver
    case 'ledger':
      return '#4169E1'; // Royal Blue
    case 'computer':
      return '#32CD32'; // Lime Green
    default:
      return '#C0C0C0'; // Default silver
  }
};

const getNodeSize = (node: any) => {
  switch (node.type) {
    case 'wallet':
      return 20;
    case 'transaction':
      return 15;
    case 'ledger':
      return 25;
    case 'computer':
      return 30;
    default:
      return 15;
  }
};

const TransactionGraph: React.FC<TransactionGraphProps> = ({
  data,
  onNodeClick,
  zoomLevel = 1
}) => {
  const graphRef = useRef<any>();
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  const handleNodeDragStart = useCallback((node: GraphNode) => {
    setDraggedNode(node);
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-100);
    }
  }, []);

  const handleNodeDrag = useCallback((node: GraphNode) => {
    if (draggedNode && graphRef.current) {
      node.fx = node.x;
      node.fy = node.y;
    }
  }, [draggedNode]);

  const handleNodeDragEnd = useCallback((node: GraphNode) => {
    if (draggedNode) {
      node.fx = null;
      node.fy = null;
      setDraggedNode(null);
      if (graphRef.current) {
        graphRef.current.d3Force('charge').strength(-30);
      }
    }
  }, [draggedNode]);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      nodeColor={getNodeColor}
      nodeVal={getNodeSize}
      linkColor={() => 'rgba(255, 215, 0, 0.2)'}
      linkWidth={2}
      nodeLabel={(node: any) => `${node.label || node.id}`}
      onNodeClick={onNodeClick}
      onNodeDragStart={handleNodeDragStart}
      onNodeDrag={handleNodeDrag}
      onNodeDragEnd={handleNodeDragEnd}
      enableNodeDrag={true}
      backgroundColor="transparent"
      width={window.innerWidth - 100}
      height={window.innerHeight - 200}
      zoom={zoomLevel}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleSpeed={0.005}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      cooldownTime={2000}
      nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.label || node.id;
        const fontSize = 12/globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

        ctx.fillStyle = getNodeColor(node);
        ctx.beginPath();
        ctx.arc(node.x, node.y, getNodeSize(node)/globalScale, 0, 2 * Math.PI);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1A1B26';
        ctx.fillText(label, node.x, node.y);
      }}
    />
  );
};

export default TransactionGraph;