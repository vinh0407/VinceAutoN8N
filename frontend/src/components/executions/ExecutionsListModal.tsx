import React, { useEffect, useState } from 'react';
import { X, History, CheckCircle2, AlertCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { IExecutionSummary } from '../../types';

interface ExecutionsListModalProps {
  onSelectExecution: (execution: IExecutionSummary) => void;
  onClose: () => void;
}

export const ExecutionsListModal: React.FC<ExecutionsListModalProps> = ({
  onSelectExecution,
  onClose,
}) => {
  const [history, setHistory] = useState<IExecutionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = () => {
    setIsLoading(true);
    axios
      .get('/api/executions')
      .then((res) => {
        if (res.data?.success) {
          setHistory(res.data.history || []);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-150 select-none">
      <div className="w-[850px] max-h-[85vh] bg-[#181d28] border border-[#2e384d] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#2e384d] bg-[#1e2433] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#ff6d5a]/20 text-[#ff6d5a]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lịch Sử Thực Thi (Executions)</h3>
              <p className="text-xs text-slate-400">Danh sách các lần chạy workflow tự động & thủ công</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchHistory}
              title="Làm mới"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#283245] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#283245] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              Chưa có lượt chạy nào được ghi nhận. Bấm "Test workflow" để bắt đầu!
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2e384d] text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Workflow</th>
                  <th className="py-2.5 px-3">Thời gian bắt đầu</th>
                  <th className="py-2.5 px-3">Thời lượng</th>
                  <th className="py-2.5 px-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262f40]">
                {history.map((item) => {
                  const isSuccess = item.status === 'success';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        onSelectExecution(item);
                        onClose();
                      }}
                      className="hover:bg-[#1e2433] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {item.workflowName}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(item.startedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{item.durationMs ?? 0}ms</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-slate-500 group-hover:text-[#ff6d5a] transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
