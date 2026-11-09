import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Radio,
  Globe,
  FileText,
  Workflow,
  MessageSquare,
  CheckCheck,
  FolderOpen,
  Sparkles,
  Bot,
  Layers,
  Code2,
  Calendar,
  Edit3,
  Filter,
  Minimize2,
  CopyX,
  Split,
  Table,
  FileArchive,
  FileUp,
  Lock,
  Image,
  FileDown,
  Code,
  BookOpen,
  Hash,
  ArrowUpDown,
  Send,
  MousePointerClick,
  Pencil,
  ArrowLeftRight,
  Briefcase,
  GitFork,
  RotateCw,
  GitMerge,
  GitPullRequest,
  Ban,
  Hourglass,
  PlayCircle,
  Receipt,
  Folder,
  ShieldCheck,
  ChevronsRight,
  Timer,
  ClipboardList,
  Mail,
  Zap,
  Cpu,
  Boxes,
  Database,
  Brain,
  ListFilter,
  Wrench,
  Languages,
  ArrowRightToLine,
  Sliders,
  ShoppingBag,
  CreditCard,
  Share2,
  Key,
  Shield,
  Check,
  Loader2,
  CheckCircle2,
  Smile,
  Tag,
  HelpCircle,
  Shrink,
  Cloud,
  GripVertical,
} from 'lucide-react';
import { INodeDescription } from '../../types';
import {
  ALL_APPS_CATALOG,
  VINCEAUTO_PLATFORM_TRIGGERS,
  IntegrationCategoryGroup,
  IntegrationStatusType,
  IIntegrationArchitectureMeta,
} from '../../data/allAppsActionsTriggers';

// ============================================================================
// AUTHENTIC BRAND & NODE SVG ICONS MATCHING N8N & USER SCREENSHOTS
// ============================================================================

const GeminiStarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <defs>
      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4E95FF" />
        <stop offset="35%" stopColor="#8768FD" />
        <stop offset="70%" stopColor="#FB6470" />
        <stop offset="100%" stopColor="#F9BC2E" />
      </linearGradient>
    </defs>
    <path
      fill="url(#geminiGrad)"
      d="M12 2C12 7.52 7.52 12 2 12c5.52 0 10 4.48 10 10 0-5.52 4.48-10 10-10-5.52 0-10-4.48-10-10z"
    />
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-white">
    <path d="M22.28 10.42a5.57 5.57 0 0 0-.48-4.64 5.7 5.7 0 0 0-3.8-2.67 5.68 5.68 0 0 0-5.26 1.48A5.63 5.63 0 0 0 8.5 3.3a5.7 5.7 0 0 0-4.66 2.3 5.6 5.6 0 0 0-.74 5.3 5.6 5.6 0 0 0-1.72 4.08 5.64 5.64 0 0 0 2.2 4.46 5.65 5.65 0 0 0 4.2 1.3 5.63 5.63 0 0 0 4.24 1.86 5.7 5.7 0 0 0 4.67-2.3 5.6 5.6 0 0 0 .74-5.3 5.64 5.64 0 0 0 1.72-4.08c0-.75-.14-1.5-.47-2.2zm-8.8 10.74a4.34 4.34 0 0 1-2.92-1.12l.14-.08 4.86-2.8a.72.72 0 0 0 .36-.62v-6.87l2.18 1.26v6.17a4.37 4.37 0 0 1-4.62 4.06zm-8.2-3.8a4.3 4.3 0 0 1-.5-3.08l.15.09 4.86 2.8a.71.71 0 0 0 .72 0l5.95-3.44v2.52l-5.34 3.08a4.36 4.36 0 0 1-5.84-1.97zm-1.84-8.8a4.32 4.32 0 0 1 2.4-1.96v.17l4.86 2.8a.71.71 0 0 0 .72 0l5.95-3.44v2.52L6.44 11.5a4.36 4.36 0 0 1-3-.94zm15.1 3.42l-5.95 3.44v-2.52l5.34-3.08a4.36 4.36 0 0 1 5.84 1.97 4.3 4.3 0 0 1 .5 3.08l-.15-.09-4.86-2.8a.71.71 0 0 0-.72 0zm2.34-4.52a4.32 4.32 0 0 1-2.4 1.96v-.17l-4.86-2.8a.71.71 0 0 0-.72 0l-5.95 3.44V7.27l5.34-3.08a4.36 4.36 0 0 1 6.84 1.5l1.75 3.1zM10.84 13.5l2.42-1.4 2.42 1.4v2.8l-2.42 1.4-2.42-1.4v-2.8z" />
  </svg>
);

const AnthropicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#D97757]">
    <path d="M13.82 3.5h3.96L24 20.5h-4.22l-1.88-4.5h-7.62l-1.88 4.5H4.18L13.82 3.5zm2.4 9.5l-2.3-5.5-2.3 5.5h4.6z" />
  </svg>
);

const QwenStarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#A855F7]">
    <path d="M12 1l2.5 7.5L22 11l-6 5 2 8-6-4.5L6 24l2-8-6-5 7.5-2.5L12 1z" />
  </svg>
);

const MiniMaxIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#EC4899]">
    <path d="M2 10h2v4H2zm4-3h2v10H6zm4-4h2v18h-2zm4 2h2v14h-2zm4 3h2v8h-2zm4 3h2v2h-2z" />
  </svg>
);

const KimiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-white">
    <path d="M5 3h3.5v7.2L15 3h4.5l-8 9 8.5 9H15.5L8.5 13.5V21H5V3z" />
  </svg>
);

const DatabricksIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#FF3621]">
    <path d="M12 2L1 8.5v7L12 22l11-6.5v-7L12 2zm0 2.8l7.8 4.6-7.8 4.6-7.8-4.6L12 4.8zm-8.8 6.1l8 4.7v6.6l-8-4.7v-6.6zm17.6 0v6.6l-8 4.7v-6.6l8-4.7z" />
  </svg>
);

const OllamaIcon = () => (
  <div className="w-5 h-5 rounded-md bg-zinc-200 text-black flex items-center justify-center font-black text-[10px] shrink-0">
    OL
  </div>
);

const GuardrailsIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0">
    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
  </div>
);

const RobotAgentIcon = () => (
  <div className="w-5 h-5 rounded-md bg-zinc-700/50 text-white flex items-center justify-center shrink-0">
    <Bot className="w-4 h-4" />
  </div>
);

const N8nManualTriggerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-zinc-300 stroke-current stroke-[1.8] fill-none shrink-0" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 0-10 10" strokeDasharray="3 3" opacity="0.6" />
    <path d="M12 6a6 6 0 0 0-6 6" strokeDasharray="2 2" opacity="0.8" />
    <path d="M12 10a2 2 0 0 0-2 2" />
    <path d="M10.5 10.5l8 3.5-3.5 1.5 2 4-1.5 1-2-4-2.5 2.5z" fill="currentColor" stroke="none" />
  </svg>
);

const N8nLogoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#e6e8ec] fill-current shrink-0">
    <path d="M4 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
    <path d="M6 7v10M12 7v10M18 7v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const CQnceIcon = () => (
  <div className="w-5 h-5 rounded-full bg-[#1e293b] text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-400/40 shrink-0">
    Q
  </div>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#5865F2] shrink-0">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const GmailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path fill="#4285F4" d="M1.5 5.5v13a1 1 0 0 0 1 1h3v-9.5l6.5 5 6.5-5V19.5h3a1 1 0 0 0 1-1v-13a1 1 0 0 0-1.6-.8L12 10.2 2.6 4.7a1 1 0 0 0-1.1.8z" />
    <path fill="#EA4335" d="M12 11.8L21.4 5.3A1 1 0 0 0 20.5 4H3.5a1 1 0 0 0-.9 1.3L12 11.8z" />
  </svg>
);

const GoogleChatIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#00AC47] shrink-0">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
  </svg>
);

const OutlookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0078D4] shrink-0">
    <path d="M1 5.5l10-2v17l-10-2z" />
    <path d="M11 3.5l12 2.5v12l-12 2.5z" opacity="0.8" />
  </svg>
);

const TeamsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#6264A7] shrink-0">
    <path d="M19.5 7.5a2 2 0 1 0-4 0 2 2 0 0 0 4 0zm-12 1a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM15 11h5a2 2 0 0 1 2 2v2.5a.5.5 0 0 1-.5.5H15v-5zm-6 1.5H3a3 3 0 0 0-3 3V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3.5a3 3 0 0 0-3-3z" />
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" />
    <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" />
    <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" />
    <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#229ED9] shrink-0">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.51l-3-2.21-1.45 1.4c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.85.92z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] shrink-0">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.14c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z" />
  </svg>
);

const ZaloIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#0068FF] text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-sm">
    Zalo
  </div>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#1877F2]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const ShopeeIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#EE4D2D] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
    S
  </div>
);

const MoMoIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#A50064] text-white flex items-center justify-center font-bold text-[8px] shrink-0 shadow-sm">
    MoMo
  </div>
);

const VnpayIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#005BAA] text-white flex items-center justify-center font-black text-[7px] shrink-0 shadow-sm">
    VNPAY
  </div>
);

const GoogleSheetsIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#0F9D58] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
    田
  </div>
);

const GoogleDriveIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#4285F4] text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-sm">
    ▲
  </div>
);

const GoogleCalendarIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#1A73E8] text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-sm">
    31
  </div>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-current text-white">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const ThreadsIcon = () => (
  <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-600 text-white flex items-center justify-center font-bold text-[12px] shrink-0 shadow-sm">
    @
  </div>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-none stroke-[#E1306C] stroke-[2]">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-[#FF0000]">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export type PanelViewType =
  | 'root'
  | 'triggers'
  | 'other_triggers'
  | 'app_list'
  | 'ai'
  | 'transformation'
  | 'flow'
  | 'core'
  | 'human_review'
  | 'other_ai'
  | 'provider_actions'
  | 'app_detail';

interface NodeCreatorPanelProps {
  nodes: INodeDescription[];
  onSelectNode: (nodeDesc: INodeDescription) => void;
  onClose: () => void;
  initialView?: PanelViewType;
}

// ============================================================================
// APP DISCOVERY & CONNECTED INTEGRATIONS REGISTRY
// ============================================================================

export interface IAppIntegrationSpec {
  id: string;
  name: string;
  desc: string;
  icon?: any;
  customIcon?: React.ReactNode;
  categoryGroup?: IntegrationCategoryGroup;
  status?: IntegrationStatusType;
  notice?: string;
  architecture?: IIntegrationArchitectureMeta;
  credentialKey: string;
  credentialTitle: string;
  fields: {
    key: string;
    label: string;
    type: 'string' | 'password' | 'options';
    placeholder?: string;
    defaultValue?: string;
    default?: any;
    options?: { name: string; value: string }[];
  }[];
  triggers: {
    id: string;
    title: string;
    desc: string;
    type: string;
    resource?: string;
    mechanism?: 'W' | 'P' | 'API';
    status?: IntegrationStatusType;
    defaultParams?: Record<string, any>;
  }[];
  actions: {
    id: string;
    title: string;
    desc: string;
    type: string;
    resource?: string;
    operation?: string;
    status?: IntegrationStatusType;
    defaultParams?: Record<string, any>;
  }[];
}

const APP_ICON_MAP: Record<string, React.ReactNode> = {
  telegram: <TelegramIcon />,
  zalo: <ZaloIcon />,
  gmail: <GmailIcon />,
  googleSheets: <GoogleSheetsIcon />,
  googleDrive: <GoogleDriveIcon />,
  googleCalendar: <GoogleCalendarIcon />,
  microsoft: <TeamsIcon />,
  notion: <FileText className="w-5 h-5 text-zinc-200" />,
  jira: <ClipboardList className="w-5 h-5 text-sky-400" />,
  slack: <SlackIcon />,
  discord: <DiscordIcon />,
  facebook: <FacebookIcon />,
  tiktok: <TikTokIcon />,
  threads: <ThreadsIcon />,
  instagram: <InstagramIcon />,
  youtube: <YouTubeIcon />,
  whatsapp: <WhatsAppIcon />,
  shopee: <ShopeeIcon />,
  shopify: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
  crm: <Briefcase className="w-5 h-5 text-amber-400" />,
  database: <Database className="w-5 h-5 text-sky-400" />,
  github: <Code2 className="w-5 h-5 text-zinc-200" />,
  cloud: <Cloud className="w-5 h-5 text-orange-400" />,
  ai: <Sparkles className="w-5 h-5 text-purple-400" />,
  momo: <MoMoIcon />,
};

const APPS_REGISTRY: Record<string, IAppIntegrationSpec> = Object.fromEntries(
  Object.entries(ALL_APPS_CATALOG).map(([key, item]) => [
    key,
    {
      id: item.id,
      name: item.name,
      desc: item.desc,
      customIcon: APP_ICON_MAP[item.iconKey] || <Globe className="w-5 h-5 text-zinc-300" />,
      categoryGroup: item.categoryGroup,
      status: item.status,
      notice: item.notice,
      architecture: item.architecture,
      credentialKey: item.credentialKey,
      credentialTitle: item.credentialTitle,
      fields: item.fields,
      triggers: item.triggers,
      actions: item.actions,
    },
  ])
);

export const NodeCreatorPanel: React.FC<NodeCreatorPanelProps> = ({
  nodes,
  onSelectNode,
  onClose,
  initialView = 'root',
}) => {
  const [view, setView] = useState<PanelViewType>(initialView);
  const [selectedProviderKey, setSelectedProviderKey] = useState<string>('gemini');
  const [selectedAppId, setSelectedAppId] = useState<string>('zalo');
  const [search, setSearch] = useState('');

  // Credentials state
  const [connectedCredentials, setConnectedCredentials] = useState<Record<string, string>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFormData, setAuthFormData] = useState<Record<string, string>>({});
  const [isAuthSaving, setIsAuthSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/credentials').then((res) => {
      if (res.data?.success && res.data?.credentials) {
        setConnectedCredentials(res.data.credentials);
      }
    });
  }, []);

  // Accordion section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    popular: true,
    addRemove: true,
    combine: true,
    convert: true,
    other: true,
    human: true,
    appTriggers: true,
    appActions: true,
  });

  const [aiSubFilter, setAiSubFilter] = useState<string>('all');
  const [appGroupFilter, setAppGroupFilter] = useState<string>('all');
  const [showArchSpec, setShowArchSpec] = useState<boolean>(false);

  const toggleSection = (s: string) => {
    setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const pickNode = (typeName: string, fallbackDisplayName?: string, extraParams?: Record<string, any>) => {
    const found = nodes.find(
      (n) =>
        n.name === typeName ||
        n.name.toLowerCase().includes(typeName.toLowerCase()) ||
        n.displayName.toLowerCase().includes((fallbackDisplayName || typeName).toLowerCase())
    );

    if (found) {
      onSelectNode({
        ...found,
        properties: found.properties,
        ...(extraParams ? { defaultParameters: extraParams } : {}),
      } as any);
      onClose();
    } else {
      onSelectNode({
        name: typeName,
        displayName: fallbackDisplayName || typeName,
        icon: 'Layers',
        category: 'automation',
        description: fallbackDisplayName || typeName,
        version: 1,
        properties: [],
        inputs: ['main'],
        outputs: ['main'],
      });
      onClose();
    }
  };

  const openAppDetail = (appId: string) => {
    setSelectedAppId(appId);
    setSearch('');
    setShowAuthModal(false);
    setView('app_detail');
  };

  const openProviderActions = (providerKey: string) => {
    setSelectedProviderKey(providerKey);
    setSearch('');
    setView('provider_actions');
  };

  const handleConnectApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthSaving(true);
    const targetApp = APPS_REGISTRY[selectedAppId];
    if (!targetApp) return;

    const payload: Record<string, string> = { ...authFormData };
    // Provide sample token if empty to allow 1-click sandbox testing
    for (const f of targetApp.fields) {
      if (!payload[f.key]) {
        payload[f.key] = `simulated_${targetApp.id}_token_${Date.now()}`;
      }
    }

    try {
      const res = await axios.post('/api/credentials', payload);
      if (res.data?.success) {
        setConnectedCredentials((prev) => ({ ...prev, ...payload }));
        setShowAuthModal(false);
      }
    } catch {
      //
    } finally {
      setIsAuthSaving(false);
    }
  };

  const handleDragStartNode = (
    e: React.DragEvent,
    typeName: string,
    displayName: string,
    defaultParams?: Record<string, any>
  ) => {
    const payload = JSON.stringify({
      typeName,
      displayName,
      defaultParams: defaultParams || {},
    });
    e.dataTransfer.setData('application/vinceauto-node', payload);
    e.dataTransfer.setData('text/plain', displayName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderNodeRow = (item: {
    id: string;
    title: string;
    desc?: string;
    icon?: any;
    customIcon?: React.ReactNode;
    badge?: string;
    hasArrow?: boolean;
    verified?: boolean;
    lightning?: boolean;
    onClick?: () => void;
    defaultParams?: Record<string, any>;
  }) => {
    const IconComp = item.icon;
    const isDraggable = !item.onClick;
    return (
      <div
        key={`${item.id}_${item.title}`}
        draggable={isDraggable}
        onDragStart={(e) => {
          if (isDraggable) {
            handleDragStartNode(e, item.id, item.title, item.defaultParams);
          }
        }}
        onClick={item.onClick ? item.onClick : () => pickNode(item.id, item.title, item.defaultParams)}
        className={`p-2.5 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] transition-all flex items-center justify-between group ${
          isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-start space-x-2.5 flex-1 min-w-0 pr-2">
          {isDraggable && (
            <GripVertical className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 mt-2 shrink-0 transition-colors" />
          )}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
            {item.customIcon ? (
              item.customIcon
            ) : IconComp ? (
              <IconComp className="w-5 h-5 stroke-[1.8] text-zinc-300 group-hover:text-white" />
            ) : (
              <Globe className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {item.title}
              </span>
              {item.lightning && (
                <Zap className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300 inline" />
              )}
              {item.verified && (
                <CheckCheck className="w-3.5 h-3.5 text-zinc-300 inline" />
              )}
              {item.badge === 'Độc quyền' && (
                <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                  ★ Độc quyền
                </span>
              )}
              {item.badge === 'Hot' && (
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">
                  HOT
                </span>
              )}
              {item.badge === 'MCP' && (
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  MCP
                </span>
              )}
              {item.badge === 'Recommended' && (
                <span className="text-[10px] font-medium bg-[#2a2a2e] text-zinc-300 px-2 py-0.5 rounded-full border border-[#3e3e42]">
                  Recommended
                </span>
              )}
              {item.badge === 'Preview' && (
                <span className="text-[10px] font-medium border border-dashed border-zinc-500 text-zinc-400 px-1.5 py-0.2 rounded-full">
                  Preview
                </span>
              )}
              {item.badge === 'Free credits' && (
                <span className="text-[10px] font-medium bg-[#1d3829] text-[#86efac] px-2 py-0.5 rounded-full border border-[#275338]">
                  Free credits
                </span>
              )}
              {item.badge &&
                item.badge !== 'Recommended' &&
                item.badge !== 'Preview' &&
                item.badge !== 'Free credits' &&
                item.badge !== 'Độc quyền' &&
                item.badge !== 'Hot' &&
                item.badge !== 'MCP' && (
                  <span className="text-[10px] font-medium bg-[#10b981]/20 text-[#34d399] px-2 py-0.5 rounded-full border border-[#10b981]/30">
                    {item.badge}
                  </span>
                )}
            </div>
            {item.desc && (
              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 mt-0.5">
                {item.desc}
              </p>
            )}
          </div>
        </div>
        {item.hasArrow && (
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 shrink-0" />
        )}
      </div>
    );
  };

  const matchesSearch = (text: string) => {
    if (!search.trim()) return true;
    return text.toLowerCase().includes(search.toLowerCase().trim());
  };

  const currentApp = APPS_REGISTRY[selectedAppId] || APPS_REGISTRY.zalo;
  const isCurrentAppConnected = Boolean(connectedCredentials[currentApp.credentialKey]);

  return (
    <div className="fixed inset-y-0 right-0 w-[430px] bg-[#18181a] border-l border-[#28282b] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-150 select-none">
      {/* 1. Header Area with dynamic back arrow & titles */}
      <div className="px-4 pt-3.5 pb-3 border-b border-[#252528] bg-[#19191b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {view !== 'root' && (
              <button
                onClick={() => {
                  if (view === 'app_detail') {
                    setView('app_list');
                  } else if (view === 'other_triggers') {
                    setView('triggers');
                  } else if (view === 'provider_actions' || view === 'other_ai') {
                    setView('ai');
                  } else {
                    setView('root');
                  }
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252528] transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {view === 'flow' && <ArrowLeftRight className="w-4 h-4 text-zinc-300 stroke-[2]" />}
            {view === 'core' && <Briefcase className="w-4 h-4 text-zinc-300 stroke-[2]" />}
            {view === 'human_review' && <MessageSquare className="w-4 h-4 text-zinc-300 stroke-[2]" />}
            {view === 'transformation' && <Pencil className="w-4 h-4 text-zinc-300 stroke-[2]" />}
            {view === 'app_list' && <Boxes className="w-4 h-4 text-zinc-300 stroke-[2]" />}
            {view === 'app_detail' && (currentApp.customIcon || <Globe className="w-4 h-4 text-zinc-300" />)}

            <div>
              <h3 className="text-[15px] font-bold text-white leading-tight">
                {view === 'triggers' && 'What triggers this workflow?'}
                {view === 'other_triggers' && 'Trigger Nền Tảng VinceAuto (13)'}
                {view === 'app_list' && 'Ứng Dụng (Integrations)'}
                {view === 'ai' && 'AI Nodes'}
                {view === 'other_ai' && 'Other AI Nodes'}
                {view === 'app_detail' && currentApp.name}
                {view === 'transformation' && 'Data transformation'}
                {view === 'flow' && 'Flow'}
                {view === 'core' && 'Core'}
                {view === 'human_review' && 'Human review'}
                {view === 'root' && 'Add node'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252528] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitles */}
        {view === 'triggers' && (
          <p className="text-xs text-zinc-400 mt-1">
            A trigger is a step that starts your workflow
          </p>
        )}
        {view === 'other_triggers' && (
          <p className="text-xs text-zinc-400 mt-1">
            Runs the flow on workflow errors, file changes, etc.
          </p>
        )}
        {view === 'app_list' && (
          <p className="text-xs text-[#38bdf8] mt-1 font-medium">
            Chọn ứng dụng để kết nối tài khoản và thiết lập Trigger & Action
          </p>
        )}
        {(view === 'ai' || view === 'other_ai') && (
          <p className="text-xs text-[#38bdf8] mt-1 font-medium">
            Select an AI Node to add to your workflow
          </p>
        )}
        {view === 'app_detail' && (
          <p className="text-xs text-[#38bdf8] mt-1 font-medium">
            Chọn kết nối tài khoản, cấp quyền & khám phá Triggers, Actions khả dụng
          </p>
        )}
      </div>

      {/* 2. Search Bar with purple focus border (Exact user screenshot) */}
      <div className="p-3 border-b border-[#242426] bg-[#141416] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              view === 'app_detail'
                ? `Tìm trigger hoặc action của ${currentApp.name}...`
                : 'Search nodes, triggers, actions...'
            }
            autoFocus
            className="w-full bg-[#1c1c1f] border border-[#2f2f33] focus:border-[#e6e8ec] focus:ring-1 focus:ring-[#e6e8ec] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 px-1">
          <GripVertical className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>Bấm chọn hoặc <strong className="text-zinc-200">Kéo thả (Drag & Drop)</strong> node ra vùng bản vẽ</span>
        </div>
      </div>

      {/* 3. Panel Body Views */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* ======================================================== */}
        {/* VIEW: APP DETAIL (Connect Account + Triggers & Actions) */}
        {/* ======================================================== */}
        {view === 'app_detail' && (
          <div className="space-y-3 p-1">
            {/* Account Connection Status Bar */}
            <div className="p-3 rounded-xl bg-[#202023] border border-[#2e2e32] shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCurrentAppConnected
                        ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-100">
                      {isCurrentAppConnected ? 'Tài Khoản Đã Kết Nối' : 'Chưa Kết Nối Tài Khoản'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {isCurrentAppConnected
                        ? `${currentApp.name} (Đã cấp quyền truy cập)`
                        : 'Cần cấp quyền để tự động chạy các trigger & action'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAuthModal(!showAuthModal)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-md flex items-center space-x-1.5 ${
                    isCurrentAppConnected
                      ? 'bg-[#29292c] hover:bg-[#323236] text-zinc-300 hover:text-white border border-[#3e3e42]'
                      : 'bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold'
                  }`}
                >
                  <Key className="w-3 h-3" />
                  <span>{isCurrentAppConnected ? 'Đổi tài khoản' : 'Kết nối ngay'}</span>
                </button>
              </div>

              {/* In-Place Auth Connect Form */}
              {showAuthModal && (
                <div className="mt-3 pt-3 border-t border-[#2e2e32] space-y-2.5 animate-in fade-in duration-100">
                  <div className="text-[11px] font-bold text-zinc-300">
                    Nhập thông tin xác thực cho {currentApp.name}:
                  </div>
                  {currentApp.fields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-medium">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={authFormData[f.key] || ''}
                        onChange={(e) =>
                          setAuthFormData({ ...authFormData, [f.key]: e.target.value })
                        }
                        className="w-full bg-[#161618] border border-[#333336] focus:border-[#e6e8ec] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  ))}

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      disabled={isAuthSaving}
                      onClick={() => handleConnectApp()}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs font-bold transition-all shadow flex items-center justify-center space-x-1"
                    >
                      {isAuthSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Lưu & Cấp quyền</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConnectApp()}
                      title="Tự động tạo token giả lập để kiểm thử ngay lập tức"
                      className="py-1.5 px-2.5 rounded-lg bg-[#29292c] hover:bg-[#343438] text-zinc-300 hover:text-white text-[11px] font-medium border border-[#3e3e42]"
                    >
                      ⚡ 1-Click Sandbox
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Standard Integration Architecture & Limitations Spec (8-Part Architecture) */}
            {(currentApp.architecture || currentApp.notice) && (
              <div className="rounded-xl bg-[#1c1c1f] border border-[#2c2c30] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowArchSpec(!showArchSpec)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#222226] transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-[11px] font-bold text-zinc-200">
                      Cấu trúc chuẩn Integration (Architecture & API Spec)
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        currentApp.status === 'NATIVE'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {currentApp.status || 'NATIVE'}
                    </span>
                  </div>
                  {showArchSpec ? (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>

                {currentApp.notice && !showArchSpec && (
                  <div className="px-3 pb-2 text-[10px] text-amber-300/90 leading-snug border-t border-[#26262a] pt-1.5">
                    ⚠️ {currentApp.notice}
                  </div>
                )}

                {showArchSpec && currentApp.architecture && (
                  <div className="px-3 pb-2.5 pt-2 border-t border-[#26262a] space-y-1.5 text-[10px] text-zinc-300">
                    <div>
                      <span className="text-zinc-500 font-semibold">Authentication: </span>
                      <span>{currentApp.architecture.authType}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold">API Capabilities: </span>
                      <span>{currentApp.architecture.apiCapabilities}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold">Rate Limits: </span>
                      <span>{currentApp.architecture.rateLimits}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold">Permissions: </span>
                      <span>{currentApp.architecture.permissions}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold">Error Handling: </span>
                      <span>{currentApp.architecture.errorHandling}</span>
                    </div>
                    {currentApp.architecture.limitations && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200">
                        <span className="font-bold">Giới hạn (L): </span>
                        {currentApp.architecture.limitations}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 1. TRIGGERS SECTION */}
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('appTriggers')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>TRIGGERS ({currentApp.triggers.length})</span>
                </div>
                {openSections.appTriggers ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {openSections.appTriggers && (
                <div className="space-y-1">
                  {currentApp.triggers
                    .filter((t) => matchesSearch(t.title) || matchesSearch(t.desc))
                    .map((trigger) => (
                      <div
                        key={trigger.title}
                        draggable
                        onDragStart={(e) =>
                          handleDragStartNode(
                            e,
                            trigger.type,
                            `${currentApp.name} Trigger: ${trigger.title}`,
                            trigger.defaultParams
                          )
                        }
                        onClick={() =>
                          pickNode(
                            trigger.type,
                            `${currentApp.name} Trigger: ${trigger.title}`,
                            trigger.defaultParams
                          )
                        }
                        className="p-2.5 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-grab active:cursor-grabbing transition-all flex items-start space-x-2.5 group"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 mt-2 shrink-0" />
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                              {trigger.title}
                            </h4>
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {trigger.mechanism ? `T/${trigger.mechanism}` : 'Trigger'}
                            </span>
                            {trigger.status && (
                              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-[#27272c] text-zinc-300 border border-[#3a3a42]">
                                {trigger.status}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 mt-0.5">
                            {trigger.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 2. ACTIONS SECTION */}
            <div className="border-t border-[#252528] pt-2 space-y-1">
              <button
                onClick={() => toggleSection('appActions')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <div className="flex items-center space-x-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>ACTIONS ({currentApp.actions.length})</span>
                </div>
                {openSections.appActions ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {openSections.appActions && (
                <div className="space-y-1">
                  {currentApp.actions
                    .filter((a) => matchesSearch(a.title) || matchesSearch(a.desc) || (a.resource && matchesSearch(a.resource)))
                    .map((action) => (
                      <div
                        key={action.title}
                        draggable
                        onDragStart={(e) =>
                          handleDragStartNode(
                            e,
                            action.type,
                            `${currentApp.name}: ${action.title}`,
                            action.defaultParams
                          )
                        }
                        onClick={() =>
                          pickNode(
                            action.type,
                            `${currentApp.name}: ${action.title}`,
                            action.defaultParams
                          )
                        }
                        className="p-2.5 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-grab active:cursor-grabbing transition-all flex items-start space-x-2.5 group"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 mt-2 shrink-0" />
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                          {currentApp.customIcon || <Globe className="w-4 h-4 text-sky-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                              {action.title}
                            </h4>
                            {action.resource && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#27272c] text-zinc-300 border border-[#3a3a42]">
                                {action.resource}
                              </span>
                            )}
                            {action.status && (
                              <span
                                className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${
                                  action.status === 'NATIVE'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                                    : 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                                }`}
                              >
                                {action.status}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 mt-0.5">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: ROOT */}
        {/* ======================================================== */}
        {view === 'root' && (
          <div className="space-y-1">
            <div
              onClick={() => setView('triggers')}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                    What triggers this workflow?
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Schedule, Webhook, App Events, Manual, Queue, DB (13 Platform Triggers)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            <div
              onClick={() => {
                setSearch('');
                setAppGroupFilter('all');
                setView('app_list');
              }}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                      Ứng Dụng
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#27272c] text-zinc-200 border border-[#3a3a42]">
                      {Object.keys(APPS_REGISTRY).length} bộ tích hợp
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Google, Microsoft 365, Social, TMĐT, CRM, Database, Cloud, AI & Thanh toán
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            <div
              onClick={() => setView('ai')}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                    AI Nodes
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    OpenAI, Qwen, Gemini, Claude, Chains, Agents
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            <div
              onClick={() => setView('transformation')}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Code2 className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                    Data transformation
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Code, Filter, Limit, Aggregate, Merge, Convert
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            <div
              onClick={() => setView('flow')}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                    Flow
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Filter, If, Loop, Merge, Switch, Wait
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            <div
              onClick={() => setView('core')}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                    Core
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Code, Data table, HTTP Request, Webhook, Guardian
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            <div
              onClick={() => setView('human_review')}
              className="p-3 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-[#e6e8ec] transition-colors">
                    Human review
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Chat, Discord, Gmail, Slack, Telegram, Teams
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            </div>

            {/* Instant Search Results inside Ứng Dụng when user types in Root search */}
            {search.trim() !== '' && (
              <div className="pt-2 space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Kết quả tìm kiếm trong Ứng Dụng
                </div>
                {Object.values(APPS_REGISTRY)
                  .filter(
                    (app) =>
                      matchesSearch(app.name) ||
                      matchesSearch(app.desc) ||
                      app.triggers.some((t) => matchesSearch(t.title)) ||
                      app.actions.some((a) => matchesSearch(a.title))
                  )
                  .map((app) => (
                    <div
                      key={app.id}
                      onClick={() => openAppDetail(app.id)}
                      className="p-2.5 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-zinc-300">
                          {app.customIcon ||
                            (app.icon && <app.icon className="w-5 h-5" />) || (
                              <Globe className="w-5 h-5 text-zinc-400" />
                            )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                              {app.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{app.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                          {app.triggers.length}T · {app.actions.length}A
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: WHAT TRIGGERS THIS WORKFLOW? (Exact Image 4) */}
        {/* ======================================================== */}
        {view === 'triggers' && (
          <div className="space-y-1">
            {[
              {
                id: 'trigger.manual',
                title: 'Trigger manually',
                desc: 'Runs the flow on clicking a button in n8n. Good for getting started quickly',
                customIcon: <N8nManualTriggerIcon />,
                hasArrow: false,
              },
              {
                id: 'on_app_event',
                title: 'On app event',
                desc: 'Runs the flow when something happens in an app like Telegram, Notion or Airtable',
                icon: Radio,
                hasArrow: true,
                onClick: () => {
                  setSearch('');
                  setView('app_list');
                },
              },
              {
                id: 'trigger.cron',
                title: 'On a schedule',
                desc: 'Runs the flow every day, hour, or custom interval',
                icon: Clock,
                hasArrow: false,
              },
              {
                id: 'trigger.webhook',
                title: 'On webhook call',
                desc: 'Runs the flow on receiving an HTTP request',
                icon: Radio,
                hasArrow: false,
              },
              {
                id: 'trigger.form',
                title: 'On form submission',
                desc: 'Generate webforms in n8n and pass their responses to the workflow',
                icon: ClipboardList,
                hasArrow: false,
              },
              {
                id: 'flow.subworkflow',
                title: 'When executed by another workflow',
                desc: 'Runs the flow when called by the Execute Workflow node from a different workflow',
                icon: ArrowRightToLine,
                hasArrow: false,
              },
              {
                id: 'trigger.chat',
                title: 'On chat message',
                desc: 'Runs the flow when a user sends a chat message. For use with AI nodes',
                icon: MessageSquare,
                hasArrow: false,
              },
              {
                id: 'automation.code',
                title: 'When running evaluation',
                desc: 'Run a dataset through your workflow to test performance',
                icon: CheckCheck,
                hasArrow: false,
              },
              {
                id: 'other_ways',
                title: 'Other ways...',
                desc: 'Runs the flow on workflow errors, file changes, database CDC, queues, approvals, etc.',
                icon: FolderOpen,
                hasArrow: true,
                onClick: () => {
                  setSearch('');
                  setView('other_triggers');
                },
              },
            ]
              .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
              .map((item) => renderNodeRow(item))}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: OTHER WAYS (13 VINCEAUTO PLATFORM TRIGGERS + DOMAIN TRIGGERS) */}
        {/* ======================================================== */}
        {view === 'other_triggers' && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              13 VinceAuto Platform Triggers
            </div>
            {VINCEAUTO_PLATFORM_TRIGGERS.map((pt) => ({
              id: pt.id,
              title: `${pt.title} [${pt.mechanism}]`,
              desc: pt.desc,
              icon: Zap,
              hasArrow: false,
            }))
              .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
              .map((item) => renderNodeRow(item))}

            <div className="pt-2 px-2 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Domain & App Event Triggers
            </div>
            {[
              {
                id: 'trigger.database',
                title: 'Database Trigger',
                desc: 'Có bản ghi dữ liệu mới trong PostgreSQL, MySQL, Supabase',
                icon: Database,
                hasArrow: true,
                onClick: () => openAppDetail('databases'),
              },
              {
                id: 'trigger.ecommerce',
                title: 'E-commerce Trigger',
                desc: 'Có đơn hàng mới phát sinh từ Shopee, TikTok Shop, Lazada, WooCommerce',
                icon: ShoppingBag,
                hasArrow: true,
                onClick: () => openAppDetail('shopee'),
              },
              {
                id: 'trigger.payment',
                title: 'Payment Trigger',
                desc: 'Nhận callback thanh toán MoMo, VNPAY, ZaloPay, Ngân hàng thành công',
                icon: CreditCard,
                hasArrow: true,
                onClick: () => openAppDetail('momo'),
              },
              {
                id: 'trigger.socialMedia',
                title: 'Social Media Trigger',
                desc: 'Có bình luận hoặc sự kiện mới trên Facebook Page, TikTok, Instagram',
                icon: Share2,
                hasArrow: true,
                onClick: () => openAppDetail('facebook'),
              },
              {
                id: 'trigger.git',
                title: 'Git Trigger',
                desc: 'Có commit mới được push hoặc mở Pull Request trên GitHub / GitLab',
                icon: GitFork,
                hasArrow: true,
                onClick: () => openAppDetail('github'),
              },
            ]
              .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
              .map((item) => renderNodeRow(item))}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: ỨNG DỤNG (APPS CATALOG BY 5 GROUPS) */}
        {/* ======================================================== */}
        {view === 'app_list' && (
          <div className="space-y-2">
            {/* 5-Part Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none select-none px-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'productivity', label: '1. Google, MS & Productivity' },
                { id: 'communication', label: '2. Social & Chat' },
                { id: 'ecommerce_crm', label: '3. TMĐT, CRM & Marketing' },
                { id: 'database_dev', label: '4. Database, Dev & Cloud' },
                { id: 'ai_finance', label: '5. AI & Thanh toán' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAppGroupFilter(cat.id as 'all' | IntegrationCategoryGroup)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                    appGroupFilter === cat.id
                      ? 'bg-[#e6e8ec] text-zinc-900 font-bold border-[#e6e8ec] shadow-sm'
                      : 'bg-[#1c1c1f] text-zinc-400 border-[#2e2e32] hover:text-zinc-200 hover:border-[#3e3e44]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {Object.values(APPS_REGISTRY)
                .filter(
                  (app) =>
                    (appGroupFilter === 'all' || app.categoryGroup === appGroupFilter) &&
                    (matchesSearch(app.name) ||
                      matchesSearch(app.desc) ||
                      app.triggers.some((t) => matchesSearch(t.title)) ||
                      app.actions.some((a) => matchesSearch(a.title)))
                )
                .map((app) => (
                  <div
                    key={app.id}
                    onClick={() => openAppDetail(app.id)}
                    className="p-2.5 rounded-xl border border-transparent hover:border-[#2e2e30] hover:bg-[#202022] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-zinc-300">
                        {app.customIcon ||
                          (app.icon &&
                            React.createElement(app.icon, {
                              className: 'w-5 h-5 text-zinc-300',
                            })) || <Globe className="w-5 h-5 text-zinc-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                            {app.name}
                          </span>
                          {app.status && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                app.status === 'NATIVE'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              }`}
                            >
                              {app.status}
                            </span>
                          )}
                          {connectedCredentials[app.credentialKey] && (
                            <span className="text-[9px] font-semibold bg-[#10b981]/20 text-[#34d399] px-1.5 py-0.2 rounded-full border border-[#10b981]/30">
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{app.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                        {app.triggers.length}T · {app.actions.length}A
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: VINCEAUTO AI NODE LIBRARY (10 Nhóm Chuẩn + 12 Node Độc Quyền) */}
        {/* ======================================================== */}
        {view === 'ai' && (
          <div className="space-y-2">
            {/* Horizontal Category Switcher Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none select-none">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'exclusive', label: '★ Độc quyền (12)' },
                { id: 'agents', label: '01. Agents' },
                { id: 'models', label: '02. Models' },
                { id: 'memory', label: '03. Memory' },
                { id: 'tools', label: '04. Tools' },
                { id: 'chains', label: '05. Chains' },
                { id: 'rag', label: '06. RAG & Vector' },
                { id: 'embeddings', label: '07. Embeddings' },
                { id: 'parsers', label: '08. Parsers' },
                { id: 'media', label: '09. Vision & Media' },
                { id: 'evaluation', label: '10. Evaluation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAiSubFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 ${
                    aiSubFilter === tab.id
                      ? 'bg-[#38bdf8] text-black font-semibold shadow-sm'
                      : 'bg-[#202023] text-zinc-300 hover:bg-[#2a2a2d] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AI Templates Hero Card */}
            {aiSubFilter === 'all' && !search && (
              <>
                {renderNodeRow({
                  id: 'vince.workflowBuilder',
                  title: 'AI Templates',
                  badge: 'Recommended',
                  desc: "See what's possible and get started 5x faster with pre-built AI architectures",
                  icon: Boxes,
                  hasArrow: true,
                })}
                <div className="border-t border-[#252528] my-1" />
              </>
            )}

            {/* Main AI Nodes List */}
            <div className="space-y-0.5">
              {[
                // -------------------------------------------------------------
                // ★ 12 CÁC NODE ĐỘC QUYỀN VINCEAUTO
                // -------------------------------------------------------------
                {
                  id: 'vince.supervisor',
                  title: 'Vince Supervisor',
                  badge: 'Độc quyền',
                  desc: 'Đầu não điều phối toàn bộ nhóm Agent, phân bổ nhiệm vụ và giám sát tiến độ',
                  icon: Layers,
                  group: 'exclusive',
                },
                {
                  id: 'vince.agentCreator',
                  title: 'Vince Agent Creator',
                  badge: 'Độc quyền',
                  desc: 'Tự động thiết kế, chọn tools và cấu hình Agent từ mô tả ngôn ngữ tự nhiên',
                  icon: Bot,
                  group: 'exclusive',
                },
                {
                  id: 'vince.workflowBuilder',
                  title: 'Vince Workflow Builder',
                  badge: 'Độc quyền',
                  desc: 'AI tự động sinh toàn bộ luồng workflow tự động hóa hoàn chỉnh từ mục tiêu',
                  icon: Boxes,
                  group: 'exclusive',
                },
                {
                  id: 'vince.workflowDebugger',
                  title: 'Vince Workflow Debugger',
                  badge: 'Độc quyền',
                  desc: 'Tự động bắt lỗi runtime, phân tích traceback và tự đề xuất sửa lỗi từng node',
                  icon: Wrench,
                  group: 'exclusive',
                },
                {
                  id: 'vince.modelRouter',
                  title: 'Vince Model Router',
                  badge: 'Độc quyền',
                  desc: 'Tự động phân loại độ khó prompt để chọn model rẻ nhất mà vẫn chuẩn xác nhất',
                  icon: Cpu,
                  group: 'exclusive',
                },
                {
                  id: 'vince.memoryManager',
                  title: 'Vince Memory Manager',
                  badge: 'Độc quyền',
                  desc: 'Hệ thống quản lý bộ nhớ đa tầng: Short-term, Long-term, Project & Team',
                  icon: Brain,
                  group: 'exclusive',
                },
                {
                  id: 'vince.agentHandoff',
                  title: 'Vince Agent Handoff',
                  badge: 'Độc quyền',
                  desc: 'Bàn giao công việc và truyền toàn bộ context mượt mà giữa các Agent chuyên môn',
                  icon: ArrowLeftRight,
                  group: 'exclusive',
                },
                {
                  id: 'vince.browserAgent',
                  title: 'Vince Browser Agent',
                  badge: 'Độc quyền',
                  desc: 'Điều khiển trình duyệt Puppeteer/Playwright tự động click, fill form, cào data',
                  icon: Globe,
                  group: 'exclusive',
                },
                {
                  id: 'vince.knowledgeHub',
                  title: 'Vince Knowledge Hub',
                  badge: 'Độc quyền',
                  desc: 'Kho lưu trữ và đồng bộ hóa toàn bộ tri thức, tài liệu và văn bản nội bộ',
                  icon: BookOpen,
                  group: 'exclusive',
                },
                {
                  id: 'vince.virtualOffice',
                  title: 'Vince Virtual Office',
                  badge: 'Độc quyền',
                  desc: 'Mô phỏng văn phòng ảo kết nối các Agent thành các phòng ban phối hợp nhịp nhàng',
                  icon: Briefcase,
                  group: 'exclusive',
                },
                {
                  id: 'vince.approval',
                  title: 'Vince Approval',
                  badge: 'Độc quyền',
                  desc: 'Cổng Human-in-the-loop: Dừng lại và gửi thông báo yêu cầu con người bấm duyệt',
                  icon: ShieldCheck,
                  group: 'exclusive',
                },
                {
                  id: 'vince.costOptimizer',
                  title: 'Vince Cost Optimizer',
                  badge: 'Độc quyền',
                  desc: 'Giám sát chi phí token thời gian thực, nén prompt và cắt giảm đến 70% hóa đơn API',
                  icon: Zap,
                  group: 'exclusive',
                },

                // -------------------------------------------------------------
                // 01. AI Agents & Orchestration
                // -------------------------------------------------------------
                {
                  id: 'ai.agent.general',
                  title: 'AI Agent',
                  desc: 'Agent tự quyết định sử dụng công cụ dựa trên prompt và mục tiêu của người dùng',
                  customIcon: <RobotAgentIcon />,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.tools',
                  title: 'Tools Agent',
                  desc: 'Agent sử dụng nhiều tools (Calculator, API, Search, Code) để giải quyết vấn đề',
                  icon: Wrench,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.conversational',
                  title: 'Conversational Agent',
                  desc: 'Agent hội thoại tương tác duy trì ngữ cảnh nhiều lượt liên tục với người dùng',
                  icon: MessageSquare,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.planAndExecute',
                  title: 'Plan & Execute Agent',
                  desc: 'Tự động lập kế hoạch các bước trước khi thực thi từng hành động',
                  icon: Workflow,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.sql',
                  title: 'SQL Agent',
                  desc: 'Truy vấn cơ sở dữ liệu PostgreSQL, MySQL, Supabase bằng ngôn ngữ tự nhiên',
                  icon: Database,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.react',
                  title: 'ReAct Agent',
                  desc: 'Cơ chế suy luận và hành động theo từng bước (Reasoning + Acting)',
                  icon: Brain,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.supervisor',
                  title: 'Multi-Agent Supervisor',
                  desc: 'Điều phối và phân bổ nhiệm vụ phức tạp cho nhiều Agent chuyên trách',
                  icon: Layers,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.router',
                  title: 'Agent Router',
                  desc: 'Phân tích ý định và chuyển nhiệm vụ tới Agent phù hợp nhất',
                  icon: GitFork,
                  group: 'agents',
                },
                {
                  id: 'ai.agent.handoff',
                  title: 'Agent Handoff',
                  desc: 'Chuyển quyền điều khiển và toàn bộ ngữ cảnh giữa các Agent liền mạch',
                  icon: ArrowLeftRight,
                  group: 'agents',
                },

                // -------------------------------------------------------------
                // 02. AI Models (LLM Providers)
                // -------------------------------------------------------------
                {
                  id: 'ai.model.openai',
                  title: 'OpenAI Chat Model',
                  badge: 'Free credits',
                  desc: 'Kết nối mô hình GPT-4o, GPT-4o-mini, o1, o3-mini từ OpenAI',
                  customIcon: <OpenAIIcon />,
                  hasArrow: true,
                  group: 'models',
                  onClick: () => openProviderActions('openai'),
                },
                {
                  id: 'ai.model.anthropic',
                  title: 'Anthropic Chat Model',
                  badge: 'Free credits',
                  desc: 'Kết nối Claude 3.7 Sonnet, Claude 3.5 Haiku, Claude 3 Opus',
                  customIcon: <AnthropicIcon />,
                  hasArrow: true,
                  group: 'models',
                  onClick: () => openProviderActions('anthropic'),
                },
                {
                  id: 'ai.model.gemini',
                  title: 'Google Gemini Chat Model',
                  badge: 'Free credits',
                  desc: 'Mô hình đa phương thức Gemini 2.5 Flash, Gemini 2.5 Pro, Flash Lite',
                  customIcon: <GeminiStarIcon />,
                  hasArrow: true,
                  group: 'models',
                  onClick: () => openProviderActions('gemini'),
                },
                {
                  id: 'ai.model.deepseek',
                  title: 'DeepSeek Chat Model',
                  badge: 'Hot',
                  desc: 'Mô hình lý luận siêu việt DeepSeek R1 và mô hình tổng hợp DeepSeek V3',
                  icon: Cpu,
                  group: 'models',
                },
                {
                  id: 'ai.model.groq',
                  title: 'Groq Chat Model',
                  desc: 'Inference siêu tốc độ với LPU phần cứng (Llama 3.3 70B, Mixtral)',
                  icon: Zap,
                  group: 'models',
                },
                {
                  id: 'ai.model.ollama',
                  title: 'Ollama Chat Model',
                  desc: 'Chạy các mô hình mã nguồn mở cục bộ không tốn chi phí API',
                  customIcon: <OllamaIcon />,
                  group: 'models',
                },
                {
                  id: 'ai.model.openrouter',
                  title: 'OpenRouter Chat Model',
                  desc: 'Truy cập hàng trăm mô hình AI trên toàn cầu qua một API duy nhất',
                  icon: Globe,
                  group: 'models',
                },
                {
                  id: 'ai.model.vertex',
                  title: 'Google Vertex AI',
                  desc: 'Mô hình Gemini và Claude trên hạ tầng bảo mật Google Cloud Platform',
                  icon: Cloud,
                  group: 'models',
                },
                {
                  id: 'ai.model.azureOpenai',
                  title: 'Azure OpenAI Chat Model',
                  desc: 'Mô hình GPT chạy trên nền tảng đám mây Microsoft Azure Enterprise',
                  icon: Cloud,
                  group: 'models',
                },
                {
                  id: 'ai.model.awsBedrock',
                  title: 'AWS Bedrock Chat Model',
                  desc: 'Mô hình AI trên dịch vụ Amazon Bedrock (Claude, Llama, Titan)',
                  icon: Cloud,
                  group: 'models',
                },
                {
                  id: 'ai.model.mistral',
                  title: 'Mistral Chat Model',
                  desc: 'Mô hình Mistral Large, Codestral và Pixtral mạnh mẽ của châu Âu',
                  icon: Cpu,
                  group: 'models',
                },
                {
                  id: 'ai.model.cohere',
                  title: 'Cohere Chat Model',
                  desc: 'Mô hình Command R+ chuyên sâu cho xử lý dữ liệu doanh nghiệp và RAG',
                  icon: Cpu,
                  group: 'models',
                },
                {
                  id: 'ai.model.nemotron',
                  title: 'NVIDIA Nemotron Chat Model',
                  desc: 'Mô hình tối ưu hóa phần cứng NVIDIA cho suy luận chuẩn xác',
                  icon: Cpu,
                  group: 'models',
                },
                {
                  id: 'ai.model.kimi',
                  title: 'Moonshot Kimi Chat Model',
                  badge: 'Free credits',
                  desc: 'Mô hình Kimi với cửa sổ ngữ cảnh siêu dài 2 triệu tokens',
                  customIcon: <KimiIcon />,
                  hasArrow: true,
                  group: 'models',
                  onClick: () => openProviderActions('kimi'),
                },
                {
                  id: 'ai.model.minimax',
                  title: 'MiniMax Chat Model',
                  badge: 'Free credits',
                  desc: 'Mô hình MiniMax mạnh về đối thoại, tạo giọng nói và hình ảnh',
                  customIcon: <MiniMaxIcon />,
                  hasArrow: true,
                  group: 'models',
                  onClick: () => openProviderActions('minimax'),
                },
                {
                  id: 'ai.model.grok',
                  title: 'xAI Grok Chat Model',
                  desc: 'Mô hình Grok 2 / Grok Vision từ xAI với dữ liệu thời gian thực',
                  icon: Cpu,
                  group: 'models',
                },
                {
                  id: 'ai.model.huggingface',
                  title: 'Hugging Face Inference',
                  desc: 'Kết nối trực tiếp tới hàng ngàn mô hình trên Hugging Face Hub',
                  icon: Smile,
                  group: 'models',
                },
                {
                  id: 'ai.model.vercelGateway',
                  title: 'Vercel AI Gateway',
                  desc: 'Cổng định tuyến và cân bằng tải mô hình AI chuẩn Vercel AI SDK',
                  icon: Zap,
                  group: 'models',
                },

                // -------------------------------------------------------------
                // 03. AI Memory (Bộ nhớ AI)
                // -------------------------------------------------------------
                {
                  id: 'ai.memory.simple',
                  title: 'Simple Memory',
                  desc: 'Bộ nhớ hội thoại cơ bản (Window Buffer) lưu k lượt chat gần nhất',
                  icon: Brain,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.postgres',
                  title: 'Postgres Chat Memory',
                  desc: 'Lưu trữ lịch sử hội thoại vĩnh viễn vào cơ sở dữ liệu PostgreSQL',
                  icon: Database,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.redis',
                  title: 'Redis Chat Memory',
                  desc: 'Bộ nhớ đệm tốc độ cực cao trên Redis kèm cấu hình thời gian sống (TTL)',
                  icon: Zap,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.mongodb',
                  title: 'MongoDB Chat Memory',
                  desc: 'Lưu trữ tài liệu hội thoại linh hoạt trên cụm cơ sở dữ liệu MongoDB',
                  icon: Database,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.zep',
                  title: 'Zep Memory',
                  desc: 'Hệ thống quản lý bộ nhớ hội thoại thông minh hỗ trợ trích xuất thực thể',
                  icon: Brain,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.motorhead',
                  title: 'Motorhead Memory',
                  desc: 'Lưu trữ trạng thái hội thoại và tóm tắt nền tự động theo tiến trình',
                  icon: Cpu,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.longTerm',
                  title: 'Agent Long-term Memory',
                  badge: 'Độc quyền',
                  desc: 'Bộ nhớ dài hạn cho Agent ghi nhớ kinh nghiệm và tri thức theo thời gian',
                  icon: Brain,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.shortTerm',
                  title: 'Agent Short-term Memory',
                  badge: 'Độc quyền',
                  desc: 'Bộ nhớ ngắn hạn cho các nhiệm vụ tác vụ tạm thời trong phiên làm việc',
                  icon: Brain,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.project',
                  title: 'Project Memory',
                  badge: 'Độc quyền',
                  desc: 'Bộ nhớ dành riêng cho toàn bộ các Agent làm việc chung trong 1 dự án',
                  icon: Folder,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.sharedTeam',
                  title: 'Shared Team Memory',
                  badge: 'Độc quyền',
                  desc: 'Không gian chia sẻ kiến thức chung giữa người dùng và toàn bộ nhóm Agent',
                  icon: Layers,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.search',
                  title: 'Memory Search',
                  badge: 'Độc quyền',
                  desc: 'Tìm kiếm ngữ nghĩa siêu nhanh trong kho ký ức của các Agent',
                  icon: Search,
                  group: 'memory',
                },
                {
                  id: 'ai.memory.summarizer',
                  title: 'Memory Summarizer',
                  badge: 'Độc quyền',
                  desc: 'Tự động nén và tóm lược các phiên hội thoại dài để tiết kiệm token',
                  icon: Shrink,
                  group: 'memory',
                },

                // -------------------------------------------------------------
                // 04. AI Tools (Công cụ cho Agent)
                // -------------------------------------------------------------
                {
                  id: 'ai.tool.calculator',
                  title: 'Calculator Tool',
                  desc: 'Công cụ tính toán số học chính xác 100%, khắc phục nhược điểm toán của LLM',
                  icon: Wrench,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.code',
                  title: 'Custom Code Tool',
                  desc: 'Thực thi mã JavaScript/Python kiểm soát an toàn trong môi trường sandbox',
                  icon: Code2,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.http',
                  title: 'HTTP Request Tool',
                  desc: 'Cho phép Agent chủ động gọi REST/GraphQL API từ các bên thứ ba',
                  icon: Globe,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.mcp',
                  title: 'MCP Client Tool',
                  badge: 'MCP',
                  desc: 'Kết nối giao thức Model Context Protocol mở rộng hàng trăm công cụ ngoại vi',
                  icon: Zap,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.searxng',
                  title: 'SearXNG Search Tool',
                  desc: 'Tìm kiếm thông tin Internet mã nguồn mở bảo vệ quyền riêng tư',
                  icon: Search,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.serpapi',
                  title: 'SerpApi Google Tool',
                  desc: 'Tìm kiếm dữ liệu trên Google Search theo thời gian thực qua SerpApi',
                  icon: Search,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.wikipedia',
                  title: 'Wikipedia Tool',
                  desc: 'Tra cứu kiến thức bách khoa toàn thư Wikipedia tiếng Việt và quốc tế',
                  icon: BookOpen,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.wolfram',
                  title: 'Wolfram Alpha Tool',
                  desc: 'Động cơ tính toán tri thức chuyên sâu cho toán học, vật lý và khoa học',
                  icon: Cpu,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.think',
                  title: 'Think Tool',
                  desc: 'Hỗ trợ Agent suy nghĩ và phân tích chuỗi tư duy (CoT) trước khi hành động',
                  icon: Brain,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.callWorkflow',
                  title: 'Call Workflow Tool',
                  desc: 'Cho phép Agent thực thi một workflow tự động hóa khác như một công cụ phụ',
                  icon: Workflow,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.vectorStoreQa',
                  title: 'Vector Store QA Tool',
                  desc: 'Công cụ hỏi đáp tài liệu nội bộ đã được vector hóa trong cơ sở dữ liệu',
                  icon: Database,
                  group: 'tools',
                },
                {
                  id: 'ai.tool.agentAsTool',
                  title: 'AI Agent as Tool',
                  desc: 'Đóng gói một AI Agent thành một công cụ độc lập cho Agent khác gọi tới',
                  customIcon: <RobotAgentIcon />,
                  group: 'tools',
                },

                // -------------------------------------------------------------
                // 05. AI Chains (Chuỗi xử lý AI)
                // -------------------------------------------------------------
                {
                  id: 'ai.chain.basicLlm',
                  title: 'Basic LLM Chain',
                  desc: 'Chuỗi xử lý LLM đơn giản nhất dựa trên prompt template và model',
                  icon: Workflow,
                  group: 'chains',
                },
                {
                  id: 'ai.chain.qa',
                  title: 'Question and Answer Chain',
                  desc: 'Hỏi đáp tài liệu RAG kết hợp tài liệu truy xuất và câu hỏi người dùng',
                  icon: HelpCircle,
                  group: 'chains',
                },
                {
                  id: 'ai.chain.summarization',
                  title: 'Summarization Chain',
                  desc: 'Tự động đọc và tóm tắt văn bản dài (Map-Reduce, Refine, Stuff)',
                  icon: Shrink,
                  group: 'chains',
                },
                {
                  id: 'ai.chain.extractor',
                  title: 'Information Extractor',
                  desc: 'Trích xuất thông tin có cấu trúc (email, số điện thoại, đơn hàng, bảng giá)',
                  icon: FileText,
                  group: 'chains',
                },
                {
                  id: 'ai.chain.classifier',
                  title: 'Text Classifier',
                  desc: 'Phân loại văn bản vào các danh mục định sẵn với độ chuẩn xác cao',
                  icon: Tag,
                  group: 'chains',
                },
                {
                  id: 'ai.chain.sentiment',
                  title: 'Sentiment Analysis',
                  desc: 'Phân tích sắc thái tình cảm của khách hàng (Tích cực, Trung tính, Tiêu cực)',
                  icon: Smile,
                  group: 'chains',
                },
                {
                  id: 'ai.chain.langchainCode',
                  title: 'LangChain Custom Code',
                  desc: 'Xây dựng đường ống xử lý LangChain tùy chỉnh bằng JavaScript/Python',
                  icon: Code2,
                  group: 'chains',
                },

                // -------------------------------------------------------------
                // 06. RAG & Vector Database
                // -------------------------------------------------------------
                {
                  id: 'ai.rag.vectorRetriever',
                  title: 'Vector Store Retriever',
                  desc: 'Truy xuất các đoạn văn bản có độ tương đồng ngữ nghĩa cao nhất',
                  icon: Search,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.contextualCompression',
                  title: 'Contextual Compression Retriever',
                  desc: 'Nén và loại bỏ thông tin thừa trong kết quả truy xuất để tiết kiệm token',
                  icon: Shrink,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.multiQuery',
                  title: 'MultiQuery Retriever',
                  desc: 'Tự động mở rộng câu hỏi thành nhiều truy vấn khác nhau để tìm dữ liệu đầy đủ',
                  icon: GitFork,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.workflowRetriever',
                  title: 'Workflow Retriever',
                  desc: 'Truy xuất dữ liệu động trực tiếp từ một workflow đang chạy',
                  icon: Workflow,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.defaultDataLoader',
                  title: 'Default Data Loader',
                  desc: 'Đọc và nạp các định dạng tài liệu phổ biến (PDF, DOCX, TXT, CSV, JSON)',
                  icon: ArrowRightToLine,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.githubLoader',
                  title: 'GitHub Document Loader',
                  desc: 'Nạp mã nguồn, tài liệu README, issue và pull request từ GitHub repo',
                  icon: GitFork,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.charSplitter',
                  title: 'Character Text Splitter',
                  desc: 'Chia nhỏ văn bản dựa trên số lượng ký tự cố định và độ gối đầu (overlap)',
                  icon: Sliders,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.recursiveSplitter',
                  title: 'Recursive Character Text Splitter',
                  desc: 'Chia nhỏ văn bản thông minh theo cấu trúc đoạn văn, ngắt dòng và dấu câu',
                  icon: Sliders,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.tokenSplitter',
                  title: 'Token Splitter',
                  desc: 'Chia nhỏ văn bản dựa trên đơn vị token để đảm bảo không vượt quá context window',
                  icon: Sliders,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.pinecone',
                  title: 'Pinecone Vector Store',
                  desc: 'Lưu trữ và tìm kiếm vector đám mây hiệu năng cao với chỉ mục Pinecone',
                  icon: Database,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.qdrant',
                  title: 'Qdrant Vector Store',
                  desc: 'Cơ sở dữ liệu vector mã nguồn mở mạnh mẽ hỗ trợ lọc metadata phong phú',
                  icon: Database,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.supabase',
                  title: 'Supabase PGVector Store',
                  desc: 'Lưu trữ vector ngữ nghĩa trực tiếp trong cơ sở dữ liệu Supabase PostgreSQL',
                  icon: Database,
                  group: 'rag',
                },
                {
                  id: 'ai.rag.simpleVectorStore',
                  title: 'Simple In-Memory Vector Store',
                  desc: 'Kho vector lưu trên bộ nhớ RAM nhẹ nhàng cho các workflow thử nghiệm nhanh',
                  icon: Database,
                  group: 'rag',
                },

                // -------------------------------------------------------------
                // 07. Embeddings (Vector hóa văn bản)
                // -------------------------------------------------------------
                {
                  id: 'ai.embedding.openai',
                  title: 'OpenAI Embeddings',
                  desc: 'Mô hình text-embedding-3-small và text-embedding-3-large chất lượng cao',
                  icon: Cpu,
                  group: 'embeddings',
                },
                {
                  id: 'ai.embedding.gemini',
                  title: 'Google Gemini Embeddings',
                  desc: 'Mô hình text-embedding-004 tối ưu cho đa ngôn ngữ và tiếng Việt',
                  icon: Sparkles,
                  group: 'embeddings',
                },
                {
                  id: 'ai.embedding.cohere',
                  title: 'Cohere Embeddings',
                  desc: 'Mô hình embed-multilingual-v3.0 hàng đầu thế giới về đa ngôn ngữ',
                  icon: Cpu,
                  group: 'embeddings',
                },
                {
                  id: 'ai.embedding.ollama',
                  title: 'Ollama Embeddings',
                  desc: 'Tạo vector embedding cục bộ miễn phí (nomic-embed-text, bge-m3)',
                  icon: Cpu,
                  group: 'embeddings',
                },
                {
                  id: 'ai.embedding.huggingface',
                  title: 'Hugging Face Embeddings',
                  desc: 'Sử dụng các mô hình embedding mã nguồn mở từ Hugging Face Hub',
                  icon: Smile,
                  group: 'embeddings',
                },

                // -------------------------------------------------------------
                // 08. Output Parser (Chuẩn hóa đầu ra AI)
                // -------------------------------------------------------------
                {
                  id: 'ai.parser.structured',
                  title: 'Structured Output Parser',
                  desc: 'Ép AI trả về JSON hợp lệ tuyệt đối tuân theo schema Zod/JSON-Schema',
                  icon: ListFilter,
                  group: 'parsers',
                },
                {
                  id: 'ai.parser.autoFixing',
                  title: 'Auto-fixing Output Parser',
                  desc: 'Tự động phát hiện lỗi cú pháp JSON và yêu cầu LLM sửa lại hợp lệ',
                  icon: Wrench,
                  group: 'parsers',
                },
                {
                  id: 'ai.parser.itemList',
                  title: 'Item List Output Parser',
                  desc: 'Chuẩn hóa danh sách các mục để dễ dàng duyệt lặp (loop) trong workflow',
                  icon: ListFilter,
                  group: 'parsers',
                },
                {
                  id: 'ai.parser.modelSelector',
                  title: 'Model Selector',
                  desc: 'Tự động chọn model phù hợp nhất dựa trên độ khó của prompt và chi phí',
                  icon: Cpu,
                  group: 'parsers',
                },

                // -------------------------------------------------------------
                // 09. AI Vision & Multimodal Media
                // -------------------------------------------------------------
                {
                  id: 'ai.media.imageAnalysis',
                  title: 'Image Analysis & Vision',
                  desc: 'Phân tích nội dung ảnh, biểu đồ, phát hiện đối tượng và phân loại hình ảnh',
                  icon: Image,
                  group: 'media',
                },
                {
                  id: 'ai.media.ocr',
                  title: 'OCR Document Scanner',
                  desc: 'Quét và trích xuất chữ viết tay, hóa đơn, căn cước công dân tiếng Việt',
                  icon: FileText,
                  group: 'media',
                },
                {
                  id: 'ai.media.speechToText',
                  title: 'Speech-to-Text (Whisper)',
                  desc: 'Chuyển đổi âm thanh ghi âm giọng nói thành văn bản chuẩn xác',
                  icon: Radio,
                  group: 'media',
                },
                {
                  id: 'ai.media.textToSpeech',
                  title: 'Text-to-Speech (TTS)',
                  desc: 'Chuyển đổi văn bản thành giọng đọc truyền cảm tự nhiên (OpenAI, ElevenLabs)',
                  icon: Radio,
                  group: 'media',
                },
                {
                  id: 'ai.media.videoGen',
                  title: 'AI Video Generator & Analyzer',
                  desc: 'Tạo hoặc phân tích từng khung hình của video với Gemini và MiniMax',
                  icon: PlayCircle,
                  group: 'media',
                },

                // -------------------------------------------------------------
                // 10. AI Evaluation & Benchmark
                // -------------------------------------------------------------
                {
                  id: 'ai.eval.evaluator',
                  title: 'AI Evaluator Test Suite',
                  desc: 'Bộ công cụ kiểm thử tự động hàng loạt prompt, agent và workflow AI',
                  icon: CheckCheck,
                  group: 'evaluation',
                },
                {
                  id: 'ai.eval.accuracy',
                  title: 'Accuracy & Relevance Test',
                  desc: 'Đo lường độ chính xác và mức độ liên quan của câu trả lời so với chuẩn',
                  icon: CheckCheck,
                  group: 'evaluation',
                },
                {
                  id: 'ai.eval.hallucination',
                  title: 'Hallucination Check',
                  desc: 'Tự động kiểm tra phát hiện ảo giác và xác minh nguồn trích dẫn dữ liệu',
                  icon: ShieldCheck,
                  group: 'evaluation',
                },
                {
                  id: 'ai.eval.comparison',
                  title: 'Model Comparison Benchmark',
                  desc: 'So sánh tốc độ, chi phí và chất lượng đầu ra giữa các model khác nhau',
                  icon: Layers,
                  group: 'evaluation',
                },
              ]
                .filter((item) => {
                  if (aiSubFilter !== 'all' && item.group !== aiSubFilter) {
                    return false;
                  }
                  return matchesSearch(item.title) || matchesSearch(item.desc);
                })
                .map((item) => renderNodeRow(item))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: OTHER AI NODES */}
        {/* ======================================================== */}
        {view === 'other_ai' && (
          <div className="space-y-1">
            {[
              { id: 'vince.scraper', title: 'Document Loaders', desc: 'Handles loading of documents for processing.', icon: ArrowRightToLine, hasArrow: true },
              { id: 'vince.modelRouter', title: 'Language Models', desc: 'AI models that understand and generate language.', icon: Languages, hasArrow: true },
              { id: 'vince.agentManager', title: 'Memory', desc: 'Manages storage and retrieval of information during execution.', icon: Brain, hasArrow: true },
              { id: 'vince.modelRouter', title: 'Output Parsers', desc: 'Ensures the output adheres to a defined format.', icon: ListFilter, hasArrow: true },
              { id: 'vince.scraper', title: 'Retrievers', desc: 'Fetches relevant information from a source.', icon: Search, hasArrow: true },
              { id: 'vince.modelRouter', title: 'Text Splitters', desc: 'Breaks down text into smaller parts.', icon: Sliders, hasArrow: true },
              { id: 'vince.agentManager', title: 'Tools', desc: 'Utility components providing various functionalities.', icon: Wrench, hasArrow: true },
              { id: 'vince.modelRouter', title: 'Embeddings', desc: 'Transforms text into vector representations.', icon: Cpu, hasArrow: true },
              { id: 'vince.zone', title: 'Vector Stores', desc: 'Store and access vector data in services like Supabase, Pinecone and MongoDB', icon: Database, hasArrow: true },
              { id: 'vince.modelRouter', title: 'Miscellaneous', desc: 'Other AI related nodes.', icon: Code2, hasArrow: true },
            ]
              .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
              .map((item) => renderNodeRow(item))}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: FLOW */}
        {/* ======================================================== */}
        {view === 'flow' && (
          <div className="space-y-2">
            <div>
              <button
                onClick={() => toggleSection('popular')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Popular</span>
                {openSections.popular ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.popular && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.filter', title: 'Filter', desc: 'Keep only items matching a condition', icon: Filter },
                    { id: 'flow.if', title: 'If', desc: 'Route items to different branches (true/false)', icon: GitFork },
                    { id: 'flow.loop', title: 'Loop Over Items (Split in Batches)', desc: 'Split data into batches and iterate over each batch', icon: RotateCw },
                    { id: 'flow.merge', title: 'Merge', desc: 'Merges data of multiple streams once data from both is available', icon: GitMerge },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>

            <div className="border-t border-[#252528] pt-2">
              <button
                onClick={() => toggleSection('other')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Other</span>
                {openSections.other ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.other && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'flow.compare', title: 'Compare Datasets', desc: 'Compare two inputs for changes', icon: Layers },
                    { id: 'flow.subworkflow', title: 'Execute Sub-workflow', desc: 'Helpers for calling other n8n workflows.', icon: GitPullRequest, hasArrow: true },
                    { id: 'flow.stopAndError', title: 'Stop and Error', desc: 'Throw an error in the workflow', icon: Ban },
                    { id: 'flow.switch', title: 'Switch', desc: 'Route items depending on defined expression or rules', icon: Split },
                    { id: 'flow.wait', title: 'Wait', desc: 'Wait before continue with execution', icon: Hourglass },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: CORE (Exact Image 7) */}
        {/* ======================================================== */}
        {view === 'core' && (
          <div className="space-y-2">
            <div>
              <button
                onClick={() => toggleSection('popular')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Popular</span>
                {openSections.popular ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.popular && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.code', title: 'Code', desc: 'Run custom JavaScript or Python code', icon: Code2, hasArrow: true },
                    { id: 'core.dataTable', title: 'Data table', desc: 'Permanently save data across workflow executions in a table', icon: Table, hasArrow: true },
                    { id: 'automation.http', title: 'HTTP Request', desc: 'Makes an HTTP request and returns the response data', icon: Globe },
                    { id: 'trigger.webhook', title: 'Webhook', lightning: true, desc: 'Starts the workflow when a webhook is called', icon: Radio },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>

            <div className="border-t border-[#252528] pt-2">
              <button
                onClick={() => toggleSection('other')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Other</span>
                {openSections.other ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.other && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'core.e2ePolling', title: 'E2E Test Polling Trigger', lightning: true, desc: 'Dummy polling trigger for e2e testing', icon: PlayCircle },
                    { id: 'flow.subworkflow', title: 'Execute Sub-workflow', desc: 'Helpers for calling other n8n workflows. Used for designing modular, microservice-like workflows.', icon: ArrowRightToLine, hasArrow: true },
                    { id: 'core.executionData', title: 'Execution Data', desc: 'Add execution data for search', icon: FileText },
                    { id: 'core.ftp', title: 'FTP', desc: 'Transfer files via FTP or SFTP', icon: Folder, hasArrow: true },
                    { id: 'core.guardian', title: 'Guardian', verified: true, desc: 'Policy-based safety gate for AI agents and workflows. Check actions against Guardian policies, enforce previously-evaluated intents, or gate AI agent tool calls. Returns Allowed (including OBSERVED advisory decisions), Denied, or Needs Approval.', icon: ShieldCheck, hasArrow: true },
                    { id: 'core.guardianApproval', title: 'Guardian Approval Trigger', lightning: true, desc: 'Lắng nghe phê duyệt bảo mật từ Guardian policy gate', icon: ShieldCheck },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: HUMAN REVIEW */}
        {/* ======================================================== */}
        {view === 'human_review' && (
          <div className="space-y-2">
            <div>
              <button
                onClick={() => toggleSection('human')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Send and wait for response</span>
                {openSections.human ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.human && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'human.chat', title: 'Chat', desc: 'Interact with human users in real-time chat', icon: MessageSquare },
                    { id: 'piece.discord.send_webhook', title: 'Discord', desc: 'Send messages to Discord channels', customIcon: <DiscordIcon /> },
                    { id: 'piece.gmail.send_email', title: 'Gmail', desc: 'Send email notifications and wait for replies', customIcon: <GmailIcon /> },
                    { id: 'piece.slack.send_message', title: 'Slack', desc: 'Post messages and approvals to Slack channels', customIcon: <SlackIcon /> },
                    { id: 'vince.telegram', title: 'Telegram', desc: 'Send Telegram messages and wait for button confirmation', customIcon: <TelegramIcon /> },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: DATA TRANSFORMATION */}
        {/* ======================================================== */}
        {view === 'transformation' && (
          <div className="space-y-3">
            {/* Popular */}
            <div>
              <button
                onClick={() => toggleSection('popular')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Popular</span>
                {openSections.popular ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.popular && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.code', title: 'Code', desc: 'Run custom JavaScript or Python code', icon: Code2, hasArrow: true },
                    { id: 'piece.date_time', title: 'Date & Time', desc: 'Manipulate date and time values', icon: Calendar, hasArrow: true },
                    { id: 'automation.set', title: 'Edit Fields (Set)', desc: 'Modify, add, or remove item fields', icon: Edit3 },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>

            {/* Add or remove items */}
            <div>
              <button
                onClick={() => toggleSection('addRemove')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Add or remove items</span>
                {openSections.addRemove ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.addRemove && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.filter', title: 'Filter', desc: 'Keep only items matching a condition', icon: Filter },
                    { id: 'automation.limit', title: 'Limit', desc: 'Restrict the number of items', icon: Minimize2 },
                    { id: 'automation.remove_duplicates', title: 'Remove Duplicates', desc: 'Delete items with matching field values', icon: CopyX, hasArrow: true },
                    { id: 'automation.split_out', title: 'Split Out', desc: 'Turn a list inside item(s) into separate items', icon: Split },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>

            {/* Combine items */}
            <div>
              <button
                onClick={() => toggleSection('combine')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Combine items</span>
                {openSections.combine ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.combine && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.aggregate', title: 'Aggregate', desc: 'Combine a field from many items into a list in a single item', icon: Layers },
                    { id: 'automation.merge', title: 'Merge', desc: 'Merges data of multiple streams once data from both is available', icon: GitMerge },
                    { id: 'automation.summarize', title: 'Summarize', desc: 'Sum, count, max, etc. across items', icon: Table },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>

            {/* Convert data */}
            <div>
              <button
                onClick={() => toggleSection('convert')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Convert data</span>
                {openSections.convert ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.convert && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.compression', title: 'Compression', desc: 'Compress and decompress files', icon: FileArchive, hasArrow: true },
                    { id: 'automation.convert_to_file', title: 'Convert to File', desc: 'Convert JSON data to binary data', icon: FileDown, hasArrow: true },
                    { id: 'automation.crypto', title: 'Crypto', desc: 'Provide cryptographic utilities', icon: Key },
                    { id: 'automation.edit_image', title: 'Edit Image', desc: 'Edits an image like blur, resize or adding border and text', icon: Image, hasArrow: true },
                    { id: 'automation.extract_from_file', title: 'Extract from File', desc: 'Convert binary data to JSON', icon: FileUp, hasArrow: true },
                    { id: 'automation.html', title: 'HTML', desc: 'Work with HTML', icon: Code, hasArrow: true },
                    { id: 'automation.markdown', title: 'Markdown', desc: 'Convert data between Markdown and HTML', icon: FileText },
                    { id: 'automation.xml', title: 'XML', desc: 'Convert data from and to XML', icon: Code },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>

            {/* Other */}
            <div>
              <button
                onClick={() => toggleSection('other')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <span>Other</span>
                {openSections.other ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
              </button>
              {openSections.other && (
                <div className="space-y-0.5 mt-1">
                  {[
                    { id: 'automation.rename_keys', title: 'Rename Keys', desc: 'Update item field names', icon: Pencil },
                    { id: 'automation.sort', title: 'Sort', desc: 'Change items order', icon: ArrowUpDown },
                  ]
                    .filter((i) => matchesSearch(i.title) || matchesSearch(i.desc))
                    .map((item) => renderNodeRow(item))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
