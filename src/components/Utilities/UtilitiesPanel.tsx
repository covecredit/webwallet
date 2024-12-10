import React from 'react';
import { Wrench } from 'lucide-react';
import Widget from '../Widget/Widget';
import NetworkInfo from './NetworkInfo';
import WorldTime from './WorldTime';

const UtilitiesPanel: React.FC = () => {
  return (
    <Widget
      id="utilities"
      title="Utilities"
      icon={Wrench}
      defaultPosition={{ x: window.innerWidth - 340, y: 80 }}
      defaultSize={{ width: 320, height: 500 }}
    >
      <div className="p-4 space-y-6">
        <NetworkInfo />
        <WorldTime />
      </div>
    </Widget>
  );
};

export default UtilitiesPanel;