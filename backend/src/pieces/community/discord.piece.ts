import { createPiece, createAction } from '../framework.js';
import { SafeHttp } from '../../engine/safe-http.js';

export const discordPiece = createPiece({
  name: 'discord',
  displayName: 'Discord',
  description: 'Gửi tin nhắn hoặc thông báo định dạng Embed vào Discord Channel',
  icon: 'Send',
  category: 'automation',
  actions: [
    createAction({
      name: 'send_webhook',
      displayName: 'Send Channel Webhook Message',
      description: 'Gửi tin nhắn tới Discord qua Webhook URL',
      props: {
        webhookUrl: {
          name: 'webhookUrl',
          displayName: 'Discord Webhook URL',
          type: 'string',
          placeholder: 'https://discord.com/api/webhooks/...',
          required: true,
        },
        content: {
          name: 'content',
          displayName: 'Message Content',
          type: 'string',
          default: '🚀 **VinceAuto Alert**: Workflow đã xử lý xong dữ liệu! \n`{{ JSON.stringify($json) }}`',
          required: true,
        },
      },
      async run(context) {
        const { webhookUrl, content } = context.propsValue;

        if (!webhookUrl) throw new Error('Discord Webhook URL is required');

        const res = await SafeHttp.post(webhookUrl, { content });
        return {
          discordStatus: 'sent',
          statusCode: res.status,
          timestamp: new Date().toISOString(),
        };
      },
    }),
  ],
});
