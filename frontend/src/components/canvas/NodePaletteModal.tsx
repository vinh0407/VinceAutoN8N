import React, { useState } from 'react';
import { X, Search, Plus, Sparkles, Bot, Globe, PlayCircle, Layers } from 'lucide-react';
import { INodeDescription } from '../../types';

interface NodePaletteModalProps {
  nodes: INodeDescription[];
  onSelectNode: (nodeDesc: INodeDescription) => void;
  onClose: () => void;
}

export const NodePaletteModal: React.FC<NodePaletteModalProps> = ({
  nodes,
  onSelectNode,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất Cả Nodes' },
    { id: 'vince', label: '⚡ VinceAuto Nodes' },
    { id: 'piece', label: '🧩 Activepieces Pieces' },
    { id: 'trigger', label: '⏰ Triggers' },
    { id: 'automation', label: '⚙️ Automation' },
  ];

  const filteredNodes = nodes.filter((n) => {
    let matchesCategory = selectedCategory === 'all';
    if (selectedCategory === 'piece') {
      matchesCategory = n.name.startsWith('piece.');
    } else if (selectedCategory === 'vince') {
      matchesCategory = n.category === 'vince' && !n.name.startsWith('piece.');
    } else if (selectedCategory !== 'all') {
      matchesCategory = n.category === selectedCategory;
    }
    const matchesSearch =
      n.displayName.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      n.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-[680px] max-h-[85vh] bg-vince-panel border border-vince-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vince-border bg-vince-dark/60">
          <div>
            <h3 className="text-base font-bold text-slate-100">Thư Viện Nodes VinceAuto</h3>
            <p className="text-xs text-slate-400">Chọn node để thêm vào quy trình tự động hóa</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-vince-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-vince-border/80 bg-vince-card/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm node theo tên, chức năng hoặc dịch vụ..."
              className="w-full bg-vince-dark border border-vince-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>

          <div className="flex space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-vince-card hover:bg-slate-700/60 text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Node Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
          {filteredNodes.map((n) => {
            const isVince = n.category === 'vince';
            const isTrigger = n.category === 'trigger';

            return (
              <div
                key={n.name}
                onClick={() => {
                  onSelectNode(n);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-vince-border bg-vince-card/80 hover:bg-vince-card hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isVince
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : isTrigger
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {isVince ? 'Vince Node' : isTrigger ? 'Trigger' : 'Core'}
                    </span>
                    <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {n.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-vince-border/40 text-[10px] font-mono text-slate-500">
                  {n.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
