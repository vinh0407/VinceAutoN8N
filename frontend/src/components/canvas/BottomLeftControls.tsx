import React from 'react';
import { Maximize2, Plus, Minus, RotateCcw } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export const BottomLeftControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();

  return (
    <div className="absolute bottom-12 left-4 bg-[#1e1e1e] border border-[#2e2e2e] rounded-full px-2 py-1 flex items-center space-x-1 shadow-2xl z-10 select-none">
      <button
        onClick={() => fitView({ duration: 250 })}
        title="Fit to view"
        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2c2c2c] transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => zoomIn({ duration: 200 })}
        title="Zoom in"
        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2c2c2c] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => zoomOut({ duration: 200 })}
        title="Zoom out"
        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2c2c2c] transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })}
        title="Reset zoom (100%)"
        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2c2c2c] transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
