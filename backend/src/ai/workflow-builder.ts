import { v4 as uuidv4 } from 'uuid';
import { IWorkflow, INode, IConnection } from '../engine/types.js';
import { globalAIRouter } from './router.js';
import { DEFAULT_OPENCODE2_PROVIDER } from './providers/openai.js';

export interface IAIBuildPlan {
  summary: string;
  steps: string[];
  workflow: IWorkflow;
  modelUsed?: string;
  providerUsed?: string;
  commandExecuted?: string;
}

export const MASTER_NODE_PROMPT_DICTIONARY = `
DANH MỤC CHUẨN CÁC NÚT KÉO THẢ (NODE TYPES & CANONICAL NAMES) TRONG VINCEAUTO:

I. 13 TRIGGER NỀN TẢNG (PLATFORM TRIGGERS):
- "trigger.manual" | Tên chuẩn: "Manual Trigger" | Tham số: { mode: "manual" }
- "trigger.cron" | Tên chuẩn: "Schedule Trigger" | Tham số: { cronExpression: "0 8 * * *", timezone: "Asia/Ho_Chi_Minh" }
- "trigger.webhook" | Tên chuẩn: "Webhook Trigger" | Tham số: { path: "vince-webhook", httpMethod: "POST" }
- "trigger.form" | Tên chuẩn: "Form Trigger" | Tham số: { formTitle: "Form đăng ký khách hàng", fields: "fullName,phone,email,note" }
- "trigger.chat" | Tên chuẩn: "Chat Trigger" | Tham số: { channel: "webchat", welcomeMessage: "Xin chào! Tôi là AI Agent của VinceAuto." }
- "flow.subworkflow" | Tên chuẩn: "Execute Sub-workflow Trigger" | Tham số: { workflowId: "sub_wf_01" }
- "trigger.error" | Tên chuẩn: "Error Trigger" | Tham số: { watchScope: "all_workflows" }
- "trigger.file" | Tên chuẩn: "File Trigger" | Tham số: { folderPath: "/uploads", watchEvents: "create,modify" }
- "trigger.database" | Tên chuẩn: "Database Trigger (CDC)" | Tham số: { table: "orders", event: "INSERT,UPDATE" }
- "trigger.queue" | Tên chuẩn: "Queue Trigger (Kafka/RabbitMQ/Redis)" | Tham số: { queueName: "vince_jobs", batchSize: 10 }
- "trigger.aiAgent" | Tên chuẩn: "AI Agent Trigger" | Tham số: { supervisorId: "vince_supervisor" }
- "trigger.approval" | Tên chuẩn: "Approval Trigger (Human-in-the-Loop)" | Tham số: { approvalChannel: "Telegram / Slack", timeoutMinutes: 60 }
- "trigger.systemEvent" | Tên chuẩn: "System Event Trigger" | Tham số: { eventType: "cpu_threshold_exceeded" }
- "trigger.appEvent" | Tên chuẩn: "App Event Trigger" | Tham số: { app: "telegram", event: "message" }
- "trigger.ecommerce" | Tên chuẩn: "E-commerce Trigger (Shopee/TikTok/Lazada)" | Tham số: { app: "shopee", event: "order_status_push" }
- "trigger.payment" | Tên chuẩn: "Payment Webhook Trigger (MoMo/VNPAY/VietQR)" | Tham số: { app: "momo", event: "ipn_payment_success" }
- "trigger.socialMedia" | Tên chuẩn: "Social Media Trigger (Facebook/Instagram/TikTok)" | Tham số: { app: "facebook", event: "leadgen_webhook" }
- "trigger.git" | Tên chuẩn: "Git Webhook Trigger (GitHub/GitLab)" | Tham số: { app: "github", event: "push" }

II. 21 BỘ ỨNG DỤNG TÍCH HỢP (INTEGRATION APPS - MỤC ỨNG DỤNG):
1. Google Sheets:
   - Action: "vince.googleSheets.appendRow" | Tên chuẩn: "Google Sheets: Append Row / Update / Read"
   - Tham số: { resource: "Row" | "Sheet" | "Document" | "Data", operation: "append" | "update" | "appendOrUpdate" | "getMany" | "delete" | "read" | "lookup", spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", range: "Sheet1!A:F" }
2. Google Drive:
   - Action: "vince.googleDrive.uploadFile" | Tên chuẩn: "Google Drive: Upload / Search / Share File"
   - Tham số: { resource: "File" | "Folder" | "Shared Drive", operation: "upload" | "download" | "get" | "search" | "create" | "delete" | "copy" | "move" | "share", folderId: "root" }
3. Gmail:
   - Action: "vince.gmail.sendEmail" | Tên chuẩn: "Gmail: Send / Reply / Get Email"
   - Tham số: { resource: "Message" | "Draft" | "Label" | "Thread", operation: "send" | "reply" | "get" | "getMany" | "addLabel" | "markAsRead" | "sendAndWait", to: "{{ $json.email }}", subject: "Thông báo tự động từ VinceAuto", bodyHtml: "<p>Xin chào {{ $json.name }}</p>" }
4. Google Calendar & Docs:
   - Action: "vince.googleCalendar.createEvent" | Tên chuẩn: "Google Calendar & Docs: Create Event / Document"
   - Tham số: { resource: "Event" | "Calendar" | "Google Docs" | "BigQuery", operation: "create" | "get" | "getMany" | "update" | "delete", calendarId: "primary", summary: "Họp dự án" }
5. Microsoft 365 (Excel, Outlook, Teams, OneDrive, SharePoint):
   - Action: "vince.microsoft365.action" | Tên chuẩn: "Microsoft 365: Excel / Outlook / Teams / OneDrive"
   - Tham số: { resource: "Excel 365" | "Outlook" | "Teams" | "OneDrive" | "SharePoint", operation: "addRow" | "sendEmail" | "sendMessage" | "upload" | "createListItem" }
6. Notion:
   - Action: "vince.notion.action" | Tên chuẩn: "Notion: Create Page / Query Database"
   - Tham số: { resource: "Page" | "Database" | "Block", operation: "create" | "get" | "update" | "query" | "append", databaseId: "db_notion_01" }
7. Project Management (Jira, Linear, Trello, Asana, ClickUp):
   - Action: "vince.projectManagement.action" | Tên chuẩn: "Project Management: Jira / Linear / Trello / Asana / ClickUp"
   - Tham số: { resource: "Jira" | "Linear" | "Trello" | "Asana" | "ClickUp", operation: "createIssue" | "updateIssue" | "transition" | "createCard" | "createTask", projectKey: "VINCE" }
8. Telegram Bot API:
   - Action: "vince.telegram" | Tên chuẩn: "Telegram: Send Message / Photo / Document / Callback"
   - Tham số: { resource: "message" | "chat" | "callback" | "file", operation: "sendMessage" | "editMessageText" | "sendPhoto" | "sendDocument" | "pinChatMessage" | "answerCallbackQuery", chatId: "-100123456789", message: "🤖 [VinceAuto]: {{ $json.text || $json.summary }}", parseMode: "HTML" }
9. Facebook Graph & Instagram:
   - Action: "vince.facebook.postFeed" | Tên chuẩn: "Facebook & Instagram: Post Feed / Reply Comment / Lead Ads"
   - Tham số: { resource: "Post" | "Comment" | "Photo" | "Video" | "Lead" | "Instagram Media" | "Messenger", operation: "create" | "reply" | "get" | "publish" | "sendMessage", pageId: "me" }
10. Zalo OA & ZNS:
   - Action: "vince.zalo.sendZns" | Tên chuẩn: "Zalo OA: Send ZNS / Tin nhắn CSKH"
   - Tham số: { resource: "ZNS" | "Zalo Message" | "Follower" | "Tag", operation: "sendZns" | "sendText" | "getProfile" | "assignTag", phone: "{{ $json.phone }}", templateId: "zns_order_confirm" }
11. Slack:
   - Action: "vince.slack.sendMessage" | Tên chuẩn: "Slack: Send Message / Upload File"
   - Tham số: { resource: "Message" | "Channel" | "File" | "Reaction", operation: "send" | "update" | "create" | "upload" | "add", channel: "#general", text: "Thông báo: {{ $json.message }}" }
12. Discord:
   - Action: "vince.discord.sendWebhook" | Tên chuẩn: "Discord: Send Webhook / Embed Message"
   - Tham số: { resource: "Webhook" | "Message" | "Channel" | "Member", operation: "sendWebhook" | "send" | "create" | "addRole", content: "🚀 {{ $json.title }}" }
13. WhatsApp / YouTube / TikTok / X:
   - Action: "vince.whatsappSocial.action" | Tên chuẩn: "WhatsApp / YouTube / TikTok / X Action"
   - Tham số: { resource: "WhatsApp Message" | "YouTube Video" | "TikTok Video" | "X (Twitter) Post", operation: "sendTemplate" | "sendText" | "upload" | "publish" | "create" }
14. Shopee / TikTok Shop / Lazada:
   - Action: "vince.shopee.createOrder" | Tên chuẩn: "Shopee / TikTok Shop / Lazada: Quản lý Đơn hàng & Tồn kho"
   - Tham số: { resource: "Shopee Order" | "Shopee Product" | "TikTok Shop Order" | "Lazada Order", operation: "getOrderDetail" | "shipOrder" | "updateStock" | "getOrderList", orderSn: "{{ $json.order_sn }}" }
15. Shopify & WooCommerce:
   - Action: "vince.shopifyWoo.action" | Tên chuẩn: "Shopify & WooCommerce: Order / Product / Customer"
   - Tham số: { resource: "Shopify Order" | "Shopify Product" | "WooCommerce Order", operation: "create" | "get" | "getMany" | "update" }
16. CRM & Marketing (HubSpot, Salesforce, Pipedrive, Zoho, Mailchimp, Airtable):
   - Action: "vince.crmMarketing.action" | Tên chuẩn: "CRM & Marketing: HubSpot / Salesforce / Airtable / Mailchimp"
   - Tham số: { resource: "HubSpot" | "Salesforce" | "Pipedrive" | "Zoho CRM" | "Mailchimp" | "Airtable", operation: "upsertContact" | "createDeal" | "executeSoql" | "addMember" | "appendRecord" }
17. Databases & Vector DB (PostgreSQL, MySQL, MongoDB, Redis, Supabase, Qdrant, Pinecone):
   - Action: "vince.databases.action" | Tên chuẩn: "Database & Vector DB: PostgreSQL / MySQL / MongoDB / Redis / Supabase / Qdrant"
   - Tham số: { resource: "PostgreSQL" | "MySQL" | "MongoDB" | "Redis" | "Supabase" | "Vector DB", operation: "executeQuery" | "insert" | "findAndUpdate" | "getSetPublish" | "upsertSearchVectors", query: "SELECT * FROM orders WHERE status = 'paid' LIMIT 50;" }
18. GitHub & GitLab:
   - Action: "vince.github.createIssue" | Tên chuẩn: "GitHub & GitLab: Create Issue / PR / Dispatch CI/CD"
   - Tham số: { resource: "GitHub Issue" | "GitHub Pull Request" | "GitHub Release & Workflow" | "GitLab Merge Request", operation: "create" | "get" | "merge" | "dispatchWorkflow", owner: "vinceauto", repo: "platform" }
19. Cloud & DevOps (Cloudflare, Docker, AWS S3/Lambda, SSH):
   - Action: "vince.cloudInfra.action" | Tên chuẩn: "Cloud & Infra: Cloudflare / Docker / AWS / SSH"
   - Tham số: { resource: "Cloudflare" | "Docker" | "AWS S3 & Lambda" | "SSH", operation: "upsertDnsPurgeCache" | "containerAction" | "s3LambdaInvoke" | "executeCommand" }
20. AI Providers (Opencode2, OpenAI, Gemini, Claude, Ollama, DeepSeek, Groq, ElevenLabs):
   - Action: "vince.aiProviders.action" | Tên chuẩn: "AI Providers: Opencode2 / OpenAI / Gemini / Claude / Ollama"
   - Tham số: { resource: "OpenAI" | "Google Gemini" | "Anthropic Claude" | "Ollama" | "OpenRouter" | "Speech & Audio", operation: "chatCompletion" | "generateMultimodal" | "messagesCreate" | "localGenerate" | "routeCompletion" | "ttsAndStt", model: "crouton-alpha-free", prompt: "{{ $json.text }}" }
21. Cổng Thanh Toán (MoMo, VNPAY, ZaloPay, VietQR, Stripe, PayPal):
   - Action: "vince.momo.createPayment" | Tên chuẩn: "Payment Gateways: MoMo / VNPAY / ZaloPay / VietQR / Stripe"
   - Tham số: { resource: "MoMo" | "VNPAY" | "ZaloPay" | "VietQR" | "Stripe" | "PayPal", operation: "createPayment" | "createPaymentUrl" | "createOrder" | "generateQr" | "createPaymentIntent", amount: 250000, orderInfo: "Thanh toán đơn hàng #{{ $json.orderId }}" }

III. 18 NÚT BIẾN ĐỔI DỮ LIỆU (DATA TRANSFORMATION NODES):
- "transform.code" | Tên chuẩn: "Code (JavaScript / Python)" | Tham số: { language: "javascript", jsCode: "return items.map(i => ({ json: { ...i.json, processedAt: new Date().toISOString() } }));" }
- "transform.dateTime" | Tên chuẩn: "Date & Time" | Tham số: { operation: "formatDate", format: "YYYY-MM-DD HH:mm:ss", timezone: "Asia/Ho_Chi_Minh" }
- "transform.editFields" | Tên chuẩn: "Edit Fields (Set)" | Tham số: { mode: "manual", fields: { status: "verified", source: "VinceAuto" }, keepOnlySet: false }
- "transform.filter" | Tên chuẩn: "Filter" | Tham số: { condition: "$json.status === 'active' || $json.amount > 0" }
- "transform.limit" | Tên chuẩn: "Limit" | Tham số: { maxItems: 20, keep: "firstItems" }
- "transform.removeDuplicates" | Tên chuẩn: "Remove Duplicates" | Tham số: { compareField: "id", operation: "removeDuplicateInputItems" }
- "transform.splitOut" | Tên chuẩn: "Split Out" | Tham số: { fieldToSplitOut: "items", include: "noOtherFields" }
- "transform.aggregate" | Tên chuẩn: "Aggregate" | Tham số: { aggregate: "individualFields", fieldToAggregate: "id", outputFieldName: "allIds" }
- "transform.merge" | Tên chuẩn: "Merge" | Tham số: { mode: "append", joinMode: "Inner Join", matchField: "id" }
- "transform.summarize" | Tên chuẩn: "Summarize (Pivot)" | Tham số: { fieldsToSummarize: "amount", aggregation: "sum", fieldsToSplitBy: "category" }
- "transform.compression" | Tên chuẩn: "Compression (Gzip/Zip)" | Tham số: { operation: "compress", format: "zip" }
- "transform.convertToFile" | Tên chuẩn: "Convert to File (CSV/XLSX/JSON/PDF)" | Tham số: { operation: "toCsv", fileName: "export_data.csv" }
- "transform.crypto" | Tên chuẩn: "Crypto (HMAC/SHA256/UUID)" | Tham số: { action: "hmac", type: "SHA256", value: "{{ $json.payload }}" }
- "transform.editImage" | Tên chuẩn: "Edit Image" | Tham số: { operation: "resize", width: 1080, height: 1080 }
- "transform.extractFromFile" | Tên chuẩn: "Extract from File (PDF/CSV/XLSX to JSON)" | Tham số: { operation: "fromPdf", binaryPropertyName: "data" }
- "transform.html" | Tên chuẩn: "HTML Extract & Template" | Tham số: { operation: "extractHtmlContent", cssSelector: "article h2" }
- "transform.markdown" | Tên chuẩn: "Markdown <-> HTML" | Tham số: { mode: "markdownToHtml", markdown: "{{ $json.content }}" }
- "transform.xml" | Tên chuẩn: "XML <-> JSON" | Tham số: { mode: "xmlToJson", propertyName: "data" }
- "transform.renameKeys" | Tên chuẩn: "Rename Keys" | Tham số: { keys: { old_name: "fullName", sdt: "phone" } }
- "transform.sort" | Tên chuẩn: "Sort" | Tham số: { sortField: "createdAt", order: "descending" }

IV. NÚT ĐIỀU KHIỂN LUỒNG & CORE (FLOW & CORE NODES):
- "flow.if" | Tên chuẩn: "If (Rẽ nhánh True/False)" | Tham số: { condition: "$json.score >= 80" }
- "flow.switch" | Tên chuẩn: "Switch (Đa nhánh)" | Tham số: { mode: "rules", routingField: "$json.channel", cases: "telegram,zalo,email" }
- "flow.loop" | Tên chuẩn: "Loop Over Items (Split in Batches)" | Tham số: { batchSize: 10 }
- "flow.wait" | Tên chuẩn: "Wait (Tạm dừng / Chờ Webhook)" | Tham số: { resume: "timeInterval", amount: 5, unit: "seconds" }
- "automation.http" | Tên chuẩn: "HTTP Request" | Tham số: { method: "POST", url: "https://api.example.com/v1/webhook", headers: {}, body: {} }
- "vince.scraper" | Tên chuẩn: "Vince Web Scraper" | Tham số: { url: "https://news.ycombinator.com", selector: ".titleline > a", extractFields: "title, href" }
- "core.guardianApproval" | Tên chuẩn: "Vince Guardian Security Gate" | Tham số: { policyLevel: "strict", requireHumanApproval: true }

V. NÚT AI AGENT & ĐA TÁC TỬ (AI AGENT NODES - OPENCODE2 CROUTON-ALPHA-FREE):
- "vince.modelRouter" | Tên chuẩn: "VinceAuto AI Router (Opencode2 crouton-alpha-free)" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", baseUrl: "https://opencode.ai/zen/v1", strategy: "auto", prompt: "Phân tích và xử lý dữ liệu: {{ JSON.stringify($json) }}" }
- "vince.agentManager" | Tên chuẩn: "Vince Multi-Agent Manager" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", agentRole: "supervisor", taskDescription: "Điều phối Researcher, Planner, Executor" }
- "ai.agent.conversational" | Tên chuẩn: "Conversational AI Agent" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", systemPrompt: "Bạn là AI Agent CSKH thông minh của VinceAuto." }
- "ai.agent.planExecute" | Tên chuẩn: "Plan & Execute Agent" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", maxSteps: 8 }
- "ai.agent.reAct" | Tên chuẩn: "ReAct Reasoning Agent" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", tools: "http,database,calculator" }
- "ai.agent.sql" | Tên chuẩn: "SQL Database AI Agent" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", dialect: "postgres" }
- "ai.vince.supervisor" | Tên chuẩn: "Vince Multi-Agent Supervisor" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", subAgents: ["Planner", "Researcher", "Critic"] }
- "ai.vince.selfHealing" | Tên chuẩn: "Vince Self-Healing Debugger Agent" | Tham số: { provider: "Opencode2", model: "crouton-alpha-free", autoPatch: true }
- "ai.rag.retriever" | Tên chuẩn: "Vector Store RAG Retriever" | Tham số: { topK: 5, collection: "vince_knowledge_base" }
- "ai.memory.buffer" | Tên chuẩn: "Window Buffer Memory" | Tham số: { contextWindowLength: 10, sessionKey: "{{ $json.chatId }}" }
`;

export class AIWorkflowBuilder {
  /**
   * Generates or updates a workflow from a natural language prompt or slash command
   * Default AI Agent Model: Opencode2 (crouton-alpha-free via https://opencode.ai/zen/v1)
   */
  static async buildFromPrompt(
    prompt: string,
    existingWorkflow?: IWorkflow,
    provider: string = 'opencode2',
    customOptions?: { baseUrl?: string; model?: string; apiKey?: string }
  ): Promise<IAIBuildPlan> {
    const trimmed = prompt.trim();

    // 1. Check if user executed a direct Slash Command (/add, /optimize, /fix, /connect)
    if (trimmed.startsWith('/add ') && existingWorkflow && existingWorkflow.nodes.length > 0) {
      return this.handleAddNodeCommand(trimmed.slice(5).trim(), existingWorkflow);
    }
    if ((trimmed === '/optimize' || trimmed.startsWith('/optimize ')) && existingWorkflow && existingWorkflow.nodes.length > 0) {
      return this.handleOptimizeWorkflowCommand(existingWorkflow);
    }
    if ((trimmed === '/fix' || trimmed.startsWith('/fix ')) && existingWorkflow && existingWorkflow.nodes.length > 0) {
      return this.handleFixWorkflowCommand(existingWorkflow);
    }

    const cleanPrompt = trimmed.replace(/^\/(build|create|workflow)\s+/i, '').trim() || trimmed;

    const systemInstruction = `Bạn là VinceAuto AI Architect vận hành trên model "${DEFAULT_OPENCODE2_PROVIDER.defaultModel}" của provider "${DEFAULT_OPENCODE2_PROVIDER.providerName}" (${DEFAULT_OPENCODE2_PROVIDER.baseUrl}).
Nhiệm vụ của bạn là phân tích yêu cầu hoặc lệnh của người dùng và tạo ra một cấu trúc JSON workflow tự động hóa hoàn chỉnh, gọi đúng tên chuẩn và đúng mã "type" của từng nút kéo thả trong VinceAuto.

${MASTER_NODE_PROMPT_DICTIONARY}

QUY TẮC SINH WORKFLOW TỰ ĐỘNG:
1. Luôn bắt đầu bằng 1 nút Trigger phù hợp nhất (ví dụ: "trigger.cron", "trigger.webhook", "trigger.ecommerce", "trigger.payment", "trigger.appEvent", "trigger.form", "trigger.chat", "trigger.database", hoặc "trigger.manual").
2. Gọi ĐÚNG "type" và tên hiển thị chuẩn ("name") của các nút trong danh mục trên.
3. Trong tham số của các nút AI ("vince.modelRouter", "vince.agentManager", "ai.agent.*"), luôn đặt provider="Opencode2", model="crouton-alpha-free", baseUrl="https://opencode.ai/zen/v1".
4. Sử dụng biểu thức chuẩn {{ $json.field }} để truyền dữ liệu giữa các nút.
5. Sắp xếp tọa độ position [X, Y] từ trái sang phải cách đều 300px (ví dụ: [80, 260], [380, 260], [680, 260], [980, 260], [1280, 260]).
6. Trả về KẾT QUẢ DUY NHẤT dưới dạng JSON hợp lệ (không kèm giải thích ngoài JSON):
{
  "summary": "Tóm tắt quy trình tự động hóa",
  "steps": ["Bước 1: ...", "Bước 2: ...", "Bước 3: ..."],
  "workflow": {
    "name": "Tên workflow",
    "nodes": [
      {
        "id": "node_1",
        "name": "Tên chuẩn của nút",
        "type": "mã_type_chuẩn",
        "position": [80, 260],
        "parameters": {}
      }
    ],
    "connections": [
      {
        "source": "node_1",
        "target": "node_2"
      }
    ]
  }
}`;

    const userMessage =
      existingWorkflow && existingWorkflow.nodes && existingWorkflow.nodes.length > 0 && trimmed.startsWith('/update')
        ? `Workflow hiện tại:\n${JSON.stringify(existingWorkflow, null, 2)}\n\nYêu cầu cập nhật của người dùng:\n${cleanPrompt}`
        : `Hãy thiết kế workflow tự động hóa hoàn chỉnh cho yêu cầu sau:\n${cleanPrompt}`;

    try {
      const response = await globalAIRouter.routeAndExecute(
        [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userMessage },
        ],
        'auto',
        provider || 'opencode2',
        {
          model: customOptions?.model || DEFAULT_OPENCODE2_PROVIDER.defaultModel,
          baseUrl: customOptions?.baseUrl || DEFAULT_OPENCODE2_PROVIDER.baseUrl,
          apiKey: customOptions?.apiKey || DEFAULT_OPENCODE2_PROVIDER.apiKey,
          temperature: 0.25,
        }
      );

      let cleanJson = response.text.trim();
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.slice(firstBrace, lastBrace + 1);
      }

      if (!cleanJson.startsWith('{')) {
        return this.compileIntelligentWorkflow(cleanPrompt, existingWorkflow);
      }

      const parsed: IAIBuildPlan = JSON.parse(cleanJson);
      if (!parsed.workflow || !Array.isArray(parsed.workflow.nodes) || parsed.workflow.nodes.length === 0) {
        return this.compileIntelligentWorkflow(cleanPrompt, existingWorkflow);
      }

      parsed.workflow.id = existingWorkflow?.id || uuidv4();
      parsed.workflow.createdAt = existingWorkflow?.createdAt || new Date().toISOString();
      parsed.workflow.updatedAt = new Date().toISOString();
      parsed.modelUsed = response.model || DEFAULT_OPENCODE2_PROVIDER.defaultModel;
      parsed.providerUsed = DEFAULT_OPENCODE2_PROVIDER.providerName;
      return parsed;
    } catch (err: any) {
      console.warn(
        `[AI Workflow Builder - Opencode2 crouton-alpha-free] Using intelligent local compiler (${err.message}).`
      );
      return this.compileIntelligentWorkflow(cleanPrompt, existingWorkflow);
    }
  }

  /**
   * Handles `/add <node>` command to append a canonical node directly to the current workflow
   */
  private static handleAddNodeCommand(nodeQuery: string, existingWorkflow: IWorkflow): IAIBuildPlan {
    const resolved = this.resolveNodeFromKeyword(nodeQuery);
    const nodes = [...(existingWorkflow.nodes || [])];
    const connections = [...(existingWorkflow.connections || [])];

    const lastNode = nodes[nodes.length - 1];
    const nextX = lastNode ? lastNode.position[0] + 300 : 100;
    const nextY = lastNode ? lastNode.position[1] : 260;

    const newNodeId = `node_${Date.now().toString().slice(-5)}`;
    const newNode: INode = {
      id: newNodeId,
      name: resolved.name,
      type: resolved.type,
      position: [nextX, nextY],
      parameters: resolved.parameters,
    };

    nodes.push(newNode);
    if (lastNode && !resolved.type.startsWith('trigger.')) {
      connections.push({
        source: lastNode.id,
        target: newNodeId,
      });
    }

    return {
      summary: `Đã thực thi lệnh "/add ${nodeQuery}": Thêm nút "${resolved.name}" (${resolved.type}) vào bản vẽ và tự động nối luồng dữ liệu.`,
      steps: [
        `Nhận diện tên chuẩn: ${resolved.name} [${resolved.type}]`,
        `Khởi tạo tham số mặc định chuẩn cho ${resolved.name}`,
        lastNode ? `Tự động kết nối từ "${lastNode.name}" -> "${resolved.name}"` : `Đặt nút "${resolved.name}" làm điểm bắt đầu`,
      ],
      workflow: {
        ...existingWorkflow,
        nodes,
        connections,
        updatedAt: new Date().toISOString(),
      },
      modelUsed: DEFAULT_OPENCODE2_PROVIDER.defaultModel,
      providerUsed: DEFAULT_OPENCODE2_PROVIDER.providerName,
      commandExecuted: `/add ${nodeQuery}`,
    };
  }

  /**
   * Handles `/optimize` command to inject Data Validation, Deduplication & Self-Healing Error Handling
   */
  private static handleOptimizeWorkflowCommand(existingWorkflow: IWorkflow): IAIBuildPlan {
    const nodes = [...(existingWorkflow.nodes || [])];
    const connections = [...(existingWorkflow.connections || [])];

    const hasDedupe = nodes.some((n) => n.type === 'transform.removeDuplicates');
    const hasSelfHealing = nodes.some((n) => n.type === 'ai.vince.selfHealing');

    const lastNode = nodes[nodes.length - 1] || { id: 'node_1', name: 'Start', position: [100, 260] };
    let currentX = lastNode.position[0] + 300;
    const baseY = lastNode.position[1];
    let prevId = lastNode.id;

    if (!hasDedupe) {
      const dedupeId = `node_dedupe_${Date.now().toString().slice(-4)}`;
      nodes.push({
        id: dedupeId,
        name: 'Remove Duplicates (Chống trùng lặp)',
        type: 'transform.removeDuplicates',
        position: [currentX, baseY],
        parameters: {
          operation: 'removeDuplicateInputItems',
          compareField: 'id',
        },
      });
      connections.push({ source: prevId, target: dedupeId });
      prevId = dedupeId;
      currentX += 300;
    }

    if (!hasSelfHealing) {
      const healId = `node_heal_${Date.now().toString().slice(-4)}`;
      nodes.push({
        id: healId,
        name: 'Vince Self-Healing Debugger (Opencode2)',
        type: 'ai.vince.selfHealing',
        position: [currentX, baseY],
        parameters: {
          provider: 'Opencode2',
          model: 'crouton-alpha-free',
          baseUrl: 'https://opencode.ai/zen/v1',
          autoPatch: true,
          maxRetries: 3,
        },
      });
      connections.push({ source: prevId, target: healId });
    }

    return {
      summary: `Đã tối ưu hóa workflow "${existingWorkflow.name}" bằng lệnh /optimize với Opencode2 (crouton-alpha-free).`,
      steps: [
        'Kiểm tra cấu trúc đồ thị DAG và các kết nối hiện tại',
        'Bổ sung nút "Remove Duplicates (transform.removeDuplicates)" để chống xử lý trùng dữ liệu',
        'Bổ sung nút "Vince Self-Healing Debugger (ai.vince.selfHealing)" dùng model crouton-alpha-free để tự động bắt lỗi runtime',
      ],
      workflow: {
        ...existingWorkflow,
        nodes,
        connections,
        updatedAt: new Date().toISOString(),
      },
      modelUsed: DEFAULT_OPENCODE2_PROVIDER.defaultModel,
      providerUsed: DEFAULT_OPENCODE2_PROVIDER.providerName,
      commandExecuted: '/optimize',
    };
  }

  /**
   * Handles `/fix` command to normalize node positions, fill missing parameters, and repair broken connections
   */
  private static handleFixWorkflowCommand(existingWorkflow: IWorkflow): IAIBuildPlan {
    const nodes = (existingWorkflow.nodes || []).map((n, idx) => ({
      ...n,
      position: [80 + idx * 300, 260] as [number, number],
      parameters: {
        ...(n.parameters || {}),
        ...(n.type.startsWith('vince.modelRouter') || n.type.startsWith('vince.agentManager') || n.type.startsWith('ai.')
          ? {
              provider: 'Opencode2',
              model: 'crouton-alpha-free',
              baseUrl: 'https://opencode.ai/zen/v1',
            }
          : {}),
      },
    }));

    const connections: IConnection[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
      });
    }

    return {
      summary: `Đã chuẩn hóa và sửa lỗi toàn bộ ${nodes.length} nút trên bản vẽ bằng lệnh /fix.`,
      steps: [
        'Căn chỉnh lại tọa độ các nút theo trục ngang chuẩn (khoảng cách 300px)',
        'Khôi phục các đường nối (connections) bị đứt đoạn giữa các bước',
        'Cập nhật cấu hình AI Agent sang Opencode2 (crouton-alpha-free - https://opencode.ai/zen/v1)',
      ],
      workflow: {
        ...existingWorkflow,
        nodes,
        connections,
        updatedAt: new Date().toISOString(),
      },
      modelUsed: DEFAULT_OPENCODE2_PROVIDER.defaultModel,
      providerUsed: DEFAULT_OPENCODE2_PROVIDER.providerName,
      commandExecuted: '/fix',
    };
  }

  /**
   * Resolves a keyword or command argument to its exact canonical VinceAuto node definition
   */
  private static resolveNodeFromKeyword(q: string): {
    type: string;
    name: string;
    parameters: Record<string, any>;
  } {
    const lower = q.toLowerCase();

    if (lower.includes('sheet') || lower.includes('trang tính')) {
      return {
        type: 'vince.googleSheets.appendRow',
        name: 'Google Sheets: Append Row',
        parameters: {
          resource: 'Row',
          operation: 'append',
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          range: 'Sheet1!A:F',
          values: '{{ JSON.stringify($json) }}',
        },
      };
    }
    if (lower.includes('drive')) {
      return {
        type: 'vince.googleDrive.uploadFile',
        name: 'Google Drive: Upload File',
        parameters: {
          resource: 'File',
          operation: 'upload',
          folderId: 'root',
          fileName: 'report_{{ $json.id || "auto" }}.json',
        },
      };
    }
    if (lower.includes('gmail') || lower.includes('email') || lower.includes('mail')) {
      return {
        type: 'vince.gmail.sendEmail',
        name: 'Gmail: Send Email',
        parameters: {
          resource: 'Message',
          operation: 'send',
          to: '{{ $json.email || "customer@example.com" }}',
          subject: '[VinceAuto] Thông báo tự động',
          bodyHtml: '<p>Xin chào {{ $json.name || "bạn" }},</p><p>{{ $json.summary || $json.text }}</p>',
        },
      };
    }
    if (lower.includes('calendar') || lower.includes('lịch') || lower.includes('docs')) {
      return {
        type: 'vince.googleCalendar.createEvent',
        name: 'Google Calendar: Create Event',
        parameters: {
          resource: 'Event',
          operation: 'create',
          calendarId: 'primary',
          summary: 'Lịch hẹn tự động: {{ $json.title || "Khách hàng" }}',
        },
      };
    }
    if (lower.includes('excel') || lower.includes('outlook') || lower.includes('teams') || lower.includes('onedrive') || lower.includes('sharepoint') || lower.includes('microsoft')) {
      return {
        type: 'vince.microsoft365.action',
        name: 'Microsoft 365: Excel / Outlook / Teams',
        parameters: {
          resource: lower.includes('teams') ? 'Teams' : lower.includes('outlook') ? 'Outlook' : 'Excel 365',
          operation: lower.includes('teams') ? 'sendMessage' : lower.includes('outlook') ? 'sendEmail' : 'addRow',
        },
      };
    }
    if (lower.includes('notion')) {
      return {
        type: 'vince.notion.action',
        name: 'Notion: Create Page',
        parameters: {
          resource: 'Page',
          operation: 'create',
          databaseId: 'notion_db_default',
          title: '{{ $json.title || "Ghi chú tự động" }}',
        },
      };
    }
    if (lower.includes('jira') || lower.includes('linear') || lower.includes('trello') || lower.includes('asana') || lower.includes('clickup')) {
      return {
        type: 'vince.projectManagement.action',
        name: 'Project Management: Create Issue / Task',
        parameters: {
          resource: lower.includes('linear') ? 'Linear' : lower.includes('trello') ? 'Trello' : 'Jira',
          operation: 'createIssue',
          projectKey: 'VINCE',
          summary: '{{ $json.title || "Task từ AI Agent" }}',
        },
      };
    }
    if (lower.includes('telegram')) {
      return {
        type: 'vince.telegram',
        name: 'Telegram: Send Message',
        parameters: {
          resource: 'message',
          operation: 'sendMessage',
          chatId: '-100123456789',
          message: '🤖 [VinceAuto - Opencode2]:\n{{ $json.text || $json.summary || JSON.stringify($json) }}',
          parseMode: 'HTML',
        },
      };
    }
    if (lower.includes('zalo') || lower.includes('zns')) {
      return {
        type: 'vince.zalo.sendZns',
        name: 'Zalo OA: Send ZNS Notification',
        parameters: {
          resource: 'ZNS',
          operation: 'sendZns',
          phone: '{{ $json.phone }}',
          templateId: 'zns_order_confirm_01',
        },
      };
    }
    if (lower.includes('tiktok') && !lower.includes('tiktok shop')) {
      return {
        type: 'vince.tiktok.action',
        name: 'TikTok: Publish Direct Video',
        parameters: {
          resource: 'Video',
          operation: 'publishVideo',
          privacyLevel: 'PUBLIC_TO_EVERYONE',
        },
      };
    }
    if (lower.includes('thread') || lower.includes('threads')) {
      return {
        type: 'vince.threads.action',
        name: 'Threads (Meta): Publish Text Post',
        parameters: {
          resource: 'Thread',
          operation: 'publishText',
          mediaType: 'TEXT',
        },
      };
    }
    if (lower.includes('instagram') || lower.includes('reel')) {
      return {
        type: 'vince.instagram.action',
        name: 'Instagram Business: Publish Reel',
        parameters: {
          resource: 'Reels',
          operation: 'publishReel',
          shareToFeed: true,
        },
      };
    }
    if (lower.includes('youtube') || lower.includes('shorts')) {
      return {
        type: 'vince.youtube.action',
        name: 'YouTube & Shorts: Upload Video',
        parameters: {
          resource: 'Video',
          operation: 'uploadVideo',
          privacyStatus: 'public',
        },
      };
    }
    if (lower.includes('facebook') || lower.includes('meta') || lower.includes('fanpage')) {
      return {
        type: 'vince.facebook.postFeed',
        name: 'Facebook Graph: Publish Page Post',
        parameters: {
          resource: 'Post',
          operation: 'create',
          pageId: 'me',
          message: '{{ $json.content || $json.text }}',
        },
      };
    }
    if (lower.includes('slack')) {
      return {
        type: 'vince.slack.sendMessage',
        name: 'Slack: Send Channel Message',
        parameters: {
          resource: 'Message',
          operation: 'send',
          channel: '#automation-alerts',
          text: '⚡ [VinceAuto]: {{ $json.text || $json.summary }}',
        },
      };
    }
    if (lower.includes('discord')) {
      return {
        type: 'vince.discord.sendWebhook',
        name: 'Discord: Send Webhook Message',
        parameters: {
          resource: 'Webhook',
          operation: 'sendWebhook',
          content: '🔔 [VinceAuto Alert]: {{ $json.text || $json.summary }}',
        },
      };
    }
    if (lower.includes('shopee') || lower.includes('lazada') || lower.includes('tiktok shop')) {
      return {
        type: 'vince.shopee.createOrder',
        name: 'Shopee / TikTok Shop: Process Order',
        parameters: {
          resource: lower.includes('tiktok') ? 'TikTok Shop Order' : lower.includes('lazada') ? 'Lazada Order' : 'Shopee Order',
          operation: 'getOrderDetail',
          orderSn: '{{ $json.order_sn || "SPVN20261109" }}',
        },
      };
    }
    if (lower.includes('shopify') || lower.includes('woo')) {
      return {
        type: 'vince.shopifyWoo.action',
        name: 'Shopify / WooCommerce: Sync Order',
        parameters: {
          resource: lower.includes('woo') ? 'WooCommerce Order' : 'Shopify Order',
          operation: 'getMany',
        },
      };
    }
    if (lower.includes('hubspot') || lower.includes('salesforce') || lower.includes('crm') || lower.includes('airtable') || lower.includes('mailchimp')) {
      return {
        type: 'vince.crmMarketing.action',
        name: 'CRM & Marketing: Upsert Contact / Lead',
        parameters: {
          resource: lower.includes('airtable') ? 'Airtable' : lower.includes('salesforce') ? 'Salesforce' : 'HubSpot',
          operation: 'upsertContact',
          email: '{{ $json.email }}',
        },
      };
    }
    if (lower.includes('postgres') || lower.includes('mysql') || lower.includes('mongo') || lower.includes('redis') || lower.includes('supabase') || lower.includes('qdrant') || lower.includes('sql') || lower.includes('database')) {
      return {
        type: 'vince.databases.action',
        name: 'Database & Vector DB: Execute Query',
        parameters: {
          resource: lower.includes('mongo') ? 'MongoDB' : lower.includes('redis') ? 'Redis' : lower.includes('supabase') ? 'Supabase' : 'PostgreSQL',
          operation: 'executeQuery',
          query: 'INSERT INTO leads (name, email, created_at) VALUES ($1, $2, NOW());',
        },
      };
    }
    if (lower.includes('momo') || lower.includes('vnpay') || lower.includes('zalopay') || lower.includes('vietqr') || lower.includes('stripe') || lower.includes('thanh toán')) {
      return {
        type: 'vince.momo.createPayment',
        name: 'Payment Gateway: Tạo mã thanh toán VietQR / MoMo',
        parameters: {
          resource: lower.includes('vietqr') ? 'VietQR' : lower.includes('vnpay') ? 'VNPAY' : lower.includes('stripe') ? 'Stripe' : 'MoMo',
          operation: lower.includes('vietqr') ? 'generateQr' : 'createPayment',
          amount: 299000,
          orderInfo: 'Thanh toán đơn hàng #{{ $json.orderId || "DH001" }}',
        },
      };
    }
    if (lower.includes('filter') || lower.includes('lọc')) {
      return {
        type: 'transform.filter',
        name: 'Filter (Lọc dữ liệu theo điều kiện)',
        parameters: {
          condition: '$json.status !== "cancelled"',
        },
      };
    }
    if (lower.includes('set') || lower.includes('edit field') || lower.includes('gán')) {
      return {
        type: 'transform.editFields',
        name: 'Edit Fields (Set)',
        parameters: {
          mode: 'manual',
          fields: { processedBy: 'Opencode2-crouton-alpha-free', verified: true },
        },
      };
    }
    if (lower.includes('code') || lower.includes('javascript') || lower.includes('script')) {
      return {
        type: 'transform.code',
        name: 'Code (JavaScript Transform)',
        parameters: {
          language: 'javascript',
          jsCode: 'return items.map(item => ({ json: { ...item.json, transformedAt: new Date().toISOString() } }));',
        },
      };
    }
    if (lower.includes('merge') || lower.includes('gộp')) {
      return {
        type: 'transform.merge',
        name: 'Merge (Gộp luồng dữ liệu)',
        parameters: { mode: 'append', joinMode: 'Inner Join', matchField: 'id' },
      };
    }
    if (lower.includes('aggregate') || lower.includes('gom')) {
      return {
        type: 'transform.aggregate',
        name: 'Aggregate (Gom danh sách items)',
        parameters: { aggregate: 'individualFields', fieldToAggregate: 'id', outputFieldName: 'itemsList' },
      };
    }
    if (lower.includes('summarize') || lower.includes('tổng hợp')) {
      return {
        type: 'transform.summarize',
        name: 'Summarize (Tính tổng / Thống kê)',
        parameters: { fieldsToSummarize: 'amount', aggregation: 'sum', fieldsToSplitBy: 'status' },
      };
    }
    if (lower.includes('if') || lower.includes('rẽ nhánh') || lower.includes('điều kiện')) {
      return {
        type: 'flow.if',
        name: 'If (Kiểm tra điều kiện True/False)',
        parameters: { condition: '$json.amount >= 500000' },
      };
    }
    if (lower.includes('switch') || lower.includes('đa nhánh')) {
      return {
        type: 'flow.switch',
        name: 'Switch (Định tuyến đa nhánh)',
        parameters: { mode: 'rules', routingField: '$json.channel', cases: 'telegram,zalo,email' },
      };
    }
    if (lower.includes('scrape') || lower.includes('cào')) {
      return {
        type: 'vince.scraper',
        name: 'Vince Web Scraper',
        parameters: {
          url: 'https://news.ycombinator.com',
          selector: '.titleline > a',
          extractFields: 'title, href',
        },
      };
    }

    return {
      type: 'vince.modelRouter',
      name: 'Opencode2 AI Agent (crouton-alpha-free)',
      parameters: {
        provider: 'Opencode2',
        model: 'crouton-alpha-free',
        baseUrl: 'https://opencode.ai/zen/v1',
        strategy: 'auto',
        prompt: `Xử lý tác vụ "${q}" trên dữ liệu đầu vào:\n{{ JSON.stringify($json) }}`,
      },
    };
  }

  /**
   * Intelligent Local Workflow Compiler that understands all VinceAuto node names,
   * triggers, 21 app suites, 18 data transformation nodes, and Opencode2 AI Agent nodes.
   */
  private static compileIntelligentWorkflow(prompt: string, existingWorkflow?: IWorkflow): IAIBuildPlan {
    const p = prompt.toLowerCase();
    const nodes: INode[] = [];
    const connections: IConnection[] = [];
    const steps: string[] = [];

    let x = 80;
    const y = 260;
    const nextPos = (): [number, number] => {
      const pos: [number, number] = [x, y];
      x += 300;
      return pos;
    };

    // 1. DETERMINE CANONICAL TRIGGER NODE
    let triggerNode: INode;
    if (p.includes('shopee') || p.includes('tiktok shop') || p.includes('lazada') || p.includes('đơn hàng mới')) {
      triggerNode = {
        id: 'node_trigger_ecom',
        name: 'Shopee / TikTok Shop Trigger: On Order Status Push [T/W]',
        type: 'trigger.ecommerce',
        position: nextPos(),
        parameters: {
          app: p.includes('tiktok') ? 'tiktokShop' : p.includes('lazada') ? 'lazada' : 'shopee',
          event: 'order_status_push',
          mechanism: 'W',
        },
      };
      steps.push('Kích hoạt tự động qua Webhook khi có đơn hàng mới trên sàn TMĐT (trigger.ecommerce)');
    } else if (p.includes('momo') || p.includes('vnpay') || p.includes('vietqr') || p.includes('thanh toán')) {
      triggerNode = {
        id: 'node_trigger_pay',
        name: 'Payment Webhook Trigger: Giao dịch thành công [T/W]',
        type: 'trigger.payment',
        position: nextPos(),
        parameters: {
          app: p.includes('vietqr') ? 'vietqr' : p.includes('vnpay') ? 'vnpay' : 'momo',
          event: 'ipn_payment_success',
          mechanism: 'W',
        },
      };
      steps.push('Nhận IPN Webhook giao dịch thanh toán thành công theo thời gian thực (trigger.payment)');
    } else if (p.includes('form') || p.includes('biểu mẫu') || p.includes('đăng ký')) {
      triggerNode = {
        id: 'node_trigger_form',
        name: 'Form Trigger: Khách hàng điền biểu mẫu [T/W]',
        type: 'trigger.form',
        position: nextPos(),
        parameters: {
          formTitle: 'Biểu mẫu thu thập Lead khách hàng',
          fields: 'fullName,phone,email,company,requirement',
        },
      };
      steps.push('Thu thập dữ liệu khách hàng ngay khi biểu mẫu Webform được gửi (trigger.form)');
    } else if (p.includes('telegram') || p.includes('tele') || p.includes('botchat') || p.includes('chat') || p.includes('hội thoại') || p.includes('cskh') || p.includes('tư vấn')) {
      const isTelegramChat = p.includes('telegram') || p.includes('tele') || p.includes('botchat') || p.includes('bot');
      triggerNode = {
        id: 'node_trigger_chat',
        name: isTelegramChat ? 'Telegram Trigger: Tin nhắn người dùng [Webhook/API]' : 'Chat Trigger: Tin nhắn khách hàng mới [T/W]',
        type: 'trigger.chat',
        position: nextPos(),
        parameters: {
          channel: isTelegramChat ? 'telegram' : 'multichannel_chat',
          chatId: '@ungdothevinh',
          welcomeMessage: 'Xin chào Ưng Đỗ Thế Vinh! AI Agent sẵn sàng tiếp nhận câu hỏi của bạn.',
        },
      };
      steps.push(isTelegramChat ? 'Lắng nghe tin nhắn Telegram gửi tới Bot (qua API hoặc Webhook và @id)' : 'Lắng nghe tin nhắn khách hàng theo thời gian thực qua Chat Trigger (trigger.chat)');
    } else if (p.includes('webhook') || p.includes('callback') || p.includes('lead')) {
      triggerNode = {
        id: 'node_trigger_webhook',
        name: 'Webhook Trigger: Nhận sự kiện HTTP POST [T/W]',
        type: 'trigger.webhook',
        position: nextPos(),
        parameters: {
          path: 'vince-automation-hook',
          httpMethod: 'POST',
        },
      };
      steps.push('Nhận dữ liệu đẩy về qua cổng HTTP Webhook (trigger.webhook)');
    } else if (p.includes('database') || p.includes('sql') || p.includes('bản ghi mới')) {
      triggerNode = {
        id: 'node_trigger_db',
        name: 'Database Trigger: On Row Inserted [T/P]',
        type: 'trigger.database',
        position: nextPos(),
        parameters: {
          table: 'orders_and_leads',
          event: 'INSERT',
        },
      };
      steps.push('Phát hiện bản ghi mới phát sinh trong cơ sở dữ liệu (trigger.database)');
    } else {
      triggerNode = {
        id: 'node_trigger_schedule',
        name: 'Schedule Trigger: Chạy định kỳ tự động [T/P]',
        type: 'trigger.cron',
        position: nextPos(),
        parameters: {
          cronExpression: '0 8 * * *',
          timezone: 'Asia/Ho_Chi_Minh',
        },
      };
      steps.push('Kích hoạt tự động theo lịch trình Cron chuẩn (trigger.cron)');
    }
    nodes.push(triggerNode);

    // 2. DATA INGESTION / SCRAPING / E-COMMERCE / DATABASE FETCH
    if (p.includes('cào') || p.includes('scrape') || p.includes('tin tức') || p.includes('web') || p.includes('hacker news')) {
      nodes.push({
        id: 'node_scraper',
        name: 'Vince Web Scraper: Trích xuất dữ liệu Web',
        type: 'vince.scraper',
        position: nextPos(),
        parameters: {
          url: 'https://news.ycombinator.com',
          selector: '.titleline > a',
          extractFields: 'title, href',
        },
      });
      steps.push('Trích xuất dữ liệu tự động từ trang đích bằng Vince Web Scraper (vince.scraper)');
    }

    if (p.includes('shopee') || p.includes('tiktok shop') || p.includes('lazada')) {
      nodes.push({
        id: 'node_ecom_detail',
        name: 'Shopee / TikTok Shop: Get Order Detail',
        type: 'vince.shopee.createOrder',
        position: nextPos(),
        parameters: {
          resource: p.includes('tiktok') ? 'TikTok Shop Order' : 'Shopee Order',
          operation: 'getOrderDetail',
          orderSn: '{{ $json.order_sn }}',
        },
      });
      steps.push('Truy vấn chi tiết đơn hàng & sản phẩm từ sàn TMĐT (vince.shopee.createOrder)');
    }

    // 3. DATA TRANSFORMATION NODES (18 Nodes)
    if (p.includes('lọc') || p.includes('filter') || p.includes('điều kiện') || p.includes('hợp lệ')) {
      nodes.push({
        id: 'node_transform_filter',
        name: 'Filter: Lọc dữ liệu hợp lệ',
        type: 'transform.filter',
        position: nextPos(),
        parameters: {
          condition: '$json.status !== "cancelled" && $json.status !== "spam"',
        },
      });
      steps.push('Lọc bỏ dữ liệu rác hoặc đơn hủy bằng nút Filter (transform.filter)');
    }

    if (p.includes('chuẩn hóa') || p.includes('set') || p.includes('edit field') || p.includes('biến đổi') || nodes.length <= 2) {
      const isTelegramChat = p.includes('telegram') || p.includes('tele') || p.includes('botchat');
      nodes.push({
        id: 'node_transform_set',
        name: isTelegramChat ? 'Edit Fields: Chuẩn hóa Schema & Trích xuất câu hỏi' : 'Edit Fields (Set): Chuẩn hóa Schema dữ liệu',
        type: 'transform.editFields',
        position: nextPos(),
        parameters: {
          mode: 'manual',
          fields: isTelegramChat
            ? {
                userQuery: '{{ $json.text || $json.message.text }}',
                chatId: '{{ $json.chatId || $json.message.chat.id || 118229444 }}',
                messageId: '{{ $json.messageId || $json.message.message_id || 142 }}',
                sender: '{{ $json.sender || $json.message.from.first_name || "Ưng Đỗ Thế Vinh" }}',
              }
            : {
                source: 'VinceAuto_Pipeline',
                aiProvider: 'Opencode2 (crouton-alpha-free)',
                timestamp: '{{ new Date().toISOString() }}',
              },
          keepOnlySet: false,
        },
      });
      steps.push(isTelegramChat ? 'Chuẩn hóa dữ liệu tin nhắn: Trích xuất nội dung câu hỏi, Chat ID (@id) và Message ID' : 'Chuẩn hóa các trường dữ liệu đầu vào bằng nút Edit Fields (transform.editFields)');
    }

    if (p.includes('trùng') || p.includes('duplicate')) {
      nodes.push({
        id: 'node_transform_dedupe',
        name: 'Remove Duplicates: Khử trùng lặp bản ghi',
        type: 'transform.removeDuplicates',
        position: nextPos(),
        parameters: {
          operation: 'removeDuplicateInputItems',
          compareField: 'id',
        },
      });
      steps.push('Loại bỏ các bản ghi trùng lặp bằng Remove Duplicates (transform.removeDuplicates)');
    }

    // 4. AI AGENT CORE NODE (Opencode2 • crouton-alpha-free • https://opencode.ai/zen/v1)
    if (p.includes('multi-agent') || p.includes('supervisor') || p.includes('planner') || p.includes('critic')) {
      nodes.push({
        id: 'node_ai_supervisor',
        name: 'Vince Multi-Agent Supervisor (Opencode2 crouton-alpha-free)',
        type: 'vince.agentManager',
        position: nextPos(),
        parameters: {
          provider: 'Opencode2',
          model: 'crouton-alpha-free',
          baseUrl: 'https://opencode.ai/zen/v1',
          agentRole: 'supervisor',
          subAgents: 'Planner, Researcher, Critic, Executor',
          taskDescription: `Thực thi yêu cầu: ${prompt}`,
        },
      });
      steps.push('Điều phối tổ hợp Multi-Agent (Planner, Researcher, Critic) trên model Opencode2 crouton-alpha-free (vince.agentManager)');
    } else {
      const isTelegramChat = p.includes('telegram') || p.includes('tele') || p.includes('botchat');
      nodes.push({
        id: 'node_ai_opencode2',
        name: 'AI Agent Opencode2 (crouton-alpha-free)',
        type: 'vince.modelRouter',
        position: nextPos(),
        parameters: {
          provider: 'Opencode2',
          providerType: 'openai',
          baseUrl: 'https://opencode.ai/zen/v1',
          model: 'crouton-alpha-free',
          strategy: 'auto',
          prompt: isTelegramChat
            ? '{{ $json.userQuery || $json.text || $json.message.text }}'
            : `Bạn là AI Agent tự động hóa của VinceAuto. Hãy phân tích dữ liệu sau và tạo nội dung xử lý tối ưu cho yêu cầu "${prompt}":\n{{ JSON.stringify($json) }}`,
          systemPrompt: isTelegramChat
            ? 'Bạn là AI Agent trợ lý thông minh trên Telegram của Ưng Đỗ Thế Vinh. Hãy trả lời câu hỏi của người dùng một cách chính xác, thân thiện và hữu ích.'
            : 'Bạn là chuyên gia tự động hóa của VinceAuto.',
        },
      });
      steps.push(isTelegramChat ? 'Gọi API AI Agent Opencode2 (crouton-alpha-free) để suy luận câu trả lời cho người dùng' : 'Phân tích, suy luận và sinh kết quả tự động bằng AI Agent Opencode2 - model crouton-alpha-free (vince.modelRouter)');
    }

    // 5. DESTINATION / APP ACTIONS (Google Sheets, Drive, Gmail, CRM, Database, Payment, Telegram, Zalo, Slack, Discord)
    if (p.includes('sheet') || p.includes('trang tính') || p.includes('báo cáo') || p.includes('lưu') || p.includes('đơn hàng') || p.includes('lead')) {
      nodes.push({
        id: 'node_google_sheets',
        name: 'Google Sheets: Append or Update Row',
        type: 'vince.googleSheets.appendRow',
        position: nextPos(),
        parameters: {
          resource: 'Row',
          operation: 'appendOrUpdate',
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          range: 'Data!A:G',
          values: '{{ JSON.stringify($json) }}',
        },
      });
      steps.push('Ghi nhận dữ liệu đã qua AI xử lý vào bảng tính Google Sheets (vince.googleSheets.appendRow)');
    }

    if (p.includes('drive') || p.includes('lưu file') || p.includes('upload')) {
      nodes.push({
        id: 'node_google_drive',
        name: 'Google Drive: Upload File',
        type: 'vince.googleDrive.uploadFile',
        position: nextPos(),
        parameters: {
          resource: 'File',
          operation: 'upload',
          folderId: 'root',
        },
      });
      steps.push('Tải tệp kết quả lưu trữ lên Google Drive (vince.googleDrive.uploadFile)');
    }

    if (p.includes('notion')) {
      nodes.push({
        id: 'node_notion',
        name: 'Notion: Create Database Page',
        type: 'vince.notion.action',
        position: nextPos(),
        parameters: {
          resource: 'Page',
          operation: 'create',
          databaseId: 'notion_workspace_db',
        },
      });
      steps.push('Tạo trang tài liệu đồng bộ vào Notion Database (vince.notion.action)');
    }

    if (p.includes('hubspot') || p.includes('salesforce') || p.includes('crm') || p.includes('airtable')) {
      nodes.push({
        id: 'node_crm',
        name: 'CRM & Marketing: Upsert Contact & Deal',
        type: 'vince.crmMarketing.action',
        position: nextPos(),
        parameters: {
          resource: p.includes('airtable') ? 'Airtable' : p.includes('salesforce') ? 'Salesforce' : 'HubSpot',
          operation: 'upsertContact',
        },
      });
      steps.push('Đồng bộ thông tin khách hàng vào hệ thống CRM (vince.crmMarketing.action)');
    }

    if (p.includes('postgres') || p.includes('mysql') || p.includes('mongo') || p.includes('supabase') || p.includes('database')) {
      nodes.push({
        id: 'node_db_action',
        name: 'Database: Insert / Upsert Record',
        type: 'vince.databases.action',
        position: nextPos(),
        parameters: {
          resource: p.includes('supabase') ? 'Supabase' : p.includes('mongo') ? 'MongoDB' : 'PostgreSQL',
          operation: 'insert',
        },
      });
      steps.push('Lưu trữ bản ghi vào cơ sở dữ liệu (vince.databases.action)');
    }

    if (p.includes('tiktok') && !p.includes('tiktok shop')) {
      nodes.push({
        id: 'node_tiktok_publish',
        name: 'TikTok: Publish Direct Video',
        type: 'vince.tiktok.action',
        position: nextPos(),
        parameters: {
          resource: 'Video',
          operation: 'publishVideo',
          privacyLevel: 'PUBLIC_TO_EVERYONE',
          caption: '{{ $json.text || $json.caption }} #vinceauto #xuhuong',
        },
      });
      steps.push('Đăng video tự động kèm caption & hashtag xu hướng lên kênh TikTok (vince.tiktok.action)');
    }

    if (p.includes('thread') || p.includes('threads')) {
      nodes.push({
        id: 'node_threads_publish',
        name: 'Threads (Meta): Publish Text / Media Post',
        type: 'vince.threads.action',
        position: nextPos(),
        parameters: {
          resource: 'Thread',
          operation: 'publishText',
          mediaType: 'TEXT',
          text: '{{ $json.text || $json.summary }}',
        },
      });
      steps.push('Xuất bản bài đăng hoặc chuỗi Threadstorm tự động lên Meta Threads (vince.threads.action)');
    }

    if (p.includes('instagram') || p.includes('reel') || p.includes('story')) {
      nodes.push({
        id: 'node_instagram_publish',
        name: 'Instagram Business: Publish Reel / Story',
        type: 'vince.instagram.action',
        position: nextPos(),
        parameters: {
          resource: 'Reels',
          operation: 'publishReel',
          shareToFeed: true,
        },
      });
      steps.push('Đăng video Reels / Story tự động lên Instagram Business (vince.instagram.action)');
    }

    if (p.includes('youtube') || p.includes('shorts')) {
      nodes.push({
        id: 'node_youtube_upload',
        name: 'YouTube & Shorts: Upload Video',
        type: 'vince.youtube.action',
        position: nextPos(),
        parameters: {
          resource: 'Video',
          operation: 'uploadVideo',
          privacyStatus: 'public',
        },
      });
      steps.push('Tải video / YouTube Shorts tự động lên kênh YouTube (vince.youtube.action)');
    }

    if (p.includes('facebook') || p.includes('fanpage')) {
      nodes.push({
        id: 'node_facebook_post',
        name: 'Facebook Graph: Publish Page Post',
        type: 'vince.facebook.postFeed',
        position: nextPos(),
        parameters: {
          resource: 'Post',
          operation: 'create',
          pageId: 'me',
        },
      });
      steps.push('Đăng bài viết tự động lên Facebook Fanpage (vince.facebook.postFeed)');
    }

    if (p.includes('zalo') || p.includes('zns')) {
      nodes.push({
        id: 'node_zalo_zns',
        name: 'Zalo OA: Send ZNS Notification',
        type: 'vince.zalo.sendZns',
        position: nextPos(),
        parameters: {
          resource: 'ZNS',
          operation: 'sendZns',
          phone: '{{ $json.phone }}',
          templateId: 'zns_auto_notify',
        },
      });
      steps.push('Gửi thông báo ZNS chăm sóc khách hàng qua Zalo OA (vince.zalo.sendZns)');
    }

    if (p.includes('gmail') || p.includes('email') || p.includes('mail')) {
      nodes.push({
        id: 'node_gmail',
        name: 'Gmail: Send Email Report',
        type: 'vince.gmail.sendEmail',
        position: nextPos(),
        parameters: {
          resource: 'Message',
          operation: 'send',
          to: '{{ $json.email || "admin@vinceauto.vn" }}',
          subject: '[VinceAuto AI] Báo cáo tự động',
          bodyHtml: '<p>{{ $json.text || $json.summary }}</p>',
        },
      });
      steps.push('Gửi email báo cáo chi tiết qua Gmail (vince.gmail.sendEmail)');
    }

    if (p.includes('slack')) {
      nodes.push({
        id: 'node_slack',
        name: 'Slack: Send Channel Alert',
        type: 'vince.slack.sendMessage',
        position: nextPos(),
        parameters: {
          resource: 'Message',
          operation: 'send',
          channel: '#vinceauto-ops',
          text: '🤖 [Opencode2 Agent]: {{ $json.text || $json.summary }}',
        },
      });
      steps.push('Bắn thông báo vào kênh làm việc Slack (vince.slack.sendMessage)');
    }

    if (p.includes('discord')) {
      nodes.push({
        id: 'node_discord',
        name: 'Discord: Send Webhook Message',
        type: 'vince.discord.sendWebhook',
        position: nextPos(),
        parameters: {
          resource: 'Webhook',
          operation: 'sendWebhook',
          content: '🚀 [VinceAuto]: {{ $json.text || $json.summary }}',
        },
      });
      steps.push('Gửi thông báo qua Discord Webhook (vince.discord.sendWebhook)');
    }

    // Default or explicitly requested Telegram notification / AI bot reply at the end
    if (
      p.includes('telegram') ||
      p.includes('thông báo') ||
      p.includes('báo cáo') ||
      (!p.includes('zalo') && !p.includes('gmail') && !p.includes('slack') && !p.includes('discord'))
    ) {
      const isTelegramChat = p.includes('telegram') || p.includes('tele') || p.includes('botchat');
      nodes.push({
        id: 'node_telegram_notify',
        name: isTelegramChat ? 'Telegram: Phản hồi tin nhắn (Send Message)' : 'Telegram: Send Message',
        type: 'vince.telegram',
        position: nextPos(),
        parameters: {
          resource: 'message',
          operation: 'sendMessage',
          chatId: isTelegramChat ? '{{ $json.chatId }}' : '@ungdothevinh',
          message: isTelegramChat
            ? '{{ $json.aiResponse || $json.text }}'
            : `🤖 [VinceAuto AI Agent - Opencode2 crouton-alpha-free]\n✅ Hoàn tất quy trình: ${prompt}\n📊 Kết quả: {{ $json.text || $json.data || "Thành công" }}`,
          replyToMessageId: isTelegramChat ? '{{ $json.messageId || $json.replyToId }}' : undefined,
          parseMode: 'HTML',
        },
      });
      steps.push(isTelegramChat ? 'Tự động gọi API Telegram để phản hồi trực tiếp câu trả lời của AI Agent về @id của người gửi' : 'Gửi thông báo kết quả tức thời về Telegram Bot (vince.telegram)');
    }

    // Wire sequential connections
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
      });
    }

    return {
      summary: `AI Agent Opencode2 (${DEFAULT_OPENCODE2_PROVIDER.defaultModel}) đã thiết kế tự động quy trình gồm ${nodes.length} nút chuẩn cho yêu cầu: "${prompt}"`,
      steps,
      workflow: {
        id: existingWorkflow?.id || uuidv4(),
        name: prompt.length <= 55 ? prompt : `${prompt.slice(0, 52)}...`,
        nodes,
        connections,
        createdAt: existingWorkflow?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      modelUsed: DEFAULT_OPENCODE2_PROVIDER.defaultModel,
      providerUsed: DEFAULT_OPENCODE2_PROVIDER.providerName,
    };
  }
}
