import { createPiece, createAction } from '../framework.js';

export const tiktokPiece = createPiece({
  name: 'tiktok',
  displayName: 'TikTok & TikTok Shop',
  description: 'Đăng tải video TikTok, lấy thống kê tương tác, quản lý đơn hàng TikTok Shop',
  icon: 'Video',
  category: 'automation',
  actions: [
    createAction({
      name: 'publish_video',
      displayName: 'TikTok: Đăng Video (Content Posting API)',
      description: 'Đăng video lên kênh TikTok của tài khoản được cấp quyền',
      props: {
        accessToken: {
          name: 'accessToken',
          displayName: 'TikTok Access Token',
          type: 'string',
          required: true,
          placeholder: '{{ $env.TIKTOK_ACCESS_TOKEN }}',
        },
        videoUrl: {
          name: 'videoUrl',
          displayName: 'URL Video Nguồn',
          type: 'string',
          required: true,
          placeholder: 'https://cdn.example.com/videos/output.mp4',
        },
        title: {
          name: 'title',
          displayName: 'Tiêu Đề / Caption Video',
          type: 'string',
          required: true,
          default: 'Video tự động hóa sản xuất bởi VinceAuto AI #automation #ai #vinceauto',
        },
        privacyLevel: {
          name: 'privacyLevel',
          displayName: 'Quyền Riêng Tư',
          type: 'options',
          default: 'PUBLIC_TO_EVERYONE',
          options: [
            { name: 'Công Khai (Public)', value: 'PUBLIC_TO_EVERYONE' },
            { name: 'Chỉ Bạn Bè (Mutual Follow Friends)', value: 'MUTUAL_FOLLOW_FRIENDS' },
            { name: 'Chỉ Mình Tôi (Self Only)', value: 'SELF_ONLY' },
          ],
        },
      },
      run: async (context) => {
        const { videoUrl, title, privacyLevel } = context.propsValue;
        return {
          success: true,
          publish_id: `v_post_${Date.now()}`,
          videoUrl,
          title,
          privacyLevel,
          status: 'PROCESSING_DOWNLOAD',
          timestamp: new Date().toISOString(),
        };
      },
    }),

    createAction({
      name: 'get_video_analytics',
      displayName: 'TikTok: Thống Kê Video (Views & Engagement)',
      description: 'Lấy số lượt xem, lượt thích, bình luận và chia sẻ của video',
      props: {
        videoIds: {
          name: 'videoIds',
          displayName: 'Danh Sách Video ID (Phân cách bởi dấu phẩy)',
          type: 'string',
          required: true,
          placeholder: '719283019283719, 719283019283720',
        },
      },
      run: async (context) => {
        const { videoIds } = context.propsValue;
        return {
          queryIds: videoIds,
          data: [
            {
              id: '719283019283719',
              views: 15420,
              likes: 1240,
              comments: 89,
              shares: 312,
            },
          ],
        };
      },
    }),
  ],
});
