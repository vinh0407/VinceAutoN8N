import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Check,
  ArrowRight,
  ChevronRight,
  X,
  Bot,
  MessageSquare,
  Activity,
  CheckCircle2,
  Clock,
  FolderClosed,
  Terminal,
  Boxes,
  Zap,
  Play,
  PlusCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';
import axios from 'axios';
import { IWorkflow } from '../../types';
import {
  IAIChatHistoryItem,
  IAIAgentProjectLog,
  DEFAULT_CHAT_HISTORY,
  DEFAULT_AGENT_PROJECT_LOGS,
} from '../sidebar/N8nSidebar';
import {
  OPENCODE2_PROVIDER_CONFIG,
  AGENT_SLASH_COMMANDS,
  DRAGGABLE_NODE_PROMPTS,
  PREBUILT_AGENT_WORKFLOW_PROMPTS,
} from '../../data/agentNodePrompts';

interface AIWorkflowAssistantProps {
  currentWorkflow?: IWorkflow | null;
  onApplyWorkflow: (workflow: IWorkflow) => void;
  onClose: () => void;
  selectedChatItem?: IAIChatHistoryItem | null;
  selectedAgentLog?: IAIAgentProjectLog | null;
  chatHistory?: IAIChatHistoryItem[];
  agentProjectLogs?: IAIAgentProjectLog[];
  onNewChatAdded?: (item: IAIChatHistoryItem, log: IAIAgentProjectLog) => void;
}

export const AIWorkflowAssistant: React.FC<AIWorkflowAssistantProps> = ({
  currentWorkflow,
  onApplyWorkflow,
  onClose,
  selectedChatItem,
  selectedAgentLog,
  chatHistory = DEFAULT_CHAT_HISTORY,
  agentProjectLogs = DEFAULT_AGENT_PROJECT_LOGS,
  onNewChatAdded,
}) => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'node_prompts' | 'history_chat' | 'history_project'
  >('chat');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    summary: string;
    steps: string[];
    workflow: IWorkflow;
    modelUsed?: string;
    providerUsed?: string;
    commandExecuted?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeHistoryChat, setActiveHistoryChat] = useState<IAIChatHistoryItem | null>(null);
  const [activeHistoryLog, setActiveHistoryLog] = useState<IAIAgentProjectLog | null>(null);
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [nodePromptCategory, setNodePromptCategory] = useState<
    'all' | 'trigger' | 'app' | 'transform' | 'flow_core' | 'ai_agent'
  >('all');
  const [nodePromptSearch, setNodePromptSearch] = useState('');
  const [isDragOverPrompt, setIsDragOverPrompt] = useState(false);

  useEffect(() => {
    if (selectedChatItem) {
      setActiveHistoryChat(selectedChatItem);
      setActiveHistoryLog(null);
      setPrompt(selectedChatItem.prompt);
      setActiveTab('chat');
    }
  }, [selectedChatItem]);

  useEffect(() => {
    if (selectedAgentLog) {
      setActiveHistoryLog(selectedAgentLog);
      setActiveHistoryChat(null);
      setActiveTab('history_project');
    }
  }, [selectedAgentLog]);

  const executePrompt = async (promptToRun: string, autoApply = false) => {
    if (!promptToRun.trim() || isLoading) return;

    setPrompt(promptToRun);
    setActiveTab('chat');
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    setActiveHistoryChat(null);

    try {
      const res = await axios.post('/api/ai/build', {
        prompt: promptToRun,
        existingWorkflow: currentWorkflow || { id: 'wf_draft', name: 'Bản vẽ mới', nodes: [], connections: [] },
        provider: 'opencode2',
      });

      if (res.data?.success && res.data?.plan) {
        const plan = res.data.plan;
        setGeneratedPlan(plan);

        if (onNewChatAdded) {
          const newChat: IAIChatHistoryItem = {
            id: `chat_${Date.now()}`,
            title: promptToRun.slice(0, 46) + (promptToRun.length > 46 ? '...' : ''),
            projectName: currentWorkflow?.name || 'Dự án hiện tại',
            timeAgo: 'Vừa xong',
            prompt: promptToRun,
            responseSummary: plan.summary,
            steps: plan.steps || [],
          };
          const newLog: IAIAgentProjectLog = {
            id: `log_${Date.now()}`,
            title: `[${OPENCODE2_PROVIDER_CONFIG.providerName} • ${OPENCODE2_PROVIDER_CONFIG.models}] ${plan.summary.slice(0, 36)}...`,
            projectName: currentWorkflow?.name || 'Dự án hiện tại',
            agentName: `Opencode2 (${OPENCODE2_PROVIDER_CONFIG.models})`,
            status: 'success',
            duration: '260ms',
            timeAgo: 'Vừa xong',
            details: `AI Agent Opencode2 (${OPENCODE2_PROVIDER_CONFIG.models}) đã phân tích lệnh và thiết kế workflow gồm ${plan.workflow?.nodes?.length || 0} nút chuẩn.`,
            steps: plan.steps || [],
          };
          onNewChatAdded(newChat, newLog);
        }

        if (autoApply && plan.workflow) {
          onApplyWorkflow(plan.workflow);
        }
      } else {
        setError(res.data?.error || 'Không thể tạo workflow từ prompt này.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi khi kết nối với AI Engine Opencode2.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executePrompt(prompt, false);
  };

  const handleApply = () => {
    if (generatedPlan?.workflow) {
      onApplyWorkflow(generatedPlan.workflow);
      onClose();
    }
  };

  // Drag & Drop support: user can drag any node from NodeCreatorPanel directly into AI Agent prompt
  const handleDropNodeIntoAgent = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPrompt(false);
    const raw = e.dataTransfer.getData('application/vinceauto-node');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.name && parsed?.type) {
        const cmd = `/build Thiết kế workflow tự động có sử dụng nút chuẩn "${parsed.name}" (type="${parsed.type}") kết hợp với AI Agent Opencode2 (${OPENCODE2_PROVIDER_CONFIG.models}) và gửi thông báo Telegram`;
        setPrompt(cmd);
        setActiveTab('chat');
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOverPrompt(true);
      }}
      onDragLeave={() => setIsDragOverPrompt(false)}
      onDrop={handleDropNodeIntoAgent}
      className="fixed inset-y-0 right-0 w-[500px] bg-[#18181b] border-l border-[#2e2e33] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 select-none"
    >
      {/* Header + Active Opencode2 Provider Status */}
      <div className="px-4 py-3.5 border-b border-[#28282c] bg-[#141416] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#242428] border border-[#34343a] text-[#e6e8ec] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#e6e8ec] tracking-tight">
                  VinceAuto AI Architect
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{OPENCODE2_PROVIDER_CONFIG.status}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Provider: <strong className="text-zinc-200">{OPENCODE2_PROVIDER_CONFIG.providerName}</strong> • Model:{' '}
                <strong className="text-[#e6e8ec] font-mono">{OPENCODE2_PROVIDER_CONFIG.models}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowProviderDetails(!showProviderDetails)}
              className="px-2 py-1 rounded-lg bg-[#222226] hover:bg-[#2c2c31] border border-[#34343a] text-[10px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Xem cấu hình Provider Opencode2"
            >
              {showProviderDetails ? 'Ẩn cấu hình' : 'Chi tiết Model'}
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

        {/* Collapsible Provider Specification Table matching user CSV */}
        {showProviderDetails && (
          <div className="p-2.5 rounded-xl bg-[#1d1d21] border border-[#303036] text-[10.5px] space-y-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Tên Provider / Loại:</span>
              <span className="font-mono font-bold text-zinc-100">
                {OPENCODE2_PROVIDER_CONFIG.providerName} ({OPENCODE2_PROVIDER_CONFIG.providerType})
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Base URL:</span>
              <span className="font-mono text-sky-300">{OPENCODE2_PROVIDER_CONFIG.baseUrl}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Danh Sách Models:</span>
              <span className="font-mono font-bold text-emerald-300">
                {OPENCODE2_PROVIDER_CONFIG.models}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>API Key:</span>
              <span className="font-mono text-zinc-300">
                {OPENCODE2_PROVIDER_CONFIG.apiKey
                  ? `${OPENCODE2_PROVIDER_CONFIG.apiKey.slice(0, 8)}••••••••`
                  : 'Cấu hình trong Credentials / .env'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Ngày tạo:</span>
              <span className="font-mono text-zinc-400">{OPENCODE2_PROVIDER_CONFIG.createdAt}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chats > Breadcrumb bar matching user screenshot */}
      <div className="px-4 py-2 bg-[#121214] border-b border-[#242428] flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center space-x-1.5 font-medium">
          <button
            onClick={() => {
              setActiveTab('history_chat');
              setActiveHistoryChat(null);
            }}
            className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Chats</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="text-zinc-300 truncate max-w-[280px]">
            {activeHistoryChat
              ? activeHistoryChat.title
              : activeTab === 'chat'
              ? 'Hội thoại AI Agent'
              : activeTab === 'node_prompts'
              ? 'Prompt mẫu các nút'
              : activeTab === 'history_chat'
              ? 'Lịch sử Chats'
              : 'Lịch sử Agent làm dự án'}
          </span>
        </div>
        {activeHistoryChat && (
          <button
            onClick={() => setActiveHistoryChat(null)}
            className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            + Chat mới
          </button>
        )}
      </div>

      {/* Navigation Tabs inside AI Panel (4 Tabs) */}
      <div className="px-4 pt-2.5 pb-2 bg-[#161618] border-b border-[#26262a]">
        <div className="grid grid-cols-4 gap-1 bg-[#111113] p-1 rounded-xl border border-[#28282c]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#26262b] text-[#e6e8ec] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">AI Tạo Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('node_prompts')}
            className={`flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'node_prompts'
                ? 'bg-[#26262b] text-[#e6e8ec] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Prompt Nút ({DRAGGABLE_NODE_PROMPTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history_chat')}
            className={`flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'history_chat'
                ? 'bg-[#26262b] text-[#e6e8ec] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Chat ({chatHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history_project')}
            className={`flex items-center justify-center space-x-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'history_project'
                ? 'bg-[#26262b] text-[#e6e8ec] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Nhật ký ({agentProjectLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#18181b]">
        {/* ============================================================ */}
        {/* TAB 1: TRÒ CHUYỆN AI AGENT & TẠO WORKFLOW TỰ ĐỘNG */}
        {/* ============================================================ */}
        {activeTab === 'chat' && (
          <>
            {/* Quick Slash Commands Bar */}
            <div className="p-3 rounded-xl bg-[#202024] border border-[#2e2e33] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#e6e8ec]" />
                  <span>Các Lệnh Điều Khiển AI Agent Chuẩn (Slash Commands)</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {AGENT_SLASH_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.command}
                    type="button"
                    onClick={() => {
                      if (cmd.command === '/optimize' || cmd.command === '/fix') {
                        executePrompt(cmd.command, false);
                      } else {
                        setPrompt(cmd.example);
                      }
                    }}
                    className="p-2 rounded-lg bg-[#18181b] hover:bg-[#27272d] border border-[#2f2f35] text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#e6e8ec] group-hover:text-white">
                        {cmd.command}
                      </span>
                      <span className="text-[9px] text-zinc-500">Chèn lệnh →</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {cmd.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Plan Preview + 1-Click Apply */}
            {generatedPlan && !isLoading && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-[#202024] border border-[#3a3a42] shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#2d2d33] text-[#e6e8ec] border border-[#3e3e46]">
                      Workflow Đã Thiết Kế Bởi {generatedPlan.providerUsed || 'Opencode2'} (
                      {generatedPlan.modelUsed || 'crouton-alpha-free'})
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#e6e8ec] leading-snug">
                    {generatedPlan.summary}
                  </h4>

                  {/* Canonical Nodes List */}
                  <div className="mt-3 pt-2.5 border-t border-[#2d2d33] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                      Danh sách các nút chuẩn trong bản vẽ ({generatedPlan.workflow.nodes.length} nodes):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedPlan.workflow.nodes.map((n, idx) => (
                        <span
                          key={n.id}
                          className="inline-flex items-center space-x-1 text-[10.5px] px-2 py-0.5 rounded-md bg-[#18181b] border border-[#34343b] text-zinc-200"
                        >
                          <span className="text-zinc-500 font-mono">{idx + 1}.</span>
                          <span className="font-semibold">{n.name}</span>
                          <span className="text-[9.5px] font-mono text-zinc-400">({n.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {generatedPlan.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px] text-zinc-300">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-[#2c2c31] border border-[#3d3d44] text-[#e6e8ec] flex items-center justify-center text-[9.5px] font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Áp Dụng Workflow Này Lên Bản Vẽ Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center p-7 space-y-2.5 rounded-xl bg-[#202024] border border-[#2e2e33]">
                <Loader2 className="w-7 h-7 text-[#e6e8ec] animate-spin" />
                <p className="text-xs text-zinc-200 font-semibold">
                  AI Agent Opencode2 ({OPENCODE2_PROVIDER_CONFIG.models}) đang thiết kế workflow...
                </p>
                <p className="text-[11px] text-zinc-400">
                  Đang ánh xạ đúng tên chuẩn các nút kéo thả & nối dây tự động
                </p>
              </div>
            )}

            {/* Selected Chat History Conversation View */}
            {activeHistoryChat && (
              <div className="p-3.5 rounded-xl bg-[#202024] border border-[#34343a] space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#2d2d32] pb-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-[#e6e8ec]" />
                    <span className="text-xs font-bold text-[#e6e8ec]">{activeHistoryChat.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{activeHistoryChat.timeAgo}</span>
                </div>

                <div className="bg-[#18181b] border border-[#2c2c31] rounded-lg p-2.5">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Prompt đã gửi:
                  </span>
                  <p className="text-xs text-zinc-200">{activeHistoryChat.prompt}</p>
                </div>

                <div className="bg-[#25252a] border border-[#35353c] rounded-lg p-2.5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#e6e8ec] block">
                    Phản hồi từ AI Agent Opencode2:
                  </span>
                  <p className="text-xs text-zinc-200 font-medium">
                    {activeHistoryChat.responseSummary}
                  </p>
                </div>
              </div>
            )}

            {/* Pre-built Automated Workflow Prompts Library */}
            <div className="p-3.5 rounded-xl bg-[#202024] border border-[#2e2e33] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#e6e8ec] text-xs font-bold">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Kho Prompt Sẵn Cho AI Agent (Tạo Workflow Tự Động)</span>
                </div>
                <span className="text-[10px] text-zinc-400">1-Click Chạy Ngay</span>
              </div>

              <div className="space-y-2">
                {PREBUILT_AGENT_WORKFLOW_PROMPTS.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#18181b] border border-[#2e2e34] hover:border-[#45454f] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#27272c] text-zinc-300 border border-[#383840]">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100 mt-1">{item.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => executePrompt(item.prompt, true)}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-[10.5px] flex items-center space-x-1 shadow cursor-pointer"
                        title="Tạo và áp dụng ngay workflow này lên bản vẽ"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Tạo Tự Động</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.nodeNames.map((nodeName, i) => (
                        <span
                          key={i}
                          className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#222227] text-zinc-300 border border-[#303036]"
                        >
                          {nodeName}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setPrompt(item.prompt)}
                        className="text-[10.5px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                      >
                        Chèn prompt vào ô nhập để chỉnh sửa thêm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TỪ ĐIỂN PROMPT & TÊN GỌI CHUẨN CHO TỪNG NÚT KÉO THẢ */}
        {/* ============================================================ */}
        {activeTab === 'node_prompts' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#202024] border border-[#2e2e33] space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#e6e8ec]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Từ Điển Tên Gọi Chuẩn & Prompt Cho Từng Nút Kéo Thả</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Mỗi nút kéo thả đã được định nghĩa sẵn <strong>Tên gọi chuẩn</strong>,{' '}
                <strong>Mã Node (`type`)</strong>, <strong>Lệnh `/add`</strong> và{' '}
                <strong>Prompt huấn luyện riêng</strong> để AI Agent Opencode2 (
                <code className="text-zinc-200">{OPENCODE2_PROVIDER_CONFIG.models}</code>) luôn nhận
                diện và kết nối chính xác.
              </p>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={nodePromptSearch}
                  onChange={(e) => setNodePromptSearch(e.target.value)}
                  placeholder="Tìm tên nút, mã type (vd: Google Sheets, Telegram, Filter, Shopee)..."
                  className="w-full bg-[#161618] border border-[#303036] focus:border-[#e6e8ec] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'trigger', label: '1. Triggers' },
                  { id: 'app', label: '2. Ứng Dụng' },
                  { id: 'transform', label: '3. Data Transform' },
                  { id: 'flow_core', label: '4. Flow & Core' },
                  { id: 'ai_agent', label: '5. AI Agent Opencode2' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNodePromptCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap border cursor-pointer transition-all ${
                      nodePromptCategory === cat.id
                        ? 'bg-[#e6e8ec] text-zinc-900 font-bold border-[#e6e8ec]'
                        : 'bg-[#18181b] text-zinc-400 border-[#2f2f35] hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Node Prompts */}
            <div className="space-y-2.5">
              {DRAGGABLE_NODE_PROMPTS.filter(
                (np) =>
                  (nodePromptCategory === 'all' || np.category === nodePromptCategory) &&
                  (!nodePromptSearch.trim() ||
                    np.canonicalName.toLowerCase().includes(nodePromptSearch.toLowerCase()) ||
                    np.nodeType.toLowerCase().includes(nodePromptSearch.toLowerCase()) ||
                    np.nodeTrainingPrompt.toLowerCase().includes(nodePromptSearch.toLowerCase()))
              ).map((np) => (
                <div
                  key={np.id}
                  className="p-3 rounded-xl bg-[#202024] border border-[#2f2f35] hover:border-[#45454f] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#e6e8ec]">
                          {np.canonicalName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161618] text-sky-300 border border-[#2e2e34]">
                          {np.nodeType}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{np.categoryLabel}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#28282e] text-zinc-200 border border-[#383840] shrink-0">
                      {np.command}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#18181b] border border-[#2a2a30] text-[11px] text-zinc-300 leading-relaxed">
                    <span className="text-[9.5px] font-bold uppercase text-zinc-400 block mb-0.5">
                      Prompt huấn luyện nút cho AI Agent:
                    </span>
                    {np.nodeTrainingPrompt}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => executePrompt(np.command, true)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#28282e] hover:bg-[#32323a] text-zinc-200 text-[10.5px] font-semibold border border-[#3a3a44] flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Thêm nút vào bản vẽ ({np.command})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => executePrompt(np.autoWorkflowPrompt, true)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#e6e8ec] hover:bg-white text-zinc-900 text-[10.5px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Tạo Workflow mẫu có nút này</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: DANH SÁCH LỊCH SỬ CHAT VỚI AI AGENT */}
        {/* ============================================================ */}
        {activeTab === 'history_chat' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Toàn bộ lịch sử hội thoại AI Agent
              </span>
            </div>

            {chatHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveHistoryChat(item);
                  setPrompt(item.prompt);
                  setActiveTab('chat');
                }}
                className="p-3.5 rounded-xl bg-[#202024] border border-[#2e2e34] hover:border-zinc-500 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-[#e6e8ec]" />
                    <span className="text-xs font-bold text-[#e6e8ec]">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{item.timeAgo}</span>
                </div>

                <p className="text-xs text-zinc-300 bg-[#18181b] p-2 rounded-lg border border-[#2a2a2f]">
                  “{item.prompt}”
                </p>

                <p className="text-[11px] text-zinc-400 leading-relaxed">{item.responseSummary}</p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#28282d] text-zinc-300">
                    <FolderClosed className="w-3 h-3" />
                    <span>{item.projectName}</span>
                  </span>
                  <span className="text-[#e6e8ec] font-medium">Mở lại hội thoại →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: LỊCH SỬ AI AGENT LÀM DỰ ÁN */}
        {/* ============================================================ */}
        {activeTab === 'history_project' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Nhật ký AI Agent thực thi & xây dựng dự án
              </span>
            </div>

            {agentProjectLogs.map((log) => {
              const isSelected = activeHistoryLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setActiveHistoryLog(isSelected ? null : log)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-[#242429] border-zinc-400 shadow-lg'
                      : 'bg-[#202024] border-[#2e2e34] hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-[#e6e8ec]">{log.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
                      Hoàn thành
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{log.details}</p>

                  {/* Steps Breakdown */}
                  <div className="bg-[#18181b] rounded-lg p-2.5 border border-[#2a2a2f] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                      Chi tiết các bước AI Agent đã thực hiện:
                    </span>
                    {log.steps.map((st, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px] text-zinc-300">
                        <span className="text-zinc-500 font-mono">{idx + 1}.</span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-[#28282d] text-zinc-200 font-medium">
                      🤖 {log.agentName} • 📁 {log.projectName}
                    </span>
                    <span className="flex items-center space-x-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{log.duration}</span>
                      <span>•</span>
                      <span>{log.timeAgo}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Prompt Footer (Supports Drag & Drop of any Node into Prompt) */}
      <form
        onSubmit={handleGenerate}
        className={`p-4 border-t transition-colors ${
          isDragOverPrompt
            ? 'border-[#e6e8ec] bg-[#222228]'
            : 'border-[#28282c] bg-[#141416]'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 text-[10px] text-zinc-400">
          <span>
            Hỗ trợ lệnh <code className="text-zinc-200">/build</code>,{' '}
            <code className="text-zinc-200">/add &lt;Tên nút&gt;</code>,{' '}
            <code className="text-zinc-200">/optimize</code>,{' '}
            <code className="text-zinc-200">/fix</code> hoặc kéo thả nút vào đây
          </span>
          <span className="font-mono text-emerald-400">{OPENCODE2_PROVIDER_CONFIG.models}</span>
        </div>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Nhập lệnh (/build, /add, /optimize, /fix) hoặc mô tả workflow tự động hóa cần tạo..."
            rows={3}
            className="w-full bg-[#202024] border border-[#303036] rounded-xl p-3 pr-12 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-300 resize-none transition-colors"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-[#e6e8ec] hover:bg-white disabled:opacity-30 text-zinc-900 font-bold transition-all shadow-md cursor-pointer"
            title="Thực thi bằng Opencode2 (crouton-alpha-free)"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
