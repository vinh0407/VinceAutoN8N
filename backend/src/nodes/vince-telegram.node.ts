import axios from 'axios';
import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export class VinceTelegramNode implements INodeType {
  description = {
    name: 'vince.telegram',
    displayName: 'VinceAuto Telegram Bot',
    icon: 'Send',
    category: 'vince' as const,
    description: 'Gửi tin nhắn thông báo tự động hoặc cảnh báo tới kênh/nhóm Telegram',
    version: 1,
    properties: [
      {
        name: 'botToken',
        displayName: 'Bot Token (Optional if set in Credentials)',
        type: 'string' as const,
        default: '',
        placeholder: '123456789:AAHdqT...',
      },
      {
        name: 'chatId',
        displayName: 'Chat ID',
        type: 'string' as const,
        default: '',
        placeholder: '-100123456789 hoặc @my_channel',
        required: true,
      },
      {
        name: 'message',
        displayName: 'Nội Dung Tin Nhắn',
        type: 'string' as const,
        default: '⚡ [VinceAuto Alert]\nWorkflow hoàn thành thành công!\nKết quả: {{ JSON.stringify($json) }}',
        required: true,
      },
      {
        name: 'parseMode',
        displayName: 'Parse Mode',
        type: 'options' as const,
        default: 'HTML',
        options: [
          { name: 'HTML', value: 'HTML' },
          { name: 'Markdown', value: 'Markdown' },
          { name: 'Plain Text', value: 'None' },
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

    const botToken =
      node.parameters.botToken ||
      context.credentials?.TELEGRAM_BOT_TOKEN ||
      process.env.TELEGRAM_BOT_TOKEN;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const chatId = ExpressionEvaluator.evaluate(node.parameters.chatId, item, context, i);
      const message = ExpressionEvaluator.evaluate(node.parameters.message, item, context, i);

      if (!botToken || !chatId) {
        context.log('[VinceTelegram] Simulating telegram send (Bot Token hoặc Chat ID chưa được cấu hình).', 'warn');
        results.push({
          json: {
            ...item.json,
            telegramStatus: 'simulated',
            chatId,
            messageSent: message,
            note: 'Vui lòng cung cấp TELEGRAM_BOT_TOKEN và chatId để gửi thực tế.',
          },
        });
        continue;
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: node.parameters.parseMode === 'None' ? undefined : node.parameters.parseMode,
      });

      results.push({
        json: {
          ...item.json,
          telegramStatus: 'sent',
          messageId: res.data?.result?.message_id,
        },
      });
    }

    return results;
  }
}
