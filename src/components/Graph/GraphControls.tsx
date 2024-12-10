import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCenter: () => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onCenter
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex space-x-2 bg-background/95 p-2 rounded-lg border border-primary/30 z-10">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-primary" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-primary" />
      </button>
      <button
        onClick={onCenter}
        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
        title="Center Graph"
      >
        <Maximize2 className="w-5 h-5 text-primary" />
      </button>
      <button
        onClick={onReset}
        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
        title="Reset Graph"
      >
        <RotateCcw className="w-5 h-5 text-primary" />
      </button>
    </div>
  );
};

export default GraphControls;