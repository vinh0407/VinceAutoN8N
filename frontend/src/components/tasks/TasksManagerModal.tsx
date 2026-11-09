import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Repeat,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Workflow,
  Loader2,
  Power,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { ITaskSchedule, IWorkflow } from '../../types';

interface TasksManagerModalProps {
  workflows?: IWorkflow[];
  currentWorkflow?: IWorkflow | null;
  isOpen?: boolean;
  onClose: () => void;
  onOpenWorkflow?: (workflowId: string) => void;
}

export const TasksManagerModal: React.FC<TasksManagerModalProps> = ({
  workflows = [],
  currentWorkflow,
  isOpen = true,
  onClose,
  onOpenWorkflow,
}) => {
  const [tasks, setTasks] = useState<ITaskSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'hourly' | 'weekly' | 'custom_cron' | 'once'>('daily');
  const [dailyTime, setDailyTime] = useState('08:30');
  const [executionType, setExecutionType] = useState<'workflow' | 'ai_prompt'>('workflow');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || currentWorkflow?.id || '');
  const [aiPrompt, setAiPrompt] = useState(
    'Tự động tổng hợp tin tức xu hướng và đăng bài lên TikTok, Meta Threads, Instagram Reels & YouTube Shorts'
  );

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/tasks');
      if (res.data?.success && Array.isArray(res.data.tasks)) {
        setTasks(res.data.tasks);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await axios.post(`/api/tasks/${taskId}/toggle`);
      if (res.data?.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data.task : t)));
      }
    } catch {
      //
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tác vụ này?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      //
    }
  };

  const handleRunNow = async (task: ITaskSchedule) => {
    setRunningTaskId(task.id);
    setFeedbackMsg(null);
    try {
      const res = await axios.post(`/api/tasks/${task.id}/run`);
      if (res.data?.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã thực thi thành công tác vụ "${task.title}".`,
        });
        fetchTasks();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: `Tác vụ gặp lỗi: ${res.data?.error || 'Không xác định'}`,
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: `Lỗi kết nối khi chạy: ${err.message}`,
      });
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setFeedbackMsg(null);

    const payload: Partial<ITaskSchedule> = {
      title,
      description,
      frequency,
      dailyTime: frequency === 'daily' ? dailyTime : undefined,
      workflowId: executionType === 'workflow' ? selectedWorkflowId : undefined,
      workflowName:
        executionType === 'workflow'
          ? workflows.find((w) => w.id === selectedWorkflowId)?.name
          : undefined,
      prompt: executionType !== 'workflow' ? aiPrompt : undefined,
      enabled: true,
      timezone: 'Asia/Ho_Chi_Minh',
    };

    try {
      const res = await axios.post('/api/tasks', payload);
      if (res.data?.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã lên lịch thành công tác vụ "${title}" (Lặp lại mỗi ngày lúc ${dailyTime}).`,
        });
        setTitle('');
        setDescription('');
        setShowCreateForm(false);
        fetchTasks();
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: `Lỗi khi lưu task: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick preset loader
  const applyPreset = (preset: {
    title: string;
    desc: string;
    time: string;
    prompt: string;
  }) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setFrequency('daily');
    setDailyTime(preset.time);
    setExecutionType('ai_prompt');
    setAiPrompt(preset.prompt);
    setShowCreateForm(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="w-[1040px] max-w-[96vw] max-h-[88vh] bg-[#18181b] border border-[#2e2e33] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#28282c] bg-[#141416] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#242428] border border-[#34343a] text-[#e6e8ec] shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-[#e6e8ec] tracking-tight">
                  Quản Lý Task & Lên Lịch Tác Vụ Lặp Lại Mỗi Ngày
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#26262b] text-[#e6e8ec] border border-[#3a3a42]">
                  {tasks.length} Tác Vụ
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Hệ thống tự động thực thi định kỳ các Workflow hoặc giao việc cho AI Agent Opencode2 lặp lại mỗi ngày
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{showCreateForm ? 'Ẩn form tạo' : 'Lên Task Mới'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252528] transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 flex items-center justify-between text-xs shrink-0 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-b border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-[#18181b]">
          {/* Quick Preset Ideas Cards */}
          <div className="p-3.5 rounded-xl bg-[#202024] border border-[#2e2e34] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mẫu Tác Vụ Lặp Lại Mỗi Ngày Gợi Ý (1-Click Sử Dụng)</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  title: 'Đăng bài TikTok, Threads & Shorts 08:30 hàng ngày',
                  desc: 'Quét tin tức xu hướng & đăng đồng loạt lên 4 mạng xã hội',
                  time: '08:30',
                  prompt:
                    'Quét tin tức xu hướng công nghệ sáng nay và đăng bài lên TikTok, Meta Threads, Instagram Reels & YouTube Shorts',
                },
                {
                  title: 'Đối soát VietQR / MoMo 12:00 hàng ngày',
                  desc: 'Kiểm tra giao dịch thanh toán buổi sáng và xuất file Google Sheets',
                  time: '12:00',
                  prompt:
                    'Đối soát toàn bộ callback thanh toán VietQR và MoMo từ đầu ngày, ghi vào Google Sheets và báo cáo Telegram',
                },
                {
                  title: 'Đồng bộ đơn hàng Shopee / TikTok Shop 17:30',
                  desc: 'Tổng hợp doanh số cuối ngày & gửi ZNS Zalo cho khách hàng',
                  time: '17:30',
                  prompt:
                    'Tổng hợp đơn hàng hoàn tất trên Shopee và TikTok Shop trong ngày, lưu vào bảng tính và gửi tin nhắn Zalo ZNS',
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-2.5 rounded-xl bg-[#18181b] hover:bg-[#25252b] border border-[#2e2e34] hover:border-[#45454f] text-left transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      ⏰ {preset.time} Hàng Ngày
                    </span>
                    <span className="text-[9.5px] text-zinc-500 group-hover:text-zinc-200">
                      Chọn mẫu →
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#e6e8ec] leading-snug line-clamp-1">
                    {preset.title}
                  </h4>
                  <p className="text-[10.5px] text-zinc-400 line-clamp-1">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Tạo Task Mới (Collapsible) */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateTask}
              className="p-4 rounded-xl bg-[#202024] border border-[#3e3e48] shadow-xl space-y-3.5 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#2c2c32] pb-2">
                <span className="text-xs font-bold text-[#e6e8ec] flex items-center space-x-1.5">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span>Thiết Lập Tác Vụ Lặp Lại Mới</span>
                </span>
                <span className="text-[10px] text-zinc-400">Timezone: Asia/Ho_Chi_Minh (GMT+7)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">Tên Tác Vụ *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Đăng bài tự động lên TikTok & Threads mỗi sáng..."
                    className="w-full bg-[#161618] border border-[#323238] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">Chu Kỳ Lặp Lại *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFrequency('daily')}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        frequency === 'daily'
                          ? 'bg-[#e6e8ec] text-zinc-900 border-[#e6e8ec]'
                          : 'bg-[#161618] text-zinc-400 border-[#323238]'
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Hàng Ngày</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency('hourly')}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        frequency === 'hourly'
                          ? 'bg-[#e6e8ec] text-zinc-900 border-[#e6e8ec]'
                          : 'bg-[#161618] text-zinc-400 border-[#323238]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mỗi Giờ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency('weekly')}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                        frequency === 'weekly'
                          ? 'bg-[#e6e8ec] text-zinc-900 border-[#e6e8ec]'
                          : 'bg-[#161618] text-zinc-400 border-[#323238]'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Hàng Tuần</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Configuration for Daily Frequency */}
              {frequency === 'daily' && (
                <div className="p-3 rounded-lg bg-[#18181b] border border-[#2c2c32] flex items-center space-x-4">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-200 block">
                      Giờ Thực Thi Lặp Lại Mỗi Ngày
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Tác vụ sẽ tự động kích hoạt đều đặn vào thời điểm này mỗi ngày
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={dailyTime}
                      onChange={(e) => setDailyTime(e.target.value)}
                      className="bg-[#242428] border border-[#383840] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#e6e8ec]"
                    />
                    <span className="text-xs font-semibold text-zinc-400">(24h Format)</span>
                  </div>
                </div>
              )}

              {/* Execution Action Type (Linked Workflow OR Natural Language AI Prompt) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 block">Phương Thức Thực Thi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExecutionType('workflow')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      executionType === 'workflow'
                        ? 'bg-[#28282e] border-zinc-200 text-white'
                        : 'bg-[#161618] border-[#303036] text-zinc-400'
                    }`}
                  >
                    <Workflow className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Chạy Workflow Tự Động</div>
                      <div className="text-[10px] text-zinc-400">Kích hoạt một bản vẽ có sẵn trong dự án</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExecutionType('ai_prompt')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      executionType === 'ai_prompt'
                        ? 'bg-[#28282e] border-zinc-200 text-white'
                        : 'bg-[#161618] border-[#303036] text-zinc-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Giao Việc Cho AI Agent Opencode2</div>
                      <div className="text-[10px] text-zinc-400">Thực thi tự động bằng câu lệnh ngôn ngữ tự nhiên</div>
                    </div>
                  </button>
                </div>
              </div>

              {executionType === 'workflow' ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">Chọn Bản Vẽ Workflow</label>
                  <select
                    value={selectedWorkflowId}
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-[#161618] border border-[#323238] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e6e8ec]"
                  >
                    {workflows.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.nodes?.length || 0} nodes)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">
                    Nhiệm Vụ Giao Cho AI Agent (Opencode2 crouton-alpha-free)
                  </label>
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Mô tả công việc cần AI Agent tự động thực hiện định kỳ..."
                    className="w-full bg-[#161618] border border-[#323238] rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec] resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Lưu & Kích Hoạt Lịch Chạy</span>
                </button>
              </div>
            </form>
          )}

          {/* Danh Sách Các Task Đã Lên Lịch */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Danh Sách Tác Vụ Định Kỳ & Lặp Lại ({tasks.length})
              </span>
              <span className="text-[11px] text-zinc-500">
                Tự động chạy ngầm trên nền tảng VinceAuto
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 space-x-2 text-zinc-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-[#e6e8ec]" />
                <span>Đang tải danh sách task...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#1c1c20] rounded-xl border border-[#2a2a30]">
                <Calendar className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-xs text-zinc-300 font-medium">Chưa có tác vụ nào được lên lịch</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#e6e8ec] text-zinc-900 font-bold text-xs shadow hover:bg-white cursor-pointer"
                >
                  Tạo tác vụ lặp lại đầu tiên
                </button>
              </div>
            ) : (
              tasks.map((task) => {
                const isRunning = runningTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      task.enabled
                        ? 'bg-[#202024] border-[#2e2e34] hover:border-[#42424b]'
                        : 'bg-[#19191c] border-[#26262a] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-xs font-bold text-[#e6e8ec] leading-snug">
                            {task.title}
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                              task.enabled
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {task.enabled ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
                          {task.frequency === 'daily' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Lặp lại mỗi ngày lúc {task.dailyTime || '08:00'}
                            </span>
                          )}
                          {task.frequency === 'hourly' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                              Lặp lại mỗi giờ
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-zinc-400">{task.description}</p>
                        )}

                        {task.workflowName && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-sky-300 pt-0.5">
                            <Workflow className="w-3.5 h-3.5" />
                            <span>Workflow liên kết: <strong>{task.workflowName}</strong></span>
                            {onOpenWorkflow && task.workflowId && (
                              <button
                                onClick={() => onOpenWorkflow(task.workflowId!)}
                                className="underline hover:text-white cursor-pointer ml-1"
                              >
                                (Mở bản vẽ)
                              </button>
                            )}
                          </div>
                        )}

                        {task.prompt && (
                          <div className="text-[11px] text-zinc-300 bg-[#161618] p-2 rounded-lg border border-[#28282d] font-mono">
                            🤖 AI Prompt: {task.prompt}
                          </div>
                        )}
                      </div>

                      {/* Controls right */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRunNow(task)}
                          disabled={isRunning}
                          className="px-3 py-1.5 rounded-lg bg-[#28282e] hover:bg-[#32323a] text-zinc-200 hover:text-white border border-[#3e3e46] text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-sm"
                          title="Kích hoạt chạy ngay lập tức mà không cần đợi đến giờ"
                        >
                          {isRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                          )}
                          <span>{isRunning ? 'Đang chạy...' : 'Chạy Ngay'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            task.enabled
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                          title={task.enabled ? 'Tạm dừng lịch chạy' : 'Kích hoạt lại lịch chạy'}
                        >
                          <Power className="w-4 h-4 stroke-[2.2]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa tác vụ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#2a2a30] text-[10.5px] text-zinc-400">
                      <div className="flex items-center space-x-4">
                        <span>
                          Số lần đã lặp: <strong className="text-zinc-200">{task.runCount || 0} lần</strong>
                        </span>
                        <span>
                          Chạy gần nhất:{' '}
                          <strong className="text-zinc-200">
                            {task.lastRunAt ? new Date(task.lastRunAt).toLocaleTimeString('vi-VN') : 'Chưa chạy'}
                          </strong>
                        </span>
                        {task.nextRunAt && (
                          <span className="text-emerald-400 font-medium">
                            Lần chạy kế tiếp: {new Date(task.nextRunAt).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Sẵn sàng trong Cron Daemon</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
