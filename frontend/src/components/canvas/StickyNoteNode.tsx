import React, { memo, useState } from 'react';
import { Trash2, Palette } from 'lucide-react';

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; header: string }> = {
  yellow: { bg: 'bg-[#fef9c3]/15', border: 'border-yellow-500/40', text: 'text-yellow-100', header: 'bg-yellow-500/20' },
  blue: { bg: 'bg-[#bfdbfe]/15', border: 'border-sky-500/40', text: 'text-sky-100', header: 'bg-sky-500/20' },
  purple: { bg: 'bg-[#e9d5ff]/15', border: 'border-purple-500/40', text: 'text-purple-100', header: 'bg-purple-500/20' },
  green: { bg: 'bg-[#bbf7d0]/15', border: 'border-emerald-500/40', text: 'text-emerald-100', header: 'bg-emerald-500/20' },
  dark: { bg: 'bg-[#27272a]/70', border: 'border-zinc-600/50', text: 'text-zinc-200', header: 'bg-zinc-800/80' },
};

export const StickyNoteNode = memo((props: any) => {
  const { id, data, selected } = props;
  const [content, setContent] = useState<string>(data?.content || 'Nhập ghi chú quy trình tại đây...');
  const [title, setTitle] = useState<string>(data?.title || 'Ghi Chú Luồng');
  const [color, setColor] = useState<string>(data?.color || 'yellow');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = COLOR_MAP[color] || COLOR_MAP.yellow;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('vince:delete-node', { detail: { nodeId: id } }));
  };

  const handleUpdate = (newTitle: string, newContent: string, newColor: string) => {
    window.dispatchEvent(
      new CustomEvent('vince:update-node-params', {
        detail: {
          nodeId: id,
          parameters: { title: newTitle, content: newContent, color: newColor },
        },
      })
    );
  };

  return (
    <div
      className={`w-64 min-h-[140px] rounded-xl border backdrop-blur-md shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${
        colors.bg
      } ${colors.border} ${selected ? 'ring-2 ring-white/50' : ''}`}
    >
      {/* Header bar */}
      <div className={`px-3 py-1.5 flex items-center justify-between border-b border-white/10 ${colors.header}`}>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleUpdate(e.target.value, content, color);
          }}
          className="bg-transparent text-xs font-bold text-white focus:outline-none w-36 truncate"
          placeholder="Tiêu đề ghi chú..."
        />

        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              title="Đổi màu ghi chú"
              className="p-1 rounded hover:bg-black/20 text-zinc-300 hover:text-white"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-6 p-1.5 bg-[#18181b] border border-zinc-700 rounded-lg shadow-xl flex space-x-1.5 z-50">
                {['yellow', 'blue', 'purple', 'green', 'dark'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setColor(c);
                      setShowColorPicker(false);
                      handleUpdate(title, content, c);
                    }}
                    className={`w-4 h-4 rounded-full border border-white/30 ${
                      c === 'yellow'
                        ? 'bg-amber-400'
                        : c === 'blue'
                        ? 'bg-sky-400'
                        : c === 'purple'
                        ? 'bg-purple-400'
                        : c === 'green'
                        ? 'bg-emerald-400'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDelete}
            title="Xóa ghi chú"
            className="p-1 rounded hover:bg-black/20 text-zinc-300 hover:text-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note body text area */}
      <div className="p-3 flex-1 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleUpdate(title, e.target.value, color);
          }}
          className={`w-full flex-1 bg-transparent text-[11px] leading-relaxed resize-none focus:outline-none placeholder-white/30 ${colors.text}`}
          rows={4}
          placeholder="Ghi chú quy trình..."
        />
      </div>
    </div>
  );
});
