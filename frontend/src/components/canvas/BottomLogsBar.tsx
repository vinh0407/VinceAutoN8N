import React from 'react';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

interface BottomLogsBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const BottomLogsBar: React.FC<BottomLogsBarProps> = ({ isOpen, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className="h-7 bg-[#141414] border-t border-[#222222] px-4 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none transition-colors z-20"
    >
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-[11px] text-slate-300">Logs</span>
      </div>

      <div className="flex items-center space-x-3">
        <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </div>
    </div>
  );
};
