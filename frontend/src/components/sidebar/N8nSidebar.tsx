import React, { useState } from 'react';
import {
  FolderClosed,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  FolderPlus,
  Workflow as WorkflowIcon,
  Trash2,
  Check,
  X,
  MessageSquare,
  Bot,
  Activity,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { IProject, IWorkflow } from '../../types';

export interface IAIChatHistoryItem {
  id: string;
  title: string;
  projectName: string;
  timeAgo: string;
  prompt: string;
  responseSummary: string;
  steps: string[];
}

export interface IAIAgentProjectLog {
  id: string;
  title: string;
  projectName: string;
  agentName: string;
  status: 'success' | 'running' | 'error';
  duration: string;
  timeAgo: string;
  details: string;
  steps: string[];
}

interface N8nSidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  projects: IProject[];
  currentProjectId: string | null;
  currentWorkflowId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectWorkflow: (workflow: IWorkflow) => void;
  onNewWorkflowInProject: (projectId: string) => void;
  onCreateProject: (name: string, description?: string) => Promise<void>;
  onDeleteWorkflow?: (workflowId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onDeleteSampleProjects?: () => void;
  onOpenAssistant: () => void;
  onOpenCredentials: () => void;
  chatHistory?: IAIChatHistoryItem[];
  agentProjectLogs?: IAIAgentProjectLog[];
  activeChatId?: string | null;
  onSelectChatHistory?: (item: IAIChatHistoryItem) => void;
  onSelectAgentLog?: (log: IAIAgentProjectLog) => void;
}

export const DEFAULT_CHAT_HISTORY: IAIChatHistoryItem[] = [];

export const DEFAULT_AGENT_PROJECT_LOGS: IAIAgentProjectLog[] = [];

export const N8nSidebar: React.FC<N8nSidebarProps> = ({
  collapsed,
  setCollapsed,
  projects,
  currentProjectId,
  currentWorkflowId,
  onSelectProject,
  onSelectWorkflow,
  onNewWorkflowInProject,
  onCreateProject,
  onDeleteWorkflow,
  onDeleteProject,
  onDeleteSampleProjects,
  onOpenAssistant,
  onOpenCredentials,
  chatHistory = DEFAULT_CHAT_HISTORY,
  agentProjectLogs = DEFAULT_AGENT_PROJECT_LOGS,
  activeChatId,
  onSelectChatHistory,
  onSelectAgentLog,
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    proj_ai: true,
    proj_cskh: true,
    proj_ecommerce: true,
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Chats & AI Agent History states
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [chatTab, setChatTab] = useState<'chats' | 'agent_logs'>('chats');

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleCreateProjectSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProjectName.trim()) {
      setIsCreatingProject(false);
      return;
    }
    await onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const plusMenuItems = [
    {
      label: 'Bản vẽ mới (New workflow)',
      action: () => {
        const targetProjId = currentProjectId || projects[0]?.id || 'proj_ai';
        onNewWorkflowInProject(targetProjId);
      },
    },
    {
      label: 'Dự án mới (New project)',
      action: () => setIsCreatingProject(true),
    },
    { label: 'New credential', action: onOpenCredentials },
    { label: 'New AI chat', action: onOpenAssistant },
  ];

  return (
    <aside
      className={`h-screen bg-[#181818] border-r border-[#262626] flex flex-col justify-between select-none z-30 transition-all duration-150 ${
        collapsed ? 'w-[56px]' : 'w-[260px]'
      }`}
    >
      {/* Top Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <div className="h-13 px-3 py-3 flex items-center justify-between border-b border-[#242424] shrink-0">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="VinceAuto Logo"
              className="w-6 h-6 object-contain rounded-md shrink-0 shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/logo.ico')) {
                  target.src = '/logo.ico';
                }
              }}
            />
            {!collapsed && (
              <span className="font-bold text-base text-[#e6e8ec] tracking-tight">VinceAuto</span>
            )}
          </div>

          {/* Right Header Icons */}
          {!collapsed && (
            <div className="flex items-center space-x-1 relative">
              {/* Plus Button with Dropdown */}
              <button
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className={`p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-[#282828] transition-colors ${
                  showPlusMenu ? 'bg-[#282828] text-white' : ''
                }`}
                title="Tạo mới"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Plus Popup Menu */}
              {showPlusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPlusMenu(false)}
                  />
                  <div className="absolute left-0 top-9 w-52 bg-[#1f1f21] border border-[#333336] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                    {plusMenuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowPlusMenu(false);
                          item.action();
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] font-medium text-zinc-200 hover:text-white hover:bg-[#2c2c2f] flex items-center justify-between transition-colors"
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Search Icon */}
              <button
                onClick={() => setShowSearchInput(!showSearchInput)}
                className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#282828] transition-colors ${
                  showSearchInput ? 'bg-[#282828] text-white' : ''
                }`}
                title="Tìm kiếm bản vẽ / dự án"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Toggle Sidebar Collapse */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#282828] transition-colors"
                title="Thu gọn thanh bên"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#282828] transition-colors"
              title="Mở rộng thanh bên"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Search Bar when active */}
        {!collapsed && showSearchInput && (
          <div className="px-3 pt-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm dự án, bản vẽ hoặc chat..."
                className="w-full bg-[#121212] border border-[#2e2e32] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Navigation Area */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 custom-scrollbar">
          {/* 1. DỰ ÁN (PROJECTS) SECTION */}
          <div>
            <div
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-zinc-300 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <FolderClosed className="w-4 h-4 text-[#e6e8ec]" />
                {!collapsed && (
                  <span className="uppercase text-[11px] tracking-wider font-bold text-[#e6e8ec]">
                    Dự án
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex items-center space-x-1">
                  {projects.some((p) => p.id === 'proj_ai' || p.id === 'proj_cskh' || p.id === 'proj_ecommerce') && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Bạn có chắc chắn muốn xóa toàn bộ các dự án mẫu (AI Agent, Zalo CSKH, E-Commerce)?'
                          )
                        ) {
                          if (onDeleteSampleProjects) onDeleteSampleProjects();
                        }
                      }}
                      title="Xóa toàn bộ dự án mẫu"
                      className="px-2 py-0.5 rounded text-[10.5px] font-semibold text-zinc-400 hover:text-white bg-[#222226] hover:bg-[#2e2e33] border border-[#34343a] transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-zinc-400" />
                      <span>Xóa mẫu</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsCreatingProject(true)}
                    title="Tạo dự án mới"
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#28282a] transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Inline Input to Create New Project */}
            {!collapsed && isCreatingProject && (
              <form onSubmit={handleCreateProjectSubmit} className="px-2 py-1.5 mb-1.5">
                <div className="bg-[#222226] border border-zinc-400 rounded-lg p-1.5 flex items-center space-x-1.5 shadow-lg">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Tên dự án mới..."
                    autoFocus
                    className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1 bg-[#e6e8ec] hover:bg-white text-zinc-900 rounded font-bold transition-colors"
                    title="Lưu dự án"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingProject(false);
                      setNewProjectName('');
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-200"
                    title="Hủy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}

            {/* Project List */}
            <div className="space-y-1 mt-1">
              {projects.map((proj) => {
                const isExpanded = expandedProjects[proj.id] ?? true;
                const isCurrentProject = proj.id === currentProjectId;
                const projWorkflows = proj.workflows || [];

                const filteredWfs = searchQuery
                  ? projWorkflows.filter((w) =>
                      w.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  : projWorkflows;

                if (
                  searchQuery &&
                  filteredWfs.length === 0 &&
                  !proj.name.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                  return null;
                }

                return (
                  <div key={proj.id} className="rounded-xl overflow-hidden">
                    {/* Project Folder Row */}
                    <div
                      onClick={() => {
                        onSelectProject(proj.id);
                        toggleProjectExpand(proj.id);
                      }}
                      className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isCurrentProject
                          ? 'bg-[#242427] text-[#e6e8ec] font-medium'
                          : 'text-zinc-300 hover:bg-[#202022] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate min-w-0">
                        {!collapsed && (
                          <span className="text-zinc-500 group-hover:text-zinc-300 transition-transform">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}

                        {/* Opaque White / Neutral Dot */}
                        <span
                          className="w-2 h-2 rounded-full shrink-0 bg-[#e6e8ec]/80"
                        />

                        {!collapsed && (
                          <span className="truncate text-[12.5px] font-medium" title={proj.name}>
                            {proj.name}
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <div className="flex items-center space-x-1 shrink-0 ml-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2b2b2f] text-zinc-300 font-mono">
                            {projWorkflows.length}
                          </span>
                          {onDeleteProject && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Bạn có chắc chắn muốn xóa dự án "${proj.name}" cùng toàn bộ bản vẽ bên trong?`
                                  )
                                ) {
                                  onDeleteProject(proj.id);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#34343a] text-zinc-400 hover:text-white transition-opacity cursor-pointer"
                              title="Xóa dự án này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sub-list of Workflows (Bản vẽ) */}
                    {!collapsed && isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-[#2e2e32] ml-4 mt-0.5">
                        {filteredWfs.map((wf) => {
                          const isSelectedWf = wf.id === currentWorkflowId;
                          return (
                            <div
                              key={wf.id}
                              onClick={() => onSelectWorkflow(wf)}
                              className={`group/wf flex items-center justify-between px-2 py-1.5 rounded-md text-[12px] cursor-pointer transition-colors ${
                                isSelectedWf
                                  ? 'bg-[#2b2b2e] text-[#e6e8ec] font-medium shadow-sm'
                                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#202022]'
                              }`}
                              title={wf.name}
                            >
                              <div className="flex items-center space-x-2 truncate min-w-0">
                                <WorkflowIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelectedWf ? 'text-[#e6e8ec]' : 'text-zinc-500'
                                  }`}
                                />
                                <span className="truncate">{wf.name}</span>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                {wf.active && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm"
                                    title="Đang kích hoạt"
                                  />
                                )}
                                {onDeleteWorkflow && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Xóa bản vẽ "${wf.name}"?`)) {
                                        onDeleteWorkflow(wf.id);
                                      }
                                    }}
                                    className="opacity-0 group-hover/wf:opacity-100 p-0.5 text-zinc-500 hover:text-zinc-200 transition-opacity"
                                    title="Xóa bản vẽ"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Button: Thêm bản vẽ (Đã bỏ dấu cộng thừa trong chuỗi chữ) */}
                        <button
                          onClick={() => onNewWorkflowInProject(proj.id)}
                          className="w-full flex items-center space-x-1.5 px-2 py-1.5 text-[11.5px] font-medium text-zinc-400 hover:text-[#e6e8ec] hover:bg-[#222225] rounded-md transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 shrink-0" />
                          <span>Thêm bản vẽ</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {projects.length === 0 && !collapsed && (
                <div className="px-3 py-4 text-center space-y-2 border border-dashed border-[#2d2d32] rounded-xl my-2 bg-[#17171a]">
                  <p className="text-[11px] text-zinc-400">Chưa có dự án nào</p>
                  <button
                    onClick={() => setIsCreatingProject(true)}
                    className="px-2.5 py-1 rounded-md bg-[#252528] hover:bg-[#303035] text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer border border-[#34343a]"
                  >
                    + Tạo dự án đầu tiên
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. CHATS & LỊCH SỬ AI AGENT LÀM DỰ ÁN */}
          {!collapsed && (
            <div className="pt-3 border-t border-[#242426]">
              {/* Chats Section Header */}
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <button
                  onClick={() => setChatsExpanded(!chatsExpanded)}
                  className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#e6e8ec] hover:text-white transition-colors cursor-pointer"
                >
                  {chatsExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>Chats & Lịch sử AI</span>
                </button>

                <button
                  onClick={onOpenAssistant}
                  title="Tạo cuộc trò chuyện AI mới"
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#28282a] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {chatsExpanded && (
                <div className="mt-1 space-y-2 px-1">
                  {/* Segmented Switch: Lịch sử Chat AI vs AI làm dự án */}
                  <div className="grid grid-cols-2 gap-1 bg-[#121214] p-1 rounded-lg border border-[#28282c]">
                    <button
                      onClick={() => setChatTab('chats')}
                      className={`flex items-center justify-center space-x-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        chatTab === 'chats'
                          ? 'bg-[#26262a] text-[#e6e8ec] shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span className="truncate">Chat AI Agent</span>
                    </button>

                    <button
                      onClick={() => setChatTab('agent_logs')}
                      className={`flex items-center justify-center space-x-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        chatTab === 'agent_logs'
                          ? 'bg-[#26262a] text-[#e6e8ec] shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Activity className="w-3 h-3 shrink-0" />
                      <span className="truncate">AI làm dự án</span>
                    </button>
                  </div>

                  {/* TAB 1: Lịch sử chat với AI Agent */}
                  {chatTab === 'chats' && (
                    <div className="space-y-1">
                      {chatHistory.map((item) => {
                        const isSelected = activeChatId === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (onSelectChatHistory) onSelectChatHistory(item);
                              else onOpenAssistant();
                            }}
                            className={`group p-2 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#26262b] border-zinc-500 text-white'
                                : 'bg-[#1c1c1f]/70 border-[#28282c] hover:bg-[#242428] hover:border-[#36363c] text-zinc-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <Bot className="w-3.5 h-3.5 text-[#e6e8ec] shrink-0" />
                                <span className="text-[11.5px] font-medium text-[#e6e8ec] truncate">
                                  {item.title}
                                </span>
                              </div>
                              <span className="text-[9.5px] text-zinc-500 shrink-0">
                                {item.timeAgo}
                              </span>
                            </div>

                            <p className="mt-1 text-[10.5px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {item.responseSummary}
                            </p>

                            <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-zinc-500">
                              <span className="truncate max-w-[160px] px-1.5 py-0.2 rounded bg-[#252529] text-zinc-300">
                                📁 {item.projectName}
                              </span>
                              <span className="text-zinc-400 group-hover:text-white">
                                Xem chat →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: Lịch sử AI Agent làm dự án */}
                  {chatTab === 'agent_logs' && (
                    <div className="space-y-1">
                      {agentProjectLogs.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => {
                            if (onSelectAgentLog) onSelectAgentLog(log);
                            else onOpenAssistant();
                          }}
                          className="group p-2 rounded-lg bg-[#1c1c1f]/70 border border-[#28282c] hover:bg-[#242428] hover:border-[#36363c] transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="text-[11.5px] font-medium text-[#e6e8ec] truncate">
                                {log.title}
                              </span>
                            </div>
                          </div>

                          <p className="mt-1 text-[10.5px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {log.details}
                          </p>

                          <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-zinc-500">
                            <span className="px-1.5 py-0.2 rounded bg-[#252529] text-zinc-300 truncate max-w-[130px]">
                              🤖 {log.agentName}
                            </span>
                            <span className="flex items-center space-x-1 text-zinc-400 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{log.duration}</span>
                              <span>•</span>
                              <span>{log.timeAgo}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
