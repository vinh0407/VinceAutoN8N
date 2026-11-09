import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  History,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Loader2,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { IWorkflowVersion, IWorkflow } from '../../types';

interface WorkflowVersionModalProps {
  workflow: IWorkflow;
  isOpen: boolean;
  onClose: () => void;
  onRestoreWorkflow: (restoredWorkflow: IWorkflow) => void;
}

export const WorkflowVersionModal: React.FC<WorkflowVersionModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onRestoreWorkflow,
}) => {
  const [versions, setVersions] = useState<IWorkflowVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSummary, setNewSummary] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVersions = async () => {
    if (!workflow?.id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get(`/api/workflows/${workflow.id}/versions`);
      if (res.data?.success) {
        setVersions(res.data.versions || []);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử phiên bản:', err);
      setErrorMsg('Không thể tải lịch sử phiên bản workflow.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, workflow?.id]);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflow?.id) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await axios.post(`/api/workflows/${workflow.id}/versions`, {
        changeSummary: newSummary.trim() || `Lưu phiên bản tự động lúc ${new Date().toLocaleTimeString('vi-VN')}`,
        nodes: workflow.nodes || [],
        connections: workflow.connections || {},
      });

      if (res.data?.success) {
        setSuccessMsg('Đã tạo bản snapshot phiên bản mới thành công!');
        setNewSummary('');
        setShowCreateForm(false);
        fetchVersions();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Lỗi khi tạo phiên bản mới.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (version: IWorkflowVersion) => {
    if (!workflow?.id) return;
    const confirmRestore = window.confirm(
      `Bạn có chắc chắn muốn khôi phục bản vẽ về Phiên bản v${version.versionNumber} ("${version.changeSummary}")? Các thay đổi chưa lưu hiện tại sẽ được thay thế.`
    );
    if (!confirmRestore) return;

    setRestoringId(version.id);
    setErrorMsg(null);
    try {
      const res = await axios.post(`/api/workflows/${workflow.id}/versions/${version.id}/restore`);
      if (res.data?.success && res.data.workflow) {
        setSuccessMsg(`Đã khôi phục thành công về v${version.versionNumber}!`);
        onRestoreWorkflow(res.data.workflow);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg('Lỗi khi khôi phục phiên bản.');
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-[#18181b] border border-[#2e2e33] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#28282c] bg-[#141416] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#242428] border border-[#36363c] flex items-center justify-center text-[#e6e8ec]">
              <History className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#e6e8ec]">Lịch sử Phiên bản Workflow</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#26262a] text-zinc-300 border border-[#3a3a40]">
                  {versions.length} phiên bản
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Workflow: <strong className="text-zinc-200">{workflow.name}</strong> • Rollback khôi phục bản vẽ bất kỳ lúc nào
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252528] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar & Notices */}
        <div className="px-5 py-3 border-b border-[#28282c] bg-[#1a1a1d] flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400">
            Mỗi lần lưu snapshot sẽ đóng băng toàn bộ cấu hình nodes & connections.
          </span>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#27272b] hover:bg-[#323237] border border-[#3c3c43] text-xs font-semibold text-[#e6e8ec] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Snapshot Mới</span>
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateSnapshot}
            className="px-5 py-3.5 bg-[#1f1f23] border-b border-[#2e2e34] space-y-2.5 animate-in fade-in duration-150 shrink-0"
          >
            <label className="text-[11px] font-semibold text-zinc-300">
              Ghi chú tóm tắt thay đổi (Change Summary):
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Ví dụ: Tích hợp thêm Telegram Bot & TikTok API v2..."
                className="flex-1 bg-[#141416] border border-[#34343a] focus:border-zinc-400 px-3 py-1.5 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-white text-zinc-900 font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Lưu Bản Này</span>
              </button>
            </div>
          </form>
        )}

        {successMsg && (
          <div className="mx-5 my-2.5 px-3.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-5 my-2.5 px-3.5 py-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
              <span className="text-xs">Đang tải lịch sử phiên bản...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-zinc-400">
              <History className="w-10 h-10 mx-auto text-zinc-600 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-300">Chưa có phiên bản nào được lưu</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Bấm "Tạo Snapshot Mới" ở trên để lưu lại trạng thái bản vẽ hiện tại trước khi thực hiện các thay đổi lớn.
                </p>
              </div>
            </div>
          ) : (
            versions.map((ver) => {
              const isRestoring = restoringId === ver.id;
              const createdAtDate = new Date(ver.savedAt || (ver as any).createdAt || Date.now());
              const formattedTime = `${createdAtDate.toLocaleTimeString('vi-VN')} ngày ${createdAtDate.toLocaleDateString('vi-VN')}`;

              return (
                <div
                  key={ver.id}
                  className="p-4 rounded-xl bg-[#202024] border border-[#2e2e34] hover:border-zinc-500 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#2b2b31] border border-[#3e3e46] text-xs font-mono font-bold text-sky-400">
                        v{ver.versionNumber}
                      </span>
                      <span className="text-xs font-bold text-[#e6e8ec]">{ver.changeSummary}</span>
                    </div>

                    <button
                      onClick={() => handleRestore(ver)}
                      disabled={isRestoring}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#2b2b30] hover:bg-[#383840] border border-[#3d3d44] text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      title="Khôi phục về phiên bản này"
                    >
                      {isRestoring ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Khôi phục (Rollback)</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{formattedTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-zinc-500" />
                      <span>{(ver.nodes || (ver as any).snapshot?.nodes)?.length || 0} nodes</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono text-[10.5px] text-zinc-500">
                      ID: {ver.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#28282c] bg-[#141416] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#27272b] hover:bg-[#303035] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
