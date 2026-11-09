import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Wrench,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { IExecutionSummary } from '../../types';

interface ExecutionMonitorProps {
  summary: IExecutionSummary | null;
  isRunning: boolean;
  onClose: () => void;
  onApplyFix?: (nodeId: string, fixedParameters: Record<string, any>) => void;
  onReRun?: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  summary,
  isRunning,
  onClose,
  onApplyFix,
  onReRun,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  if (!summary && !isRunning) return null;

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const resultsList = summary ? Object.values(summary.results || {}) : [];
  const activeNodeResult = selectedNodeId && summary?.results ? summary.results[selectedNodeId] : resultsList[0];

  return (
    <div className="fixed bottom-0 inset-x-0 h-[380px] bg-vince-panel border-t border-vince-border z-40 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-vince-border bg-vince-dark/80">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isRunning ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            ) : summary?.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <h3 className="text-sm font-bold text-slate-100">
              {isRunning
                ? 'Đang thực thi quy trình...'
                : summary?.status === 'success'
                ? 'Thực thi Thành Công'
                : 'Thực thi Thất Bại'}
            </h3>
          </div>

          {summary && (
            <div className="flex items-center space-x-3 text-xs text-slate-400 border-l border-vince-border pl-3">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{summary.durationMs}ms</span>
              </span>
              <span>•</span>
              <span>{resultsList.length} nodes đã chạy</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onReRun && !isRunning && (
            <button
              onClick={onReRun}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-vince-card hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-vince-border transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chạy lại</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-vince-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Node Execution List */}
        <div className="w-[340px] border-r border-vince-border overflow-y-auto p-3 space-y-2 bg-vince-dark/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Danh sách Nodes ({resultsList.length})
          </span>

          {resultsList.map((res: any) => {
            const isSelected = activeNodeResult?.nodeId === res.nodeId;
            return (
              <div
                key={res.nodeId}
                onClick={() => setSelectedNodeId(res.nodeId)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-vince-card border-cyan-400 ring-1 ring-cyan-400/20'
                    : 'bg-vince-panel hover:bg-vince-card/60 border-vince-border/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    {res.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 truncate">{res.nodeName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{res.durationMs}ms</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono truncate">{res.nodeType}</span>
                  <span>{res.data ? `${res.data.length} items` : '0 items'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Output Payload & Self-Healing Assistant */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Self-Healing Alert Banner if present */}
          {summary?.selfHealing && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-400">
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    VinceAuto Self-Healing Assistant
                  </span>
                </div>
                {onApplyFix && summary.selfHealing.autoFixAvailable && (
                  <button
                    onClick={() =>
                      onApplyFix(
                        summary.selfHealing!.nodeId,
                        summary.selfHealing!.suggestedParameters
                      )
                    }
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Áp Dụng Tự Động Sửa & Chạy Lại</span>
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-rose-300">
                  Chẩn đoán: {summary.selfHealing.issueDiagnosis}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  💡 {summary.selfHealing.explanation}
                </p>
              </div>

              <div className="text-[11px] font-mono bg-vince-dark/80 p-2.5 rounded-lg border border-vince-border text-slate-300">
                <span className="text-emerald-400 font-bold">Tham số đề xuất:</span>
                <pre className="mt-1 max-h-24 overflow-y-auto">
                  {JSON.stringify(summary.selfHealing.suggestedParameters, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Active Node Output Inspection */}
          {activeNodeResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{activeNodeResult.nodeName}</h4>
                  <p className="text-xs font-mono text-slate-400">{activeNodeResult.nodeType}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                    activeNodeResult.status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {activeNodeResult.status}
                </span>
              </div>

              {activeNodeResult.error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  ❌ {activeNodeResult.error.message}
                </div>
              )}

              {activeNodeResult.data && (
                <div className="rounded-xl border border-vince-border bg-vince-dark/60 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-vince-border/50 text-xs text-slate-400">
                    <span>Output Data JSON</span>
                    <span>{activeNodeResult.data.length} Items</span>
                  </div>
                  <pre className="text-xs font-mono text-cyan-300 overflow-x-auto max-h-[160px]">
                    {JSON.stringify(activeNodeResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Chọn một node bên trái để xem chi tiết dữ liệu thực thi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
