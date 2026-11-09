import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyCanvasStateProps {
  onAddFirstStep: () => void;
  onBuildWithAI: () => void;
}

export const EmptyCanvasState: React.FC<EmptyCanvasStateProps> = ({
  onAddFirstStep,
  onBuildWithAI,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="flex items-center space-x-6 pointer-events-auto">
        {/* Card 1: Add first step... */}
        <div className="flex flex-col items-center">
          <button
            onClick={onAddFirstStep}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#383838] hover:border-slate-300 bg-[#1a1a1a]/40 hover:bg-[#202020] flex items-center justify-center text-slate-400 hover:text-white transition-all group shadow-xl"
          >
            <Plus className="w-8 h-8 stroke-[1.5] group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-medium text-slate-300 mt-2.5">
            Add first step...
          </span>
        </div>

        {/* Text: or */}
        <span className="text-xs text-slate-500 font-medium pb-5">or</span>

        {/* Card 2: Build with AI */}
        <div className="flex flex-col items-center">
          <button
            onClick={onBuildWithAI}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#383838] hover:border-[#e6e8ec] bg-[#1a1a1a]/40 hover:bg-[#202020] flex items-center justify-center text-slate-400 hover:text-[#e6e8ec] transition-all group shadow-xl"
          >
            <Sparkles className="w-8 h-8 stroke-[1.5] group-hover:scale-110 transition-transform text-slate-300 group-hover:text-[#e6e8ec]" />
          </button>
          <span className="text-xs font-medium text-slate-300 mt-2.5">
            Build with AI
          </span>
        </div>
      </div>
    </div>
  );
};
