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
import { OPENCODE2_PROVIDER_CONFIG } from '../../data/agentNodePrompts';

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
        chatId: '-100123456789',
        message: '🤖 [VinceAuto Opencode2]: {{ $json.text || $json.summary || "Hoàn thành" }}',
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

  // 6. AI AGENT & LLM NODES -> Upgraded to Opencode2 (crouton-alpha-free)
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
      name: `${rawName} [Opencode2 • crouton-alpha-free]`,
      type: isAgent ? 'vince.agentManager' : 'vince.modelRouter',
      position,
      parameters: {
        provider: OPENCODE2_PROVIDER_CONFIG.providerName,
        providerType: OPENCODE2_PROVIDER_CONFIG.providerType,
        baseUrl: OPENCODE2_PROVIDER_CONFIG.baseUrl,
        model: OPENCODE2_PROVIDER_CONFIG.models,
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
    id: 'vince_tpl_social_tiktok_threads_01',
    fileName: 'VinceAuto_TikTok_Threads_Reels_Crosspost.json',
    relativePath: 'VinceAuto Featured / Social Media Automation',
    category: 'VINCEAUTO_FEATURED',
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: 'AI Multi-Channel Social Publisher: TikTok, Meta Threads, Instagram Reels & YouTube Shorts',
    titleVi: 'Tự động Sáng tạo & Đăng chéo Video/Bài viết lên TikTok, Meta Threads, Instagram Reels & YouTube Shorts',
    descriptionVi:
      'Quy trình tự động hóa mạng xã hội đa kênh chuẩn VinceAuto: Lấy ý tưởng/video từ Google Drive, dùng AI Agent Opencode2 (crouton-alpha-free) viết kịch bản, caption và bộ hashtag xu hướng, sau đó tự động xuất bản đồng loạt lên TikTok, Meta Threads, Instagram Reels và YouTube Shorts, lưu báo cáo vào Google Sheets và gửi thông báo Telegram.',
    departmentVi: 'Social Media & Marketing',
    isVinceOptimizedFeatured: true,
    nodesCount: 8,
    nodeNames: [
      'Schedule Trigger (9:00 AM)',
      'Google Drive: Get New Video/Media',
      'AI Agent Opencode2 (crouton-alpha-free): Viết Caption & Hashtag',
      'TikTok: Publish Direct Video',
      'Threads (Meta): Publish Post & Threadstorm',
      'Instagram Business: Publish Reel',
      'YouTube & Shorts: Upload Video',
      'Google Sheets: Lưu Lịch Đăng + Telegram Alert',
    ],
    nodes: [
      { id: 'n1', name: 'Schedule Trigger (9:00 AM)', type: 'trigger.cron', position: [80, 240], parameters: { cronExpression: '0 9 * * *', timezone: 'Asia/Ho_Chi_Minh' } },
      { id: 'n2', name: 'Google Drive: Get Video & Media', type: 'vince.googleDrive.uploadFile', position: [380, 240], parameters: { resource: 'File', operation: 'search', folderId: 'social_media_queue' } },
      { id: 'n3', name: 'AI Agent Opencode2 (crouton-alpha-free)', type: 'vince.modelRouter', position: [680, 240], parameters: { provider: 'Opencode2', model: 'crouton-alpha-free', baseUrl: 'https://opencode.ai/zen/v1', prompt: 'Viết caption thu hút cho TikTok, chuỗi bài viết 500 ký tự cho Meta Threads và mô tả SEO cho YouTube Shorts từ chủ đề: {{ $json.name }}' } },
      { id: 'n4', name: 'TikTok: Publish Direct Video', type: 'vince.tiktok.action', position: [980, 120], parameters: { resource: 'Video', operation: 'publishVideo', privacyLevel: 'PUBLIC_TO_EVERYONE' } },
      { id: 'n5', name: 'Threads (Meta): Publish Post', type: 'vince.threads.action', position: [980, 260], parameters: { resource: 'Thread', operation: 'publishText', mediaType: 'TEXT' } },
      { id: 'n6', name: 'Instagram Business: Publish Reel', type: 'vince.instagram.action', position: [980, 400], parameters: { resource: 'Reels', operation: 'publishReel', shareToFeed: true } },
      { id: 'n7', name: 'YouTube & Shorts: Upload Video', type: 'vince.youtube.action', position: [1280, 240], parameters: { resource: 'Video', operation: 'uploadVideo', privacyStatus: 'public' } },
      { id: 'n8', name: 'Telegram: Báo cáo Đăng Đa Kênh', type: 'vince.telegram', position: [1580, 240], parameters: { resource: 'message', operation: 'sendMessage', chatId: '-100123456789', message: '🚀 Đã đăng thành công nội dung lên TikTok, Threads, Instagram Reels & YouTube Shorts!' } },
    ],
    connections: [
      { source: 'n1', target: 'n2' },
      { source: 'n2', target: 'n3' },
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
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: 'TikTok, Threads & Instagram Comment Auto-Reply & Private DM Lead Closer',
    titleVi: 'Lắng nghe Bình luận TikTok, Threads & Instagram ➔ AI Opencode2 Tự động Trả lời & Gửi DM Chốt Đơn',
    descriptionVi:
      'Khi khách hàng bình luận hỏi giá trên video TikTok, bài viết Meta Threads hoặc Reels Instagram, hệ thống tự động lọc bình luận hợp lệ, dùng AI Agent Opencode2 (crouton-alpha-free) phân tích ý định mua hàng, trả lời bình luận và gửi tin nhắn DM riêng kèm link sản phẩm, đồng thời lưu Lead vào Google Sheets.',
    departmentVi: 'CSKH & Mạng xã hội',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Social Media Trigger (TikTok / Threads / IG Comment) [T/W]',
      'Filter: Lọc bình luận hỏi mua hàng & Chống spam',
      'AI Agent Opencode2 (crouton-alpha-free): Soạn phản hồi cá nhân hóa',
      'Threads (Meta): Reply to Comment',
      'Instagram & TikTok: Reply & Send Private DM',
      'Google Sheets: Append Lead + Telegram Alert',
    ],
    nodes: [
      { id: 'c1', name: 'Social Media Trigger (TikTok / Threads / IG)', type: 'trigger.socialMedia', position: [80, 250], parameters: { app: 'threads_tiktok_ig', event: 'comment.create' } },
      { id: 'c2', name: 'Filter: Lọc bình luận khách hàng', type: 'transform.filter', position: [380, 250], parameters: { condition: '$json.text.length > 2' } },
      { id: 'c3', name: 'AI Agent Opencode2 (crouton-alpha-free)', type: 'vince.modelRouter', position: [680, 250], parameters: { provider: 'Opencode2', model: 'crouton-alpha-free', baseUrl: 'https://opencode.ai/zen/v1', prompt: 'Phân tích bình luận khách hàng và soạn câu trả lời thân thiện chốt đơn: {{ $json.text }}' } },
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
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: 'Automated Threadstorm Generator for Meta Threads, X (Twitter) & LinkedIn from Notion',
    titleVi: 'Biến bài viết Notion / Tin tức thành chuỗi bài đăng (Threadstorm) trên Meta Threads, X & LinkedIn',
    descriptionVi:
      'Tự động lấy bài viết dài từ Notion hoặc Vince Web Scraper, chia nhỏ thành chuỗi các đoạn 500 ký tự cuốn hút bằng Multi-Agent Supervisor (Opencode2 crouton-alpha-free), sau đó đăng tự động thành chuỗi Threadstorm trên Meta Threads, X (Twitter) và bài viết chuyên sâu trên LinkedIn.',
    departmentVi: 'Content & Thương hiệu cá nhân',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Schedule Trigger (8:30 AM)',
      'Notion: Query Database Bài Viết Mới',
      'Vince Multi-Agent Supervisor (Opencode2 crouton-alpha-free)',
      'Threads (Meta): Publish Carousel & Threadstorm',
      'X (Twitter) & LinkedIn: Publish Post',
      'Telegram: Thông báo Link Bài Đăng',
    ],
    nodes: [
      { id: 't1', name: 'Schedule Trigger (8:30 AM)', type: 'trigger.cron', position: [80, 250], parameters: { cronExpression: '30 8 * * *' } },
      { id: 't2', name: 'Notion: Query Database Bài Viết', type: 'vince.notion.action', position: [380, 250], parameters: { resource: 'Database', operation: 'query' } },
      { id: 't3', name: 'Vince Multi-Agent Supervisor (Opencode2)', type: 'vince.agentManager', position: [680, 250], parameters: { provider: 'Opencode2', model: 'crouton-alpha-free', baseUrl: 'https://opencode.ai/zen/v1', agentRole: 'supervisor', taskDescription: 'Chuyển đổi bài viết dài thành chuỗi 5 bài Threads (dưới 500 ký tự/bài) và 1 bài LinkedIn.' } },
      { id: 't4', name: 'Threads (Meta): Publish Threadstorm', type: 'vince.threads.action', position: [980, 170], parameters: { resource: 'Thread', operation: 'publishText' } },
      { id: 't5', name: 'X (Twitter) & LinkedIn: Publish Post', type: 'vince.whatsappSocial.action', position: [980, 330], parameters: { resource: 'LinkedIn', operation: 'Publish Post' } },
      { id: 't6', name: 'Telegram: Send Message', type: 'vince.telegram', position: [1280, 250], parameters: { resource: 'message', operation: 'sendMessage', chatId: '-100123456789' } },
    ],
    connections: [
      { source: 't1', target: 't2' },
      { source: 't2', target: 't3' },
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
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: 'Shopee, TikTok Shop & Lazada Order Automation + Zalo ZNS + Google Sheets',
    titleVi: 'Đồng bộ Đơn hàng Shopee, TikTok Shop & Lazada ➔ AI Opencode2 ➔ Lưu Google Sheets & Gửi Zalo ZNS',
    descriptionVi:
      'Mẫu quy trình thương mại điện tử tối ưu cho doanh nghiệp Việt Nam: Nhận sự kiện đơn hàng mới từ Shopee/TikTok Shop qua Webhook, lọc đơn hợp lệ, dùng AI Opencode2 phân류 khách hàng, ghi sổ Google Sheets, gửi tin nhắn xác nhận Zalo ZNS và báo về nhóm vận hành Telegram.',
    departmentVi: 'Thương mại điện tử (TMĐT)',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'E-commerce Trigger (Shopee / TikTok Shop) [T/W]',
      'Shopee / TikTok Shop: Get Order Detail',
      'Filter: Lọc đơn hàng hợp lệ',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'Google Sheets: Append Row Đơn Hàng',
      'Zalo OA: Send ZNS Notification',
    ],
    nodes: [
      { id: 'e1', name: 'E-commerce Trigger (Shopee / TikTok Shop)', type: 'trigger.ecommerce', position: [80, 250], parameters: { app: 'shopee', event: 'order_status_push' } },
      { id: 'e2', name: 'Shopee / TikTok Shop: Get Order Detail', type: 'vince.shopee.createOrder', position: [380, 250], parameters: { resource: 'Shopee Order', operation: 'getOrderDetail' } },
      { id: 'e3', name: 'Filter: Lọc đơn hợp lệ', type: 'transform.filter', position: [680, 250], parameters: { condition: '$json.order_status !== "CANCELLED"' } },
      { id: 'e4', name: 'AI Agent Opencode2 (crouton-alpha-free)', type: 'vince.modelRouter', position: [980, 250], parameters: { provider: 'Opencode2', model: 'crouton-alpha-free', baseUrl: 'https://opencode.ai/zen/v1', prompt: 'Phân tích đơn hàng và soạn lời cảm ơn khách hàng: {{ JSON.stringify($json) }}' } },
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
    categoryVi: '★ Mẫu Tối Ưu Chuẩn Dự Án VinceAuto',
    titleEn: 'VietQR, MoMo & VNPAY Instant Payment Reconciliation + Gmail Receipt + Sheets',
    titleVi: 'Đối soát Thanh toán Tự động VietQR, MoMo & VNPAY ➔ AI Opencode2 ➔ Ghi Google Sheets & Gửi Biên lai Gmail',
    descriptionVi:
      'Nhận callback IPN thanh toán thành công từ VietQR, MoMo hoặc VNPAY, chuẩn hóa dữ liệu bằng Edit Fields (Set), dùng AI Agent Opencode2 (crouton-alpha-free) đối soát mã đơn hàng, cập nhật trạng thái vào Google Sheets, gửi biên lai điện tử qua Gmail và báo tin tinh về Telegram.',
    departmentVi: 'Tài chính & Kế toán',
    isVinceOptimizedFeatured: true,
    nodesCount: 6,
    nodeNames: [
      'Payment Webhook Trigger (VietQR / MoMo / VNPAY) [T/W]',
      'Edit Fields (Set): Chuẩn hóa giao dịch',
      'AI Agent Opencode2 (crouton-alpha-free): Đối soát tự động',
      'Google Sheets: Update Trạng Thái Thanh Toán',
      'Gmail: Gửi Biên Lai Xác Nhận',
      'Telegram: Báo Biến Động Số Dư',
    ],
    nodes: [
      { id: 'p1', name: 'Payment Webhook Trigger (VietQR / MoMo)', type: 'trigger.payment', position: [80, 250], parameters: { app: 'vietqr_momo', event: 'ipn_payment_success' } },
      { id: 'p2', name: 'Edit Fields (Set): Chuẩn hóa giao dịch', type: 'transform.editFields', position: [380, 250], parameters: { mode: 'manual', fields: { verified: true, currency: 'VND' } } },
      { id: 'p3', name: 'AI Agent Opencode2 (crouton-alpha-free)', type: 'vince.modelRouter', position: [680, 250], parameters: { provider: 'Opencode2', model: 'crouton-alpha-free', baseUrl: 'https://opencode.ai/zen/v1', prompt: 'Trích xuất mã đơn hàng từ nội dung chuyển khoản và tạo biên lai xác nhận: {{ JSON.stringify($json) }}' } },
      { id: 'p4', name: 'Google Sheets: Append or Update Row', type: 'vince.googleSheets.appendRow', position: [980, 160], parameters: { resource: 'Row', operation: 'appendOrUpdate', range: 'Payments!A:G' } },
      { id: 'p5', name: 'Gmail: Send Email Receipt', type: 'vince.gmail.sendEmail', position: [980, 340], parameters: { resource: 'Message', operation: 'send' } },
      { id: 'p6', name: 'Telegram: Báo Biến Động Số Dư', type: 'vince.telegram', position: [1280, 250], parameters: { resource: 'message', operation: 'sendMessage', chatId: '-100123456789' } },
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
    const newWorkflow: IWorkflow = {
      id: `wf_tpl_${Date.now()}`,
      name: optimized.titleVi,
      nodes: optimized.nodes,
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
      <div className="w-[1200px] max-w-[96vw] h-[86vh] bg-[#18181b] border border-[#2e2e33] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#28282c] bg-[#141416] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#242428] border border-[#34343a] text-[#e6e8ec] shadow-sm">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-[#e6e8ec] tracking-tight">
                  Kho Mẫu Dự Án Chuẩn VinceAuto (Tối Ưu Cho Opencode2 & Đa Kênh MXH)
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#26262b] text-[#e6e8ec] border border-[#3a3a42]">
                  {allTemplates.length} Mẫu Đã Tối Ưu
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Toàn bộ mẫu đã được chuẩn hóa mã Node VinceAuto, tích hợp TikTok, Meta Threads, Instagram, Shopee, Zalo OA & AI Agent Opencode2 ({OPENCODE2_PROVIDER_CONFIG.models})
              </p>
            </div>
          </div>

          {/* Search & Close */}
          <div className="flex items-center space-x-3">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && selectedCategory === 'VINCEAUTO_FEATURED') {
                    setSelectedCategory('ALL');
                  }
                }}
                placeholder="Tìm mẫu (VD: TikTok, Threads, Shopee, Zalo, Telegram, RAG)..."
                className="w-full bg-[#202024] border border-[#323238] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-300"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#252529] transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 3-Column Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column: Categories List */}
          <div className="w-[280px] border-r border-[#28282c] bg-[#141416] overflow-y-auto p-3 space-y-1 custom-scrollbar shrink-0">
            <div className="px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
              Danh mục mẫu dự án ({categories.length})
            </div>

            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#28282d] text-[#e6e8ec] font-bold border border-[#3a3a42]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1f1f23]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Layers className="w-3.5 h-3.5 shrink-0 text-[#e6e8ec]" />
                <span className="truncate">Tất cả mẫu dự án</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#1e1e22] text-zinc-300 font-mono">
                {allTemplates.length}
              </span>
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#28282d] text-[#e6e8ec] font-semibold border border-[#3a3a42]'
                      : isFeatured
                      ? 'bg-[#1f1f25] text-zinc-200 border border-[#32323a] hover:bg-[#26262e]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1f1f23]'
                  }`}
                  title={cat.nameVi}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    {isFeatured ? (
                      <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    ) : (
                      <FolderClosed
                        className={`w-3.5 h-3.5 shrink-0 ${
                          active ? 'text-[#e6e8ec]' : 'text-zinc-500'
                        }`}
                      />
                    )}
                    <span className="truncate text-left">{cat.nameVi}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#1e1e22] text-zinc-300 font-mono shrink-0">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center Column: Templates List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#18181b] custom-scrollbar">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-xs font-semibold text-zinc-300">
                Hiển thị <strong className="text-[#e6e8ec]">{filteredTemplates.length}</strong> mẫu bản vẽ đã tối ưu chuẩn VinceAuto
              </span>
              <span className="inline-flex items-center space-x-1 text-[10.5px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tương thích 100% Node & Opencode2 Agent</span>
              </span>
            </div>

            {filteredTemplates.map((tpl) => {
              const isSelected = previewTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setPreviewTemplate(tpl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#242429] border-zinc-400 shadow-lg'
                      : 'bg-[#202024] border-[#2c2c31] hover:bg-[#232328] hover:border-[#3a3a42]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Workflow className="w-4 h-4 text-[#e6e8ec] shrink-0" />
                        <h4 className="text-[13px] font-bold text-[#e6e8ec] leading-snug">
                          {tpl.titleVi}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {tpl.titleEn}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {tpl.isVinceOptimizedFeatured && (
                        <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                          Chuẩn Dự Án
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#2b2b31] text-zinc-300 font-medium">
                        {tpl.departmentVi}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#18181b] border border-[#323238] text-[#e6e8ec] font-mono">
                        {tpl.nodesCount} nodes
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                    {tpl.descriptionVi}
                  </p>

                  {/* Node chain preview */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-[#2a2a2f]">
                    <div className="flex items-center flex-wrap gap-1 min-w-0">
                      {tpl.nodeNames.slice(0, 4).map((nName, idx) => (
                        <React.Fragment key={idx}>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18181b] text-zinc-300 border border-[#2d2d33] truncate max-w-[140px]">
                            {nName}
                          </span>
                          {idx < Math.min(tpl.nodeNames.length, 4) - 1 && (
                            <span className="text-[10px] text-zinc-500">➔</span>
                          )}
                        </React.Fragment>
                      ))}
                      {tpl.nodeNames.length > 4 && (
                        <span className="text-[10px] text-zinc-500">
                          +{tpl.nodeNames.length - 4} bước
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemplate(tpl);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-[11px] flex items-center space-x-1 shrink-0 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Dùng mẫu này</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Inspector of Selected Template */}
          {previewTemplate && (
            <div className="w-[350px] border-l border-[#28282c] bg-[#141416] p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar shrink-0">
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#26262b] border border-[#383840] text-[10px] font-bold text-[#e6e8ec] uppercase mb-2">
                    {previewTemplate.categoryVi}
                  </span>
                  <h3 className="text-sm font-bold text-[#e6e8ec] leading-snug">
                    {previewTemplate.titleVi}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 break-words">
                    Nguồn: {previewTemplate.relativePath}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1c1c20] border border-[#2c2c32] space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#e6e8ec]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đã tối ưu hóa cho dự án VinceAuto</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {previewTemplate.descriptionVi}
                  </p>
                </div>

                {/* All nodes in this template */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Cấu trúc các nút chuẩn ({previewTemplate.nodesCount} Nodes)</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {previewTemplate.connections.length} liên kết
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                    {previewTemplate.nodes.map((n, index) => (
                      <div
                        key={n.id || index}
                        className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#1c1c20] border border-[#2a2a30] text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#2a2a30] text-[#e6e8ec] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-zinc-200 font-medium truncate">{n.name}</div>
                          <div className="text-[10px] text-sky-300 font-mono truncate">{n.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#26262a] mt-4">
                <button
                  onClick={() => handleApplyTemplate(previewTemplate)}
                  className="w-full py-3 px-4 rounded-xl bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Áp Dụng Mẫu Vào Bản Vẽ</span>
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
