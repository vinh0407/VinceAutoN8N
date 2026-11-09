import { INodeType, IExecutionContext, INodeExecutionData, INode, NodeCategory } from '../engine/types.js';

function createTriggerNodeClass(config: {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  properties?: any[];
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
      _node: INode
    ): Promise<INodeExecutionData[]> {
      if (inputData && inputData.length > 0) return inputData;
      return [
        {
          json: {
            triggeredAt: new Date().toISOString(),
            triggerType: config.name,
            event: 'SAMPLE_EVENT',
            data: { test: true },
          },
        },
      ];
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
      default: 'zalo_oa',
      options: [
        { name: 'Zalo Official Account (Tin nhắn người dùng mới)', value: 'zalo_oa' },
        { name: 'Facebook Messenger (Khách hàng nhắn tin Page)', value: 'fb_messenger' },
        { name: 'Telegram Bot (Có tin nhắn trong nhóm / kênh)', value: 'telegram' },
        { name: 'Gmail (Có email mới khớp bộ lọc)', value: 'gmail' },
      ],
      required: true,
    },
  ],
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
  description: 'Kích hoạt khi người dùng gửi tin nhắn trò chuyện vào khung Chat AI hoặc trợ lý ảo',
  properties: [],
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
