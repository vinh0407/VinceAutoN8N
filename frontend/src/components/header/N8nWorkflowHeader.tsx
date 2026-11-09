import React, { useState } from 'react';
import {
  FolderClosed,
  MoreHorizontal,
  ChevronDown,
  Play,
  Save,
  Check,
  Loader2,
  Trash2,
  Download,
  Upload,
  Clock,
  History,
  Database,
} from 'lucide-react';
import { IWorkflow } from '../../types';

interface N8nWorkflowHeaderProps {
  workflow: IWorkflow | null;
  projectName?: string;
  activeTab?: 'editor' | 'executions' | 'evaluations';
  setActiveTab?: (tab: 'editor' | 'executions' | 'evaluations') => void;
  onUpdateWorkflowName: (name: string) => void;
  onToggleActive: (active: boolean) => void;
  onSave: () => void;
  onExecute: () => void;
  onExportWorkflow: () => void;
  onOpenTasks?: () => void;
  onOpenVersions?: () => void;
  onOpenTables?: () => void;
  isRunning: boolean;
}

export const N8nWorkflowHeader: React.FC<N8nWorkflowHeaderProps> = ({
  workflow,
  projectName = 'Dự án',
  onUpdateWorkflowName,
  onToggleActive,
  onSave,
  onExecute,
  onExportWorkflow,
  onOpenTasks,
  onOpenVersions,
  onOpenTables,
  isRunning,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow?.name || 'My workflow 2');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);

  const isActive = Boolean(workflow?.active);

  const handleFinishEdit = () => {
    setIsEditing(false);
    if (name.trim()) onUpdateWorkflowName(name.trim());
  };

  return (
    <header className="h-12 bg-[#141414] border-b border-[#222222] px-4 flex items-center justify-between select-none z-20">
      {/* Left: Breadcrumbs (Screenshot 3) */}
      <div className="flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300 font-medium hover:text-white cursor-pointer">
          <FolderClosed className="w-3.5 h-3.5 text-zinc-300" />
          <span>{projectName}</span>
        </div>

        <span className="text-slate-600">/</span>

        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleFinishEdit()}
            autoFocus
            className="bg-[#222222] border border-zinc-400 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="text-white font-medium hover:text-slate-200 cursor-pointer"
          >
            {workflow?.name || 'My workflow 2'}
          </span>
        )}

        {/* More options button "..." (Screenshot 3) */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMoreMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
              <div className="absolute left-0 mt-1 w-44 bg-[#1f1f1f] border border-[#2e2e2e] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setIsEditing(true);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#282828] hover:text-white"
                >
                  Rename workflow
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onExportWorkflow();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#282828] hover:text-white flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Publish button & Test Workflow (Screenshot 3) */}
      <div className="flex items-center space-x-2">
        {onOpenTasks && (
          <button
            onClick={onOpenTasks}
            title="Quản lý lịch trình & Task lặp lại mỗi ngày"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#1f1f22] hover:bg-[#28282c] border border-[#333338] text-xs font-semibold text-sky-300 hover:text-white transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Lên Task Hàng Ngày</span>
          </button>
        )}

        {onOpenVersions && (
          <button
            onClick={onOpenVersions}
            title="Lịch sử phiên bản & Rollback bản vẽ"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#1f1f22] hover:bg-[#28282c] border border-[#333338] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Phiên bản</span>
          </button>
        )}

        {onOpenTables && (
          <button
            onClick={onOpenTables}
            title="Bảng dữ liệu nội bộ (Data Tables)"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#1f1f22] hover:bg-[#28282c] border border-[#333338] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Data Tables</span>
          </button>
        )}

        <button
          onClick={onSave}
          title="Save changes"
          className="px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-xs text-slate-300 hover:text-white border border-[#2e2e2e] transition-colors"
        >
          Save
        </button>

        <button
          onClick={onExecute}
          disabled={isRunning}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#e6e8ec] hover:bg-white disabled:opacity-50 text-zinc-900 font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
          ) : (
            <Play className="w-3 h-3 fill-current text-zinc-900" />
          )}
          <span>{isRunning ? 'Running...' : 'Test workflow'}</span>
        </button>

        {/* Publish Pill Button with Chevron (Screenshot 3) */}
        <div className="relative">
          <button
            onClick={() => setShowPublishMenu(!showPublishMenu)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isActive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-[#222222] border-[#2e2e2e] text-slate-300 hover:text-white hover:bg-[#2c2c2c]'
            }`}
          >
            <span>{isActive ? 'Published' : 'Publish'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPublishMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPublishMenu(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-[#1f1f1f] border border-[#2e2e2e] rounded-xl shadow-2xl p-2 z-50">
                <div className="flex items-center justify-between p-1.5">
                  <span className="text-xs text-slate-300 font-medium">Activate workflow</span>
                  <button
                    onClick={() => {
                      onToggleActive(!isActive);
                      setShowPublishMenu(false);
                    }}
                    className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 flex items-center ${
                      isActive ? 'bg-emerald-500' : 'bg-[#383838]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
