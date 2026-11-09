import axios from 'axios';
import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export class VinceTelegramNode implements INodeType {
  description = {
    name: 'vince.telegram',
    displayName: 'VinceAuto Telegram Bot',
    icon: 'Send',
    category: 'vince' as const,
    description: 'Gửi tin nhắn thông báo tự động hoặc cảnh báo tới kênh/nhóm/cá nhân Telegram',
    version: 1,
    properties: [
      {
        name: 'botToken',
        displayName: 'Telegram Bot Token (API từ @BotFather)',
        type: 'string' as const,
        default: '',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ (hoặc lưu trong Credentials)',
      },
      {
        name: 'chatId',
        displayName: 'Chat ID (@chatid hoặc ID số)',
        type: 'string' as const,
        default: '@ungdothevinh',
        placeholder: '@ungdothevinh hoặc 118229444',
        required: true,
      },
      {
        name: 'message',
        displayName: 'Nội Dung Tin Nhắn (Text Message)',
        type: 'string' as const,
        default: '⚡ [VinceAuto - Ưng Đỗ Thế Vinh]\nWorkflow hoàn thành thành công!\nKết quả: {{ JSON.stringify($json) }}',
        placeholder: 'Kéo thả {{ $json.message.text }} từ cột INPUT vào đây...',
        required: true,
      },
      {
        name: 'parseMode',
        displayName: 'Định Dạng Văn Bản (Parse Mode)',
        type: 'options' as const,
        default: 'HTML',
        options: [
          { name: 'HTML', value: 'HTML' },
          { name: 'Markdown', value: 'Markdown' },
          { name: 'Văn bản thuần (Plain Text)', value: 'None' },
        ],
      },
    ],
    inputs: ['main'],
    outputs: ['main'],
  };

  async execute(
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]> {
    const results: INodeExecutionData[] = [];
    const items = inputData.length > 0 ? inputData : [{ json: {} }];

    const botToken = (
      node.parameters.botToken ||
      context.credentials?.TELEGRAM_BOT_TOKEN ||
      process.env.TELEGRAM_BOT_TOKEN ||
      ''
    ).toString().trim();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let chatId = ExpressionEvaluator.evaluate(node.parameters.chatId, item, context, i);
      if (typeof chatId === 'string') chatId = chatId.trim();
      const message = ExpressionEvaluator.evaluate(node.parameters.message, item, context, i);

      if (!botToken || !chatId) {
        context.log('[VinceTelegram] Giả lập chạy thử Telegram cho Ưng Đỗ Thế Vinh (chưa có Bot Token hoặc Chat ID).', 'warn');
        results.push({
          json: {
            ...item.json,
            telegramStatus: 'simulated',
            user: 'Ưng Đỗ Thế Vinh',
            chatId: chatId || '@ungdothevinh',
            messageSent: message || 'Xin chào Ưng Đỗ Thế Vinh! Tin nhắn mẫu tự động từ VinceAuto.',
            guide: 'Để gửi tin nhắn thật qua Telegram: 1) Nhập Bot Token từ @BotFather. 2) Nhập @chatid (hoặc ID số Telegram). 3) Bấm "Execute step" để kiểm tra.',
          },
        });
        continue;
      }

      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await axios.post(url, {
          chat_id: chatId,
          text: message,
          parse_mode: node.parameters.parseMode === 'None' ? undefined : (node.parameters.parseMode || 'HTML'),
        });

        results.push({
          json: {
            ...item.json,
            telegramStatus: 'sent',
            messageId: res.data?.result?.message_id,
            chatId,
            messageSent: message,
          },
        });
      } catch (err: any) {
        const errorDesc = err.response?.data?.description || err.message;
        context.log(`[VinceTelegram] Lỗi gửi Telegram: ${errorDesc}`, 'error');
        results.push({
          json: {
            ...item.json,
            telegramStatus: 'error',
            error: errorDesc,
            chatId,
            guide: 'Vui lòng kiểm tra lại Bot Token (từ @BotFather) hoặc Chat ID (@ungdothevinh). Nếu gửi cho tài khoản cá nhân, cần chat /start với bot trước.',
          },
        });
      }
    }

    return results;
  }
}
