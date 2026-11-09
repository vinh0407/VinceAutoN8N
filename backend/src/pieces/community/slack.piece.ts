import { createPiece, createAction } from '../framework.js';
import { SafeHttp } from '../../engine/safe-http.js';

export const slackPiece = createPiece({
  name: 'slack',
  displayName: 'Slack',
  description: 'Gửi tin nhắn hoặc thông báo vào kênh Slack qua Webhook / Bot API',
  icon: 'Send',
  category: 'automation',
  actions: [
    createAction({
      name: 'send_message',
      displayName: 'Send Message to Channel',
      description: 'Gửi tin nhắn tới channel Slack qua Incoming Webhook URL hoặc Bot Token',
      props: {
        webhookUrl: {
          name: 'webhookUrl',
          displayName: 'Webhook URL',
          type: 'string',
          placeholder: 'https://hooks.slack.com/services/...',
          required: true,
        },
        text: {
          name: 'text',
          displayName: 'Nội Dung Tin Nhắn',
          type: 'string',
          default: '⚡ [VinceAuto] Thông báo mới từ workflow: {{ JSON.stringify($json) }}',
          required: true,
        },
        username: {
          name: 'username',
          displayName: 'Bot Username (Optional)',
          type: 'string',
          default: 'VinceAuto Bot',
        },
      },
      async run(context) {
        const { webhookUrl, text, username } = context.propsValue;

        if (!webhookUrl) {
          throw new Error('Slack Webhook URL is required');
        }

        const payload: any = { text };
        if (username) payload.username = username;

        const res = await SafeHttp.post(webhookUrl, payload);
        return {
          slackStatus: 'delivered',
          statusCode: res.status,
          deliveredAt: new Date().toISOString(),
        };
      },
    }),
  ],
});
