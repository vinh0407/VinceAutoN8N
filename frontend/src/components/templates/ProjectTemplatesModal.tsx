import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  LayoutGrid,
  Workflow,
  Check,
  ArrowRight,
  FolderClosed,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import templatesData from '../../data/n8nTemplatesCatalog.json';
import { IWorkflow } from '../../types';
const GEMINI_DEFAULT_CONFIG = {
  providerName: 'gemini',
  providerType: 'gemini',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  models: 'gemini-3.1-flash-lite-preview',
};

export interface IN8nTemplateItem {
  id: string;
  fileName: string;
  relativePath: string;
  category: string;
  categoryVi: string;
  titleEn: string;
  titleVi: string;
  descriptionVi: string;
  departmentVi: string;
  nodesCount: number;
  nodeNames: string[];
  nodes: any[];
  connections: { source: string; target: string }[];
  isVinceOptimizedFeatured?: boolean;
}

interface ProjectTemplatesModalProps {
  onSelectTemplate: (workflow: IWorkflow, templateItem: IN8nTemplateItem) => void;
  onClose: () => void;
}

/**
 * Ánh xạ tên node bất kỳ trong mẫu n8n sang đúng Mã Node Chuẩn (canonical type) và Tham số (parameters) của dự án VinceAuto
 */
function mapNodeToVinceAutoCanonical(rawNode: any, index: number): {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
} {
  const rawName = String(rawNode?.name || `Bước ${index + 1}`).trim();
  const lower = rawName.toLowerCase();
  const id = rawNode?.id || `node_tpl_${index + 1}`;
  const existingParams = rawNode?.parameters || {};

  // Calculate clean grid position (max 5 nodes per row, wrapping cleanly)
  const col = index % 5;
  const row = Math.floor(index / 5);
  const position: [number, number] = [80 + col * 300, 220 + row * 210];

  // 1. TRIGGERS
  if (
    index === 0 ||
    lower.includes('trigger') ||
    lower.includes('when clicking') ||
    lower.includes('schedule') ||
    lower.includes('webhook') ||
    lower.includes('on form') ||
    lower.includes('on chat')
  ) {
    if (lower.includes('schedule') || lower.includes('cron') || lower.includes('every')) {
      return {
        id,
        name: rawName.includes('Trigger') ? rawName : `Schedule Trigger: ${rawName}`,
        type: 'trigger.cron',
        position,
        parameters: { cronExpression: '0 8 * * *', timezone: 'Asia/Ho_Chi_Minh', ...existingParams },
      };
    }
    if (lower.includes('webhook')) {
      return {
        id,
        name: rawName.includes('Webhook') ? rawName : `Webhook Trigger: ${rawName}`,
        type: 'trigger.webhook',
        position,
        parameters: { path: 'vince-template-hook', httpMethod: 'POST', ...existingParams },
      };
    }
    if (lower.includes('form')) {
      return {
        id,
        name: `Form Trigger: ${rawName}`,
        type: 'trigger.form',
        position,
        parameters: { formTitle: rawName, fields: 'fullName,phone,email,message', ...existingParams },
      };
    }
    if (lower.includes('chat')) {
      return {
        id,
        name: `Chat Trigger: ${rawName}`,
        type: 'trigger.chat',
        position,
        parameters: { channel: 'multichannel_chat', welcomeMessage: 'Xin chào! AI Agent Opencode2 sẵn sàng hỗ trợ.', ...existingParams },
      };
    }
    if (lower.includes('telegram')) {
      return {
        id,
        name: 'Telegram Trigger: On Message [T/W]',
        type: 'trigger.appEvent',
        position,
        parameters: { app: 'telegram', updates: ['Message'], ...existingParams },
      };
    }
    if (index === 0) {
      return {
        id,
        name: rawName.startsWith('When clicking') ? 'Manual Trigger: Khởi chạy quy trình' : rawName,
        type: rawNode?.type?.startsWith('trigger.') ? rawNode.type : 'trigger.manual',
        position,
        parameters: { mode: 'manual', ...existingParams },
      };
    }
  }

  // 2. SOCIAL MEDIA (TikTok, Threads, Instagram, YouTube, Facebook, Zalo, Telegram, Slack, Discord, X, LinkedIn, WhatsApp)
  if (lower.includes('tiktok') && !lower.includes('shop')) {
    return {
      id,
      name: rawName.includes('TikTok') ? rawName : `TikTok: ${rawName}`,
      type: 'vince.tiktok.action',
      position,
      parameters: { resource: 'Video', operation: 'publishVideo', privacyLevel: 'PUBLIC_TO_EVERYONE', ...existingParams },
    };
  }
  if (lower.includes('thread')) {
    return {
      id,
      name: rawName.includes('Threads') ? rawName : `Threads (Meta): ${rawName}`,
      type: 'vince.threads.action',
      position,
      parameters: { resource: 'Thread', operation: 'publishText', mediaType: 'TEXT', ...existingParams },
    };
  }
  if (lower.includes('instagram') || lower.includes('reel')) {
    return {
      id,
      name: rawName.includes('Instagram') ? rawName : `Instagram Business: ${rawName}`,
      type: 'vince.instagram.action',
      position,
      parameters: { resource: 'Reels', operation: 'publishReel', shareToFeed: true, ...existingParams },
    };
  }
  if (lower.includes('youtube')) {
    return {
      id,
      name: rawName.includes('YouTube') ? rawName : `YouTube & Shorts: ${rawName}`,
      type: 'vince.youtube.action',
      position,
      parameters: { resource: 'Video', operation: 'uploadVideo', privacyStatus: 'public', ...existingParams },
    };
  }
  if (lower.includes('facebook') || lower.includes('messenger')) {
    return {
      id,
      name: rawName,
      type: 'vince.facebook.postFeed',
      position,
      parameters: { resource: 'Post', operation: 'create', pageId: 'me', ...existingParams },
    };
  }
  if (lower.includes('zalo') || lower.includes('zns')) {
    return {
      id,
      name: rawName,
      type: 'vince.zalo.sendZns',
      position,
      parameters: { resource: 'ZNS', operation: 'sendZns', ...existingParams },
    };
  }
  if (lower.includes('telegram')) {
    return {
      id,
      name: rawName,
      type: 'vince.telegram',
      position,
      parameters: {
        resource: 'message',
        operation: 'sendMessage',
        chatId: '{{ $json.chatId || $json.message.chat.id }}',
        message: '🤖 [VinceAuto Bot]: {{ $json.text || $json.summary || "Hoàn thành nhiệm vụ tự động!" }}',
        parseMode: 'HTML',
        ...existingParams,
      },
    };
  }
  if (lower.includes('slack')) {
    return {
      id,
      name: rawName,
      type: 'vince.slack.sendMessage',
      position,
      parameters: { resource: 'Message', operation: 'send', channel: '#general', ...existingParams },
    };
  }
  if (lower.includes('discord')) {
    return {
      id,
      name: rawName,
      type: 'vince.discord.sendWebhook',
      position,
      parameters: { resource: 'Webhook', operation: 'sendWebhook', ...existingParams },
    };
  }
  if (lower.includes('whatsapp') || lower.includes('twitter') || lower.includes('linkedin') || lower.includes('pinterest')) {
    return {
      id,
      name: rawName,
      type: 'vince.whatsappSocial.action',
      position,
      parameters: {
        resource: lower.includes('linkedin') ? 'LinkedIn' : lower.includes('twitter') ? 'X (Twitter)' : 'WhatsApp Message',
        operation: 'sendTemplate',
        ...existingParams,
      },
    };
  }

  // 3. GOOGLE, MICROSOFT & PRODUCTIVITY
  if (lower.includes('google sheets') || lower.includes('sheet')) {
    return {
      id,
      name: rawName,
      type: 'vince.googleSheets.appendRow',
      position,
      parameters: {
        resource: 'Row',
        operation: 'appendOrUpdate',
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A:G',
        ...existingParams,
      },
    };
  }
  if (lower.includes('google drive') || lower.includes('drive')) {
    return {
      id,
      name: rawName,
      type: 'vince.googleDrive.uploadFile',
      position,
      parameters: { resource: 'File', operation: 'upload', folderId: 'root', ...existingParams },
    };
  }
  if (lower.includes('gmail') || lower.includes('email') || lower.includes('send email')) {
    return {
      id,
      name: rawName,
      type: 'vince.gmail.sendEmail',
      position,
      parameters: {
        resource: 'Message',
        operation: 'send',
        to: '{{ $json.email || "contact@vinceauto.vn" }}',
        subject: '[VinceAuto] Thông báo tự động',
        ...existingParams,
      },
    };
  }
  if (lower.includes('calendar') || lower.includes('google docs')) {
    return {
      id,
      name: rawName,
      type: 'vince.googleCalendar.createEvent',
      position,
      parameters: {
        resource: lower.includes('docs') ? 'Google Docs' : 'Event',
        operation: 'create',
        ...existingParams,
      },
    };
  }
  if (lower.includes('outlook') || lower.includes('excel') || lower.includes('teams') || lower.includes('onedrive') || lower.includes('sharepoint') || lower.includes('microsoft')) {
    return {
      id,
      name: rawName,
      type: 'vince.microsoft365.action',
      position,
      parameters: {
        resource: lower.includes('teams') ? 'Teams' : lower.includes('outlook') ? 'Outlook' : 'Excel 365',
        operation: 'addRow',
        ...existingParams,
      },
    };
  }
  if (lower.includes('notion')) {
    return {
      id,
      name: rawName,
      type: 'vince.notion.action',
      position,
      parameters: { resource: 'Page', operation: 'create', ...existingParams },
    };
  }
  if (lower.includes('jira') || lower.includes('linear') || lower.includes('trello') || lower.includes('asana') || lower.includes('clickup')) {
    return {
      id,
      name: rawName,
      type: 'vince.projectManagement.action',
      position,
      parameters: { resource: 'Jira', operation: 'createIssue', ...existingParams },
    };
  }

  // 4. E-COMMERCE, CRM, DATABASE & PAYMENT
  if (lower.includes('shopee') || lower.includes('lazada') || lower.includes('tiktok shop')) {
    return {
      id,
      name: rawName,
      type: 'vince.shopee.createOrder',
      position,
      parameters: { resource: 'Shopee Order', operation: 'getOrderDetail', ...existingParams },
    };
  }
  if (lower.includes('shopify') || lower.includes('woocommerce')) {
    return {
      id,
      name: rawName,
      type: 'vince.shopifyWoo.action',
      position,
      parameters: { resource: 'Shopify Order', operation: 'getMany', ...existingParams },
    };
  }
  if (lower.includes('hubspot') || lower.includes('salesforce') || lower.includes('pipedrive') || lower.includes('zoho') || lower.includes('mailchimp') || lower.includes('airtable')) {
    return {
      id,
      name: rawName,
      type: 'vince.crmMarketing.action',
      position,
      parameters: {
        resource: lower.includes('airtable') ? 'Airtable' : 'HubSpot',
        operation: 'upsertContact',
        ...existingParams,
      },
    };
  }
  if (lower.includes('postgres') || lower.includes('mysql') || lower.includes('mongo') || lower.includes('redis') || lower.includes('supabase') || lower.includes('qdrant') || lower.includes('pinecone') || lower.includes('vector')) {
    return {
      id,
      name: rawName,
      type: 'vince.databases.action',
      position,
      parameters: {
        resource: lower.includes('supabase') ? 'Supabase' : lower.includes('qdrant') || lower.includes('pinecone') ? 'Vector DB' : 'PostgreSQL',
        operation: 'executeQuery',
        ...existingParams,
      },
    };
  }
  if (lower.includes('github') || lower.includes('gitlab')) {
    return {
      id,
      name: rawName,
      type: 'vince.github.createIssue',
      position,
      parameters: { resource: 'GitHub Issue', operation: 'create', ...existingParams },
    };
  }
  if (lower.includes('momo') || lower.includes('vnpay') || lower.includes('vietqr') || lower.includes('stripe') || lower.includes('paypal')) {
    return {
      id,
      name: rawName,
      type: 'vince.momo.createPayment',
      position,
      parameters: { resource: 'VietQR', operation: 'generateQr', ...existingParams },
    };
  }

  // 5. DATA TRANSFORMATION (18 NODES) & FLOW
  if (lower.includes('edit fields') || lower === 'set' || lower.startsWith('set ')) {
    return {
      id,
      name: `Edit Fields (Set): ${rawName}`,
      type: 'transform.editFields',
      position,
      parameters: { mode: 'manual', fields: { processedBy: 'VinceAuto' }, ...existingParams },
    };
  }
  if (lower.includes('filter')) {
    return {
      id,
      name: rawName,
      type: 'transform.filter',
      position,
      parameters: { condition: '$json.id !== null', ...existingParams },
    };
  }
  if (lower.includes('code') || lower.includes('function')) {
    return {
      id,
      name: rawName,
      type: 'transform.code',
      position,
      parameters: {
        language: 'javascript',
        jsCode: 'return items.map(i => ({ json: { ...i.json, processed: true } }));',
        ...existingParams,
      },
    };
  }
  if (lower.includes('merge')) {
    return {
      id,
      name: rawName,
      type: 'transform.merge',
      position,
      parameters: { mode: 'append', ...existingParams },
    };
  }
  if (lower.includes('aggregate')) {
    return {
      id,
      name: rawName,
      type: 'transform.aggregate',
      position,
      parameters: { aggregate: 'individualFields', ...existingParams },
    };
  }
  if (lower.includes('split out') || lower.includes('item lists')) {
    return {
      id,
      name: rawName,
      type: 'transform.splitOut',
      position,
      parameters: { fieldToSplitOut: 'data', ...existingParams },
    };
  }
  if (lower.includes('summarize')) {
    return {
      id,
      name: rawName,
      type: 'transform.summarize',
      position,
      parameters: { fieldsToSummarize: 'amount', aggregation: 'sum', ...existingParams },
    };
  }
  if (lower.includes('extract from file') || lower.includes('pdf')) {
    return {
      id,
      name: rawName,
      type: 'transform.extractFromFile',
      position,
      parameters: { operation: 'fromPdf', ...existingParams },
    };
  }
  if (lower === 'if' || lower.startsWith('if ')) {
    return {
      id,
      name: rawName,
      type: 'flow.if',
      position,
      parameters: { condition: '$json.valid === true', ...existingParams },
    };
  }
  if (lower.includes('switch')) {
    return {
      id,
      name: rawName,
      type: 'flow.switch',
      position,
      parameters: { mode: 'rules', ...existingParams },
    };
  }
  if (lower.includes('wait')) {
    return {
      id,
      name: rawName,
      type: 'flow.wait',
      position,
      parameters: { amount: 5, unit: 'seconds', ...existingParams },
    };
  }
  if (lower.includes('http request') || lower.includes('http')) {
    return {
      id,
      name: rawName,
      type: 'automation.http',
      position,
      parameters: { method: 'GET', url: 'https://api.example.com/data', ...existingParams },
    };
  }

  // 6. AI AGENT & LLM NODES -> Upgraded to Google Gemini (gemini-3.1-flash-lite-preview)
  if (
    lower.includes('openai') ||
    lower.includes('agent') ||
    lower.includes('chat model') ||
    lower.includes('llm') ||
    lower.includes('gemini') ||
    lower.includes('claude') ||
    lower.includes('anthropic') ||
    lower.includes('ollama') ||
    lower.includes('ai') ||
    rawNode?.type === 'vince.agentManager' ||
    rawNode?.type === 'vince.modelRouter'
  ) {
    const isAgent = lower.includes('agent') || rawNode?.type === 'vince.agentManager';
    return {
      id,
      name: `${rawName} [Google Gemini]`,
      type: isAgent ? 'vince.agentManager' : 'vince.modelRouter',
      position,
      parameters: {
        provider: GEMINI_DEFAULT_CONFIG.providerName,
        providerType: GEMINI_DEFAULT_CONFIG.providerType,
        baseUrl: GEMINI_DEFAULT_CONFIG.baseUrl,
        model: GEMINI_DEFAULT_CONFIG.models,
        strategy: 'auto',
        prompt: `Xử lý tác vụ "${rawName}" với dữ liệu đầu vào: {{ JSON.stringify($json) }}`,
        ...existingParams,
      },
    };
  }

  // Default fallback
  return {
    id,
    name: rawName,
    type: rawNode?.type && rawNode.type !== 'vince.zone' ? rawNode.type : 'transform.editFields',
    position,
    parameters: existingParams,
  };
}

/**
 * Chuẩn hóa bất kỳ mẫu n8n nào sang chuẩn thực thi của dự án VinceAuto:
 * - Loại bỏ các node Sticky Note trang trí không thực thi
 * - Ánh xạ đúng tên và mã type chuẩn của VinceAuto
 * - Nâng cấp toàn bộ node AI sang Opencode2 (crouton-alpha-free)
 * - Đảm bảo kết nối liên hoàn (connections) không bị đứt đoạn
 */
function optimizeTemplateForVinceAuto(tpl: IN8nTemplateItem): IN8nTemplateItem {
  if (tpl.isVinceOptimizedFeatured) return tpl;

  const filteredRawNodes = (tpl.nodes || []).filter((n) => {
    const nm = String(n?.name || '').toLowerCase();
    return !nm.startsWith('sticky note') && !nm.includes('stickynote');
  });

  const effectiveRawNodes = filteredRawNodes.length > 0 ? filteredRawNodes : tpl.nodes || [];
  const optimizedNodes = effectiveRawNodes.map((n, idx) => mapNodeToVinceAutoCanonical(n, idx));

  const validIds = new Set(optimizedNodes.map((n) => n.id));
  let validConnections = (tpl.connections || []).filter(
    (c) => validIds.has(c.source) && validIds.has(c.target) && c.source !== c.target
  );

  // If connections were missing or stripped because of helper sub-nodes, wire sequential pipeline
  if (validConnections.length === 0 && optimizedNodes.length > 1) {
    validConnections = [];
    for (let i = 0; i < optimizedNodes.length - 1; i++) {
      validConnections.push({
        source: optimizedNodes[i].id,
        target: optimizedNodes[i + 1].id,
      });
    }
  }

  return {
    ...tpl,
    nodesCount: optimizedNodes.length,
    nodeNames: optimizedNodes.map((n) => n.name),
    nodes: optimizedNodes,
    connections: validConnections,
  };
}

/**
 * 10 MẪU DỰ ÁN TIÊU BIỂU ĐƯỢC THIẾT KẾ ĐẶC BIỆT CHO VINCEAUTO (TIKTOK, THREADS, INSTAGRAM, YOUTUBE, SHOPEE, ZALO, OPENCODE2)
 */
const VINCEAUTO_FEATURED_TEMPLATES: IN8nTemplateItem[] = [
  {
    id: 'vince_tpl_chatbot_telegram_00',
    fileName: 'VinceAuto_Telegram_Chatbot_2Way.json',
    relativePath: 'VinceAuto Featured / Chatbot AI Telegram',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: '2-Way Telegram AI Chatbot',
    titleVi: 'Chatbot AI Telegram 2 Chiều — Tự động Trả lời Mọi Người Nhắn',
    descriptionVi:
      'Lắng nghe tin nhắn từ Telegram Bot API theo thời gian thực, chuẩn hóa câu hỏi & Chat ID bằng Edit Fields, gọi Google Gemini (gemini-3.1-flash-lite-preview) trả lời thông minh và tự động reply lại đúng người vừa nhắn.',
    departmentVi: 'Chatbot AI & CSKH',
    isVinceOptimizedFeatured: true,
    nodesCount: 4,
    nodeNames: [
      'Telegram Trigger (Message)',
      'Edit Fields (Chuẩn hóa Câu hỏi & Chat ID)',
      'AI Agent Google Gemini (gemini-3.1-flash-lite-preview)',
      'Telegram: Send Message (Reply người gửi)',
    ],
    nodes: [
      { id: 'tg1', name: 'Telegram Trigger', type: 'trigger.appEvent', position: [80, 240], parameters: { app: 'telegram', updates: ['Message'] } },
      { id: 'tg2', name: 'Edit Fields (Set)', type: 'transform.editFields', position: [380, 240], parameters: { mode: 'manual', fields: { userQuery: '{{ $json.text || $json.message.text }}', chatId: '{{ $json.chatId || $json.message.chat.id }}' }, keepOnlySet: false } },
      { id: 'tg3', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [680, 240], parameters: { provider: 'gemini', providerType: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-3.1-flash-lite-preview', prompt: '{{ $json.userQuery || $json.text || $json.message.text }}', systemPrompt: 'Bạn là trợ lý ảo AI thông minh trên Telegram. Hãy trả lời chính xác, nhanh gọn, lịch sự và hữu ích.' } },
      { id: 'tg4', name: 'Telegram: Send Message', type: 'vince.telegram', position: [980, 240], parameters: { resource: 'message', operation: 'sendMessage', chatId: '{{ $json.chatId || $json.message.chat.id }}', message: '{{ $json.aiResponse || $json.text }}', parseMode: 'HTML' } },
    ],
    connections: [
      { source: 'tg1', target: 'tg2' },
      { source: 'tg2', target: 'tg3' },
      { source: 'tg3', target: 'tg4' },
    ],
  },
  {
    id: 'vince_tpl_fb_video_reup_00b',
    fileName: 'VinceAuto_MultiPlatform_Video_Drive_Sheets_Facebook.json',
    relativePath: 'VinceAuto Featured / Video Automation',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: 'Multi-Platform Video Downloader + Google Drive & Sheets + Facebook Page Publisher',
    titleVi: 'Tải Video Đa Nền Tảng (FB / TikTok / YT / IG) ➔ Google Drive & Sheets ➔ Đăng Trang Facebook',
    descriptionVi:
      'Tự động kích hoạt ngay khi bạn thêm link bài viết/video mới vào Google Sheets (hỗ trợ Facebook, TikTok, YouTube, Instagram...), tải video về lưu trữ lên Google Drive, dùng Google Gemini viết caption cuốn hút, đăng lên Trang Facebook chỉ định và cập nhật trạng thái vào Google Sheets.',
    departmentVi: 'Social Media & Video',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Google Sheets Trigger (Khi có Link Video Mới)',
      'HTTP Request: Tải Video Đa Nền Tảng (FB/TikTok/YT/IG)',
      'Google Drive: Lưu Trữ Video Đã Tải',
      'AI Agent Google Gemini: Viết Caption & Hashtag',
      'Facebook Graph: Publish Page Video',
      'Google Sheets: Cập Nhật Link & Trạng Thái Đã Đăng',
    ],
    nodes: [
      { id: 'fbv1', name: 'Google Sheets Trigger: Khi có Link Mới', type: 'trigger.appEvent', position: [80, 240], parameters: { app: 'googleSheets', event: 'rowAdded', range: 'VideoLinks!A:E', columns: 'platform,videoUrl,targetPageId,status,postUrl' } },
      { id: 'fbv2', name: 'HTTP Request: Tải Video Đa Nền Tảng', type: 'core.httpRequest', position: [380, 240], parameters: { method: 'GET', url: '{{ $json.videoUrl || $json.url }}', responseFormat: 'file' } },
      { id: 'fbv3', name: 'Google Drive: Lưu Trữ Video', type: 'vince.googleDrive.uploadFile', position: [680, 240], parameters: { resource: 'File', operation: 'upload', folderId: 'VinceAuto_Videos', fileName: '{{ $json.platform || "video" }}_{{ Date.now() }}.mp4' } },
      { id: 'fbv4', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [980, 240], parameters: { provider: 'gemini', providerType: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-3.1-flash-lite-preview', prompt: 'Viết caption ngắn gọn, thu hút kèm 5 hashtag tiếng Việt phù hợp cho video từ nền tảng {{ $json.platform || "MXH" }} ({{ $json.videoUrl || $json.url }})', systemPrompt: 'Bạn là chuyên gia sáng tạo nội dung mạng xã hội.' } },
      { id: 'fbv5', name: 'Facebook Graph: Publish Page Video', type: 'vince.facebook.video', position: [1280, 150], parameters: { resource: 'Video', operation: 'publish', pageId: '{{ $json.targetPageId }}', fileUrl: '{{ $json.driveFileUrl || $json.videoUrl }}', description: '{{ $json.aiResponse || $json.text }}' } },
      { id: 'fbv6', name: 'Google Sheets: Cập Nhật Đã Đăng', type: 'vince.googleSheets.appendRow', position: [1280, 330], parameters: { resource: 'Row', operation: 'appendOrUpdate', range: 'VideoLinks!A:E', values: '{{ JSON.stringify({ platform: $json.platform, videoUrl: $json.videoUrl, driveUrl: $json.driveFileUrl, status: "PUBLISHED" }) }}' } },
    ],
    connections: [
      { source: 'fbv1', target: 'fbv2' },
      { source: 'fbv2', target: 'fbv3' },
      { source: 'fbv3', target: 'fbv4' },
      { source: 'fbv4', target: 'fbv5' },
      { source: 'fbv4', target: 'fbv6' },
    ],
  },
  {
    id: 'vince_tpl_chatbot_zalo_01',
    fileName: 'VinceAuto_Zalo_Chatbot_2Way.json',
    relativePath: 'VinceAuto Featured / Chatbot AI Zalo OA',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: '2-Way Zalo OA AI Chatbot',
    titleVi: 'Chatbot AI Zalo OA 2 Chiều',
    descriptionVi:
      'Mẫu chatbot Zalo OA tối ưu: Lắng nghe tin nhắn đến từ khách hàng, chuẩn hóa nội dung & SĐT bằng Edit Fields, gọi Google Gemini (gemini-3.1-flash-lite-preview) tư vấn và tự động trả lời qua Zalo OA.',
    departmentVi: 'Chatbot AI & CSKH',
    isVinceOptimizedFeatured: true,
    nodesCount: 4,
    nodeNames: [
      'Chat Trigger (Zalo OA Message)',
      'Edit Fields (Chuẩn hóa Nội dung & SĐT)',
      'AI Agent Google Gemini (gemini-3.1-flash-lite-preview)',
      'Zalo OA: Send Message / ZNS',
    ],
    nodes: [
      { id: 'zl1', name: 'Zalo OA Trigger', type: 'trigger.chat', position: [80, 240], parameters: { channel: 'zalo', welcomeMessage: 'Xin chào! Trợ lý AI Zalo OA sẵn sàng hỗ trợ.' } },
      { id: 'zl2', name: 'Edit Fields (Set)', type: 'transform.editFields', position: [380, 240], parameters: { mode: 'manual', fields: { userQuery: '{{ $json.text || $json.message.text }}', phone: '{{ $json.phone || "" }}' }, keepOnlySet: false } },
      { id: 'zl3', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [680, 240], parameters: { provider: 'gemini', providerType: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-3.1-flash-lite-preview', prompt: '{{ $json.userQuery || $json.text }}', systemPrompt: 'Bạn là trợ lý ảo CSKH trên Zalo OA. Hãy trả lời ngắn gọn, lịch sự, chính xác.' } },
      { id: 'zl4', name: 'Zalo OA: Send Message / ZNS', type: 'vince.zalo.sendZns', position: [980, 240], parameters: { resource: 'Zalo Message', operation: 'sendText', phone: '{{ $json.phone || "" }}', message: '{{ $json.aiResponse || $json.text }}' } },
    ],
    connections: [
      { source: 'zl1', target: 'zl2' },
      { source: 'zl2', target: 'zl3' },
      { source: 'zl3', target: 'zl4' },
    ],
  },
  {
    id: 'vince_tpl_chatbot_social_02',
    fileName: 'VinceAuto_Social_Chatbot_Messenger_IG_Threads_TikTok.json',
    relativePath: 'VinceAuto Featured / Chatbot Mạng xã hội',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: 'Omnichannel Social Bot: Messenger, IG, Threads & TikTok',
    titleVi: 'Bot AI Trả Lời Tự Động Messenger, Instagram, Threads & TikTok',
    descriptionVi:
      'Mẫu chatbot mạng xã hội: Lắng nghe bình luận & tin nhắn DM mới từ Messenger, Instagram, Meta Threads hoặc TikTok, lọc nội dung hợp lệ bằng Filter, gọi Google Gemini soạn phản hồi và tự động trả lời trên từng nền tảng.',
    departmentVi: 'Chatbot & Mạng xã hội',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Social Media Trigger (Messenger / IG / Threads / TikTok)',
      'Filter (Lọc bình luận & tin nhắn hợp lệ)',
      'AI Agent Google Gemini (gemini-3.1-flash-lite-preview)',
      'Messenger / Facebook: Reply',
      'Instagram & Threads: Reply',
      'TikTok: Reply Comment / DM',
    ],
    nodes: [
      { id: 'sb1', name: 'Social Media Trigger', type: 'trigger.socialMedia', position: [80, 240], parameters: { app: 'messenger_ig_threads_tiktok', event: 'message_or_comment' } },
      { id: 'sb2', name: 'Filter: Lọc tin nhắn hợp lệ', type: 'transform.filter', position: [380, 240], parameters: { condition: '$json.text && $json.text.length > 1' } },
      { id: 'sb3', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [680, 240], parameters: { provider: 'gemini', providerType: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-3.1-flash-lite-preview', prompt: '{{ $json.text || $json.message.text }}', systemPrompt: 'Bạn là trợ lý ảo, trả lời bình luận và tin nhắn DM trên mạng xã hội thân thiện, tự nhiên và hữu ích.' } },
      { id: 'sb4', name: 'Messenger / Facebook: Reply', type: 'vince.facebook.postFeed', position: [1000, 100], parameters: { resource: 'Messenger', operation: 'sendMessage' } },
      { id: 'sb5', name: 'Instagram & Threads: Reply', type: 'vince.threads.action', position: [1000, 240], parameters: { resource: 'Reply', operation: 'createReply' } },
      { id: 'sb6', name: 'TikTok: Reply Comment', type: 'vince.tiktok.action', position: [1000, 380], parameters: { resource: 'Comment', operation: 'reply' } },
    ],
    connections: [
      { source: 'sb1', target: 'sb2' },
      { source: 'sb2', target: 'sb3' },
      { source: 'sb3', target: 'sb4' },
      { source: 'sb3', target: 'sb5' },
      { source: 'sb3', target: 'sb6' },
    ],
  },
  {
    id: 'vince_tpl_social_tiktok_threads_01',
    fileName: 'VinceAuto_TikTok_Threads_Reels_Crosspost.json',
    relativePath: 'VinceAuto Featured / Social Media Automation',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: 'AI Multi-Channel Social Publisher: TikTok, Meta Threads, IG Reels & YouTube Shorts',
    titleVi: 'Tự động Sáng tạo & Đăng chéo Video lên TikTok, Threads, IG Reels & Shorts',
    descriptionVi:
      'Quy trình tự động hóa mạng xã hội đa kênh cá nhân hóa: Lấy video từ Google Drive, dùng Google Gemini (gemini-3.1-flash-lite-preview) viết caption và hashtag xu hướng, xuất bản đồng loạt lên TikTok, Meta Threads, Instagram Reels và YouTube Shorts, rồi báo về Telegram.',
    departmentVi: 'Social Media & Marketing',
    isVinceOptimizedFeatured: true,
    nodesCount: 7,
    nodeNames: [
      'Google Drive Trigger (Khi có Video Mới)',
      'AI Agent Google Gemini: Viết Caption & Hashtag',
      'TikTok: Publish Direct Video',
      'Threads (Meta): Publish Post & Threadstorm',
      'Instagram Business: Publish Reel',
      'YouTube & Shorts: Upload Video',
      'Telegram: Báo cáo Đăng Đa Kênh',
    ],
    nodes: [
      { id: 'n1', name: 'Google Drive Trigger: Video Mới', type: 'trigger.appEvent', position: [80, 240], parameters: { app: 'googleDrive', event: 'fileCreated', folderId: 'social_media_queue' } },
      { id: 'n3', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [380, 240], parameters: { provider: 'gemini', providerType: 'gemini', model: 'gemini-3.1-flash-lite-preview', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', prompt: 'Viết caption thu hút cho TikTok, chuỗi bài viết 500 ký tự cho Meta Threads và mô tả SEO cho YouTube Shorts từ chủ đề: {{ $json.name }}' } },
      { id: 'n4', name: 'TikTok: Publish Direct Video', type: 'vince.tiktok.action', position: [680, 120], parameters: { resource: 'Video', operation: 'publishVideo', privacyLevel: 'PUBLIC_TO_EVERYONE' } },
      { id: 'n5', name: 'Threads (Meta): Publish Post', type: 'vince.threads.action', position: [680, 260], parameters: { resource: 'Thread', operation: 'publishText', mediaType: 'TEXT' } },
      { id: 'n6', name: 'Instagram Business: Publish Reel', type: 'vince.instagram.action', position: [680, 400], parameters: { resource: 'Reels', operation: 'publishReel', shareToFeed: true } },
      { id: 'n7', name: 'YouTube & Shorts: Upload Video', type: 'vince.youtube.action', position: [980, 240], parameters: { resource: 'Video', operation: 'uploadVideo', privacyStatus: 'public' } },
      { id: 'n8', name: 'Telegram: Báo cáo Đăng Đa Kênh', type: 'vince.telegram', position: [1280, 240], parameters: { resource: 'message', operation: 'sendMessage', chatId: '{{ $json.chatId || $json.message.chat.id }}', message: '🚀 [VinceAuto] Đã đăng thành công nội dung lên TikTok, Threads, Instagram Reels & YouTube Shorts!' } },
    ],
    connections: [
      { source: 'n1', target: 'n3' },
      { source: 'n3', target: 'n4' },
      { source: 'n3', target: 'n5' },
      { source: 'n3', target: 'n6' },
      { source: 'n4', target: 'n7' },
      { source: 'n5', target: 'n7' },
      { source: 'n6', target: 'n7' },
      { source: 'n7', target: 'n8' },
    ],
  },
  {
    id: 'vince_tpl_social_comment_dm_02',
    fileName: 'VinceAuto_TikTok_Threads_IG_AutoReply_DM.json',
    relativePath: 'VinceAuto Featured / Social Media CSKH',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: 'TikTok, Threads & IG Comment Auto-Reply & DM Lead Closer',
    titleVi: 'Lắng nghe Bình luận TikTok, Threads & IG ➔ AI Gemini Trả lời & Gửi DM Chốt Đơn',
    descriptionVi:
      'Khi khách hàng bình luận trên video TikTok, Meta Threads hoặc Reels Instagram, hệ thống lọc bình luận hợp lệ, dùng Google Gemini phân tích ý định, trả lời bình luận và gửi DM kèm link sản phẩm, đồng thời lưu Lead vào Google Sheets.',
    departmentVi: 'CSKH & Mạng xã hội',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Social Media Trigger (TikTok / Threads / IG Comment)',
      'Filter: Lọc bình luận hỏi mua hàng & Chống spam',
      'AI Agent Google Gemini: Soạn phản hồi cá nhân hóa',
      'Threads (Meta): Reply to Comment',
      'Instagram & TikTok: Reply & Send Private DM',
      'Google Sheets: Lưu Lead Khách Hàng',
    ],
    nodes: [
      { id: 'c1', name: 'Social Media Trigger (TikTok / Threads / IG)', type: 'trigger.socialMedia', position: [80, 250], parameters: { app: 'threads_tiktok_ig', event: 'comment.create' } },
      { id: 'c2', name: 'Filter: Lọc bình luận khách hàng', type: 'transform.filter', position: [380, 250], parameters: { condition: '$json.text.length > 2' } },
      { id: 'c3', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [680, 250], parameters: { provider: 'gemini', providerType: 'gemini', model: 'gemini-3.1-flash-lite-preview', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', prompt: 'Phân tích bình luận khách hàng và soạn câu trả lời thân thiện chốt đơn: {{ $json.text }}' } },
      { id: 'c4', name: 'Threads (Meta): Reply to Thread', type: 'vince.threads.action', position: [980, 160], parameters: { resource: 'Reply', operation: 'createReply' } },
      { id: 'c5', name: 'Instagram & TikTok: Reply & Private DM', type: 'vince.instagram.action', position: [980, 340], parameters: { resource: 'Comment', operation: 'replyAndPrivateDm' } },
      { id: 'c6', name: 'Google Sheets: Lưu Lead Khách Hàng', type: 'vince.googleSheets.appendRow', position: [1280, 250], parameters: { resource: 'Row', operation: 'append', range: 'Leads!A:F' } },
    ],
    connections: [
      { source: 'c1', target: 'c2' },
      { source: 'c2', target: 'c3' },
      { source: 'c3', target: 'c4' },
      { source: 'c3', target: 'c5' },
      { source: 'c4', target: 'c6' },
      { source: 'c5', target: 'c6' },
    ],
  },
  {
    id: 'vince_tpl_threads_threadstorm_03',
    fileName: 'VinceAuto_Threads_X_LinkedIn_Threadstorm.json',
    relativePath: 'VinceAuto Featured / Content Repurposing',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: 'Automated Threadstorm for Threads, X & LinkedIn from Notion',
    titleVi: 'Biến bài viết Notion thành chuỗi Threadstorm trên Threads, X & LinkedIn',
    descriptionVi:
      'Tự động lấy bài viết dài từ Notion, dùng Multi-Agent Supervisor (Google Gemini) chia nhỏ thành chuỗi đoạn 500 ký tự cuốn hút, rồi đăng tự động lên Meta Threads, X (Twitter) và LinkedIn.',
    departmentVi: 'Content & Thương hiệu cá nhân',
    isVinceOptimizedFeatured: true,
    nodesCount: 5,
    nodeNames: [
      'Notion Trigger (Khi có Bài Viết Mới)',
      'Vince Multi-Agent Supervisor (Google Gemini)',
      'Threads (Meta): Publish Carousel & Threadstorm',
      'X (Twitter) & LinkedIn: Publish Post',
      'Telegram: Thông báo Link Bài Đăng',
    ],
    nodes: [
      { id: 't1', name: 'Notion Trigger: Bài Viết Mới', type: 'trigger.appEvent', position: [80, 250], parameters: { app: 'notion', event: 'pageAdded' } },
      { id: 't3', name: 'Vince Multi-Agent Supervisor (Google Gemini)', type: 'vince.agentManager', position: [380, 250], parameters: { provider: 'gemini', providerType: 'gemini', model: 'gemini-3.1-flash-lite-preview', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', agentRole: 'supervisor', taskDescription: 'Chuyển đổi bài viết dài thành chuỗi 5 bài Threads (dưới 500 ký tự/bài) và 1 bài LinkedIn.' } },
      { id: 't4', name: 'Threads (Meta): Publish Threadstorm', type: 'vince.threads.action', position: [680, 170], parameters: { resource: 'Thread', operation: 'publishText' } },
      { id: 't5', name: 'X (Twitter) & LinkedIn: Publish Post', type: 'vince.whatsappSocial.action', position: [680, 330], parameters: { resource: 'LinkedIn', operation: 'Publish Post' } },
      { id: 't6', name: 'Telegram: Send Message', type: 'vince.telegram', position: [980, 250], parameters: { resource: 'message', operation: 'sendMessage', chatId: '{{ $json.chatId || $json.message.chat.id }}', message: '🤖 [VinceAuto] Chuỗi bài đăng Threads/LinkedIn đã sẵn sàng!' } },
    ],
    connections: [
      { source: 't1', target: 't3' },
      { source: 't3', target: 't4' },
      { source: 't3', target: 't5' },
      { source: 't4', target: 't6' },
      { source: 't5', target: 't6' },
    ],
  },
  {
    id: 'vince_tpl_shopee_tiktokshop_zalo_04',
    fileName: 'VinceAuto_Shopee_TikTokShop_ZaloZNS.json',
    relativePath: 'VinceAuto Featured / Vietnam E-Commerce',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: 'Shopee, TikTok Shop & Lazada Order Automation + Zalo ZNS + Sheets',
    titleVi: 'Đồng bộ Đơn hàng Shopee, TikTok Shop & Lazada ➔ AI Gemini ➔ Google Sheets & Zalo ZNS',
    descriptionVi:
      'Mẫu quy trình thương mại điện tử tối ưu: Nhận đơn hàng mới từ Shopee/TikTok Shop qua Webhook, lọc đơn hợp lệ, dùng Google Gemini phân loại khách hàng, ghi sổ Google Sheets và gửi tin nhắn xác nhận Zalo ZNS.',
    departmentVi: 'Thương mại điện tử (TMĐT)',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'E-commerce Trigger (Shopee / TikTok Shop)',
      'Shopee / TikTok Shop: Get Order Detail',
      'Filter: Lọc đơn hàng hợp lệ',
      'AI Agent Google Gemini (gemini-3.1-flash-lite-preview)',
      'Google Sheets: Append Row Đơn Hàng',
      'Zalo OA: Send ZNS Notification',
    ],
    nodes: [
      { id: 'e1', name: 'E-commerce Trigger (Shopee / TikTok Shop)', type: 'trigger.ecommerce', position: [80, 250], parameters: { app: 'shopee', event: 'order_status_push' } },
      { id: 'e2', name: 'Shopee / TikTok Shop: Get Order Detail', type: 'vince.shopee.createOrder', position: [380, 250], parameters: { resource: 'Shopee Order', operation: 'getOrderDetail' } },
      { id: 'e3', name: 'Filter: Lọc đơn hợp lệ', type: 'transform.filter', position: [680, 250], parameters: { condition: '$json.order_status !== "CANCELLED"' } },
      { id: 'e4', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [980, 250], parameters: { provider: 'gemini', providerType: 'gemini', model: 'gemini-3.1-flash-lite-preview', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', prompt: 'Phân tích đơn hàng và soạn lời cảm ơn khách hàng: {{ JSON.stringify($json) }}' } },
      { id: 'e5', name: 'Google Sheets: Append Row', type: 'vince.googleSheets.appendRow', position: [1280, 170], parameters: { resource: 'Row', operation: 'append', range: 'Orders!A:H' } },
      { id: 'e6', name: 'Zalo OA: Send ZNS Notification', type: 'vince.zalo.sendZns', position: [1280, 330], parameters: { resource: 'ZNS', operation: 'sendZns' } },
    ],
    connections: [
      { source: 'e1', target: 'e2' },
      { source: 'e2', target: 'e3' },
      { source: 'e3', target: 'e4' },
      { source: 'e4', target: 'e5' },
      { source: 'e4', target: 'e6' },
    ],
  },
  {
    id: 'vince_tpl_vietqr_momo_payment_05',
    fileName: 'VinceAuto_VietQR_MoMo_Reconciliation.json',
    relativePath: 'VinceAuto Featured / Finance & Payment',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn VinceAuto',
    titleEn: 'VietQR, MoMo & VNPAY Payment Reconciliation + Gmail + Sheets',
    titleVi: 'Đối soát Thanh toán VietQR, MoMo & VNPAY ➔ AI Gemini ➔ Google Sheets & Telegram',
    descriptionVi:
      'Nhận callback IPN thanh toán thành công từ VietQR, MoMo hoặc VNPAY, chuẩn hóa dữ liệu bằng Edit Fields, dùng Google Gemini đối soát mã đơn hàng, cập nhật Google Sheets, gửi biên lai Gmail và báo biến động số dư về Telegram.',
    departmentVi: 'Tài chính & Kế toán',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Payment Webhook Trigger (VietQR / MoMo / VNPAY)',
      'Edit Fields (Set): Chuẩn hóa giao dịch',
      'AI Agent Google Gemini: Đối soát tự động',
      'Google Sheets: Update Trạng Thái Thanh Toán',
      'Gmail: Gửi Biên Lai Xác Nhận',
      'Telegram: Báo Biến Động Số Dư',
    ],
    nodes: [
      { id: 'p1', name: 'Payment Webhook Trigger (VietQR / MoMo)', type: 'trigger.payment', position: [80, 250], parameters: { app: 'vietqr_momo', event: 'ipn_payment_success' } },
      { id: 'p2', name: 'Edit Fields (Set): Chuẩn hóa giao dịch', type: 'transform.editFields', position: [380, 250], parameters: { mode: 'manual', fields: { verified: true, currency: 'VND' } } },
      { id: 'p3', name: 'AI Agent (Google Gemini)', type: 'vince.modelRouter', position: [680, 250], parameters: { provider: 'gemini', providerType: 'gemini', model: 'gemini-3.1-flash-lite-preview', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', prompt: 'Trích xuất mã đơn hàng từ nội dung chuyển khoản và tạo biên lai xác nhận: {{ JSON.stringify($json) }}' } },
      { id: 'p4', name: 'Google Sheets: Append or Update Row', type: 'vince.googleSheets.appendRow', position: [980, 160], parameters: { resource: 'Row', operation: 'appendOrUpdate', range: 'Payments!A:G' } },
      { id: 'p5', name: 'Gmail: Send Email Receipt', type: 'vince.gmail.sendEmail', position: [980, 340], parameters: { resource: 'Message', operation: 'send' } },
      { id: 'p6', name: 'Telegram: Báo Biến Động Số Dư', type: 'vince.telegram', position: [1280, 250], parameters: { resource: 'message', operation: 'sendMessage', chatId: '{{ $json.chatId || $json.message.chat.id }}', message: '💰 [VinceAuto] Nhận thanh toán thành công qua VietQR/MoMo!' } },
    ],
    connections: [
      { source: 'p1', target: 'p2' },
      { source: 'p2', target: 'p3' },
      { source: 'p3', target: 'p4' },
      { source: 'p3', target: 'p5' },
      { source: 'p4', target: 'p6' },
      { source: 'p5', target: 'p6' },
    ],
  },
];

// Optimize all 369 imported templates and combine with VinceAuto Featured Templates
const allTemplates: IN8nTemplateItem[] = [
  ...VINCEAUTO_FEATURED_TEMPLATES,
  ...(templatesData as IN8nTemplateItem[]).map((tpl) => optimizeTemplateForVinceAuto(tpl)),
];

export const ProjectTemplatesModal: React.FC<ProjectTemplatesModalProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('VINCEAUTO_FEATURED');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<IN8nTemplateItem | null>(
    allTemplates[0] || null
  );

  // Group categories with counts, keeping VINCEAUTO_FEATURED at the top
  const categories = useMemo(() => {
    const map = new Map<string, { key: string; nameVi: string; count: number }>();
    for (const tpl of allTemplates) {
      const existing = map.get(tpl.category);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(tpl.category, {
          key: tpl.category,
          nameVi: tpl.categoryVi,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.key === 'VINCEAUTO_FEATURED') return -1;
      if (b.key === 'VINCEAUTO_FEATURED') return 1;
      return b.count - a.count;
    });
  }, []);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tpl) => {
      if (selectedCategory !== 'ALL' && tpl.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tpl.titleVi.toLowerCase().includes(q) ||
        tpl.titleEn.toLowerCase().includes(q) ||
        tpl.descriptionVi.toLowerCase().includes(q) ||
        tpl.categoryVi.toLowerCase().includes(q) ||
        tpl.departmentVi.toLowerCase().includes(q) ||
        tpl.nodeNames.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleApplyTemplate = (tpl: IN8nTemplateItem) => {
    const optimized = optimizeTemplateForVinceAuto(tpl);
    let savedGeminiKey = '';
    try {
      savedGeminiKey = (localStorage.getItem('vinceauto:gemini_api_key') || '').trim();
    } catch {
      savedGeminiKey = '';
    }

    const personalizedNodes = optimized.nodes.map((n) => {
      const params = { ...(n.parameters || {}) };
      if (n.type === 'vince.modelRouter' || n.type === 'vince.agentManager' || n.type.startsWith('ai.')) {
        if (savedGeminiKey && !params.apiKey) {
          params.apiKey = savedGeminiKey;
        }
      }
      if (n.type === 'vince.telegram') {
        const cid = String(params.chatId || '').trim();
        if (!cid || cid === '{{ $json.chatId || $json.message.chat.id }}') {
          params.chatId = '{{ $json.chatId || $json.message?.chat?.id || "1869249751" }}';
        }
      }
      return { ...n, parameters: params };
    });

    const newWorkflow: IWorkflow = {
      id: `wf_tpl_${Date.now()}`,
      name: optimized.titleVi,
      nodes: personalizedNodes,
      connections: optimized.connections,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSelectTemplate(newWorkflow, optimized);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="w-[1220px] max-w-[96vw] h-[86vh] bg-[#161619] border border-[#2b2b30] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Clean Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#25252a] bg-[#131316] shrink-0 gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#222227] border border-[#323239] text-[#e6e8ec]">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-[#f0f2f5] tracking-tight truncate">
                  Kho Mẫu Dự Án — VinceAuto
                </h2>
                <span className="px-2 py-0.5 text-[10.5px] font-semibold rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                  Google Gemini
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                Chuẩn hóa Node VinceAuto • Model {GEMINI_DEFAULT_CONFIG.models}
              </p>
            </div>
          </div>

          {/* Segmented View Switch + Search + Close */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="flex items-center p-0.5 rounded-lg bg-[#1e1e22] border border-[#2d2d34] text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedCategory('VINCEAUTO_FEATURED')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'VINCEAUTO_FEATURED'
                    ? 'bg-[#2e2e36] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Dành cho tôi ({VINCEAUTO_FEATURED_TEMPLATES.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  selectedCategory !== 'VINCEAUTO_FEATURED'
                    ? 'bg-[#2e2e36] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Tất cả ({allTemplates.length})
              </button>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && selectedCategory === 'VINCEAUTO_FEATURED') {
                    setSelectedCategory('ALL');
                  }
                }}
                placeholder="Tìm mẫu (Facebook, Telegram, Zalo...)"
                className="w-full bg-[#1e1e22] border border-[#2f2f36] rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#242429] transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Slim Sidebar (shown when browsing All / Categories) */}
          {selectedCategory !== 'VINCEAUTO_FEATURED' && (
            <div className="w-[225px] border-r border-[#25252a] bg-[#131316] overflow-y-auto p-2.5 space-y-1 custom-scrollbar shrink-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#26262c] text-white font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1d1d22]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Tất cả danh mục</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">{allTemplates.length}</span>
              </button>

              {categories.map((cat) => {
                const active = selectedCategory === cat.key;
                const isFeatured = cat.key === 'VINCEAUTO_FEATURED';
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      const firstInCat = allTemplates.find((t) => t.category === cat.key);
                      if (firstInCat) setPreviewTemplate(firstInCat);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#26262c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1d1d22]'
                    }`}
                    title={cat.nameVi}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      {isFeatured ? (
                        <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      ) : (
                        <FolderClosed className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                      )}
                      <span className="truncate text-left">{cat.nameVi}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">{cat.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Center Grid: Clean, Spacious Cards */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#161619] custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filteredTemplates.map((tpl) => {
                const isSelected = previewTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setPreviewTemplate(tpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#222228] border-zinc-400 shadow-lg'
                        : 'bg-[#1c1c21] border-[#292930] hover:bg-[#202026] hover:border-[#383842]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#26262d] text-zinc-300 font-medium truncate">
                          {tpl.departmentVi}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                          {tpl.nodesCount} bước
                        </span>
                      </div>

                      <h4 className="text-[13px] font-bold text-[#f0f2f5] leading-snug line-clamp-2">
                        {tpl.titleVi}
                      </h4>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {tpl.descriptionVi}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[#26262d]">
                      <span className="inline-flex items-center space-x-1 text-[10.5px] text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Google Gemini</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(tpl);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                      >
                        <span>Dùng mẫu</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Clean Inspector */}
          {previewTemplate && (
            <div className="w-[340px] border-l border-[#25252a] bg-[#131316] p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar shrink-0">
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#222228] border border-[#32323a] text-[10px] font-semibold text-zinc-300 mb-2">
                    {previewTemplate.departmentVi}
                  </span>
                  <h3 className="text-sm font-bold text-[#f0f2f5] leading-snug">
                    {previewTemplate.titleVi}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {previewTemplate.descriptionVi}
                  </p>
                </div>

                {/* Prefilled Personalization Card */}
                <div className="p-3 rounded-xl bg-[#1a1a1f] border border-[#2a2a32] space-y-1.5 text-[11px]">
                  <div className="flex items-center space-x-1.5 font-semibold text-sky-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thông tin đã nhập sẵn</span>
                  </div>
                  <div className="text-zinc-300">• AI: <span className="font-mono text-zinc-100">Google Gemini</span> ({GEMINI_DEFAULT_CONFIG.models})</div>
                                  </div>

                {/* Vertical Flow Steps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                    <span>Luồng xử lý ({previewTemplate.nodesCount} bước)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {previewTemplate.connections.length} kết nối
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                    {previewTemplate.nodes.map((n, index) => (
                      <div
                        key={n.id || index}
                        className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#1a1a1f] border border-[#27272f] text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#272730] text-zinc-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-zinc-200 font-medium truncate">{n.name}</div>
                          <div className="text-[10px] text-sky-400/90 font-mono truncate">{n.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#25252a] mt-4">
                <button
                  onClick={() => handleApplyTemplate(previewTemplate)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Áp Dụng Vào Bản Vẽ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
