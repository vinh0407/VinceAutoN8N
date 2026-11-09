import React, { memo, useState } from 'react';
import { Handle, Position, useNodeConnections } from '@xyflow/react';
import {
  Play,
  Power,
  Trash2,
  Sparkles,
  MoreHorizontal,
  Plus,
  Check,
  AlertTriangle,
  FlaskConical,
  Clock,
  Radio,
  Globe,
  Code2,
  GitFork,
  Cpu,
  Bot,
  Search,
  Send,
  Layers,
  Copy,
} from 'lucide-react';
import { INodeData } from '../../types';

// Authentic n8n Manual Trigger Icon SVG (Radar target with pointer)
const ManualTriggerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8 text-white fill-none stroke-current stroke-[1.8]"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a10 10 0 0 0-10 10" strokeDasharray="3 3" opacity="0.6" />
    <path d="M12 6a6 6 0 0 0-6 6" strokeDasharray="2 2" opacity="0.8" />
    <path d="M12 10a2 2 0 0 0-2 2" />
    <path
      d="M10.5 10.5l8 3.5-3.5 1.5 2 4-1.5 1-2-4-2.5 2.5z"
      fill="white"
      stroke="none"
    />
  </svg>
);

export const VinceCustomNode = memo((props: any) => {
  const { data, selected } = props;
  const nodeData = data as INodeData;
  const isTrigger = nodeData.type?.startsWith('trigger.');

  // Theo chuẩn dữ liệu n8n: Kiểm tra xem node đã có liên kết đầu ra (outgoing connection) chưa
  const outgoingConnections = useNodeConnections({ handleType: 'source' });
  const hasOutgoing = outgoingConnections.length > 0;

  const [isHovered, setIsHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Trigger-specific title label below node (n8n exact)
  let triggerTitle = nodeData.name;
  if (nodeData.type === 'trigger.manual') {
    triggerTitle = "When clicking 'Execute\nworkflow'";
  } else if (nodeData.type === 'trigger.cron') {
    triggerTitle = 'On a schedule';
  } else if (nodeData.type === 'trigger.webhook') {
    triggerTitle = 'On webhook call';
  }

  // Pick matching icon
  let IconComponent: any = Globe;
  if (nodeData.type === 'trigger.manual') IconComponent = ManualTriggerIcon;
  else if (nodeData.type?.includes('cron')) IconComponent = Clock;
  else if (nodeData.type?.includes('webhook')) IconComponent = Radio;
  else if (nodeData.type?.includes('modelRouter')) IconComponent = Cpu;
  else if (nodeData.type?.includes('agentManager') || nodeData.type?.includes('leadGen')) IconComponent = Bot;
  else if (nodeData.type?.includes('scraper')) IconComponent = Search;
  else if (nodeData.type?.includes('telegram')) IconComponent = Send;
  else if (nodeData.type?.includes('zone')) IconComponent = Layers;
  else if (nodeData.type?.includes('code')) IconComponent = Code2;
  else if (nodeData.type?.includes('filter')) IconComponent = GitFork;

  const status = nodeData.status || 'idle';
  const isDisabled = Boolean(nodeData.parameters?._disabled);
  const isPinned = Boolean(nodeData.pinnedData || nodeData.parameters?._pinnedData);

  // Identify multi-output nodes
  const isIfNode = nodeData.type === 'flow.if' || nodeData.type?.includes('.if') || nodeData.type === 'transform.filter';
  const isSwitchNode = nodeData.type === 'flow.switch';
  const isAiAgentNode =
    nodeData.type?.startsWith('vince.agentManager') ||
    nodeData.type?.startsWith('ai.agent') ||
    nodeData.type === 'vince.modelRouter';

  // Dispatch custom events to parent
  const handleExecuteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('vince:execute-node', { detail: { nodeId: nodeData.id } }));
  };

  const handleToggleDisable = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    window.dispatchEvent(new CustomEvent('vince:toggle-disable', { detail: { nodeId: nodeData.id } }));
  };

  const handleDeleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    window.dispatchEvent(new CustomEvent('vince:delete-node', { detail: { nodeId: nodeData.id } }));
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('vince:ask-ai-node', { detail: { nodeId: nodeData.id, nodeName: nodeData.name } }));
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    window.dispatchEvent(new CustomEvent('vince:duplicate-node', { detail: { nodeId: nodeData.id } }));
  };

  const handleOpenCreator = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('vince:open-creator-from-node', { detail: { sourceNodeId: nodeData.id } }));
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMoreMenu(false);
      }}
      className={`relative flex flex-col items-center group cursor-pointer ${
        isDisabled ? 'opacity-40 grayscale' : ''
      }`}
    >
      {/* 1. TOP FLOATING MINI TOOLBAR (Screenshot user uploaded: clean floating icons above node) */}
      {(isHovered || selected) && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-3.5 z-30 animate-in fade-in duration-100 select-none">
          {/* Play/Execute icon */}
          <button
            onClick={handleExecuteNode}
            title="Execute step"
            className="text-zinc-200 hover:text-white transition-colors cursor-pointer p-0.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Power/Disable icon */}
          <button
            onClick={handleToggleDisable}
            title={isDisabled ? 'Enable step' : 'Disable step'}
            className="text-zinc-200 hover:text-white transition-colors cursor-pointer p-0.5"
          >
            <Power className="w-3.5 h-3.5 stroke-[2.4]" />
          </button>

          {/* Trash icon */}
          <button
            onClick={handleDeleteNode}
            title="Delete step"
            className="text-zinc-200 hover:text-rose-400 transition-colors cursor-pointer p-0.5"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* AI Sparkle icon */}
          <button
            onClick={handleAskAI}
            title="Ask AI"
            className="text-zinc-200 hover:text-white transition-colors cursor-pointer p-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* More options "..." */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(!showMoreMenu);
              }}
              title="More options"
              className="text-zinc-200 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMoreMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 top-6 w-32 bg-[#1f1f21] border border-[#333336] rounded-xl shadow-2xl py-1 z-40">
                <button
                  onClick={handleDuplicate}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-[#2a2a2d] hover:text-white flex items-center space-x-1.5"
                >
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={handleToggleDisable}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-[#2a2a2d] hover:text-white flex items-center space-x-1.5"
                >
                  <Power className="w-3 h-3" />
                  <span>{isDisabled ? 'Enable' : 'Disable'}</span>
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-rose-400 hover:bg-[#2a2a2d] flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LEFT TRIGGER ACTION PILL BUTTON (Screenshot: [⚗ Execute workflow]) */}
      {isTrigger && (
        <button
          onClick={handleExecuteNode}
          type="button"
          className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white hover:bg-zinc-100 text-[#1a1a1a] px-3.5 py-1.5 rounded-full font-medium text-[13px] shadow-lg cursor-pointer transition-all hover:scale-102 z-20 whitespace-nowrap"
        >
          <FlaskConical className="w-4 h-4 text-[#1a1a1a] stroke-[2.2]" />
          <span>Execute workflow</span>
        </button>
      )}

      {/* Halo ring when running */}
      {status === 'running' && <div className="n8n-node-running-ring" />}

      {/* 3. MAIN NODE CARD (Authentic n8n contour) */}
      <div
        className={`w-[74px] h-[74px] bg-[#29292b] border transition-all duration-150 flex items-center justify-center relative shadow-xl ${
          isTrigger
            ? 'rounded-tl-[32px] rounded-bl-[32px] rounded-tr-[18px] rounded-br-[18px]'
            : 'rounded-[18px]'
        } ${
          selected
            ? 'border-zinc-200 ring-2 ring-white/40 shadow-white/10'
            : status === 'error'
            ? 'border-[#ef4444] ring-2 ring-[#ef4444]/30'
            : status === 'success'
            ? 'border-[#10b981]/80 ring-1 ring-[#10b981]/30'
            : 'border-[#38383a] hover:border-zinc-400'
        }`}
      >
        {/* Left Input Handle (Only for non-triggers) */}
        {!isTrigger && (
          <Handle
            type="target"
            position={Position.Left}
            className="!w-2.5 !h-2.5 !-left-1.5 !bg-[#29292b] !border-2 !border-zinc-500 hover:!border-white"
          />
        )}

        {/* Center Node Icon */}
        <div className="w-10 h-10 flex items-center justify-center text-white">
          {React.isValidElement(IconComponent) ? (
            IconComponent
          ) : IconComponent ? (
            React.createElement(IconComponent, { className: 'w-7 h-7 stroke-[1.8]' })
          ) : (
            <Globe className="w-7 h-7 stroke-[1.8]" />
          )}
        </div>

        {/* Pin Data Badge (Exact n8n Pin icon at top right) */}
        {isPinned && (
          <div
            title="Dữ liệu bước này đã được ghim (Pinned Data) - Luôn trả về snapshot mà không gọi lại API"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500/90 border border-amber-300 text-zinc-900 flex items-center justify-center shadow-lg text-[10px]"
          >
            📌
          </div>
        )}

        {/* Multi-Output Handles:
            Case A: If Node -> 2 distinct handles (true & false)
            Case B: Switch Node -> 3 handles (case_0, case_1, fallback)
            Case C: Standard Node -> 1 handle
        */}
        {isIfNode ? (
          <>
            {/* True Handle (Top-Right, Green) */}
            <div className="absolute -right-1.5 top-5 flex items-center">
              <Handle
                type="source"
                position={Position.Right}
                id="true"
                className="!w-2.5 !h-2.5 !bg-[#10b981] !border-2 !border-emerald-200 hover:!scale-125 transition-transform"
              />
              <span className="absolute left-3 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/40 pointer-events-none">
                true
              </span>
            </div>

            {/* False Handle (Bottom-Right, Red) */}
            <div className="absolute -right-1.5 bottom-5 flex items-center">
              <Handle
                type="source"
                position={Position.Right}
                id="false"
                className="!w-2.5 !h-2.5 !bg-[#ef4444] !border-2 !border-rose-200 hover:!scale-125 transition-transform"
              />
              <span className="absolute left-3 text-[9px] font-bold text-rose-400 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-500/40 pointer-events-none">
                false
              </span>
            </div>
          </>
        ) : isSwitchNode ? (
          <>
            {/* Switch Case 0 */}
            <div className="absolute -right-1.5 top-3 flex items-center">
              <Handle
                type="source"
                position={Position.Right}
                id="case_0"
                className="!w-2 !h-2 !bg-sky-400 !border-2 !border-sky-200"
              />
              <span className="absolute left-3 text-[8.5px] font-mono text-sky-300 bg-[#16161a] px-1 rounded pointer-events-none">
                0
              </span>
            </div>
            {/* Switch Case 1 */}
            <div className="absolute -right-1.5 top-8 flex items-center">
              <Handle
                type="source"
                position={Position.Right}
                id="case_1"
                className="!w-2 !h-2 !bg-sky-400 !border-2 !border-sky-200"
              />
              <span className="absolute left-3 text-[8.5px] font-mono text-sky-300 bg-[#16161a] px-1 rounded pointer-events-none">
                1
              </span>
            </div>
            {/* Switch Fallback */}
            <div className="absolute -right-1.5 bottom-3 flex items-center">
              <Handle
                type="source"
                position={Position.Right}
                id="fallback"
                className="!w-2 !h-2 !bg-zinc-400 !border-2 !border-zinc-200"
              />
              <span className="absolute left-3 text-[8.5px] font-mono text-zinc-400 bg-[#16161a] px-1 rounded pointer-events-none">
                *
              </span>
            </div>
          </>
        ) : (
          /* Standard Right Output Handle */
          <Handle
            type="source"
            position={Position.Right}
            className="!w-2.5 !h-2.5 !-right-1.5 !bg-[#29292b] !border-2 !border-zinc-500 hover:!border-white"
          />
        )}

        {/* AI Agent Sub-node Bottom Handles (Model, Memory, Tool) */}
        {isAiAgentNode && (
          <div className="absolute -bottom-1.5 inset-x-0 flex items-center justify-around px-2 pointer-events-auto">
            <div className="relative group/h flex flex-col items-center">
              <Handle
                type="target"
                position={Position.Bottom}
                id="ai_model"
                className="!w-2 !h-2 !bg-purple-500 !border !border-purple-300"
              />
              <span className="opacity-0 group-hover/h:opacity-100 absolute top-2.5 text-[8px] font-mono text-purple-300 bg-black/90 px-1 rounded pointer-events-none z-30">
                Model
              </span>
            </div>
            <div className="relative group/h flex flex-col items-center">
              <Handle
                type="target"
                position={Position.Bottom}
                id="ai_memory"
                className="!w-2 !h-2 !bg-sky-500 !border !border-sky-300"
              />
              <span className="opacity-0 group-hover/h:opacity-100 absolute top-2.5 text-[8px] font-mono text-sky-300 bg-black/90 px-1 rounded pointer-events-none z-30">
                Memory
              </span>
            </div>
            <div className="relative group/h flex flex-col items-center">
              <Handle
                type="target"
                position={Position.Bottom}
                id="ai_tool"
                className="!w-2 !h-2 !bg-emerald-500 !border !border-emerald-300"
              />
              <span className="opacity-0 group-hover/h:opacity-100 absolute top-2.5 text-[8px] font-mono text-emerald-300 bg-black/90 px-1 rounded pointer-events-none z-30">
                Tool
              </span>
            </div>
          </div>
        )}

        {/* 4. RIGHT CONNECTOR WITH PLUS BUTTON PILL (Theo n8n: Chỉ hiển thị khi CHƯA có liên kết ra và thẳng hàng tuyệt đối với Handle) */}
        {!hasOutgoing && !isIfNode && !isSwitchNode && (
          <div className="absolute left-[calc(100%+3px)] top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
            <div className="w-5 h-[1.5px] bg-[#3e3e42]" />
            <button
              onClick={handleOpenCreator}
              type="button"
              title="Add next step"
              className="w-5 h-5 rounded-[6px] bg-[#29292b] border border-[#3e3e42] hover:border-zinc-300 hover:bg-[#343437] text-zinc-300 hover:text-white flex items-center justify-center pointer-events-auto cursor-pointer shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        )}

        {/* Status Badge at bottom-right corner */}
        {status === 'success' && (
          <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#10b981] border-2 border-[#1e1e1e] flex items-center justify-center text-white shadow">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#ef4444] border-2 border-[#1e1e1e] flex items-center justify-center text-white shadow">
            <AlertTriangle className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        )}

        {/* Duration badge */}
        {nodeData.executionDuration !== undefined && (
          <div className="absolute -top-2 bg-[#141414] border border-[#2d2d2d] rounded-full px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
            {nodeData.executionDuration}ms
          </div>
        )}
      </div>

      {/* 5. TEXT BELOW NODE (Screenshot: When clicking 'Execute workflow') */}
      <div className="mt-2.5 text-center max-w-[150px] select-none pointer-events-none">
        <div className="text-[13px] font-medium text-white tracking-normal leading-[1.2] whitespace-pre-line">
          {triggerTitle}
        </div>
      </div>
    </div>
  );
});
