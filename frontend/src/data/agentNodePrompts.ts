export interface IAIProviderEntry {
  providerName: string;
  providerType: string;
  baseUrl: string;
  apiKey: string;
  models: string;
  status: string;
  createdAt: string;
}

export const OPENCODE2_PROVIDER_CONFIG: IAIProviderEntry = {
  providerName: 'Opencode2',
  providerType: 'openai',
  baseUrl: 'https://opencode.ai/zen/v1',
  apiKey: (import.meta as any).env?.VITE_OPENCODE_API_KEY || '',
  models: 'crouton-alpha-free',
  status: 'Kích hoạt',
  createdAt: '2026-11-08T00:12:36.869Z',
};

export interface IAgentSlashCommand {
  command: string;
  usage: string;
  description: string;
  example: string;
}

export const AGENT_SLASH_COMMANDS: IAgentSlashCommand[] = [
  {
    command: '/build',
    usage: '/build <mô tả quy trình>',
    description: 'Tạo mới hoàn toàn một workflow tự động bằng Opencode2 (crouton-alpha-free) với đầy đủ Trigger, Transform, AI Agent và Action.',
    example: '/build Tự động nhận đơn hàng Shopee mới, lọc đơn hợp lệ, phân tích bằng AI Opencode2, lưu Google Sheets và gửi Zalo ZNS + Telegram',
  },
  {
    command: '/add',
    usage: '/add <tên nút chuẩn hoặc mã type>',
    description: 'Thêm đúng 1 nút kéo thả (theo tên chuẩn) vào cuối bản vẽ hiện tại và tự động nối dây.',
    example: '/add Google Sheets: Append Row',
  },
  {
    command: '/optimize',
    usage: '/optimize',
    description: 'Tối ưu hóa workflow hiện tại: tự động chèn nút Remove Duplicates (chống trùng lặp) và Vince Self-Healing Debugger (Opencode2).',
    example: '/optimize',
  },
  {
    command: '/fix',
    usage: '/fix',
    description: 'Chuẩn hóa tọa độ các nút trên bản vẽ, khôi phục đường nối bị đứt và đồng bộ model AI về Opencode2 (crouton-alpha-free).',
    example: '/fix',
  },
];

export interface IDraggableNodePromptSpec {
  id: string;
  nodeType: string;
  canonicalName: string;
  category: 'trigger' | 'app' | 'transform' | 'flow_core' | 'ai_agent';
  categoryLabel: string;
  command: string;
  defaultParamsSummary: string;
  nodeTrainingPrompt: string;
  autoWorkflowPrompt: string;
}

/**
 * Từ điển Tên Gọi Chuẩn & Prompt Huấn Luyện Cho Từng Nút Kéo Thả (Giúp AI Agent Opencode2 gọi đúng tên & tạo workflow chuẩn xác)
 */
export const DRAGGABLE_NODE_PROMPTS: IDraggableNodePromptSpec[] = [
  // ============================================================================
  // 1. TRIGGERS (13 PLATFORM TRIGGERS & DOMAIN TRIGGERS)
  // ============================================================================
  {
    id: 'prompt_trigger_manual',
    nodeType: 'trigger.manual',
    canonicalName: 'Manual Trigger',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Manual Trigger',
    defaultParamsSummary: '{ mode: "manual" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Manual Trigger" (type="trigger.manual") làm điểm khởi đầu khi người dùng muốn chạy kiểm thử thủ công trên bản vẽ.',
    autoWorkflowPrompt: '/build Tạo workflow bắt đầu bằng Manual Trigger, chạy Vince Web Scraper lấy tin tức mới, tóm tắt bằng AI Agent Opencode2 (crouton-alpha-free) và gửi qua Telegram',
  },
  {
    id: 'prompt_trigger_schedule',
    nodeType: 'trigger.cron',
    canonicalName: 'Schedule Trigger',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Schedule Trigger',
    defaultParamsSummary: '{ cronExpression: "0 8 * * *", timezone: "Asia/Ho_Chi_Minh" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Schedule Trigger" (type="trigger.cron") với tham số cronExpression (ví dụ "0 8 * * *") để kích hoạt workflow định kỳ.',
    autoWorkflowPrompt: '/build Dùng Schedule Trigger chạy lúc 8:00 sáng mỗi ngày, cào tin công nghệ bằng Vince Web Scraper, chuẩn hóa bằng Edit Fields (Set), phân tích bằng AI Agent Opencode2 và gửi báo cáo vào Google Sheets + Telegram',
  },
  {
    id: 'prompt_trigger_webhook',
    nodeType: 'trigger.webhook',
    canonicalName: 'Webhook Trigger',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Webhook Trigger',
    defaultParamsSummary: '{ path: "vince-webhook", httpMethod: "POST" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Webhook Trigger" (type="trigger.webhook") để nhận sự kiện HTTP POST/GET đẩy về từ hệ thống bên ngoài.',
    autoWorkflowPrompt: '/build Tạo workflow nhận dữ liệu từ Webhook Trigger, lọc điều kiện bằng Filter, phân loại bằng AI Agent Opencode2 (crouton-alpha-free), lưu vào CRM HubSpot và bắn thông báo Slack + Telegram',
  },
  {
    id: 'prompt_trigger_form',
    nodeType: 'trigger.form',
    canonicalName: 'Form Trigger',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Form Trigger',
    defaultParamsSummary: '{ formTitle: "Form đăng ký khách hàng", fields: "fullName,phone,email,note" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Form Trigger" (type="trigger.form") khi cần tạo biểu mẫu thu thập thông tin khách hàng (Lead Form) trực tiếp vào workflow.',
    autoWorkflowPrompt: '/build Tạo workflow bắt đầu bằng Form Trigger thu thập khách hàng mới, chuẩn hóa bằng Edit Fields (Set), chấm điểm Lead bằng AI Agent Opencode2, lưu vào Google Sheets và gửi email chào mừng qua Gmail',
  },
  {
    id: 'prompt_trigger_chat',
    nodeType: 'trigger.chat',
    canonicalName: 'Chat Trigger',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Chat Trigger',
    defaultParamsSummary: '{ channel: "multichannel_chat", welcomeMessage: "Xin chào!" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Chat Trigger" (type="trigger.chat") để lắng nghe tin nhắn hội thoại từ người dùng và chuyển tiếp cho AI Agent trả lời.',
    autoWorkflowPrompt: '/build Tạo workflow CSKH tự động bắt đầu bằng Chat Trigger, kết nối AI Agent Opencode2 (crouton-alpha-free) tư vấn khách hàng, lưu lịch sử vào Google Sheets và cảnh báo về Telegram',
  },
  {
    id: 'prompt_trigger_ecommerce',
    nodeType: 'trigger.ecommerce',
    canonicalName: 'E-commerce Trigger (Shopee/TikTok Shop/Lazada)',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add E-commerce Trigger',
    defaultParamsSummary: '{ app: "shopee", event: "order_status_push", mechanism: "W" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "E-commerce Trigger" (type="trigger.ecommerce") khi lắng nghe sự kiện đơn hàng mới từ Shopee, TikTok Shop hoặc Lazada.',
    autoWorkflowPrompt: '/build Tạo workflow khi có đơn hàng mới từ Shopee qua E-commerce Trigger, lấy chi tiết đơn hàng Shopee, lọc đơn hợp lệ bằng Filter, phân tích bằng AI Agent Opencode2, ghi vào Google Sheets và gửi Zalo ZNS + Telegram',
  },
  {
    id: 'prompt_trigger_payment',
    nodeType: 'trigger.payment',
    canonicalName: 'Payment Webhook Trigger (MoMo/VNPAY/VietQR)',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Payment Webhook Trigger',
    defaultParamsSummary: '{ app: "momo", event: "ipn_payment_success", mechanism: "W" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Payment Webhook Trigger" (type="trigger.payment") để nhận callback thanh toán thành công từ MoMo, VNPAY, ZaloPay, VietQR hoặc Stripe.',
    autoWorkflowPrompt: '/build Tạo workflow lắng nghe giao dịch thành công qua Payment Webhook Trigger (MoMo/VietQR), kiểm tra chữ ký, đối soát bằng AI Agent Opencode2, cập nhật Google Sheets và gửi thông báo xác nhận qua Telegram + Gmail',
  },
  {
    id: 'prompt_trigger_database',
    nodeType: 'trigger.database',
    canonicalName: 'Database Trigger (CDC)',
    category: 'trigger',
    categoryLabel: '1. Triggers',
    command: '/add Database Trigger',
    defaultParamsSummary: '{ table: "orders", event: "INSERT,UPDATE" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Database Trigger (CDC)" (type="trigger.database") khi muốn kích hoạt workflow mỗi khi có dòng dữ liệu mới INSERT/UPDATE trong PostgreSQL, MySQL hoặc Supabase.',
    autoWorkflowPrompt: '/build Tạo workflow bắt đầu bằng Database Trigger khi có bản ghi mới trong PostgreSQL, chuẩn hóa bằng Edit Fields (Set), phân tích bằng AI Agent Opencode2 và đồng bộ sang Notion + Slack',
  },

  // ============================================================================
  // 2. ỨNG DỤNG (21 APPLICATION INTEGRATIONS)
  // ============================================================================
  {
    id: 'prompt_app_sheets',
    nodeType: 'vince.googleSheets.appendRow',
    canonicalName: 'Google Sheets: Append Row / Update Row',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Google Sheets: Append Row',
    defaultParamsSummary: '{ resource: "Row", operation: "appendOrUpdate", range: "Sheet1!A:F" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Google Sheets: Append Row" (type="vince.googleSheets.appendRow", resource="Row", operation="append" | "update" | "appendOrUpdate" | "getMany") để đọc/ghi trang tính Google Sheets.',
    autoWorkflowPrompt: '/build Tạo workflow nhận Webhook, xử lý nội dung bằng AI Agent Opencode2 (crouton-alpha-free), ghi dữ liệu vào Google Sheets: Append Row và báo cáo về Telegram',
  },
  {
    id: 'prompt_app_drive',
    nodeType: 'vince.googleDrive.uploadFile',
    canonicalName: 'Google Drive: Upload / Search File',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Google Drive: Upload File',
    defaultParamsSummary: '{ resource: "File", operation: "upload", folderId: "root" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Google Drive: Upload File" (type="vince.googleDrive.uploadFile", resource="File" | "Folder", operation="upload" | "download" | "search" | "share") để quản lý tệp Google Drive.',
    autoWorkflowPrompt: '/build Tạo workflow chạy định kỳ, tổng hợp dữ liệu bằng AI Agent Opencode2, lưu báo cáo lên Google Drive: Upload File và gửi link qua Gmail + Telegram',
  },
  {
    id: 'prompt_app_gmail',
    nodeType: 'vince.gmail.sendEmail',
    canonicalName: 'Gmail: Send / Reply Email',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Gmail: Send Email',
    defaultParamsSummary: '{ resource: "Message", operation: "send", to: "{{ $json.email }}" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Gmail: Send Email" (type="vince.gmail.sendEmail", resource="Message" | "Draft" | "Thread", operation="send" | "reply" | "markAsRead") để gửi/phản hồi email tự động.',
    autoWorkflowPrompt: '/build Tạo workflow nhận Form khách hàng, dùng AI Agent Opencode2 (crouton-alpha-free) soạn email cá nhân hóa, gửi qua Gmail: Send Email và lưu lịch sử vào Google Sheets',
  },
  {
    id: 'prompt_app_calendar',
    nodeType: 'vince.googleCalendar.createEvent',
    canonicalName: 'Google Calendar & Docs: Create Event',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Google Calendar: Create Event',
    defaultParamsSummary: '{ resource: "Event", operation: "create", calendarId: "primary" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Google Calendar: Create Event" (type="vince.googleCalendar.createEvent", resource="Event" | "Calendar" | "Google Docs", operation="create" | "update") để đặt lịch hẹn hoặc tạo tài liệu.',
    autoWorkflowPrompt: '/build Tạo workflow nhận yêu cầu đặt lịch từ Form Trigger, phân tích thời gian bằng AI Agent Opencode2, tạo sự kiện trên Google Calendar: Create Event và gửi xác nhận qua Gmail + Telegram',
  },
  {
    id: 'prompt_app_ms365',
    nodeType: 'vince.microsoft365.action',
    canonicalName: 'Microsoft 365: Excel / Outlook / Teams / OneDrive',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Microsoft 365: Excel / Outlook / Teams',
    defaultParamsSummary: '{ resource: "Excel 365" | "Outlook" | "Teams", operation: "addRow" | "sendMessage" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Microsoft 365" (type="vince.microsoft365.action") để thêm dòng Excel 365, gửi mail Outlook, gửi tin nhắn Microsoft Teams hoặc tải tệp OneDrive/SharePoint.',
    autoWorkflowPrompt: '/build Tạo workflow nhận báo cáo doanh thu, phân tích bằng AI Agent Opencode2, cập nhật vào Microsoft 365 (Excel 365 & Microsoft Teams) và thông báo Telegram',
  },
  {
    id: 'prompt_app_notion',
    nodeType: 'vince.notion.action',
    canonicalName: 'Notion: Create Page / Query Database',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Notion: Create Page',
    defaultParamsSummary: '{ resource: "Page", operation: "create", databaseId: "notion_db_default" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Notion: Create Page" (type="vince.notion.action", resource="Page" | "Database" | "Block", operation="create" | "query" | "append") để lưu trữ tri thức vào Notion.',
    autoWorkflowPrompt: '/build Tạo workflow cào tin tức công nghệ mỗi sáng, dùng AI Agent Opencode2 (crouton-alpha-free) tóm tắt thành bài viết, lưu vào Notion: Create Page và gửi thông báo Telegram',
  },
  {
    id: 'prompt_app_pm',
    nodeType: 'vince.projectManagement.action',
    canonicalName: 'Project Management: Jira / Linear / Trello / Asana / ClickUp',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Jira / Linear / Trello: Create Issue',
    defaultParamsSummary: '{ resource: "Jira" | "Linear" | "Trello", operation: "createIssue" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Project Management" (type="vince.projectManagement.action") để tạo Issue Jira/Linear, tạo Card Trello hoặc Task Asana/ClickUp.',
    autoWorkflowPrompt: '/build Tạo workflow nhận báo lỗi từ Webhook, phân tích nguyên nhân bằng AI Agent Opencode2, tự động tạo ticket trên Jira / Linear / Trello và cảnh báo vào Slack + Telegram',
  },
  {
    id: 'prompt_app_telegram',
    nodeType: 'vince.telegram',
    canonicalName: 'Telegram: Send Message / Photo / Document',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Telegram: Send Message',
    defaultParamsSummary: '{ resource: "message", operation: "sendMessage", chatId: "-100123456789" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Telegram: Send Message" (type="vince.telegram", resource="message" | "chat" | "callback", operation="sendMessage" | "sendPhoto" | "sendDocument") để gửi thông báo hoặc tương tác bot Telegram.',
    autoWorkflowPrompt: '/build Tạo workflow chatbot Telegram tự động: nhận tin nhắn khách hàng, suy luận câu trả lời bằng AI Agent Opencode2 (crouton-alpha-free), lưu Google Sheets và phản hồi qua Telegram: Send Message',
  },
  {
    id: 'prompt_app_zalo',
    nodeType: 'vince.zalo.sendZns',
    canonicalName: 'Zalo OA: Send ZNS Notification',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Zalo OA: Send ZNS',
    defaultParamsSummary: '{ resource: "ZNS", operation: "sendZns", phone: "{{ $json.phone }}" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Zalo OA: Send ZNS Notification" (type="vince.zalo.sendZns", resource="ZNS" | "Zalo Message", operation="sendZns" | "sendText") để gửi thông báo chăm sóc khách hàng qua Zalo.',
    autoWorkflowPrompt: '/build Tạo workflow khi có đơn hàng mới hoặc khách đăng ký Form, chuẩn hóa số điện thoại bằng Edit Fields (Set), cá nhân hóa bằng AI Agent Opencode2, gửi tin nhắn Zalo OA: Send ZNS và lưu vào Google Sheets',
  },
  {
    id: 'prompt_app_facebook',
    nodeType: 'vince.facebook.postFeed',
    canonicalName: 'Facebook Graph & Instagram: Post / Reply / Lead Ads',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Facebook & Instagram: Post Feed',
    defaultParamsSummary: '{ resource: "Post" | "Comment" | "Instagram Media", operation: "create" | "reply" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Facebook Graph & Instagram" (type="vince.facebook.postFeed") để đăng bài Fanpage, trả lời bình luận tự động, lấy dữ liệu Facebook Lead Ads hoặc đăng ảnh/Reels Instagram.',
    autoWorkflowPrompt: '/build Tạo workflow tự động sáng tạo nội dung mạng xã hội bằng AI Agent Opencode2 (crouton-alpha-free), đăng bài lên Facebook Graph & Instagram, lưu lịch đăng vào Google Sheets và báo về Telegram',
  },
  {
    id: 'prompt_app_tiktok',
    nodeType: 'vince.tiktok.action',
    canonicalName: 'TikTok: Publish Direct Video / Photo Carousel / Insights',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add TikTok: Publish Direct Video',
    defaultParamsSummary: '{ resource: "Video", operation: "publishVideo", privacyLevel: "PUBLIC_TO_EVERYONE" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "TikTok: Publish Direct Video" (type="vince.tiktok.action", resource="Video" | "Photo" | "Status" | "Comment", operation="publishVideo" | "publishPhotoCarousel" | "queryVideoList" | "replyComment") để đăng video, bộ ảnh trượt hoặc trả lời bình luận trên TikTok.',
    autoWorkflowPrompt: '/build Tạo workflow tự động lấy video từ Google Drive, dùng AI Agent Opencode2 (crouton-alpha-free) viết caption xu hướng kèm hashtag #xuhuong, đăng trực tiếp lên TikTok: Publish Direct Video, lưu link vào Google Sheets và báo về Telegram',
  },
  {
    id: 'prompt_app_threads',
    nodeType: 'vince.threads.action',
    canonicalName: 'Threads (Meta): Publish Post / Carousel / Threadstorm / Reply',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Threads: Publish Text Post',
    defaultParamsSummary: '{ resource: "Thread", operation: "publishText", mediaType: "TEXT" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Threads (Meta): Publish Text Post" (type="vince.threads.action", resource="Thread" | "Reply" | "Insights", operation="publishText" | "publishMedia" | "publishCarousel" | "createReply" | "getInsights") để đăng bài viết, chuỗi Threadstorm hoặc trả lời bình luận tự động trên Meta Threads.',
    autoWorkflowPrompt: '/build Tạo workflow tự động cào tin xu hướng mỗi sáng, dùng AI Agent Opencode2 (crouton-alpha-free) biên tập thành chuỗi bài viết ngắn 500 ký tự, đăng tự động lên Threads: Publish Text Post, đồng bộ sang Notion và thông báo qua Telegram',
  },
  {
    id: 'prompt_app_instagram',
    nodeType: 'vince.instagram.action',
    canonicalName: 'Instagram Business: Publish Reels / Story / Automated DM',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Instagram: Publish Reel',
    defaultParamsSummary: '{ resource: "Reels", operation: "publishReel", shareToFeed: true }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Instagram Business: Publish Reel" (type="vince.instagram.action", resource="Reels" | "Story" | "Comment" | "Message", operation="publishReel" | "publishStory" | "replyAndPrivateDm") để đăng Reels, Story 24h hoặc tự động gửi tin nhắn DM chốt đơn khi khách bình luận.',
    autoWorkflowPrompt: '/build Tạo workflow khi khách hàng bình luận vào bài viết Instagram, dùng AI Agent Opencode2 phân tích nhu cầu, tự động trả lời bình luận và gửi tin nhắn DM kèm link sản phẩm qua Instagram Business, lưu Lead vào Google Sheets',
  },
  {
    id: 'prompt_app_youtube',
    nodeType: 'vince.youtube.action',
    canonicalName: 'YouTube & Shorts: Upload Video / Reply Comment / Analytics',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add YouTube: Upload Video / Shorts',
    defaultParamsSummary: '{ resource: "Video", operation: "uploadVideo", privacyStatus: "public" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "YouTube & Shorts: Upload Video" (type="vince.youtube.action", resource="Video" | "Comment" | "Playlist", operation="uploadVideo" | "replyComment" | "addPlaylistItem") để tải video/Shorts lên kênh YouTube hoặc trả lời bình luận tự động.',
    autoWorkflowPrompt: '/build Tạo workflow lấy video mới từ Google Drive, dùng AI Agent Opencode2 (crouton-alpha-free) tối ưu tiêu đề SEO và mô tả, tải tự động lên YouTube & Shorts: Upload Video, cập nhật Google Sheets và gửi thông báo Telegram',
  },
  {
    id: 'prompt_app_shopee',
    nodeType: 'vince.shopee.createOrder',
    canonicalName: 'Shopee / TikTok Shop / Lazada: Quản lý Đơn hàng',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Shopee / TikTok Shop: Get Order Detail',
    defaultParamsSummary: '{ resource: "Shopee Order", operation: "getOrderDetail", orderSn: "{{ $json.order_sn }}" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Shopee / TikTok Shop: Process Order" (type="vince.shopee.createOrder", resource="Shopee Order" | "TikTok Shop Order" | "Lazada Order", operation="getOrderDetail" | "shipOrder" | "updateStock") để đồng bộ sàn TMĐT.',
    autoWorkflowPrompt: '/build Tạo workflow đồng bộ đơn hàng tự động từ Shopee / TikTok Shop, lọc đơn hợp lệ bằng Filter, phân tích bằng AI Agent Opencode2, ghi vào Google Sheets, gửi Zalo ZNS cho khách và báo về Telegram',
  },
  {
    id: 'prompt_app_crm',
    nodeType: 'vince.crmMarketing.action',
    canonicalName: 'CRM & Marketing: HubSpot / Salesforce / Airtable / Mailchimp',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add CRM HubSpot / Salesforce: Upsert Contact',
    defaultParamsSummary: '{ resource: "HubSpot" | "Salesforce" | "Airtable", operation: "upsertContact" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "CRM & Marketing" (type="vince.crmMarketing.action") để đồng bộ Contact, Deal, Ticket vào HubSpot, Salesforce, Pipedrive, Zoho CRM, Mailchimp hoặc Airtable.',
    autoWorkflowPrompt: '/build Tạo workflow thu thập Lead khách hàng từ Webhook, làm giàu thông tin và chấm điểm Lead bằng AI Agent Opencode2 (crouton-alpha-free), đồng bộ vào CRM HubSpot / Airtable và thông báo qua Slack + Telegram',
  },
  {
    id: 'prompt_app_databases',
    nodeType: 'vince.databases.action',
    canonicalName: 'Database & Vector DB: PostgreSQL / MySQL / MongoDB / Redis / Supabase / Qdrant',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Database: Execute Query',
    defaultParamsSummary: '{ resource: "PostgreSQL" | "Supabase" | "Vector DB", operation: "executeQuery" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Database & Vector DB" (type="vince.databases.action") để truy vấn SQL trên PostgreSQL/MySQL/Supabase, thao tác document MongoDB, cache Redis hoặc tìm kiếm vector trên Qdrant/Pinecone.',
    autoWorkflowPrompt: '/build Tạo workflow nhận câu hỏi hoặc sự kiện dữ liệu, truy vấn cơ sở dữ liệu PostgreSQL / Supabase bằng Database: Execute Query, phân tích bằng AI Agent Opencode2 và xuất báo cáo vào Google Sheets + Telegram',
  },
  {
    id: 'prompt_app_payment',
    nodeType: 'vince.momo.createPayment',
    canonicalName: 'Payment Gateway: MoMo / VNPAY / ZaloPay / VietQR / Stripe',
    category: 'app',
    categoryLabel: '2. Ứng Dụng (Integrations)',
    command: '/add Payment Gateway: VietQR / MoMo',
    defaultParamsSummary: '{ resource: "VietQR" | "MoMo" | "VNPAY", operation: "generateQr" | "createPayment", amount: 299000 }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Payment Gateway" (type="vince.momo.createPayment", resource="MoMo" | "VNPAY" | "ZaloPay" | "VietQR" | "Stripe") để khởi tạo link thanh toán hoặc sinh mã QR chuyển khoản tự động.',
    autoWorkflowPrompt: '/build Tạo workflow nhận đơn hàng mới, dùng AI Agent Opencode2 kiểm tra thông tin, tạo mã thanh toán tự động bằng Payment Gateway (VietQR / MoMo), lưu Google Sheets và gửi mã QR cho khách qua Zalo ZNS + Telegram',
  },

  // ============================================================================
  // 3. DATA TRANSFORMATION (18 NÚT BIẾN ĐỔI DỮ LIỆU CHUẨN)
  // ============================================================================
  {
    id: 'prompt_transform_set',
    nodeType: 'transform.editFields',
    canonicalName: 'Edit Fields (Set)',
    category: 'transform',
    categoryLabel: '3. Data Transformation (18 Nodes)',
    command: '/add Edit Fields (Set)',
    defaultParamsSummary: '{ mode: "manual", fields: { status: "verified" }, keepOnlySet: false }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Edit Fields (Set)" (type="transform.editFields") để thêm mới, đổi giá trị hoặc chuẩn hóa cấu trúc trường JSON trước khi đưa vào AI Agent hoặc lưu Database.',
    autoWorkflowPrompt: '/build Tạo workflow nhận Webhook dữ liệu thô, chuẩn hóa cấu trúc bằng Edit Fields (Set), khử trùng bằng Remove Duplicates, phân tích bằng AI Agent Opencode2 và lưu vào Google Sheets',
  },
  {
    id: 'prompt_transform_filter',
    nodeType: 'transform.filter',
    canonicalName: 'Filter (Lọc điều kiện)',
    category: 'transform',
    categoryLabel: '3. Data Transformation (18 Nodes)',
    command: '/add Filter',
    defaultParamsSummary: '{ condition: "$json.status !== \'cancelled\'" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Filter" (type="transform.filter") để chỉ giữ lại các bản ghi thỏa mãn biểu thức điều kiện.',
    autoWorkflowPrompt: '/build Tạo workflow lấy danh sách đơn hàng, dùng nút Filter lọc các đơn giá trị cao, phân tích bằng AI Agent Opencode2 (crouton-alpha-free) và gửi cảnh báo VIP về Telegram',
  },
  {
    id: 'prompt_transform_code',
    nodeType: 'transform.code',
    canonicalName: 'Code (JavaScript / Python)',
    category: 'transform',
    categoryLabel: '3. Data Transformation (18 Nodes)',
    command: '/add Code',
    defaultParamsSummary: '{ language: "javascript", jsCode: "return items;" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Code" (type="transform.code") khi cần chạy đoạn mã JavaScript hoặc Python tùy chỉnh để biến đổi mảng dữ liệu phức tạp.',
    autoWorkflowPrompt: '/build Tạo workflow thu thập dữ liệu API, xử lý tính toán bằng nút Code (JavaScript), tổng hợp nhận xét bằng AI Agent Opencode2 và xuất báo cáo lên Google Sheets + Telegram',
  },
  {
    id: 'prompt_transform_dedupe',
    nodeType: 'transform.removeDuplicates',
    canonicalName: 'Remove Duplicates (Khử trùng lặp)',
    category: 'transform',
    categoryLabel: '3. Data Transformation (18 Nodes)',
    command: '/add Remove Duplicates',
    defaultParamsSummary: '{ operation: "removeDuplicateInputItems", compareField: "id" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Remove Duplicates" (type="transform.removeDuplicates") để loại bỏ các bản ghi bị trùng khóa định danh.',
    autoWorkflowPrompt: '/build Tạo workflow cào dữ liệu định kỳ, khử trùng lặp bằng Remove Duplicates, tóm tắt điểm mới bằng AI Agent Opencode2 và gửi vào Telegram',
  },
  {
    id: 'prompt_transform_aggregate',
    nodeType: 'transform.aggregate',
    canonicalName: 'Aggregate & Summarize (Gom nhóm & Thống kê)',
    category: 'transform',
    categoryLabel: '3. Data Transformation (18 Nodes)',
    command: '/add Summarize',
    defaultParamsSummary: '{ fieldsToSummarize: "amount", aggregation: "sum" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Aggregate" (type="transform.aggregate") hoặc "Summarize" (type="transform.summarize") để gom danh sách items hoặc tính tổng/trung bình doanh thu.',
    autoWorkflowPrompt: '/build Tạo workflow tổng hợp doanh thu cuối ngày: lấy dữ liệu đơn hàng, thống kê bằng Summarize, viết báo cáo phân tích bằng AI Agent Opencode2 và gửi qua Gmail + Telegram',
  },

  // ============================================================================
  // 4. FLOW & CORE NODES
  // ============================================================================
  {
    id: 'prompt_flow_if_switch',
    nodeType: 'flow.if',
    canonicalName: 'If / Switch (Rẽ nhánh điều kiện)',
    category: 'flow_core',
    categoryLabel: '4. Flow & Core',
    command: '/add If',
    defaultParamsSummary: '{ condition: "$json.amount >= 500000" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "If" (type="flow.if") để rẽ nhánh True/False hoặc "Switch" (type="flow.switch") để định tuyến dữ liệu ra nhiều kênh khác nhau.',
    autoWorkflowPrompt: '/build Tạo workflow nhận Lead khách hàng, chấm điểm bằng AI Agent Opencode2, rẽ nhánh bằng nút If và đồng bộ khách VIP vào CRM HubSpot + thông báo Telegram',
  },
  {
    id: 'prompt_core_scraper',
    nodeType: 'vince.scraper',
    canonicalName: 'Vince Web Scraper (Cào dữ liệu Web)',
    category: 'flow_core',
    categoryLabel: '4. Flow & Core',
    command: '/add Vince Web Scraper',
    defaultParamsSummary: '{ url: "https://news.ycombinator.com", selector: ".titleline > a" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Vince Web Scraper" (type="vince.scraper") để trích xuất nội dung HTML/CSS Selector từ bất kỳ trang web nào.',
    autoWorkflowPrompt: '/build Tạo workflow chạy mỗi sáng bằng Schedule Trigger, cào dữ liệu bằng Vince Web Scraper, lọc tin bằng Filter, phân tích xu hướng bằng AI Agent Opencode2 và gửi báo cáo về Telegram + Google Sheets',
  },

  // ============================================================================
  // 5. AI AGENT & MULTI-AGENT NODES (OPENCODE2 CROUTON-ALPHA-FREE)
  // ============================================================================
  {
    id: 'prompt_ai_opencode2_router',
    nodeType: 'vince.modelRouter',
    canonicalName: 'AI Agent Opencode2 (crouton-alpha-free)',
    category: 'ai_agent',
    categoryLabel: '5. AI Agent (Opencode2)',
    command: '/add AI Agent Opencode2',
    defaultParamsSummary: '{ provider: "Opencode2", model: "crouton-alpha-free", baseUrl: "https://opencode.ai/zen/v1" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "AI Agent Opencode2 (crouton-alpha-free)" (type="vince.modelRouter", provider="Opencode2", model="crouton-alpha-free", baseUrl="https://opencode.ai/zen/v1") để phân tích, tóm tắt, trích xuất JSON và suy luận tự động.',
    autoWorkflowPrompt: '/build Tạo workflow sử dụng AI Agent Opencode2 (crouton-alpha-free) nhận dữ liệu từ Webhook, chuẩn hóa bằng Edit Fields (Set), suy luận phương án xử lý, lưu vào Google Sheets và gửi thông báo Telegram',
  },
  {
    id: 'prompt_ai_multi_agent_supervisor',
    nodeType: 'vince.agentManager',
    canonicalName: 'Vince Multi-Agent Supervisor (Opencode2)',
    category: 'ai_agent',
    categoryLabel: '5. AI Agent (Opencode2)',
    command: '/add Vince Multi-Agent Supervisor',
    defaultParamsSummary: '{ provider: "Opencode2", model: "crouton-alpha-free", agentRole: "supervisor" }',
    nodeTrainingPrompt: 'Sử dụng nút chuẩn "Vince Multi-Agent Supervisor" (type="vince.agentManager", provider="Opencode2", model="crouton-alpha-free") để điều phối tổ hợp Planner, Researcher, Critic và Executor.',
    autoWorkflowPrompt: '/build Tạo pipeline Multi-Agent với Vince Multi-Agent Supervisor (Opencode2 crouton-alpha-free): nhận yêu cầu nghiên cứu thị trường, cào dữ liệu bằng Vince Web Scraper, điều phối Planner & Critic đánh giá và xuất báo cáo lên Notion + Telegram',
  },
];

export interface IPrebuiltWorkflowPrompt {
  id: string;
  title: string;
  category: string;
  nodesCount: number;
  nodeNames: string[];
  prompt: string;
}

/**
 * Kho Prompt Dựng Sẵn Cho AI Agent (Opencode2 - crouton-alpha-free) Để Tạo Workflow Tự Động 1-Click
 */
export const PREBUILT_AGENT_WORKFLOW_PROMPTS: IPrebuiltWorkflowPrompt[] = [
  {
    id: 'wf_prompt_social_tiktok_threads',
    title: '1. Tự động Sáng tạo & Đăng chéo lên TikTok, Meta Threads, Instagram Reels & YouTube Shorts',
    category: 'Mạng xã hội (TikTok & Threads)',
    nodesCount: 7,
    nodeNames: [
      'Schedule Trigger (9:00 AM)',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'TikTok: Publish Direct Video',
      'Threads: Publish Text/Media Post',
      'Instagram: Publish Reel',
      'YouTube: Upload Shorts',
      'Telegram: Send Message',
    ],
    prompt:
      '/build Lên lịch tự động mỗi ngày, dùng AI Agent Opencode2 (crouton-alpha-free) sáng tạo kịch bản, caption và hashtag xu hướng, đăng đồng loạt lên TikTok: Publish Direct Video, Threads: Publish Text Post, Instagram: Publish Reel và YouTube Shorts, lưu lịch đăng vào Google Sheets và báo về Telegram',
  },
  {
    id: 'wf_prompt_ecom_shopee',
    title: '1. Tự động xử lý Đơn hàng Shopee / TikTok Shop + Zalo ZNS + Google Sheets',
    category: 'TMĐT & Bán lẻ',
    nodesCount: 6,
    nodeNames: [
      'E-commerce Trigger [T/W]',
      'Shopee: Get Order Detail',
      'Filter (Lọc đơn hợp lệ)',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'Google Sheets: Append Row',
      'Zalo OA: Send ZNS + Telegram',
    ],
    prompt:
      '/build Khi có đơn hàng mới trên Shopee hoặc TikTok Shop, tự động lấy chi tiết đơn hàng, lọc đơn hợp lệ bằng Filter, dùng AI Agent Opencode2 (crouton-alpha-free) phân tích ghi chú khách hàng, lưu vào Google Sheets, gửi thông báo Zalo ZNS và báo về Telegram',
  },
  {
    id: 'wf_prompt_cskh_omnichannel',
    title: '2. AI Agent Opencode2 CSKH Đa kênh (Chat / Telegram / Zalo) + Lưu CRM',
    category: 'CSKH & Hội thoại AI',
    nodesCount: 5,
    nodeNames: [
      'Chat Trigger [T/W]',
      'Edit Fields (Set)',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'CRM HubSpot: Upsert Contact',
      'Telegram: Send Message',
    ],
    prompt:
      '/build Tạo workflow CSKH tự động khi khách nhắn tin qua Chat Trigger, chuẩn hóa thông tin bằng Edit Fields (Set), dùng AI Agent Opencode2 (crouton-alpha-free) tư vấn và phân loại nhu cầu, đồng bộ vào CRM HubSpot và gửi cảnh báo về Telegram',
  },
  {
    id: 'wf_prompt_payment_vietqr_momo',
    title: '3. Tự động Đối soát Thanh toán VietQR / MoMo + Xuất Hóa đơn Gmail & Sheets',
    category: 'Tài chính & Thanh toán',
    nodesCount: 5,
    nodeNames: [
      'Payment Webhook Trigger [T/W]',
      'Edit Fields (Set)',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'Google Sheets: Append or Update Row',
      'Gmail: Send Email + Telegram',
    ],
    prompt:
      '/build Khi nhận callback giao dịch thành công từ Payment Webhook Trigger (MoMo / VietQR), chuẩn hóa dữ liệu bằng Edit Fields (Set), đối soát tự động bằng AI Agent Opencode2 (crouton-alpha-free), ghi sổ Google Sheets, gửi email biên lai qua Gmail và thông báo Telegram',
  },
  {
    id: 'wf_prompt_news_scraper_notion',
    title: '4. Cào Tin tức mỗi sáng + AI Opencode2 Tóm tắt + Lưu Notion & Google Sheets',
    category: 'Nghiên cứu & Nội dung',
    nodesCount: 6,
    nodeNames: [
      'Schedule Trigger (8:00 AM)',
      'Vince Web Scraper',
      'Remove Duplicates',
      'Vince Multi-Agent Supervisor (Opencode2)',
      'Notion: Create Page',
      'Telegram: Send Message',
    ],
    prompt:
      '/build Lên lịch 8:00 sáng mỗi ngày bằng Schedule Trigger, dùng Vince Web Scraper cào tin tức công nghệ mới, khử trùng lặp bằng Remove Duplicates, điều phối Multi-Agent Supervisor (Opencode2 crouton-alpha-free) tóm tắt chuyên sâu, lưu vào Notion + Google Sheets và gửi báo cáo qua Telegram',
  },
  {
    id: 'wf_prompt_lead_form_ms365',
    title: '5. Thu thập Lead từ Biểu mẫu + Chấm điểm AI + Đồng bộ Microsoft 365 & Calendar',
    category: 'Google & Microsoft 365',
    nodesCount: 6,
    nodeNames: [
      'Form Trigger [T/W]',
      'Edit Fields (Set)',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'Google Calendar: Create Event',
      'Microsoft 365 (Excel & Teams)',
      'Gmail: Send Email',
    ],
    prompt:
      '/build Khi khách hàng điền biểu mẫu đăng ký qua Form Trigger, chuẩn hóa bằng Edit Fields (Set), dùng AI Agent Opencode2 (crouton-alpha-free) chấm điểm Lead, tự động đặt lịch hẹn trên Google Calendar, đồng bộ vào Microsoft 365 (Excel & Teams) và gửi email xác nhận qua Gmail',
  },
  {
    id: 'wf_prompt_db_cdc_devops',
    title: '6. Giám sát Database PostgreSQL / Supabase + AI Phân tích + Cảnh báo Slack & Discord',
    category: 'Database & DevOps',
    nodesCount: 5,
    nodeNames: [
      'Database Trigger [T/P]',
      'Filter',
      'AI Agent Opencode2 (crouton-alpha-free)',
      'Database: Execute Query',
      'Slack + Discord + Telegram',
    ],
    prompt:
      '/build Khi có bản ghi mới trong PostgreSQL / Supabase qua Database Trigger, lọc điều kiện bằng Filter, phân tích bất thường bằng AI Agent Opencode2 (crouton-alpha-free), cập nhật trạng thái vào Database và bắn cảnh báo tức thời qua Slack, Discord và Telegram',
  },
];
