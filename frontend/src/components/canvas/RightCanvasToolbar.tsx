import React, { useState } from 'react';
import { Plus, Sparkles, LayoutGrid, StickyNote, Wand2 } from 'lucide-react';

interface RightCanvasToolbarProps {
  onAddNode: () => void;
  onSearch?: () => void;
  onToggleAssistant?: () => void;
  onOpenTemplates?: () => void;
  onAddStickyNote?: () => void;
  onAutoLayout?: () => void;
}

export const RightCanvasToolbar: React.FC<RightCanvasToolbarProps> = ({
  onAddNode,
  onToggleAssistant,
  onOpenTemplates,
  onAddStickyNote,
  onAutoLayout,
}) => {
  const [hoveredPlus, setHoveredPlus] = useState(false);
  const [hoveredAI, setHoveredAI] = useState(false);
  const [hoveredTemplates, setHoveredTemplates] = useState(false);
  const [hoveredNote, setHoveredNote] = useState(false);
  const [hoveredLayout, setHoveredLayout] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2 select-none">
      {/* 1. Plus Button: Open nodes panel [N] */}
      <div className="relative flex items-center">
        {hoveredPlus && (
          <div className="absolute right-11 flex items-center space-x-2 bg-[#0c0c0e] border border-[#2b2b2f] px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#e6e8ec] whitespace-nowrap shadow-2xl animate-in fade-in duration-100">
            <span>Open nodes panel</span>
            <span className="w-5 h-5 rounded-full bg-[#404046] text-zinc-200 flex items-center justify-center text-[10px] font-bold">
              N
            </span>
          </div>
        )}

        <button
          onClick={onAddNode}
          onMouseEnter={() => setHoveredPlus(true)}
          onMouseLeave={() => setHoveredPlus(false)}
          className="w-9 h-9 rounded-full bg-[#1e1e20] hover:bg-[#28282b] border border-[#333338] hover:border-zinc-400 flex items-center justify-center text-[#e6e8ec] hover:text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Open nodes panel (N)"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* 2. Nút AI Assistant */}
      <div className="relative flex items-center">
        {hoveredAI && (
          <div className="absolute right-11 flex items-center space-x-2 bg-[#0c0c0e] border border-[#2b2b2f] px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#e6e8ec] whitespace-nowrap shadow-2xl animate-in fade-in duration-100">
            <span>VinceAuto AI Assistant</span>
            <span className="w-5 h-5 rounded-full bg-[#404046] text-zinc-200 flex items-center justify-center text-[10px] font-bold">
              AI
            </span>
          </div>
        )}

        <button
          onClick={onToggleAssistant}
          onMouseEnter={() => setHoveredAI(true)}
          onMouseLeave={() => setHoveredAI(false)}
          className="w-9 h-9 rounded-full bg-[#1e1e20] hover:bg-[#28282b] border border-[#333338] hover:border-zinc-300 flex items-center justify-center text-[#e6e8ec] hover:text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="VinceAuto AI Assistant"
        >
          <Sparkles className="w-4.5 h-4.5 text-[#e6e8ec]" />
        </button>
      </div>

      {/* 3. Nút Mẫu dự án (Chỉ icon) */}
      <div className="relative flex items-center">
        {hoveredTemplates && (
          <div className="absolute right-11 flex items-center space-x-2 bg-[#0c0c0e] border border-[#2b2b2f] px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#e6e8ec] whitespace-nowrap shadow-2xl animate-in fade-in duration-100">
            <span>Mẫu dự án</span>
          </div>
        )}

        <button
          onClick={onOpenTemplates}
          onMouseEnter={() => setHoveredTemplates(true)}
          onMouseLeave={() => setHoveredTemplates(false)}
          className="w-9 h-9 rounded-full bg-[#1e1e20] hover:bg-[#28282b] border border-[#333338] hover:border-zinc-300 flex items-center justify-center text-[#e6e8ec] hover:text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Mẫu dự án"
        >
          <LayoutGrid className="w-4.5 h-4.5 text-[#e6e8ec]" />
        </button>
      </div>

      {/* 4. Nút Sticky Note */}
      {onAddStickyNote && (
        <div className="relative flex items-center">
          {hoveredNote && (
            <div className="absolute right-11 flex items-center space-x-2 bg-[#0c0c0e] border border-[#2b2b2f] px-3 py-1.5 rounded-full text-[12px] font-semibold text-amber-300 whitespace-nowrap shadow-2xl animate-in fade-in duration-100">
              <span>Sticky Note</span>
            </div>
          )}

          <button
            onClick={onAddStickyNote}
            onMouseEnter={() => setHoveredNote(true)}
            onMouseLeave={() => setHoveredNote(false)}
            className="w-9 h-9 rounded-full bg-[#1e1e20] hover:bg-[#28282b] border border-[#333338] hover:border-amber-400/50 flex items-center justify-center text-amber-300 hover:text-amber-200 shadow-xl transition-all hover:scale-105 cursor-pointer"
            title="Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Nút Tidy Up (Auto-layout DAG) */}
      {onAutoLayout && (
        <div className="relative flex items-center">
          {hoveredLayout && (
            <div className="absolute right-11 flex items-center space-x-2 bg-[#0c0c0e] border border-[#2b2b2f] px-3 py-1.5 rounded-full text-[12px] font-semibold text-sky-300 whitespace-nowrap shadow-2xl animate-in fade-in duration-100">
              <span>Tidy Up</span>
            </div>
          )}

          <button
            onClick={onAutoLayout}
            onMouseEnter={() => setHoveredLayout(true)}
            onMouseLeave={() => setHoveredLayout(false)}
            className="w-9 h-9 rounded-full bg-[#1e1e20] hover:bg-[#28282c] border border-[#333338] hover:border-sky-400/50 flex items-center justify-center text-sky-300 hover:text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
            title="Tidy Up"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

