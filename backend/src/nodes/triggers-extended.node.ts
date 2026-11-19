import { INodeType, IExecutionContext, INodeExecutionData, INode, NodeCategory } from '../engine/types.js';

function createTriggerNodeClass(config: {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  properties?: any[];
  defaultPayloadFn?: (node: INode) => Record<string, any>;
}): new () => INodeType {
  return class implements INodeType {
    description = {
      name: config.name,
      displayName: config.displayName,
      icon: config.icon,
      category: 'trigger' as NodeCategory,
      description: config.description,
      version: 1,
      properties: config.properties || [],
      inputs: [],
      outputs: ['main'],
    };

    async execute(
      _context: IExecutionContext,
      inputData: INodeExecutionData[],
      node: INode
    ): Promise<INodeExecutionData[]> {
      const hasMeaningfulInput =
        inputData &&
        inputData.length > 0 &&
        Object.keys(inputData[0]?.json || {}).length > 0;

      if (hasMeaningfulInput) return inputData;

      const payload = config.defaultPayloadFn
        ? config.defaultPayloadFn(node)
        : {
            triggeredAt: new Date().toISOString(),
            triggerType: config.name,
            event: 'SAMPLE_EVENT',
            data: { test: true },
          };

      return [{ json: payload }];
    }
  };
}

export const TriggerAppEventNode = createTriggerNodeClass({
  name: 'trigger.appEvent',
  displayName: 'App Event Trigger',
  icon: 'Radio',
  description: 'Kích hoạt khi có sự kiện từ Zalo OA, Telegram, Facebook Messenger hoặc Notion',
  properties: [
    {
      name: 'app',
      displayName: 'Ứng Dụng (App)',
      type: 'options',
      default: 'telegram',
      options: [
        { name: 'Telegram Bot (Có tin nhắn người dùng / nhóm)', value: 'telegram' },
        { name: 'Google Sheets (Khi có dòng/link mới)', value: 'googleSheets' },
        { name: 'Google Drive (Khi có file/video mới)', value: 'googleDrive' },
        { name: 'Notion (Khi có bài viết mới)', value: 'notion' },
        { name: 'Gmail (Có email mới khớp bộ lọc)', value: 'gmail' },
        { name: 'Zalo Official Account (Tin nhắn người dùng mới)', value: 'zalo_oa' },
        { name: 'Facebook Messenger (Khách hàng nhắn tin Page)', value: 'fb_messenger' },
      ],
      required: true,
    },
  ],
  defaultPayloadFn: (node) => {
    const app = node.parameters?.app || 'telegram';
    if (app === 'telegram') {
      return {
        update_id: 894120394,
        chatId: 1869249751,
        text: 'Xin chào AI Agent! Đây là tin nhắn mẫu từ Vinh Ưng (@ungvinh0407).',
        sender: 'Vinh Ưng',
        username: 'ungvinh0407',
        messageId: 142,
        message: {
          message_id: 142,
          from: {
            id: 1869249751,
            is_bot: false,
            first_name: 'Vinh',
            last_name: 'Ưng',
            username: 'ungvinh0407',
            language_code: 'vi',
          },
          chat: {
            id: 1869249751,
            first_name: 'Vinh',
            last_name: 'Ưng',
            username: 'ungvinh0407',
            type: 'private',
          },
          date: Math.floor(Date.now() / 1000),
          text: 'Xin chào AI Agent! Đây là tin nhắn mẫu từ Vinh Ưng (@ungvinh0407).',
        },
        timestamp: new Date().toISOString(),
      };
    }
    if (app === 'googleSheets') {
      return {
        triggeredAt: new Date().toISOString(),
        triggerType: 'trigger.appEvent',
        app: 'googleSheets',
        event: node.parameters?.event || 'rowAdded',
        spreadsheetId: node.parameters?.spreadsheetId || '',
        range: node.parameters?.range || 'VideoLinks!A:G',
        platform: 'TikTok',
        videoUrl: 'https://www.tiktok.com/@example/video/123456789',
        targetPageId: node.parameters?.targetPageId || '123456789012345',
        scheduleTime: '2026-11-20 20:00',
        status: 'PENDING',
      };
    }
    if (app === 'googleDrive') {
      return {
        triggeredAt: new Date().toISOString(),
        triggerType: 'trigger.appEvent',
        app: 'googleDrive',
        event: node.parameters?.event || 'fileCreated',
        fileId: 'drive_file_demo_01',
        name: 'video-demo.mp4',
        mimeType: 'video/mp4',
        webViewLink: 'https://drive.google.com/file/d/drive_file_demo_01/view',
      };
    }
    if (app === 'notion') {
      return {
        triggeredAt: new Date().toISOString(),
        triggerType: 'trigger.appEvent',
        app: 'notion',
        event: node.parameters?.event || 'pageAdded',
        pageId: 'notion_page_demo_01',
        title: 'Bài viết mới trên Notion',
        content: 'Nội dung bài viết mẫu từ Notion Database.',
      };
    }
    if (app === 'gmail') {
      return {
        triggeredAt: new Date().toISOString(),
        triggerType: 'trigger.appEvent',
        app: 'gmail',
        event: node.parameters?.event || 'newEmail',
        from: 'partner@example.com',
        subject: 'Thông báo hợp tác & báo giá mới',
        body: 'Xin chào, vui lòng kiểm tra thông tin đính kèm.',
      };
    }
    return {
      triggeredAt: new Date().toISOString(),
      triggerType: 'trigger.appEvent',
      app,
      event: 'USER_MESSAGE',
      data: { user: 'Khách hàng', text: 'Tin nhắn kiểm tra từ người dùng' },
    };
  },
});

export const TriggerEcommerceNode = createTriggerNodeClass({
  name: 'trigger.ecommerce',
  displayName: 'E-commerce Trigger (Đơn Hàng Mới)',
  icon: 'ShoppingBag',
  description: 'Tự động kích hoạt ngay khi có đơn hàng mới từ Shopee, TikTok Shop, Lazada hoặc WooCommerce',
  properties: [
    {
      name: 'platform',
      displayName: 'Sàn Thương Mại Điện Tử',
      type: 'options',
      default: 'shopee',
      options: [
        { name: 'Shopee Open Platform', value: 'shopee' },
        { name: 'TikTok Shop Seller Center', value: 'tiktok_shop' },
        { name: 'Lazada Open Platform', value: 'lazada' },
        { name: 'WooCommerce Store', value: 'woocommerce' },
      ],
      required: true,
    },
    {
      name: 'orderStatusFilter',
      displayName: 'Lọc Theo Trạng Thái',
      type: 'string',
      default: 'READY_TO_SHIP, PAID',
    },
  ],
});

export const TriggerPaymentNode = createTriggerNodeClass({
  name: 'trigger.payment',
  displayName: 'Payment Trigger (Thanh Toán Thành Công)',
  icon: 'CreditCard',
  description: 'Kích hoạt khi nhận callback IPN thanh toán thành công từ MoMo, VNPAY, ZaloPay hoặc Ngân hàng',
  properties: [
    {
      name: 'gateway',
      displayName: 'Cổng Thanh Toán / Ngân Hàng',
      type: 'options',
      default: 'momo',
      options: [
        { name: 'Ví MoMo (IPN Webhook Callback)', value: 'momo' },
        { name: 'Cổng VNPAY (VNPAY Secure Hash Callback)', value: 'vnpay' },
        { name: 'ZaloPay Payment Gateway', value: 'zalopay' },
        { name: 'Open Banking / Biến Động Số Dư', value: 'open_banking' },
      ],
      required: true,
    },
  ],
});

export const TriggerFormNode = createTriggerNodeClass({
  name: 'trigger.form',
  displayName: 'Form Trigger (Gửi Biểu Mẫu)',
  icon: 'ClipboardList',
  description: 'Tự động kích hoạt khi có người dùng điền và submit biểu mẫu Webform của VinceAuto',
  properties: [
    {
      name: 'formPath',
      displayName: 'Đường Dẫn Biểu Mẫu (Form URL Path)',
      type: 'string',
      default: 'lead-contact-form',
      required: true,
    },
  ],
});

export const TriggerChatNode = createTriggerNodeClass({
  name: 'trigger.chat',
  displayName: 'AI Chat Trigger',
  icon: 'MessageSquare',
  description: 'Kích hoạt khi bất kỳ người dùng nào gửi tin nhắn tới Bot Telegram hoặc Chat AI',
  properties: [],
  defaultPayloadFn: (_node) => ({
    update_id: 894120394,
    chatId: 1869249751,
    text: 'Xin chào AI Agent! Đây là tin nhắn mẫu từ Vinh Ưng (@ungvinh0407).',
    sender: 'Vinh Ưng',
    username: 'ungvinh0407',
    messageId: 142,
    message: {
      message_id: 142,
      from: {
        id: 1869249751,
        is_bot: false,
        first_name: 'Vinh',
        last_name: 'Ưng',
        username: 'ungvinh0407',
        language_code: 'vi',
      },
      chat: {
        id: 1869249751,
        first_name: 'Vinh',
        last_name: 'Ưng',
        username: 'ungvinh0407',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: 'Xin chào AI Agent! Đây là tin nhắn mẫu từ Vinh Ưng (@ungvinh0407).',
    },
    timestamp: new Date().toISOString(),
  }),
});

export const TriggerDatabaseNode = createTriggerNodeClass({
  name: 'trigger.database',
  displayName: 'Database Trigger (Bản Ghi Mới)',
  icon: 'Database',
  description: 'Kích hoạt khi có dữ liệu bản ghi mới được thêm trong PostgreSQL, MySQL, Supabase',
  properties: [
    {
      name: 'tableName',
      displayName: 'Tên Bảng (Table Name)',
      type: 'string',
      default: 'orders',
      required: true,
    },
  ],
});

export const TriggerSocialMediaNode = createTriggerNodeClass({
  name: 'trigger.socialMedia',
  displayName: 'Social Media Trigger (Bình Luận / Bài Viết Mới)',
  icon: 'Share2',
  description: 'Kích hoạt khi có bình luận mới trên Facebook Page, video TikTok hoặc ảnh Instagram',
  properties: [
    {
      name: 'platform',
      displayName: 'Nền Tảng Mạng Xã Hội',
      type: 'options',
      default: 'facebook_page',
      options: [
        { name: 'Facebook Fanpage (Bình luận / Bài đăng mới)', value: 'facebook_page' },
        { name: 'TikTok (Bình luận video)', value: 'tiktok' },
        { name: 'Instagram (Bình luận / Tin nhắn direct)', value: 'instagram' },
        { name: 'YouTube (Bình luận video mới)', value: 'youtube' },
      ],
      required: true,
    },
  ],
});

export const TriggerGitNode = createTriggerNodeClass({
  name: 'trigger.git',
  displayName: 'Git Trigger (Commit / Pull Request)',
  icon: 'GitBranch',
  description: 'Kích hoạt khi có mã nguồn mới được push hoặc mở Pull Request trên GitHub / GitLab',
  properties: [
    {
      name: 'events',
      displayName: 'Sự Kiện Lắng Nghe',
      type: 'string',
      default: 'push, pull_request',
    },
  ],
});

export const TriggerErrorNode = createTriggerNodeClass({
  name: 'trigger.error',
  displayName: 'Error Trigger (Bắt Lỗi Quy Trình)',
  icon: 'AlertTriangle',
  description: 'Tự động kích hoạt xử lý sự cố hoặc cảnh báo khi có một workflow khác bị lỗi thực thi',
  properties: [],
});
