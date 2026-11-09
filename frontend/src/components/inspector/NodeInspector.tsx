import React from 'react';
import { X, Trash2, Info, Settings } from 'lucide-react';
import { INodeDescription } from '../../types';

interface NodeInspectorProps {
  node: any | null;
  nodeDescription?: INodeDescription;
  onUpdateParameters: (nodeId: string, parameters: Record<string, any>) => void;
  onUpdateName: (nodeId: string, name: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  nodeDescription,
  onUpdateParameters,
  onUpdateName,
  onDeleteNode,
  onClose,
}) => {
  if (!node) return null;

  const parameters = node.data?.parameters || {};

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...parameters, [key]: value };
    onUpdateParameters(node.id, updated);
  };

  const properties = nodeDescription?.properties || [];

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-vince-panel border-l border-vince-border z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-vince-border bg-vince-dark/40">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Cấu Hình Node</h3>
            <p className="text-[11px] font-mono text-slate-400">{node.data?.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onDeleteNode(node.id)}
            title="Xóa Node"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-vince-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Node Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Node</label>
          <input
            type="text"
            value={node.data?.name || ''}
            onChange={(e) => onUpdateName(node.id, e.target.value)}
            className="w-full bg-vince-card border border-vince-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Dynamic Properties */}
        {properties.map((prop) => {
          const val = parameters[prop.name] !== undefined ? parameters[prop.name] : prop.default ?? '';

          return (
            <div key={prop.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {prop.displayName}
                  {prop.required && <span className="text-rose-400 ml-1">*</span>}
                </label>
              </div>

              {prop.type === 'options' ? (
                <select
                  value={val}
                  onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                  className="w-full bg-vince-card border border-vince-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  {prop.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-vince-dark">
                      {opt.name}
                    </option>
                  ))}
                </select>
              ) : prop.type === 'json' || prop.type === 'code' ? (
                <textarea
                  value={typeof val === 'object' ? JSON.stringify(val, null, 2) : val}
                  onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                  rows={prop.type === 'code' ? 6 : 4}
                  className="w-full bg-vince-card border border-vince-border rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 resize-none"
                />
              ) : (
                <input
                  type={prop.type === 'number' ? 'number' : 'text'}
                  value={val}
                  onChange={(e) =>
                    handleFieldChange(
                      prop.name,
                      prop.type === 'number' ? Number(e.target.value) : e.target.value
                    )
                  }
                  placeholder={prop.placeholder}
                  className="w-full bg-vince-card border border-vince-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              )}

              {prop.description && (
                <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  <span>{prop.description}</span>
                </p>
              )}
            </div>
          );
        })}

        {/* Expression Helper Note */}
        <div className="p-3 rounded-xl bg-vince-card/80 border border-vince-border/50 text-[11px] text-slate-400 space-y-1">
          <span className="font-semibold text-cyan-400">💡 Biểu thức động (Expression):</span>
          <p>
            Bạn có thể dùng <code className="text-cyan-300 font-mono">{'{{ $json.field }}'}</code> hoặc{' '}
            <code className="text-cyan-300 font-mono">{"{{ $('Tên Node').item.json.field }}"}</code> để lấy dữ liệu từ node trước.
          </p>
        </div>
      </div>
    </div>
  );
};
