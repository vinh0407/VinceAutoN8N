import { createPiece, createAction } from '../framework.js';

export const gmailPiece = createPiece({
  name: 'gmail',
  displayName: 'Gmail',
  description: 'Gửi email, tìm kiếm hộp thư, lọc thư chưa đọc và xử lý tệp đính kèm',
  icon: 'Mail',
  category: 'automation',
  actions: [
    createAction({
      name: 'send_email',
      displayName: 'Gmail: Gửi Thư Điện Tử',
      description: 'Gửi email dạng văn bản hoặc HTML tới một hoặc nhiều người nhận',
      props: {
        to: {
          name: 'to',
          displayName: 'Người Nhận (To)',
          type: 'string',
          required: true,
          placeholder: 'khachhang@example.com hoặc {{ $json.email }}',
        },
        subject: {
          name: 'subject',
          displayName: 'Tiêu Đề Thư',
          type: 'string',
          required: true,
          default: '⚡ Thông Báo Mới Từ VinceAuto Automation',
        },
        bodyHtml: {
          name: 'bodyHtml',
          displayName: 'Nội Dung Thư (HTML / Markdown)',
          type: 'string',
          required: true,
          default: '<h3>Xin chào,</h3><p>Quy trình tự động hóa VinceAuto của bạn đã hoàn thành xuất sắc!</p><p>Chi tiết: {{ JSON.stringify($json) }}</p>',
        },
        cc: {
          name: 'cc',
          displayName: 'CC (Tùy chọn)',
          type: 'string',
          placeholder: 'admin@example.com',
        },
      },
      run: async (context) => {
        const { to, subject, bodyHtml, cc } = context.propsValue;
        return {
          success: true,
          messageId: `<vince_${Date.now()}@mail.gmail.com>`,
          to,
          cc,
          subject,
          bodyHtml,
          sentAt: new Date().toISOString(),
          status: 'SENT',
        };
      },
    }),

    createAction({
      name: 'search_emails',
      displayName: 'Gmail: Tìm Kiếm & Lọc Thư',
      description: 'Tìm kiếm thư theo bộ lọc Gmail (ví dụ: is:unread label:INBOX has:attachment)',
      props: {
        query: {
          name: 'query',
          displayName: 'Cú Pháp Tìm Kiếm (Query)',
          type: 'string',
          default: 'is:unread label:INBOX',
          placeholder: 'from:boss@company.com has:attachment',
        },
        maxResults: {
          name: 'maxResults',
          displayName: 'Số Lượng Thư Tối Đa',
          type: 'number',
          default: 10,
        },
      },
      run: async (context) => {
        const { query } = context.propsValue;
        return {
          query,
          messagesCount: 2,
          messages: [
            {
              id: 'msg_101',
              threadId: 'th_101',
              from: 'lead@partner.vn',
              subject: 'Yêu cầu tư vấn tự động hóa VinceAuto',
              snippet: 'Chào bạn, công ty chúng tôi muốn tìm hiểu giải pháp...',
              receivedAt: new Date().toISOString(),
              hasAttachment: true,
            },
            {
              id: 'msg_102',
              threadId: 'th_102',
              from: 'finance@shopee.vn',
              subject: 'Đối soát doanh thu bán hàng',
              snippet: 'Thông báo đối soát kỳ 1 tháng 11...',
              receivedAt: new Date().toISOString(),
              hasAttachment: false,
            },
          ],
        };
      },
    }),
  ],
});
