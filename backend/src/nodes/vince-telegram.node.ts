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
      if (!chatId || chatId === '@chatid' || chatId === '{{ $json.chatId }}') {
        chatId = item.json.chatId || item.json.message?.chat?.id || item.json.message?.from?.id || '@ungdothevinh';
      }

      let message = ExpressionEvaluator.evaluate(node.parameters.message, item, context, i);
      if (typeof message === 'string') message = message.trim();
      if (!message || message === '{{ $json.aiResponse }}' || message.includes('Workflow hoàn thành thành công!') || message.includes('Kết quả: {{ JSON.stringify')) {
        message = item.json.aiResponse || item.json.response || item.json.text || message || 'Xin chào Ưng Đỗ Thế Vinh!';
      }

      const replyToMessageId =
        node.parameters.replyToMessageId ||
        item.json.replyToMessageId ||
        item.json.messageId ||
        item.json.message?.message_id ||
        142;

      if (!botToken) {
        context.log(`[VinceTelegram Bot] Giả lập phản hồi AI Agent thành công tới ${chatId}`, 'info');
        results.push({
          json: {
            ...item.json,
            telegramStatus: 'simulated_reply',
            action: 'Telegram Bot Reply to User',
            botReply: message,
            recipient: chatId,
            replyToMessageId,
            conversation: {
              userMessage: item.json.userQuestion || item.json.text || item.json.message?.text || 'Xin chào AI Agent, hãy tư vấn giải pháp tự động hóa giúp tôi!',
              aiAgentReply: message,
              status: 'Thành công (Bot đã nhận tin qua @id, gọi AI Agent và chuẩn bị phản hồi)',
            },
            guide: 'Để bot tự động gửi tin nhắn thật 24/7 trên Telegram: Nhập Bot Token từ @BotFather vào node Telegram hoặc phần Credentials.',
          },
        });
        continue;
      }

      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const postData: any = {
          chat_id: chatId,
          text: message,
          parse_mode: node.parameters.parseMode === 'None' ? undefined : (node.parameters.parseMode || 'HTML'),
        };
        if (replyToMessageId) {
          postData.reply_to_message_id = replyToMessageId;
        }

        const res = await axios.post(url, postData);

        results.push({
          json: {
            ...item.json,
            telegramStatus: 'sent',
            messageId: res.data?.result?.message_id,
            chatId,
            replyToMessageId,
            messageSent: message,
            botReply: message,
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
